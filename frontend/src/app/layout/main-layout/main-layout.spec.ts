import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MainLayout } from './main-layout';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

const mockProductService = {
  getProducts: () => of([]),
  getProductBySlug: () => of({ product: null, reviews: [] }),
  getProductsByGender: () => of([]),
  getProductsByCategory: () => of([]),
};

const mockAuthService = {
  isLoggedIn: () => false,
  getUser: () => null,
};

const mockCartService = {
  getCount: () => 0,
  cart$: of([]),
};

const mockWishlistService = {
  getCount: () => 0,
  wishlist$: of([]),
};

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CartService, useValue: mockCartService },
        { provide: WishlistService, useValue: mockWishlistService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
