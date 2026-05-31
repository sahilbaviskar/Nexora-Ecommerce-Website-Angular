import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ExploreColors } from './explore-colors';

describe('ExploreColors', () => {
  let component: ExploreColors;
  let fixture: ComponentFixture<ExploreColors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreColors],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreColors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
