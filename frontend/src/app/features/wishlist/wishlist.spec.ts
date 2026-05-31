import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { Wishlist } from './wishlist';
import { WishlistService } from '../../core/services/wishlist.service';

const mockProduct: any = {
  productId: 1, id: 1, title: 'Test Hat', price: 30, image: '/img/hat.jpg',
  images: [], category: 'men', subcategory: 'hats', colors: [], collections: [],
  tags: [], description: '', slug: 'test-hat-1',
};

describe('Wishlist', () => {
  let component: Wishlist;
  let fixture: ComponentFixture<Wishlist>;
  let wishlistSubject: Subject<any[]>;
  let wishlistMock: any;

  beforeEach(async () => {
    wishlistSubject = new Subject<any[]>();
    wishlistMock = {
      syncWishlist: vi.fn(),
      toggle: vi.fn(),
      wishlist$: wishlistSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [Wishlist],
      providers: [
        provideRouter([]),
        { provide: WishlistService, useValue: wishlistMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Wishlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should call syncWishlist on init', () => {
    expect(wishlistMock.syncWishlist).toHaveBeenCalled();
  });

  it('should update items when wishlist$ emits', () => {
    wishlistSubject.next([mockProduct]);
    expect(component.items.length).toBe(1);
    expect(component.items[0].title).toBe('Test Hat');
  });

  it('remove() should call toggle with the product', () => {
    component.remove(mockProduct);
    expect(wishlistMock.toggle).toHaveBeenCalledWith(mockProduct);
  });

  it('should unsubscribe on destroy', () => {
    const spy = vi.spyOn(component['sub'], 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
