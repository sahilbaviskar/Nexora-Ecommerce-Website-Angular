import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyShop } from './why-shop';

describe('WhyShop', () => {
  let component: WhyShop;
  let fixture: ComponentFixture<WhyShop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhyShop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhyShop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
