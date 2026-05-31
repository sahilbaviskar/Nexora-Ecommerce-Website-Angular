import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getDashboard() should GET /admin/dashboard', () => {
    service.getDashboard().subscribe();
    httpMock.expectOne(`${api}/admin/dashboard`).flush({ stats: {} });
  });

  it('getUsers() should GET /admin/users', () => {
    service.getUsers().subscribe();
    httpMock.expectOne(`${api}/admin/users`).flush({ users: [] });
  });

  it('getAllOrders() should GET /admin/orders', () => {
    service.getAllOrders().subscribe();
    httpMock.expectOne(`${api}/admin/orders`).flush({ orders: [] });
  });

  it('updateOrderStatus() should PUT /orders/:id/status with body', () => {
    service.updateOrderStatus('order1', 'shipped').subscribe();
    const req = httpMock.expectOne(`${api}/orders/order1/status`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.status).toBe('shipped');
    req.flush({});
  });

  it('updateOrderStatus() should include paymentStatus when provided', () => {
    service.updateOrderStatus('order2', 'delivered', 'paid').subscribe();
    const req = httpMock.expectOne(`${api}/orders/order2/status`);
    expect(req.request.body.paymentStatus).toBe('paid');
    req.flush({});
  });

  it('getProducts() should GET /products with page and limit', () => {
    service.getProducts(2, 10).subscribe();
    httpMock.expectOne(`${api}/products?page=2&limit=10`).flush({ products: [] });
  });

  it('createProduct() should POST /products', () => {
    const data = { title: 'New Product' };
    service.createProduct(data).subscribe();
    const req = httpMock.expectOne(`${api}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({});
  });

  it('updateProduct() should PUT /products/:id', () => {
    service.updateProduct(42, { title: 'Updated' }).subscribe();
    const req = httpMock.expectOne(`${api}/products/42`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('deleteProduct() should DELETE /products/:id', () => {
    service.deleteProduct(42).subscribe();
    const req = httpMock.expectOne(`${api}/products/42`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
