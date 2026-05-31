import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Signup } from './signup';
import { AuthService } from '../../../core/services/auth.service';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      signup: vi.fn().mockReturnValue(of({ token: 'fake-token' })),
    };

    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error when required fields are empty on submit', () => {
    component.name = '';
    component.email = '';
    component.password = 'pass123';
    component.confirmPassword = 'pass123';
    component.onSubmit();
    expect(component.error).toBeTruthy();
    expect(authServiceMock.signup).not.toHaveBeenCalled();
  });

  it('should show an error when passwords do not match', () => {
    component.name = 'Alice';
    component.email = 'alice@test.com';
    component.password = 'password123';
    component.confirmPassword = 'different456';
    component.onSubmit();
    expect(component.error).toContain('match');
    expect(authServiceMock.signup).not.toHaveBeenCalled();
  });

  it('should call authService.signup when all fields are valid', () => {
    component.name = 'Alice';
    component.email = 'alice@test.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(authServiceMock.signup).toHaveBeenCalledWith('Alice', 'alice@test.com', 'password123');
  });

  it('should clear error on a successful signup call', () => {
    component.error = 'old error';
    component.name = 'Alice';
    component.email = 'alice@test.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error).toBe('');
  });

  it('should display server error message on signup failure', () => {
    authServiceMock.signup = vi.fn().mockReturnValue(
      throwError(() => ({ error: { message: 'Email already in use' }, status: 409 }))
    );
    component.name = 'Alice';
    component.email = 'existing@test.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';
    component.onSubmit();
    expect(component.error).toBe('Email already in use');
  });

  it('should fall back to generic error message when server provides none', () => {
    authServiceMock.signup = vi.fn().mockReturnValue(
      throwError(() => ({ error: {}, status: 500 }))
    );
    component.name = 'Bob';
    component.email = 'bob@test.com';
    component.password = 'pass123';
    component.confirmPassword = 'pass123';
    component.onSubmit();
    expect(component.error).toBe('Signup failed');
  });

  it('should render the error toast in the template when error is set', async () => {
    // Set error BEFORE the very first detectChanges so Angular has no prior value to compare against
    const freshFixture = TestBed.createComponent(Signup);
    freshFixture.componentInstance.error = 'Something went wrong';
    freshFixture.detectChanges();
    const compiled: HTMLElement = freshFixture.nativeElement;
    expect(compiled.textContent).toContain('Something went wrong');
  });
});
