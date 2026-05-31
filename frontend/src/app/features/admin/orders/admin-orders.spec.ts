import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminOrders } from './admin-orders';
import { AdminService } from '../../../core/services/admin.service';

const mockOrders = [
  { _id: 'o1', status: 'pending', total: 100, user: { name: 'Alice' }, createdAt: new Date().toISOString() },
  { _id: 'o2', status: 'shipped', total: 200, user: { name: 'Bob' }, createdAt: new Date().toISOString() },
];

describe('AdminOrders', () => {
  let component: AdminOrders;
  let fixture: ComponentFixture<AdminOrders>;
  let adminMock: any;

  beforeEach(async () => {
    adminMock = {
      getAllOrders: vi.fn().mockReturnValue(of({ orders: mockOrders })),
      updateOrderStatus: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [AdminOrders],
      providers: [{ provide: AdminService, useValue: adminMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load orders on init', () => {
    expect(adminMock.getAllOrders).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });
});
