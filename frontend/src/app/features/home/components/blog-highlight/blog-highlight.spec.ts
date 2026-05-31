import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BlogHighlight } from './blog-highlight';

describe('BlogHighlight', () => {
  let component: BlogHighlight;
  let fixture: ComponentFixture<BlogHighlight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogHighlight],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogHighlight);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
