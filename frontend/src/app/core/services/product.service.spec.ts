import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

const mockProducts: Product[] = [
  {
    productId: 1, id: 1, title: 'Air Max', price: 120, image: '/img/1.jpg', images: [],
    category: 'men', subcategory: 'shoes', colors: ['black'], collections: [], tags: [], description: '', slug: 'air-max-1',
  },
  {
    productId: 2, id: 2, title: 'Running Short', price: 40, image: '/img/2.jpg', images: [],
    category: 'men', subcategory: 'shorts', colors: ['blue'], collections: [], tags: [], description: '', slug: 'running-short-2',
  },
  {
    productId: 3, id: 3, title: 'Floral Dress', price: 90, image: '/img/3.jpg', images: [],
    category: 'women', subcategory: 'dresses', colors: ['pink'], collections: [], tags: [], description: '', slug: 'floral-dress-3',
  },
];

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProducts() should return all products', () => {
    service.getProducts().subscribe(products => {
      expect(products.length).toBe(3);
      expect(products[0].title).toBe('Air Max');
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
  });

  it('getProducts() should only make one HTTP request (shareReplay)', () => {
    service.getProducts().subscribe();
    service.getProducts().subscribe();
    // Only one HTTP request should be made due to shareReplay
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
  });

  it('getProductById() should return the matching product', () => {
    service.getProductById(2).subscribe(product => {
      expect(product).toBeDefined();
      expect(product!.title).toBe('Running Short');
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
  });

  it('getProductById() should return undefined when product does not exist', () => {
    service.getProductById(999).subscribe(product => {
      expect(product).toBeUndefined();
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
  });

  it('getProductsByGender() should return only products of the specified gender', () => {
    service.getProductsByGender('men').subscribe(products => {
      expect(products.length).toBe(2);
      products.forEach(p => expect(p.category).toBe('men'));
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
  });

  it('getProductsByGender() should return empty array for unknown gender', () => {
    service.getProductsByGender('kids').subscribe(products => {
      expect(products.length).toBe(0);
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
  });

  it('getProductsByCategory() should return products matching both gender and subcategory', () => {
    service.getProductsByCategory('men', 'shoes').subscribe(products => {
      expect(products.length).toBe(1);
      expect(products[0].id).toBe(1);
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
  });

  it('getProductsByCategory() should return empty array when no match exists', () => {
    service.getProductsByCategory('women', 'shoes').subscribe(products => {
      expect(products.length).toBe(0);
    });
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
  });
});
