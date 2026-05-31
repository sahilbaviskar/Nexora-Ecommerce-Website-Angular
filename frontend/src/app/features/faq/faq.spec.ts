import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Faq } from './faq';

describe('Faq', () => {
  let component: Faq;
  let fixture: ComponentFixture<Faq>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Faq] }).compileComponents();
    fixture = TestBed.createComponent(Faq);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have faqs array populated', () => {
    expect(component.faqs.length).toBeGreaterThan(0);
  });

  it('should have first faq open by default', () => {
    expect(component.faqs[0].open).toBe(true);
  });

  it('toggle() should flip the open state', () => {
    const faq = component.faqs[0];
    const initial = faq.open;
    component.toggle(faq);
    expect(faq.open).toBe(!initial);
  });

  it('toggle() can re-open a closed faq', () => {
    const faq = component.faqs[1]; // starts closed
    expect(faq.open).toBe(false);
    component.toggle(faq);
    expect(faq.open).toBe(true);
  });
});
