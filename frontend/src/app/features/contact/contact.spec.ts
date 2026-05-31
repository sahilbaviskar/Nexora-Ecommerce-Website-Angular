import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Contact } from './contact';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Contact] }).compileComponents();
    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('should create', () => expect(component).toBeTruthy());

  it('should have empty form by default', () => {
    expect(component.form.name).toBe('');
    expect(component.submitted).toBe(false);
    expect(component.sending).toBe(false);
  });

  it('send() should not proceed with empty required fields', () => {
    component.send();
    expect(component.sending).toBe(false);
  });

  it('send() should set sending=true when fields are filled', () => {
    component.form = { name: 'Alice', email: 'alice@test.com', subject: 'Hi', message: 'Hello' };
    component.send();
    expect(component.sending).toBe(true);
    expect(component.submitted).toBe(false);
  });

  it('send() should set submitted=true after timeout', () => {
    component.form = { name: 'Alice', email: 'alice@test.com', subject: 'Hi', message: 'Hello' };
    component.send();
    vi.advanceTimersByTime(1200);
    expect(component.submitted).toBe(true);
    expect(component.sending).toBe(false);
  });

  it('send() should reset form after submission', () => {
    component.form = { name: 'Alice', email: 'alice@test.com', subject: 'Hi', message: 'Hello' };
    component.send();
    vi.advanceTimersByTime(1200);
    expect(component.form.name).toBe('');
    expect(component.form.email).toBe('');
  });

  it('send() should not proceed when email is missing', () => {
    component.form = { name: 'Alice', email: '', subject: '', message: 'Hello' };
    component.send();
    expect(component.sending).toBe(false);
  });
});
