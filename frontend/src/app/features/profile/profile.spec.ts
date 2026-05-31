import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Profile } from './profile';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProfileService } from '../../core/services/profile.service';
import { OrderService } from '../../core/services/order.service';
import { Subject } from 'rxjs';

const mockUser = { name: 'Test User', email: 'test@test.com' };

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let authMock: any;
  let cartSubject: Subject<any[]>;
  let wishSubject: Subject<any[]>;
  let cartMock: any;
  let wishlistMock: any;
  let profileMock: any;
  let orderMock: any;

  beforeEach(async () => {
    cartSubject = new Subject();
    wishSubject = new Subject();

    authMock = {
      getUser: vi.fn().mockReturnValue(mockUser),
      logout: vi.fn(),
    };
    cartMock = {
      syncCart: vi.fn(),
      cart$: cartSubject.asObservable(),
      getCount: vi.fn().mockReturnValue(2),
    };
    wishlistMock = {
      syncWishlist: vi.fn(),
      wishlist$: wishSubject.asObservable(),
      getCount: vi.fn().mockReturnValue(3),
    };
    profileMock = {
      getProfile: vi.fn().mockReturnValue(of({ name: 'Test User', email: 'test@test.com', phone: '1234567890' })),
      getAddresses: vi.fn().mockReturnValue(of([])),
      addAddress: vi.fn().mockReturnValue(of({})),
      deleteAddress: vi.fn().mockReturnValue(of({})),
      updateAddress: vi.fn().mockReturnValue(of({})),
      updateProfile: vi.fn().mockReturnValue(of({})),
    };
    orderMock = {
      getMyOrders: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: CartService, useValue: cartMock },
        { provide: WishlistService, useValue: wishlistMock },
        { provide: ProfileService, useValue: profileMock },
        { provide: OrderService, useValue: orderMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load user on init', () => {
    expect(component.user?.name).toBe('Test User');
  });

  it('getInitials() should return initials', () => {
    expect(component.getInitials()).toBe('TU');
  });

  it('getInitials() with null user returns ?', () => {
    component.user = null;
    expect(component.getInitials()).toBe('?');
  });

  it('getMemberSince() should return a string', () => {
    expect(typeof component.getMemberSince()).toBe('string');
  });

  it('logout() should call authService.logout', () => {
    component.logout();
    expect(authMock.logout).toHaveBeenCalled();
  });

  it('should update totalCart when cart$ emits', () => {
    cartSubject.next([{}, {}]);
    expect(component.totalCart).toBe(2);
  });

  it('should update totalWishlist when wishlist$ emits', () => {
    wishSubject.next([{}, {}, {}]);
    expect(component.totalWishlist).toBe(3);
  });

  it('loadAddresses() should populate addresses', () => {
    profileMock.getAddresses.mockReturnValue(of([
      { _id: 'a1', type: 'home', fullName: 'Jane', addressLine1: '1 St', city: 'NY', state: 'NY', postalCode: '10001', phone: '555', isDefault: true }
    ]));
    component.loadAddresses();
    expect(component.addresses.length).toBe(1);
    expect(component.addresses[0].label).toBe('Home');
  });

  it('loadAddresses() maps office label to Work', () => {
    profileMock.getAddresses.mockReturnValue(of([
      { _id: 'a2', type: 'office', fullName: 'Bob', addressLine1: '2 Ave', city: 'LA', state: 'CA', postalCode: '90001', phone: '666', isDefault: false }
    ]));
    component.loadAddresses();
    expect(component.addresses[0].label).toBe('Work');
  });
});
