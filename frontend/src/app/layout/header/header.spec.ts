import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Header } from './header';
import { Product } from '../../core/models/product.model';

@Component({ standalone: true, template: '' })
class StubRouteComponent {}

const mockProducts: Product[] = [
  { productId: 1, id: 1, title: 'Air Max Pro', price: 130, image: '/img/1.jpg', images: [], category: 'men', subcategory: 'shoes', colors: [], collections: [], tags: [], description: '', slug: 'air-max-pro-1' },
  { productId: 2, id: 2, title: 'Running Hat', price: 30, image: '/img/2.jpg', images: [], category: 'men', subcategory: 'hats', colors: [], collections: [], tags: [], description: '', slug: 'running-hat-2' },
];

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([{ path: '**', component: StubRouteComponent }], withNavigationErrorHandler(() => {})),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
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

  it('isMenuOpen should default to false', () => {
    expect(component.isMenuOpen).toBe(false);
  });

  it('toogleMenu() should open the menu', () => {
    component.toogleMenu();
    expect(component.isMenuOpen).toBe(true);
  });

  it('toogleMenu() called twice should close the menu', () => {
    component.toogleMenu();
    component.toogleMenu();
    expect(component.isMenuOpen).toBe(false);
  });

  it('closeMenu() should set isMenuOpen to false', () => {
    component.isMenuOpen = true;
    component.closeMenu();
    expect(component.isMenuOpen).toBe(false);
  });

  it('onSearch() should clear results when query is shorter than 2 characters', () => {
    component.searchQuery = 'a';
    component.onSearch();
    expect(component.searchResults.length).toBe(0);
    expect(component.isSearchOpen).toBe(false);
  });

  it('onSearch() should populate searchResults for a matching query', () => {
    component.searchQuery = 'air';
    component.onSearch();
    expect(component.searchResults.length).toBe(1);
    expect(component.searchResults[0].title).toBe('Air Max Pro');
    expect(component.isSearchOpen).toBe(true);
  });

  it('onSearch() should set isSearchOpen to false when no results match', () => {
    component.searchQuery = 'zzznomatch';
    component.onSearch();
    expect(component.isSearchOpen).toBe(false);
    expect(component.searchResults.length).toBe(0);
  });

  it('onSearch() should find products by subcategory', () => {
    component.searchQuery = 'hats';
    component.onSearch();
    expect(component.searchResults.length).toBe(1);
    expect(component.searchResults[0].subcategory).toBe('hats');
  });

  it('dismissAnnouncement() should hide announcement bar', () => {
    component.dismissAnnouncement();
    expect(component.announcementVisible()).toBe(false);
  });

  it('goToProduct() should navigate to product page and clear search', () => {
    component.searchQuery = 'air';
    component.searchResults = mockProducts;
    component.goToProduct(mockProducts[0]);
    expect(component.searchQuery).toBe('');
    expect(component.searchResults.length).toBe(0);
    expect(component.isSearchOpen).toBe(false);
  });

  it('goToSearch() should clear search if query is too short', () => {
    component.searchQuery = 'a';
    component.goToSearch();
    expect(component.isSearchOpen).toBe(false);
  });

  it('closeSearch() should close search after delay', async () => {
    component.isSearchOpen = true;
    component.closeSearch();
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(component.isSearchOpen).toBe(false);
  });

  it('toggleTabletSearch() should toggle tablet search', () => {
    component.toggleTabletSearch();
    expect(component.isTabletSearchOpen).toBe(true);
    component.toggleTabletSearch();
    expect(component.isTabletSearchOpen).toBe(false);
  });

  it('toggleCategory() should toggle isCategoryOpen', () => {
    component.toggleCategory();
    expect(component.isCategoryOpen).toBe(true);
    component.toggleCategory();
    expect(component.isCategoryOpen).toBe(false);
  });

  it('toggleGiftCards() should toggle isGiftCardsOpen', () => {
    component.toggleGiftCards();
    expect(component.isGiftCardsOpen).toBe(true);
  });

  it('toggleSpecialEvents() should toggle isSpecialEventsOpen', () => {
    component.toggleSpecialEvents();
    expect(component.isSpecialEventsOpen).toBe(true);
  });

  it('toggleCategoryMenu() should toggle isCategoryOpen', () => {
    component.isCategoryOpen = false;
    component.toggleCategoryMenu();
    expect(component.isCategoryOpen).toBe(true);
  });

  it('ngOnDestroy() should clear timer', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
