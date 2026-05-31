import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

@Component({ standalone: true, template: '' })
class StubRouteComponent {}
import { of, Subject } from 'rxjs';
import { Products } from './products';
import { ProductService } from '../../../core/services/product.service';

const mockProducts: any[] = [
  { productId: 1, id: 1, title: 'Shirt', price: 50, image: '', images: [], category: 'men', subcategory: 'shirts', colors: ['red', 'blue'], collections: [], tags: ['casual'], description: '', slug: 'shirt-1' },
  { productId: 2, id: 2, title: 'Hat', price: 20, image: '', images: [], category: 'men', subcategory: 'hats', colors: ['black'], collections: [], tags: ['streetwear'], description: '', slug: 'hat-2' },
  { productId: 3, id: 3, title: 'Dress', price: 80, image: '', images: [], category: 'women', subcategory: 'dresses', colors: ['pink'], collections: [], tags: ['formal'], description: '', slug: 'dress-3' },
];

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let productMock: any;
  let paramMapSubject: Subject<any>;
  let queryParamsSubject: Subject<any>;

  beforeEach(async () => {
    paramMapSubject = new Subject();
    queryParamsSubject = new Subject();

    productMock = {
      getProducts: vi.fn().mockReturnValue(of(mockProducts)),
    };

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        provideRouter([{ path: '**', component: StubRouteComponent }]),
        { provide: ProductService, useValue: productMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
            queryParams: queryParamsSubject.asObservable(),
            snapshot: { queryParams: {} },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Trigger paramMap with men
    paramMapSubject.next({ get: (k: string) => k === 'gender' ? 'men' : null });
    queryParamsSubject.next({});
    await fixture.whenStable();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should filter products by gender', () => {
    expect(component.products.length).toBe(2); // men only
  });

  it('getColorHex() should return hex for known color', () => {
    expect(component.getColorHex('red')).toBe('#ef4444');
  });

  it('getColorHex() should return input for unknown color', () => {
    expect(component.getColorHex('#abc123')).toBe('#abc123');
  });

  it('toggleCategory() should add and remove category', () => {
    component.toggleCategory('shirts');
    expect(component.tempCategories).toContain('shirts');
    component.toggleCategory('shirts');
    expect(component.tempCategories).not.toContain('shirts');
  });

  it('toggleColor() should add and remove color', () => {
    component.toggleColor('red');
    expect(component.tempColors).toContain('red');
    component.toggleColor('red');
    expect(component.tempColors).not.toContain('red');
  });

  it('toggleTag() should add and remove tag', () => {
    component.toggleTag('casual');
    expect(component.tempTags).toContain('casual');
    component.toggleTag('casual');
    expect(component.tempTags).not.toContain('casual');
  });

  it('sortProducts() should sort by price low-high', () => {
    component.products = [...mockProducts.filter(p => p.category === 'men')];
    component.sortOption = 'low-high';
    component.sortProducts();
    expect(component.products[0].price).toBeLessThanOrEqual(component.products[1].price);
  });

  it('sortProducts() should sort by price high-low', () => {
    component.products = [...mockProducts.filter(p => p.category === 'men')];
    component.sortOption = 'high-low';
    component.sortProducts();
    expect(component.products[0].price).toBeGreaterThanOrEqual(component.products[1].price);
  });

  it('goToPage() should update currentPage', () => {
    component.products = mockProducts;
    component.updatePagination();
    component.goToPage(1);
    expect(component.currentPage).toBe(1);
  });

  it('nextPage() and prevPage() should navigate pages', () => {
    component.products = Array(20).fill(mockProducts[0]);
    component.updatePagination();
    component.nextPage();
    expect(component.currentPage).toBe(2);
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('prevPage() should not go below 1', () => {
    component.currentPage = 1;
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('clearFilters() should reset all filters', () => {
    component.tempCategories = ['shirts'];
    component.clearFilters();
    expect(component.tempCategories).toEqual([]);
  });

  it('runFiltering() should filter by selectedCategories', () => {
    component.allProducts = mockProducts;
    component.gender = 'men';
    component.selectedCategories = ['shirts'];
    component.runFiltering();
    expect(component.products.every(p => p.subcategory === 'shirts')).toBe(true);
  });

  it('runFiltering() should filter by selectedColors', () => {
    component.allProducts = mockProducts;
    component.gender = 'men';
    component.selectedColors = ['black'];
    component.runFiltering();
    expect(component.products.every(p => p.colors.includes('black'))).toBe(true);
  });

  it('runFiltering() should filter by selectedTags', () => {
    component.allProducts = mockProducts;
    component.gender = 'men';
    component.selectedTags = ['casual'];
    component.runFiltering();
    expect(component.products.every(p => p.tags.includes('casual'))).toBe(true);
  });

  it('ngOnDestroy() should not throw', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
