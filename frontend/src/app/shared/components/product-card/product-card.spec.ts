import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';

const mockProduct: Product = {
  productId: 7, id: 7, title: 'Cool Jacket', price: 199, image: '/img/jacket.jpg', images: [],
  category: 'men', subcategory: 'jackets', colors: ['black'], collections: [], tags: [], description: '', slug: 'cool-jacket-7',
};

describe('ProductCard', () => {
  let component: ProductCard;
  let fixture: ComponentFixture<ProductCard>;
  let wishlistServiceMock: Partial<WishlistService>;

  beforeEach(async () => {
    wishlistServiceMock = {
      isInWishlist: vi.fn().mockReturnValue(false),
      toggle: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [
        provideRouter([]),
        { provide: WishlistService, useValue: wishlistServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;
    component.product = mockProduct;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the skeleton loader when product is undefined', async () => {
    component.product = undefined as any;
    fixture.changeDetectorRef.detectChanges(); // main CD pass only, no verification — avoids ExpressionChangedAfterChecked
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('should render product details when product is provided', async () => {
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.textContent).toContain('Cool Jacket');
    expect(compiled.textContent).toContain('199');
  });

  it('toggleWishlist() should call wishlistService.toggle with the product', () => {
    const fakeEvent = new MouseEvent('click');
    vi.spyOn(fakeEvent, 'stopPropagation');
    component.toggleWishlist(fakeEvent);
    expect(wishlistServiceMock.toggle).toHaveBeenCalledWith(mockProduct);
  });

  it('toggleWishlist() should stop event propagation to prevent navigation', () => {
    const fakeEvent = new MouseEvent('click');
    const stopSpy = vi.spyOn(fakeEvent, 'stopPropagation');
    component.toggleWishlist(fakeEvent);
    expect(stopSpy).toHaveBeenCalled();
  });

  it('should show a filled heart icon when product is in wishlist', async () => {
    wishlistServiceMock.isInWishlist = vi.fn().mockReturnValue(true);
    fixture.changeDetectorRef.detectChanges(); // main CD pass only, no verification — avoids ExpressionChangedAfterChecked
    const compiled: HTMLElement = fixture.nativeElement;
    // Filled heart SVG uses fill="red"
    const heartSvg = compiled.querySelector('[aria-label="Toggle wishlist"] svg path');
    expect(heartSvg?.getAttribute('fill')).toBe('red');
  });

  it('should show an outlined heart icon when product is not in wishlist', async () => {
    wishlistServiceMock.isInWishlist = vi.fn().mockReturnValue(false);
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const heartSvg = compiled.querySelector('[aria-label="Toggle wishlist"] svg path');
    expect(heartSvg?.getAttribute('fill')).toBe('currentColor');
  });
});
