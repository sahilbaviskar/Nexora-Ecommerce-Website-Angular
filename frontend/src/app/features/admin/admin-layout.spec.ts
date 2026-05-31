import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLayout } from './admin-layout';
import { AuthService } from '../../core/services/auth.service';

describe('AdminLayout', () => {
  let component: AdminLayout;
  let fixture: ComponentFixture<AdminLayout>;
  let authMock: any;

  beforeEach(async () => {
    authMock = {
      getUser: vi.fn().mockReturnValue({ name: 'SuperAdmin' }),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('adminName should return user name from AuthService', () => {
    expect(component.adminName).toBe('SuperAdmin');
  });

  it('adminName should return "Admin" when user is null', () => {
    authMock.getUser.mockReturnValue(null);
    expect(component.adminName).toBe('Admin');
  });

  it('logout() should call authService.logout()', () => {
    component.logout();
    expect(authMock.logout).toHaveBeenCalled();
  });
});
