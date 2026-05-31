import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../../core/services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      loginRaw: vi.fn().mockReturnValue(of({ token: 'fake-token' })),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error when email and password are empty on submit', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();
    expect(component.error).toBeTruthy();
    expect(authServiceMock.loginRaw).not.toHaveBeenCalled();
  });

  it('should show an error when password is whitespace-only', () => {
    component.email = 'user@test.com';
    component.password = '   ';
    component.onSubmit();
    expect(component.error).toBeTruthy();
    expect(authServiceMock.loginRaw).not.toHaveBeenCalled();
  });

  it('should call authService.loginRaw with trimmed credentials when form is valid', () => {
    component.email = '  user@test.com  ';
    component.password = 'password123';
    component.onSubmit();
    expect(authServiceMock.loginRaw).toHaveBeenCalledWith('user@test.com', 'password123');
  });

  it('should clear error on successful login', () => {
    component.error = 'old error';
    component.email = 'user@test.com';
    component.password = 'password123';
    component.onSubmit();
    expect(component.error).toBe('');
  });

  it('should display error message from server on login failure', () => {
    authServiceMock.loginRaw = vi.fn().mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' }, status: 401 }))
    );
    component.email = 'user@test.com';
    component.password = 'wrongpass';
    component.onSubmit();
    expect(component.error).toBe('Invalid credentials');
  });

  it('should fall back to a generic error message when server provides none', () => {
    authServiceMock.loginRaw = vi.fn().mockReturnValue(
      throwError(() => ({ error: {}, status: 500 }))
    );
    component.email = 'user@test.com';
    component.password = 'pass';
    component.onSubmit();
    expect(component.error).toBe('Login failed');
  });

  it('should render an error toast in the template when error is set', async () => {
    // Set error BEFORE the very first detectChanges so Angular has no prior value to compare against
    const freshFixture = TestBed.createComponent(Login);
    freshFixture.componentInstance.error = 'Test error';
    freshFixture.detectChanges();
    const compiled: HTMLElement = freshFixture.nativeElement;
    expect(compiled.textContent).toContain('Test error');
  });

  it('should not render the error toast when error is empty', async () => {
    component.error = '';
    fixture.detectChanges();
    const compiled: HTMLElement = fixture.nativeElement;
    const toast = compiled.querySelector('.bg-red-500');
    expect(toast).toBeNull();
  });
});
