import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BlogService } from './blog.service';

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;
  const api = 'http://localhost:3000/api/blogs';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getBlogs() should GET /blogs with no params by default', () => {
    service.getBlogs().subscribe();
    httpMock.expectOne(api).flush({ blogs: [], totalPages: 1 });
  });

  it('getBlogs() should include category param when provided', () => {
    service.getBlogs({ category: 'style' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === api);
    expect(req.request.params.get('category')).toBe('style');
    req.flush({ blogs: [], totalPages: 1 });
  });

  it('getBlogs() should include page and limit params', () => {
    service.getBlogs({ page: 2, limit: 5 }).subscribe();
    const req = httpMock.expectOne((r) => r.url === api);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({ blogs: [], totalPages: 1 });
  });

  it('getBlogBySlug() should GET /blogs/:slug', () => {
    service.getBlogBySlug('my-post').subscribe();
    httpMock.expectOne(`${api}/my-post`).flush({ blog: {} });
  });

  it('getCategories() should GET /blogs/categories', () => {
    service.getCategories().subscribe();
    httpMock.expectOne(`${api}/categories`).flush({ categories: ['style', 'tips'] });
  });
});
