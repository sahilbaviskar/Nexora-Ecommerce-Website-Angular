import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('subscribe() with invalid email should not set subscribeMessage', () => {
    component.subscribeEmail = 'invalid';
    component.subscribe();
    expect(component.subscribeMessage).toBe('');
  });

  it('subscribe() with empty email should not set subscribeMessage', () => {
    component.subscribeEmail = '';
    component.subscribe();
    expect(component.subscribeMessage).toBe('');
  });

  it('subscribe() with valid email should set success message', () => {
    component.subscribeEmail = 'user@example.com';
    component.subscribe();
    expect(component.subscribeMessage).toBe('You successfully subscribed to our community platform!');
    expect(component.subscribeEmail).toBe('');
  });
});
