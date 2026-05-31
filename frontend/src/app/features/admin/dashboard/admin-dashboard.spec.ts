import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminDashboard } from './admin-dashboard';
import { AdminService } from '../../../core/services/admin.service';

const mockDashboard = {
  stats: { users: 5, orders: 10, products: 50, revenue: 9999 },
  recentOrders: [{ _id: 'o1', total: 100, status: 'pending' }],
};

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;
  let adminMock: any;

  beforeEach(async () => {
    adminMock = { getDashboard: vi.fn().mockReturnValue(of(mockDashboard)) };

    await TestBed.configureTestingModule({
      imports: [AdminDashboard],
      providers: [
        provideRouter([]),
        { provide: AdminService, useValue: adminMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load stats on init', () => {
    expect(adminMock.getDashboard).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });
});
