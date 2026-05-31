import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Collections } from './collections';
import { ProductService } from '../../core/services/product.service';

const mockProducts: any[] = [
  { productId: 1, id: 1, title: 'Shoe A', price: 100, image: '/img/1.jpg', images: [], category: 'men', subcategory: 'shoes', colors: [], collections: [], tags: [], description: '', slug: 'shoe-a-1' },
  { productId: 2, id: 2, title: 'Shoe B', price: 120, image: '/img/2.jpg', images: [], category: 'men', subcategory: 'shoes', colors: [], collections: [], tags: [], description: '', slug: 'shoe-b-2' },
  { productId: 3, id: 3, title: 'Dress A', price: 200, image: '/img/3.jpg', images: [], category: 'women', subcategory: 'dresses', colors: [], collections: [], tags: [], description: '', slug: 'dress-a-3' },
];

describe('Collections', () => {
  let component: Collections;
  let fixture: ComponentFixture<Collections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Collections],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: { getProducts: vi.fn().mockReturnValue(of(mockProducts)) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Collections);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());
});
