import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { WishlistService } from './wishlist.service';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';

const mockProduct: Product = {
  productId: 42,
  id: 42,
  title: 'Test Hat',
  price: 50,
  image: '/img/hat.jpg',
  images: [],
  category: 'women',
  subcategory: 'hats',
  colors: ['red'],
  collections: [],
  tags: [],
  description: 'A test hat',
  slug: 'test-hat-42',
};

const mockProduct2: Product = {
  productId: 99,
  id: 99,
  title: 'Test Jacket',
  price: 200,
  image: '/img/jacket.jpg',
  images: [],
  category: 'men',
  subcategory: 'jackets',
  colors: ['black'],
  collections: [],
  tags: ['new'],
  description: 'A test jacket',
  slug: 'test-jacket-99',
};

describe('WishlistService', () => {
  let service: WishlistService;
  let httpMock: HttpTestingController;
  let authServiceMock: Partial<AuthService>;

  beforeEach(() => {
    localStorage.clear();
    authServiceMock = {
      isLoggedIn: () => true,
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
    service = TestBed.inject(WishlistService);
    httpMock = TestBed.inject(HttpTestingController);
    // Consume any initial requests triggered by effects
    httpMock.match(() => true).forEach(r => r.flush({ wishlist: { products: [] } }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a product when toggled and not already in wishlist', () => {
    service.toggle(mockProduct);
    expect(service.isInWishlist(mockProduct.id)).toBe(true);
  });

  it('should remove a product when toggled and already in wishlist', () => {
    service.toggle(mockProduct);
    httpMock.expectOne(r => r.method === 'POST').flush({ wishlist: { products: [mockProduct] } });
    service.toggle(mockProduct);
    httpMock.expectOne(r => r.method === 'DELETE').flush({ wishlist: { products: [] } });
    expect(service.isInWishlist(mockProduct.id)).toBe(false);
  });

  it('should return 0 count when wishlist is empty', () => {
    expect(service.getCount()).toBe(0);
  });

  it('should return correct count after adding items', () => {
    service.toggle(mockProduct);
    expect(service.getCount()).toBe(1);
    service.toggle(mockProduct2);
    expect(service.getCount()).toBe(2);
  });

  it('should decrement count after removing an item', () => {
    service.toggle(mockProduct);
    httpMock.expectOne(r => r.method === 'POST').flush({ wishlist: { products: [mockProduct] } });
    service.toggle(mockProduct2);
    httpMock.expectOne(r => r.method === 'POST').flush({ wishlist: { products: [mockProduct, mockProduct2] } });
    service.toggle(mockProduct);
    httpMock.expectOne(r => r.method === 'DELETE').flush({ wishlist: { products: [mockProduct2] } });
    expect(service.getCount()).toBe(1);
  });

  it('should return false for isInWishlist when wishlist is empty', () => {
    expect(service.isInWishlist(999)).toBe(false);
  });

  it('should return false for isInWishlist for a product that was not added', () => {
    service.toggle(mockProduct);
    expect(service.isInWishlist(mockProduct2.id)).toBe(false);
  });

  it('should emit the updated wishlist via wishlist$ after adding', () => {
    service.toggle(mockProduct);
    let items: Product[] = [];
    service.wishlist$.subscribe(i => (items = i));
    expect(items[0].id).toBe(mockProduct.id);
  });

  it('should emit an empty array via wishlist$ after removing last item', () => {
    service.toggle(mockProduct);
    httpMock.expectOne(r => r.method === 'POST').flush({ wishlist: { products: [mockProduct] } });
    service.toggle(mockProduct);
    httpMock.expectOne(r => r.method === 'DELETE').flush({ wishlist: { products: [] } });
    let items: Product[] = [mockProduct]; // start non-empty
    service.wishlist$.subscribe(i => (items = i));
    expect(items.length).toBe(0);
  });

  it('should persist wishlist to localStorage after toggle', () => {
    service.toggle(mockProduct);
    httpMock.expectOne(r => r.method === 'POST').flush({ wishlist: { products: [mockProduct] } });
    const stored: Product[] = JSON.parse(localStorage.getItem('wishlist_cache_v1') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe(mockProduct.id);
  });

  it('should remove item from localStorage after toggling off', () => {
    service.toggle(mockProduct);
    service.toggle(mockProduct);
    const stored: Product[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    expect(stored.length).toBe(0);
  });

  it('should load persisted wishlist from localStorage on initialisation', () => {
    localStorage.setItem('wishlist_cache_v1', JSON.stringify([mockProduct, mockProduct2]));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(WishlistService);
    expect(freshService.getCount()).toBe(2);
    expect(freshService.isInWishlist(mockProduct.id)).toBe(true);
  });
});
