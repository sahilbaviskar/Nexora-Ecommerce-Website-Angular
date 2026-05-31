import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

interface ProductForm {
  productId: number | null;
  title: string;
  price: number | null;
  image: string;
  images: string;
  category: string;
  subcategory: string;
  colors: string;
  collections: string;
  tags: string;
  description: string;
  stock: number | null;
}

const emptyForm = (): ProductForm => ({
  productId: null, title: '', price: null, image: '', images: '',
  category: '', subcategory: '', colors: '', collections: '', tags: '',
  description: '', stock: 100
});

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './admin-products.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminProducts implements OnInit {
  products: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';

  showModal = false;
  isEdit = false;
  editingProductId: number | null = null;
  saving = false;
  saveError = '';
  form: ProductForm = emptyForm();

  confirmDeleteId: number | null = null;
  deleting = false;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.adminService.getProducts(1, 200).subscribe({
      next: (res) => {
        this.products = res.items || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load products';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter() {
    const q = this.search.toLowerCase().trim();
    this.filtered = q
      ? this.products.filter(p =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          String(p.productId).includes(q)
        )
      : [...this.products];
  }

  openAdd() {
    this.form = emptyForm();
    this.isEdit = false;
    this.editingProductId = null;
    this.saveError = '';
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openEdit(p: any) {
    this.form = {
      productId: p.productId,
      title: p.title,
      price: p.price,
      image: p.image,
      images: (p.images || []).join('\n'),
      category: p.category,
      subcategory: p.subcategory,
      colors: (p.colors || []).join(', '),
      collections: (p.collections || []).join(', '),
      tags: (p.tags || []).join(', '),
      description: p.description || '',
      stock: p.stock ?? 100
    };
    this.isEdit = true;
    this.editingProductId = p.productId;
    this.saveError = '';
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  splitCSV(val: string): string[] {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }

  splitLines(val: string): string[] {
    return val.split('\n').map(s => s.trim()).filter(Boolean);
  }

  save() {
    if (this.saving) return;
    this.saving = true;
    this.saveError = '';

    const payload: any = {
      title: this.form.title.trim(),
      price: Number(this.form.price),
      image: this.form.image.trim(),
      images: this.splitLines(this.form.images),
      category: this.form.category.trim().toLowerCase(),
      subcategory: this.form.subcategory.trim().toLowerCase(),
      colors: this.splitCSV(this.form.colors),
      collections: this.splitCSV(this.form.collections),
      tags: this.splitCSV(this.form.tags),
      description: this.form.description,
      stock: Number(this.form.stock)
    };

    if (!this.isEdit) {
      payload.productId = Number(this.form.productId);
    }

    const request$ = this.isEdit
      ? this.adminService.updateProduct(this.editingProductId!, payload)
      : this.adminService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.loadProducts();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Save failed';
        this.cdr.markForCheck();
      }
    });
  }

  confirmDelete(productId: number) {
    this.confirmDeleteId = productId;
    this.cdr.markForCheck();
  }

  cancelDelete() {
    this.confirmDeleteId = null;
    this.cdr.markForCheck();
  }

  deleteProduct() {
    if (this.confirmDeleteId == null || this.deleting) return;
    this.deleting = true;
    this.adminService.deleteProduct(this.confirmDeleteId).subscribe({
      next: () => {
        this.deleting = false;
        this.confirmDeleteId = null;
        this.loadProducts();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || 'Delete failed';
        this.confirmDeleteId = null;
        this.cdr.markForCheck();
      }
    });
  }
}
