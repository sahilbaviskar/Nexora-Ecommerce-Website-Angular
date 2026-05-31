import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BlogDetail } from './blog-detail';
import { BlogService } from '../../../core/services/blog.service';

const mockBlog = {
  _id: 'b1',
  title: 'Test Post',
  slug: 'test-post',
  category: 'style',
  excerpt: 'excerpt',
  content: 'content',
  coverImage: '',
  author: { name: 'Jane', role: 'Editor' },
  createdAt: '2024-01-01',
  tags: [],
};
const mockRelated = [
  { _id: 'b2', title: 'Related', slug: 'related', category: 'style', excerpt: '', coverImage: '', author: { name: 'Tom', role: 'Writer' }, createdAt: '2024-01-02' },
];

describe('BlogDetail', () => {
  let component: BlogDetail;
  let fixture: ComponentFixture<BlogDetail>;
  let blogMock: any;

  beforeEach(async () => {
    blogMock = {
      getBlogBySlug: vi.fn().mockReturnValue(of({ blog: mockBlog })),
      getBlogs: vi.fn().mockReturnValue(of({ blogs: mockRelated })),
    };

    await TestBed.configureTestingModule({
      imports: [BlogDetail],
      providers: [
        provideRouter([]),
        { provide: BlogService, useValue: blogMock },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: (key: string) => key === 'slug' ? 'test-post' : null }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load blog on init', () => {
    expect(component.blog).not.toBeNull();
    expect(component.blog?.title).toBe('Test Post');
    expect(component.loading).toBe(false);
  });

  it('should load related blogs', () => {
    expect(component.relatedBlogs.length).toBe(1);
  });

  it('should show error when blog not found', async () => {
    blogMock.getBlogBySlug.mockReturnValue(throwError(() => new Error('not found')));
    const f = TestBed.createComponent(BlogDetail);
    f.detectChanges();
    expect(f.componentInstance.error).toBe('Blog post not found.');
  });
});
