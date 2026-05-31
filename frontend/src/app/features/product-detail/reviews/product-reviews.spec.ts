import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { ProductReviews } from './product-reviews';
import { AuthService } from '../../../core/services/auth.service';

const mockReviews = [
  { _id: 'r1', rating: 5, comment: 'Great!', user: { name: 'Alice' }, createdAt: '2024-01-01' },
];

describe('ProductReviews', () => {
  let component: ProductReviews;
  let fixture: ComponentFixture<ProductReviews>;
  let httpMock: HttpTestingController;
  let authMock: any;

  beforeEach(async () => {
    authMock = {
      isLoggedIn: vi.fn().mockReturnValue(true),
      getUser: vi.fn().mockReturnValue({ name: 'Test User' }),
    };

    await TestBed.configureTestingModule({
      imports: [ProductReviews],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductReviews);
    component = fixture.componentInstance;
    component.slug = 'test-product';
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    component.initialReviews = [];
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should use initialReviews when provided', () => {
    component.initialReviews = mockReviews;
    fixture.detectChanges();
    expect(component.reviews.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should load reviews via HTTP when initialReviews is null', () => {
    component.initialReviews = null;
    fixture.detectChanges();
    const req = httpMock.expectOne(r => r.url.includes('/api/reviews'));
    req.flush({ reviews: mockReviews });
    expect(component.reviews.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should handle HTTP error on loadReviews', () => {
    component.initialReviews = null;
    fixture.detectChanges();
    const req = httpMock.expectOne(r => r.url.includes('/api/reviews'));
    req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    expect(component.error).toBeTruthy();
    expect(component.loading).toBe(false);
  });

  it('openForm() should show form', () => {
    component.initialReviews = [];
    fixture.detectChanges();
    component.openForm();
    expect(component.showForm).toBe(true);
  });

  it('closeForm() should hide form', () => {
    component.initialReviews = [];
    fixture.detectChanges();
    component.showForm = true;
    component.closeForm();
    expect(component.showForm).toBe(false);
  });

  it('setRating() should set rating', () => {
    component.initialReviews = [];
    fixture.detectChanges();
    component.setRating(4);
    expect(component.rating).toBe(4);
  });

  it('setHover() and clearHover() should manage hoverRating', () => {
    component.initialReviews = [];
    fixture.detectChanges();
    component.setHover(3);
    expect(component.hoverRating).toBe(3);
    component.clearHover();
    expect(component.hoverRating).toBe(0);
  });

  it('submitReview() should post review and update list', () => {
    component.initialReviews = mockReviews;
    fixture.detectChanges();
    component.rating = 5;
    component.comment = 'Excellent';
    component.submitReview();
    const req = httpMock.expectOne(r => r.url.includes('/api/reviews'));
    req.flush({ review: { _id: 'r2', rating: 5, comment: 'Excellent', user: { name: 'Test User' }, createdAt: '2024-01-02' } });
    expect(component.reviews.length).toBe(2);
    expect(component.showForm).toBe(false);
  });

  it('submitReview() should not post if not logged in', () => {
    authMock.isLoggedIn.mockReturnValue(false);
    component.initialReviews = [];
    fixture.detectChanges();
    component.submitReview();
    httpMock.expectNone(r => r.url.includes('/api/reviews'));
  });

  it('submitReview() should handle error', () => {
    component.initialReviews = [];
    fixture.detectChanges();
    component.rating = 4;
    component.comment = 'Okay';
    component.submitReview();
    const req = httpMock.expectOne(r => r.url.includes('/api/reviews'));
    req.flush({ message: 'Failed' }, { status: 400, statusText: 'Bad Request' });
    expect(component.submitError).toBeTruthy();
    expect(component.submitting).toBe(false);
  });

  it('ngOnChanges should reload when initialReviews changes', () => {
    component.initialReviews = mockReviews;
    fixture.detectChanges();
    const newReviews = [{ _id: 'r3', rating: 3, comment: 'Ok', user: { name: 'Bob' }, createdAt: '2024-02-01' }];
    component.initialReviews = newReviews;
    component.ngOnChanges({
      initialReviews: new SimpleChange(mockReviews, newReviews, false),
    });
    expect(component.reviews.length).toBe(1);
    expect(component.reviews[0]._id).toBe('r3');
  });
});
