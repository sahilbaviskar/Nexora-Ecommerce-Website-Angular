import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SearchPage } from './search';
import { ProductService } from '../../core/services/product.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ParamMap } from '@angular/router';

const mockProducts: any[] = [
  { productId: 1, id: 1, title: 'Blue Sneaker', price: 100, image: '/img/1.jpg', images: [], category: 'men', subcategory: 'shoes', colors: [], collections: [], tags: ['sport'], description: '', slug: 'blue-sneaker-1' },
  { productId: 2, id: 2, title: 'Red Cap', price: 40, image: '/img/2.jpg', images: [], category: 'women', subcategory: 'caps', colors: [], collections: [], tags: [], description: '', slug: 'red-cap-2' },
];

describe('SearchPage', () => {
  let component: SearchPage;
  let fixture: ComponentFixture<SearchPage>;
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject({ get: (k: string) => k === 'q' ? 'sneaker' : null });

    await TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: { getProducts: vi.fn().mockReturnValue(of(mockProducts)) } },
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamsSubject.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should search and display results matching query', () => {
    expect(component.results.length).toBe(1);
    expect(component.results[0].title).toBe('Blue Sneaker');
  });

  it('should set loading=false after search', () => {
    expect(component.loading).toBe(false);
  });

  it('should populate categories from results', () => {
    expect(component.categories).toContain('All');
    expect(component.categories).toContain('men');
  });

  it('selectCategory() should filter results', () => {
    component.results = mockProducts;
    component.selectCategory('women');
    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].category).toBe('women');
  });

  it('selectCategory("All") should show all results', () => {
    component.results = mockProducts;
    component.selectCategory('All');
    expect(component.filtered.length).toBe(2);
  });

  it('should return empty results for query shorter than 2 chars', () => {
    queryParamsSubject.next({ get: (k: string) => k === 'q' ? 'a' : null });
    expect(component.results.length).toBe(0);
  });
});
