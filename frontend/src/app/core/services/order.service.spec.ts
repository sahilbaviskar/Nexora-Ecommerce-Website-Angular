import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:3000/api/orders';

  const mockAddress = {
    fullName: 'John Doe', phone: '9999999999', addressLine1: '123 St',
    addressLine2: '', city: 'Mumbai', state: 'MH', postalCode: '400001', country: 'India',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('placeOrder() should POST /orders with payload', () => {
    const payload = { paymentMethod: 'COD' as const, shippingAddress: mockAddress };
    service.placeOrder(payload).subscribe();
    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.paymentMethod).toBe('COD');
    req.flush({ order: { _id: 'ord1' } });
  });

  it('getMyOrders() should GET /orders and extract orders array', () => {
    let result: any[];
    service.getMyOrders().subscribe((orders) => (result = orders));
    const req = httpMock.expectOne(api);
    expect(req.request.method).toBe('GET');
    req.flush({ orders: [{ _id: 'o1' }, { _id: 'o2' }] });
    expect(result!.length).toBe(2);
  });

  it('getMyOrders() should return empty array when orders is missing', () => {
    let result: any[];
    service.getMyOrders().subscribe((orders) => (result = orders));
    httpMock.expectOne(api).flush({});
    expect(result!).toEqual([]);
  });
});
