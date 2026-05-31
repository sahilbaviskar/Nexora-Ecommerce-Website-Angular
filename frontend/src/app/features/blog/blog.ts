import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Blog } from '../../core/models/blog.model';
import { BlogService } from '../../core/services/blog.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class BlogPage implements OnInit {
  blogs: Blog[] = [];
  categories: string[] = [];
  activeCategory = '';
  loading = true;
  error = '';

  page = 1;
  totalPages = 1;

  private blogService = inject(BlogService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.blogService.getCategories().subscribe({
      next: (res) => { this.categories = res.categories; this.cdr.markForCheck(); },
      error: () => {}
    });
    this.load();
  }

  load() {
    this.loading = true;
    this.blogService
      .getBlogs({ category: this.activeCategory || undefined, page: this.page, limit: 9 })
      .subscribe({
        next: (res) => {
          this.blogs = res.blogs;
          this.totalPages = res.totalPages;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Failed to load blog posts.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  selectCategory(cat: string) {
    this.activeCategory = cat;
    this.page = 1;
    this.load();
  }

  goPage(p: number) {
    this.page = p;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
