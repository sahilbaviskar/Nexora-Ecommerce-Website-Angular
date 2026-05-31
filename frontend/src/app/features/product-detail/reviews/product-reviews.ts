// Removed stray class declaration; stars array will be inside the correct class below
import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-reviews.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductReviews implements OnInit, OnChanges {

  @Input() slug!: string;
  @Input() initialReviews: any[] | null = null;
  public stars = [1, 2, 3, 4, 5];
  private readonly apiBaseUrl = 'http://localhost:3000/api/reviews';

  reviews: any[] = [];
  loading = true;
  error = '';

  // Review form modal
  showForm = false;
  rating = 0;
  comment = '';
  submitting = false;
  submitError = '';
  hoverRating = 0;

  constructor(private http: HttpClient, public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.initialReviews !== null) {
      this.reviews = this.initialReviews;
      this.loading = false;
      this.cdr.markForCheck();
    } else {
      this.loadReviews();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialReviews'] && !changes['initialReviews'].firstChange) {
      // parent fetched new product — use its reviews directly
      this.reviews = this.initialReviews || [];
      this.loading = false;
      this.showForm = false;
      this.cdr.markForCheck();
    } else if (changes['slug'] && !changes['slug'].firstChange && this.initialReviews === null) {
      // fallback: no parent reviews — load independently
      this.reviews = [];
      this.showForm = false;
      this.loadReviews();
    }
  }

  loadReviews() {
    this.loading = true;
    this.http.get(`${this.apiBaseUrl}?product=${this.slug}`).subscribe({
      next: (res: any) => {
        this.reviews = res.reviews || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load reviews';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openForm() {
    this.showForm = true;
    this.rating = 0;
    this.comment = '';
    this.submitError = '';
    this.cdr.markForCheck();
  }

  closeForm() {
    this.showForm = false;
    this.cdr.markForCheck();
  }

  setRating(r: number) {
    this.rating = r;
  }

  setHover(r: number) {
    this.hoverRating = r;
  }

  clearHover() {
    this.hoverRating = 0;
  }

  submitReview() {
    if (this.submitting || !this.auth.isLoggedIn()) return;

    this.submitting = true;
    this.submitError = '';

    this.http.post(this.apiBaseUrl, { productSlug: this.slug, rating: this.rating, comment: this.comment }).subscribe({
      next: (res: any) => {
        const review = res.review;
        // Ensure user name is shown immediately (backend may not populate it)
        if (!review.user || !review.user.name) {
          const user = this.auth.getUser();
          review.user = { name: user?.name || 'You' };
        }
        this.reviews.unshift(review);
        this.rating = 0;
        this.comment = '';
        this.submitting = false;
        this.showForm = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        // Try to parse error message from HTML if backend returns HTML
        let msg = 'Failed to submit review';
        if (err?.error) {
          if (typeof err.error === 'string' && err.error.startsWith('<')) {
            msg = 'You are not logged in or session expired.';
          } else if (err.error.message) {
            msg = err.error.message;
          }
        }
        this.submitError = msg;
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}