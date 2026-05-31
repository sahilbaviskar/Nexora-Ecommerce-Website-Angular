import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';


// import ProductsData from '../../../../../data/products.json'
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { switchMap, forkJoin } from 'rxjs';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductReviews } from '../reviews/product-reviews';
import { ProductCard } from '../../products/product-card/product-card';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductReviews, ProductCard],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product!: Product;
  reviews: any[] = [];
  constructor(private route:ActivatedRoute, private productService: ProductService, private router: Router, public wishlistService: WishlistService, private cartService: CartService, private cdr: ChangeDetectorRef){}

  colorMap: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'navy-blue': '#1e3a5f',
    'lime-green': '#84cc16',
    'green': '#22c55e',
    'yellow': '#eab308',
    'orange': '#f97316',
    'pink': '#ec4899',
    'purple': '#a855f7',
    'gray': '#6b7280',
    'grey': '#6b7280',
    'brown': '#92400e',
    'beige': '#d4b896',
    'cream': '#fffdd0',
    'maroon': '#800000',
    'teal': '#14b8a6',
    'coral': '#ff7f50',
    'olive': '#808000',
    'sky-blue': '#38bdf8',
    'dark-green': '#166534',
    'light-gray': '#d1d5db',
    'charcoal': '#374151',
    'dark-blue': '#10315d',
    'brinjal': '#6c3869',
    'green-luxury': '#006557',
    'khaki': '#625d44',
    'multicolor': 'linear-gradient(45deg, #ef4444, #3b82f6, #22c55e, #eab308, #ec4899, #a855f7)',
    'denim': '#3b82f6',
    'olive-drab': '#6b8e23',
    'mustard': '#ffdb58',
    'emerald': '#50c878',
    'sapphire': '#0f52ba',
  };

  getColorHex(color: string): string {
    return this.colorMap[color] || color;
  }

  get isLiked(): boolean {
    return this.wishlistService.isInWishlist(this.product?.id);
  }

  toogleLike(){
    this.wishlistService.toggle(this.product);
  }

  selectedSize: string = 'M';
  addedToCart = false;
  quantity = 1;

  get isOutOfStock(): boolean {
    return this.product?.stock === 0;
  }

  get lowStock(): number | null {
    const s = this.product?.stock;
    return s !== undefined && s > 0 && s <= 3 ? s : null;
  }

  get isAtMaxQty(): boolean {
    return this.product?.stock !== undefined && this.quantity >= this.product.stock;
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  incrementQty() {
    const maxQty = this.product?.stock ?? Infinity;
    if (this.quantity < maxQty) this.quantity++;
  }

  decrementQty() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart() {
    if (this.addedToCart || this.isOutOfStock) return;
    this.cartService.setInCart(this.product, this.selectedSize, this.quantity);
    this.addedToCart = true;
    this.cdr.markForCheck();
    setTimeout(() => { this.addedToCart = false; this.cdr.markForCheck(); }, 2000);
  }

  buyNow() {
    if (this.isOutOfStock) return;
    this.cartService.setInCart(this.product, this.selectedSize, this.quantity);
    this.router.navigate(['/checkout']);
  }

  selectedImage:string = '';
  relatedProducts:Product[] = [];


  ngOnInit(){
    this.wishlistService.syncWishlist();

    this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug') ?? '';
        return forkJoin({
          detail: this.productService.getProductBySlug(slug),
          allProducts: this.productService.getProducts()
        });
      })
    ).subscribe(({ detail, allProducts }) => {
      this.product = detail.product;
      this.reviews = detail.reviews;
      this.selectedImage = this.product.images?.[0] || this.product.image;
      this.relatedProducts = allProducts.filter(p =>
        p.category === this.product.category &&
        p.subcategory === this.product.subcategory &&
        p.slug !== this.product.slug
      ).slice(0, 4);
      this.cdr.markForCheck();
    });
  }
}
