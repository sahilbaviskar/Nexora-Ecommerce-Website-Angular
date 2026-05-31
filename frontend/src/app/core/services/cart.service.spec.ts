import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';
import { Product } from '../models/product.model';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';
import { vi, afterEach } from 'vitest';

const mockProduct: Product = {
  productId: 1,
  id: 1,
  title: 'Test Sneaker',
  price: 100,
  image: '/img/test.jpg',
  images: [],
  category: 'men',
  subcategory: 'shoes',
  colors: ['black'],
  collections: [],
  tags: ['trending'],
  description: 'Test product',
  slug: 'test-sneaker-1',
};

const mockProduct2: Product = {
  productId: 2,
  id: 2,
  title: 'Test Hat',
  price: 50,
  image: '/img/hat.jpg',
  images: [],
  category: 'women',
  subcategory: 'hats',
  colors: ['red'],
  collections: [],
  tags: [],
  description: 'Another product',
  slug: 'test-hat-2',
};

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let authServiceMock: any;

  beforeEach(() => {
    localStorage.clear();
    
    authServiceMock = {
      loggedIn: signal(true),
      isLoggedIn: vi.fn(() => true),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CartService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
    
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CartService);
    
    // Handle the initial syncCart() call that happens in the CartService constructor
    // due to the effect() watching the loggedIn signal
    // Try to match and flush the initial GET request if it exists
    const initialSyncRequests = httpMock.match(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'GET');
    initialSyncRequests.forEach(req => {
      req.flush({ cart: { items: [] } });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a product to the cart', () => {
    service.addToCart(mockProduct, 'M', 1);
    
    // Handle the HTTP POST
    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    expect(service.getCount()).toBe(1);
  });

  it('should increment quantity when the same product and size is added again', () => {
    service.addToCart(mockProduct, 'M', 1);
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    service.addToCart(mockProduct, 'M', 2);
    req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 3, size: 'M' }] } });
    
    expect(service.getCount()).toBe(3);
  });

  it('should add as a separate item when the size differs', () => {
    service.addToCart(mockProduct, 'M', 1);
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    service.addToCart(mockProduct, 'L', 1);
    req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ 
      cart: { 
        items: [
          { productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' },
          { productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'L' }
        ] 
      } 
    });
    
    let items: CartItem[] = [];
    service.cart$.subscribe(i => (items = i));
    expect(items.length).toBe(2);
  });

  it('should remove a specific product/size combination from the cart', () => {
    service.addToCart(mockProduct, 'M', 1);
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ _id: 'item-m', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    service.addToCart(mockProduct, 'L', 1);
    req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ 
      cart: { 
        items: [
          { _id: 'item-m', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' },
          { _id: 'item-l', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'L' }
        ] 
      } 
    });
    
    service.removeFromCart(mockProduct.id, 'M');
    req = httpMock.expectOne(r => r.url.includes('http://localhost:3000/api/cart/') && r.method === 'DELETE');
    req.flush({ cart: { items: [{ _id: 'item-l', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'L' }] } });
    
    let items: CartItem[] = [];
    service.cart$.subscribe(i => (items = i));
    expect(items.length).toBe(1);
    expect(items[0].size).toBe('L');
  });

  it('should update quantity correctly', () => {
    service.addToCart(mockProduct, 'M', 1);
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ _id: 'item-1', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    service.updateQuantity(mockProduct.id, 'M', 5);
    req = httpMock.expectOne(r => r.url.includes('http://localhost:3000/api/cart/') && r.method === 'PUT');
    req.flush({ cart: { items: [{ _id: 'item-1', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 5, size: 'M' }] } });
    
    expect(service.getCount()).toBe(5);
  });

  it('should clamp quantity to a minimum of 1 when updating with 0', () => {
    service.addToCart(mockProduct, 'M', 2);
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ _id: 'item-1', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 2, size: 'M' }] } });
    
    service.updateQuantity(mockProduct.id, 'M', 0);
    req = httpMock.expectOne(r => r.url.includes('http://localhost:3000/api/cart/') && r.method === 'PUT');
    req.flush({ cart: { items: [{ _id: 'item-1', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    expect(service.getCount()).toBe(1);
  });

  it('should calculate the total price for a single item', () => {
    service.addToCart(mockProduct, 'M', 3);
    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 3, size: 'M' }] } });
    
    expect(service.getTotal()).toBe(300);
  });

  it('should calculate the total price across multiple items', () => {
    service.addToCart(mockProduct, 'M', 2);  // 2 × 100 = 200
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 2, size: 'M' }] } });
    
    service.addToCart(mockProduct2, 'S', 1); // 1 × 50  = 50
    req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ 
      cart: { 
        items: [
          { productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 2, size: 'M' },
          { productId: 2, title: 'Test Hat', price: 50, image: '/img/hat.jpg', quantity: 1, size: 'S' }
        ] 
      } 
    });
    
    expect(service.getTotal()).toBe(250);
  });

  it('should return 0 total when cart is empty', () => {
    expect(service.getTotal()).toBe(0);
  });

  it('should return 0 count when cart is empty', () => {
    expect(service.getCount()).toBe(0);
  });

  it('should clear all items from the cart', () => {
    service.addToCart(mockProduct, 'M', 3);
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 3, size: 'M' }] } });
    
    service.addToCart(mockProduct2, 'L', 2);
    req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ 
      cart: { 
        items: [
          { productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 3, size: 'M' },
          { productId: 2, title: 'Test Hat', price: 50, image: '/img/hat.jpg', quantity: 2, size: 'L' }
        ] 
      } 
    });
    
    service.clearCart();
    req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'DELETE');
    req.flush({ cart: { items: [] } });
    
    expect(service.getCount()).toBe(0);
    expect(service.getTotal()).toBe(0);
  });

  it('should return true for isInCart when item with matching size exists', () => {
    service.addToCart(mockProduct, 'M', 1);
    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    expect(service.isInCart(mockProduct.id, 'M')).toBe(true);
  });

  it('should return false for isInCart when size does not match', () => {
    service.addToCart(mockProduct, 'M', 1);
    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    expect(service.isInCart(mockProduct.id, 'L')).toBe(false);
  });

  it('should return false for isInCart when product is not in cart', () => {
    expect(service.isInCart(999, 'M')).toBe(false);
  });

  it('should emit updated cart items via cart$ observable after adding', () => {
    service.addToCart(mockProduct, 'M', 1);
    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    let items: CartItem[] = [];
    service.cart$.subscribe(i => (items = i));
    expect(items[0].product.id).toBe(mockProduct.id);
    expect(items[0].quantity).toBe(1);
  });

  it('should emit an empty array via cart$ after clearing', () => {
    service.addToCart(mockProduct, 'M', 1);
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    service.clearCart();
    req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'DELETE');
    req.flush({ cart: { items: [] } });
    
    let items: CartItem[] = [{ product: mockProduct, quantity: 1, size: 'M' }]; // start non-empty
    service.cart$.subscribe(i => (items = i));
    expect(items.length).toBe(0);
  });

  it('should persist cart data to localStorage after adding', () => {
    service.addToCart(mockProduct, 'M', 2);
    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 2, size: 'M' }] } });
    
    const stored: CartItem[] = JSON.parse(localStorage.getItem('cart_cache_v1') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].product.id).toBe(mockProduct.id);
    expect(stored[0].quantity).toBe(2);
  });

  it('setInCart should set quantity if item already exists', () => {
    service.addToCart(mockProduct, 'M', 5);
    let req = httpMock.expectOne(r => r.url === 'http://localhost:3000/api/cart' && r.method === 'POST');
    req.flush({ cart: { items: [{ _id: 'item-1', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 5, size: 'M' }] } });
    
    service.setInCart(mockProduct, 'M', 1);
    req = httpMock.expectOne(r => r.url.includes('http://localhost:3000/api/cart/') && r.method === 'PUT');
    req.flush({ cart: { items: [{ _id: 'item-1', productId: 1, title: 'Test Sneaker', price: 100, image: '/img/test.jpg', quantity: 1, size: 'M' }] } });
    
    expect(service.getCount()).toBe(1);
  });
});
