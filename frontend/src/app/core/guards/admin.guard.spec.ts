import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

@Component({ standalone: true, template: '' })
class StubRouteComponent {}

describe('adminGuard', () => {
  let authMock: { isLoggedIn: ReturnType<typeof vi.fn>; isAdmin: ReturnType<typeof vi.fn> };

  const run = () =>
    TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  beforeEach(() => {
    authMock = { isLoggedIn: vi.fn(), isAdmin: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: StubRouteComponent }]),
        { provide: AuthService, useValue: authMock },
      ],
    });
  });

  it('should return true when user is logged in and is admin', () => {
    authMock.isLoggedIn.mockReturnValue(true);
    authMock.isAdmin.mockReturnValue(true);
    expect(run()).toBe(true);
  });

  it('should return false when user is logged in but not admin', () => {
    authMock.isLoggedIn.mockReturnValue(true);
    authMock.isAdmin.mockReturnValue(false);
    expect(run()).toBe(false);
  });

  it('should return false when user is not logged in', () => {
    authMock.isLoggedIn.mockReturnValue(false);
    authMock.isAdmin.mockReturnValue(false);
    expect(run()).toBe(false);
  });
});
