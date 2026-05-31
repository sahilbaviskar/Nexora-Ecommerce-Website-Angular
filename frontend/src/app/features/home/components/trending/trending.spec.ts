import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Trending } from './trending';
import { Product } from '../../../../core/models/product.model';

const mockProducts: Product[] = [
  { productId: 1, id: 1, title: 'Shoe A', price: 100, image: '/img/1.jpg', images: [], category: 'men', subcategory: 'shoes', colors: [], collections: [], tags: [], description: '', slug: 'shoe-a-1' },
  { productId: 2, id: 2, title: 'Shoe B', price: 120, image: '/img/2.jpg', images: [], category: 'men', subcategory: 'shoes', colors: [], collections: [], tags: [], description: '', slug: 'shoe-b-2' },
  { productId: 3, id: 3, title: 'Hat A', price: 40, image: '/img/3.jpg', images: [], category: 'men', subcategory: 'hats', colors: [], collections: [], tags: [], description: '', slug: 'hat-a-3' },
  { productId: 4, id: 4, title: 'Hat B', price: 45, image: '/img/4.jpg', images: [], category: 'women', subcategory: 'hats', colors: [], collections: [], tags: [], description: '', slug: 'hat-b-4' },
];

describe('Trending', () => {
  let component: Trending;
  let fixture: ComponentFixture<Trending>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Trending],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Trending);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    const req = httpMock.expectOne((r) => r.url.includes('/api/products'));
    req.flush({ items: mockProducts });
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to "shoes" as the active category', () => {
    expect(component.activeCategory()).toBe('shoes');
  });

  it('should expose the expected category list', () => {
    expect(component.categories).toContain('shoes');
    expect(component.categories).toContain('hats');
  });

  it('filterByCategory() should update the active category signal', () => {
    component.filterByCategory('hats');
    expect(component.activeCategory()).toBe('hats');
  });

  it('products computed signal should filter by active category', () => {
    component.filterByCategory('shoes');
    const shoeProducts = component.products();
    expect(shoeProducts.every(p => p.subcategory === 'shoes')).toBe(true);
  });

  it('products computed signal should return at most 6 items', () => {
    expect(component.products().length).toBeLessThanOrEqual(6);
  });

  it('switching category should update the displayed products', () => {
    component.filterByCategory('shoes');
    const shoeCount = component.products().length;
    component.filterByCategory('hats');
    const hatCount = component.products().length;
    // Both sets exist; product counts can differ
    expect(shoeCount).toBeGreaterThan(0);
    expect(hatCount).toBeGreaterThan(0);
  });

  it('products should return empty array for a category with no matching products', () => {
    component.filterByCategory('jackets');
    expect(component.products().length).toBe(0);
  });

  it('getRow1Class() should return col-span-6 for index 2 with no hover', () => {
    component.hoverIndex = null;
    expect(component.getRow1Class(2)).toBe('col-span-6');
    expect(component.getRow1Class(0)).toBe('col-span-3');
  });

  it('getRow1Class() should expand index 0 when hovered', () => {
    component.hoverIndex = 0;
    expect(component.getRow1Class(0)).toBe('col-span-6');
    expect(component.getRow1Class(1)).toBe('col-span-3');
  });

  it('getRow1Class() should expand index 1 when hovered', () => {
    component.hoverIndex = 1;
    expect(component.getRow1Class(1)).toBe('col-span-6');
    expect(component.getRow1Class(0)).toBe('col-span-3');
  });

  it('getRow1Class() should keep col-span-6 for index 2 when index 2 hovered', () => {
    component.hoverIndex = 2;
    expect(component.getRow1Class(2)).toBe('col-span-6');
  });

  it('getRow2Class() should return col-span-6 for index 0 with no hover', () => {
    component.hoverIndex = null;
    expect(component.getRow2Class(0)).toBe('col-span-6');
    expect(component.getRow2Class(1)).toBe('col-span-3');
  });

  it('getRow2Class() should expand index 0 on hover 3', () => {
    component.hoverIndex = 3;
    expect(component.getRow2Class(0)).toBe('col-span-6');
  });

  it('getRow2Class() should expand index 1 on hover 4', () => {
    component.hoverIndex = 4;
    expect(component.getRow2Class(1)).toBe('col-span-6');
    expect(component.getRow2Class(0)).toBe('col-span-3');
  });

  it('getRow2Class() should expand index 2 on hover 5', () => {
    component.hoverIndex = 5;
    expect(component.getRow2Class(2)).toBe('col-span-6');
  });
});
