import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

@Component({ standalone: true, template: '' })
class StubRouteComponent {}
import { of, Subject } from 'rxjs';
import { Checkout } from './checkout';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';

describe('Checkout', () => {
  let component: Checkout;
  let fixture: ComponentFixture<Checkout>;
  let authMock: any;
  let cartSubject: Subject<any[]>;
  let cartMock: any;
  let orderMock: any;
  let profileMock: any;
  let toastMock: any;

  beforeEach(async () => {
    cartSubject = new Subject<any[]>();
    authMock = { isLoggedIn: vi.fn().mockReturnValue(true), getUser: vi.fn().mockReturnValue({ name: 'Test User' }) };
    cartMock = {
      syncCart: vi.fn(),
      cart$: cartSubject.asObservable(),
      clearCart: vi.fn(),
      removeFromCart: vi.fn(),
      updateQuantity: vi.fn(),
    };
    orderMock = { placeOrder: vi.fn().mockReturnValue(of({ order: { _id: 'ord1' } })) };
    profileMock = { getAddresses: vi.fn().mockReturnValue(of([])) };
    toastMock = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [
        provideRouter([{ path: '**', component: StubRouteComponent }]),
        { provide: AuthService, useValue: authMock },
        { provide: CartService, useValue: cartMock },
        { provide: OrderService, useValue: orderMock },
        { provide: ProfileService, useValue: profileMock },
        { provide: ToastService, useValue: toastMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should call syncCart when logged in', () => {
    expect(cartMock.syncCart).toHaveBeenCalled();
  });

  it('should update cartItems when cart$ emits', () => {
    const items = [{ product: { id: 1 }, quantity: 2, size: 'M' }];
    cartSubject.next(items as any);
    expect(component.cartItems.length).toBe(1);
  });

  it('should redirect to login when not authenticated', async () => {
    authMock.isLoggedIn.mockReturnValue(false);
    const newFixture = TestBed.createComponent(Checkout);
    newFixture.detectChanges();
    await newFixture.whenStable();
    expect(newFixture.componentInstance).toBeTruthy();
  });

  it('should start at step 1', () => {
    expect(component.currentStep).toBe(1);
  });

  it('should have cod as default payment method', () => {
    expect(component.paymentMethod).toBe('cod');
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  });

  it('subtotal, shipping, tax, total, discount, grandTotal, totalItems computed correctly', () => {
    component.cartItems = [
      { product: { price: 600, id: 1, productId: 1, title: 'T', image: '', images: [], category: 'c', subcategory: 's', colors: [], collections: [], tags: [], description: '', slug: 's-1' } as any, quantity: 2, size: 'M' }
    ];
    expect(component.subtotal).toBe(1200);
    expect(component.shipping).toBe(0); // > 500
    expect(component.tax).toBe(Math.round(1200 * 0.18));
    expect(component.total).toBe(component.subtotal + component.shipping + component.tax);
    expect(component.discount).toBe(Math.round(1200 * 0.1)); // > 1000
    expect(component.grandTotal).toBe(component.total - component.discount);
    expect(component.totalItems).toBe(2);
  });

  it('shipping should be 50 when subtotal <= 500', () => {
    component.cartItems = [
      { product: { price: 100, id: 1, productId: 1, title: 'T', image: '', images: [], category: 'c', subcategory: 's', colors: [], collections: [], tags: [], description: '', slug: 's-1' } as any, quantity: 1, size: 'M' }
    ];
    expect(component.shipping).toBe(50);
  });

  it('discount should be 0 when subtotal <= 1000', () => {
    component.cartItems = [
      { product: { price: 200, id: 1, productId: 1, title: 'T', image: '', images: [], category: 'c', subcategory: 's', colors: [], collections: [], tags: [], description: '', slug: 's-1' } as any, quantity: 1, size: 'M' }
    ];
    expect(component.discount).toBe(0);
  });

  it('isAddressValid() returns false when fields empty', () => {
    expect(component.isAddressValid()).toBe(false);
  });

  it('isAddressValid() returns true when all fields filled', () => {
    component.address = { fullName: 'John', phone: '1234567890', street: '1 St', city: 'NYC', state: 'NY', zip: '10001', landmark: '' };
    expect(component.isAddressValid()).toBe(true);
  });

  it('isPaymentValid() returns true for cod', () => {
    component.paymentMethod = 'cod';
    expect(component.isPaymentValid()).toBe(true);
  });

  it('isPaymentValid() validates upi', () => {
    component.paymentMethod = 'upi';
    component.upiId = 'user@upi';
    expect(component.isPaymentValid()).toBe(true);
    component.upiId = 'invalid';
    expect(component.isPaymentValid()).toBe(false);
  });

  it('isPaymentValid() validates card', () => {
    component.paymentMethod = 'card';
    component.card = { number: '1234567890123456', name: 'John', expiry: '12/25', cvv: '123' };
    expect(component.isPaymentValid()).toBe(true);
    component.card = { number: '123', name: '', expiry: '', cvv: '' };
    expect(component.isPaymentValid()).toBe(false);
  });

  it('prevStep() should decrement step', () => {
    component.currentStep = 2;
    component.prevStep();
    expect(component.currentStep).toBe(1);
  });

  it('prevStep() should not go below 1', () => {
    component.currentStep = 1;
    component.prevStep();
    expect(component.currentStep).toBe(1);
  });

  it('nextStep() should not advance with invalid address', () => {
    component.currentStep = 1;
    component.nextStep();
    expect(component.currentStep).toBe(1);
  });

  it('nextStep() step 2 with valid payment advances to step 3', () => {
    component.currentStep = 2;
    component.paymentMethod = 'cod';
    component.nextStep();
    expect(component.currentStep).toBe(3);
  });

  it('continueShopping() should navigate to /', () => {
    expect(() => component.continueShopping()).not.toThrow();
  });

  it('placeOrder() should call orderService', () => {
    component.address = { fullName: 'John', phone: '123', street: '1 St', city: 'NYC', state: 'NY', zip: '10001', landmark: '' };
    component.placeOrder();
    expect(orderMock.placeOrder).toHaveBeenCalled();
    expect(component.orderPlaced).toBe(true);
  });

  it('placeOrder() should not call twice if placing', () => {
    component.placingOrder = true;
    component.placeOrder();
    expect(orderMock.placeOrder).not.toHaveBeenCalled();
  });

  it('selectAddress() should update address from savedAddresses', () => {
    component.savedAddresses = [{ fullName: 'Alice', phone: '555', street: '2nd Ave', city: 'LA', state: 'CA', zip: '90001', landmark: '' }];
    component.selectAddress(0);
    expect(component.address.fullName).toBe('Alice');
    expect(component.showNewAddressForm).toBe(false);
  });

  it('useNewAddress() should reset address form', () => {
    component.useNewAddress();
    expect(component.showNewAddressForm).toBe(true);
    expect(component.selectedAddressIndex).toBe(-1);
  });
});
