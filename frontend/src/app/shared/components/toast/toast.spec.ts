import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast';
import { ToastService } from '../../../core/services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToastComponent] }).compileComponents();
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('icon() should return SVG string for success', () => {
    expect(component.icon('success')).toContain('<svg');
  });

  it('icon() should return SVG string for error', () => {
    expect(component.icon('error')).toContain('<svg');
  });

  it('icon() should return SVG string for warning', () => {
    expect(component.icon('warning')).toContain('<svg');
  });

  it('icon() should return SVG string for info', () => {
    expect(component.icon('info')).toContain('<svg');
  });

  it('colors() should return green border class for success', () => {
    expect(component.colors('success')).toContain('border-green-500');
  });

  it('colors() should return red border class for error', () => {
    expect(component.colors('error')).toContain('border-red-500');
  });

  it('colors() should return orange border class for warning', () => {
    expect(component.colors('warning')).toContain('border-orange-400');
  });

  it('colors() should return blue border class for info', () => {
    expect(component.colors('info')).toContain('border-blue-500');
  });

  it('iconColor() should return correct color class for each type', () => {
    expect(component.iconColor('success')).toContain('green');
    expect(component.iconColor('error')).toContain('red');
    expect(component.iconColor('warning')).toContain('orange');
    expect(component.iconColor('info')).toContain('blue');
  });

  it('trackById() should return toast id', () => {
    expect(component.trackById(0, { id: 42, message: 'test', type: 'info' })).toBe(42);
  });
});
