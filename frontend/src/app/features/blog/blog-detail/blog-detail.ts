import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Blog } from '../../../core/models/blog.model';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css',
})
export class BlogDetail implements OnInit {
  blog: Blog | null = null;
  relatedBlogs: Blog[] = [];
  loading = true;
  error = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) { this.router.navigate(['/blog']); return; }
      this.load(slug);
    });
  }

  private load(slug: string) {
    this.loading = true;
    this.error = '';
    this.blogService.getBlogBySlug(slug).subscribe({
      next: (res) => {
        this.blog = res.blog;
        this.loading = false;
        this.cdr.markForCheck();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.loadRelated();
      },
      error: () => {
        this.error = 'Blog post not found.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadRelated() {
    if (!this.blog) return;
    this.blogService
      .getBlogs({ category: this.blog.category, limit: 4 })
      .subscribe({
        next: (res) => {
          this.relatedBlogs = res.blogs.filter((b) => b._id !== this.blog!._id).slice(0, 3);
          this.cdr.markForCheck();
        },
        error: () => {}
      });
  }
}
