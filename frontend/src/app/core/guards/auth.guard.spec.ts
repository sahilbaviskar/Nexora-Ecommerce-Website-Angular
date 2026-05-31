import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const run = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: vi.fn() } },
      ],
    });
  });

  it('should return true when user is logged in', () => {
    TestBed.inject(AuthService).isLoggedIn = vi.fn().mockReturnValue(true);
    expect(run()).toBe(true);
  });

  it('should return a UrlTree (redirect) when user is not logged in', () => {
    TestBed.inject(AuthService).isLoggedIn = vi.fn().mockReturnValue(false);
    const result = run();
    expect(result).not.toBe(true);
    expect(typeof result).toBe('object'); // UrlTree
  });
});
