import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BlogPage } from './blog';
import { BlogService } from '../../core/services/blog.service';

const mockBlogs = [
  { _id: '1', title: 'Post 1', slug: 'post-1', category: 'style', excerpt: '', coverImage: '', author: { name: 'Jane Doe', role: 'Editor' }, createdAt: '' },
];

describe('BlogPage', () => {
  let component: BlogPage;
  let fixture: ComponentFixture<BlogPage>;
  let blogMock: any;

  beforeEach(async () => {
    blogMock = {
      getCategories: vi.fn().mockReturnValue(of({ categories: ['style', 'tips'] })),
      getBlogs: vi.fn().mockReturnValue(of({ blogs: mockBlogs, totalPages: 2 })),
    };

    await TestBed.configureTestingModule({
      imports: [BlogPage],
      providers: [
        provideRouter([]),
        { provide: BlogService, useValue: blogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load categories on init', () => {
    expect(component.categories).toEqual(['style', 'tips']);
  });

  it('should load blogs on init', () => {
    expect(component.blogs.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should set totalPages from response', () => {
    expect(component.totalPages).toBe(2);
  });

  it('load() should reload blogs', () => {
    component.load();
    expect(blogMock.getBlogs).toHaveBeenCalledTimes(2);
  });
});
