import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ToastService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('should add a toast via show()', () => {
    service.show('Hello', 'success');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Hello');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('should auto-dismiss toast after duration', () => {
    service.show('Auto dismiss', 'info', 1000);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
  });

  it('should dismiss a toast by id', () => {
    service.show('A', 'info');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });

  it('should add a success toast', () => {
    service.success('Saved!');
    expect(service.toasts()[0].type).toBe('success');
    expect(service.toasts()[0].message).toBe('Saved!');
  });

  it('should add an error toast', () => {
    service.error('Failed!');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('should add an info toast', () => {
    service.info('Note');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('should add a warning toast', () => {
    service.warning('Watch out');
    expect(service.toasts()[0].type).toBe('warning');
  });

  it('should include image when provided', () => {
    service.show('With image', 'success', 3500, '/img/test.jpg');
    expect(service.toasts()[0].image).toBe('/img/test.jpg');
  });

  it('should stack multiple toasts', () => {
    service.show('First', 'success');
    service.show('Second', 'error');
    expect(service.toasts().length).toBe(2);
  });

  it('should dismiss only the targeted toast', () => {
    service.show('A', 'info');
    service.show('B', 'success');
    const firstId = service.toasts()[0].id;
    service.dismiss(firstId);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('B');
  });
});
