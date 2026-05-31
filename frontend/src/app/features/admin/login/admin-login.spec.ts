import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminLogin } from './admin-login';
import { AuthService } from '../../../core/services/auth.service';

describe('AdminLogin', () => {
  let component: AdminLogin;
  let fixture: ComponentFixture<AdminLogin>;
  let authMock: any;

  beforeEach(async () => {
    authMock = {
      isLoggedIn: vi.fn().mockReturnValue(false),
      isAdmin: vi.fn().mockReturnValue(false),
      loginRaw: vi.fn().mockReturnValue(of({ token: 'tok' })),
    };

    await TestBed.configureTestingModule({
      imports: [AdminLogin],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have empty email and password by default', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('login() should not proceed when already loading', () => {
    component.loading = true;
    component.login();
    expect(authMock.loginRaw).not.toHaveBeenCalled();
  });
});
