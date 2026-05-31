import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProductDetail } from './product-detail';
import { ProductService } from '../../../core/services/product.service';

const mockProduct = {
  productId: 1, id: 1, title: 'Test Product', price: 100, image: '/img/1.jpg',
  images: [], category: 'men', subcategory: 'shoes', colors: [], collections: [],
  tags: [], description: '', slug: 'test-product-1', stock: 10,
};

describe('ProductDetail', () => {
  let component: ProductDetail;
  let fixture: ComponentFixture<ProductDetail>;

  beforeEach(async () => {
    const productServiceMock = {
      getProductBySlug: vi.fn().mockReturnValue(of({ product: mockProduct, reviews: [] })),
      getProducts: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productServiceMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
