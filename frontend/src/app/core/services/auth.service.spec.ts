import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', redirectTo: '' }, { path: '', redirectTo: 'login', pathMatch: 'full' }]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isLoggedIn() should return false when no token in localStorage', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn() should return true when token is present in localStorage', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    localStorage.setItem('token', `header.${payload}.signature`);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout() should remove the token from localStorage', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    localStorage.setItem('token', `header.${payload}.signature`);
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('getUser() should return null when no token is stored', () => {
    expect(service.getUser()).toBeNull();
  });

  it('getUser() should return null for a malformed token', () => {
    localStorage.setItem('token', 'not.a.valid.jwt');
    expect(service.getUser()).toBeNull();
  });

  it('getUser() should decode and return name and email from a valid JWT payload', () => {
    const payload = btoa(JSON.stringify({ name: 'Alice', email: 'alice@example.com' }));
    localStorage.setItem('token', `header.${payload}.signature`);
    const user = service.getUser();
    expect(user).not.toBeNull();
    expect(user!.name).toBe('Alice');
    expect(user!.email).toBe('alice@example.com');
  });

  it('login() should store token in localStorage on success', () => {
    const fakeToken = 'fake.jwt.token';
    service.login('test@example.com', 'password123').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password123' });
    req.flush({ token: fakeToken });

    expect(localStorage.getItem('token')).toBe(fakeToken);
  });

  it('login() should propagate the error when the request fails', () => {
    let caughtError: any;
    service.login('bad@example.com', 'wrong').subscribe({
      error: err => (caughtError = err),
    });

    const req = httpMock.expectOne('http://localhost:3000/api/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(caughtError).toBeTruthy();
    expect(caughtError.status).toBe(401);
  });

  it('signup() should store token in localStorage on success', () => {
    const fakeToken = 'signup.jwt.token';
    service.signup('Bob', 'bob@example.com', 'secret123').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/signup');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Bob', email: 'bob@example.com', password: 'secret123' });
    req.flush({ token: fakeToken });

    expect(localStorage.getItem('token')).toBe(fakeToken);
  });

  it('signup() should propagate the error when the request fails', () => {
    let caughtError: any;
    service.signup('Bob', 'existing@example.com', 'pass').subscribe({
      error: err => (caughtError = err),
    });

    const req = httpMock.expectOne('http://localhost:3000/api/signup');
    req.flush({ message: 'Email already exists' }, { status: 409, statusText: 'Conflict' });

    expect(caughtError).toBeTruthy();
    expect(caughtError.status).toBe(409);
  });
});
