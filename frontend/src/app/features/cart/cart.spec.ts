import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Cart } from './cart';
import { CartService, CartItem } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

const mockProduct: Product = {
  productId: 1, id: 1, title: 'Test Shoe', price: 100, image: '/img/shoe.jpg', images: [],
  category: 'men', subcategory: 'shoes', colors: ['black'], collections: [], tags: [], description: '', slug: 'test-shoe-1',
};

const mockItem: CartItem = { product: mockProduct, quantity: 2, size: 'M' };

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let cartServiceMock: Partial<CartService>;

  beforeEach(async () => {
    cartServiceMock = {
      cart$: of([mockItem]),
      getTotal: vi.fn().mockReturnValue(200),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      syncCart: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate items from cart$ on init', () => {
    expect(component.items.length).toBe(1);
    expect(component.items[0].product.title).toBe('Test Shoe');
  });

  it('total getter should return value from cartService.getTotal()', () => {
    expect(component.total).toBe(200);
    expect(cartServiceMock.getTotal).toHaveBeenCalled();
  });

  it('increment() should call updateQuantity with quantity + 1', () => {
    component.increment(mockItem);
    expect(cartServiceMock.updateQuantity).toHaveBeenCalledWith(mockProduct.id, 'M', 3);
  });

  it('decrement() should call updateQuantity with quantity - 1 when quantity > 1', () => {
    component.decrement(mockItem);
    expect(cartServiceMock.updateQuantity).toHaveBeenCalledWith(mockProduct.id, 'M', 1);
  });

  it('decrement() should NOT call updateQuantity when quantity is 1', () => {
    const itemWithQty1: CartItem = { ...mockItem, quantity: 1 };
    component.decrement(itemWithQty1);
    expect(cartServiceMock.updateQuantity).not.toHaveBeenCalled();
  });

  it('remove() should call removeFromCart with correct product id and size', () => {
    component.remove(mockItem);
    expect(cartServiceMock.removeFromCart).toHaveBeenCalledWith(mockProduct.id, 'M');
  });

  it('should render the correct number of items in the template', () => {
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const itemCount = compiled.querySelectorAll('[data-testid="cart-item"], .bg-gray-50.rounded-2xl').length;
    expect(itemCount).toBeGreaterThan(0);
  });

  it('should show the empty state when there are no items', async () => {
    cartServiceMock = {
      cart$: of([]),
      getTotal: vi.fn().mockReturnValue(0),
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      syncCart: vi.fn(),
    };
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartServiceMock },
      ],
    }).compileComponents();
    const emptyFixture = TestBed.createComponent(Cart);
    await emptyFixture.whenStable();
    emptyFixture.detectChanges();
    const compiled: HTMLElement = emptyFixture.nativeElement;
    expect(compiled.textContent).toContain('Your cart is empty');
  });
});
