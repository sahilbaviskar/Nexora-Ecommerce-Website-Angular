import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminProducts } from './admin-products';
import { AdminService } from '../../../core/services/admin.service';

const mockProducts = [
  { productId: 1, title: 'Shirt', price: 29, category: 'shirts', subcategory: 'casual', image: '', images: [], colors: [], collections: [], tags: [], description: '', stock: 10 },
  { productId: 2, title: 'Hat', price: 15, category: 'hats', subcategory: 'caps', image: '', images: [], colors: [], collections: [], tags: [], description: '', stock: 5 },
];

describe('AdminProducts', () => {
  let component: AdminProducts;
  let fixture: ComponentFixture<AdminProducts>;
  let adminMock: any;

  beforeEach(async () => {
    adminMock = {
      getProducts: vi.fn().mockReturnValue(of({ items: mockProducts })),
      createProduct: vi.fn().mockReturnValue(of({})),
      updateProduct: vi.fn().mockReturnValue(of({})),
      deleteProduct: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [AdminProducts],
      providers: [{ provide: AdminService, useValue: adminMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load products on init', () => {
    expect(component.products.length).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should handle load error', async () => {
    adminMock.getProducts.mockReturnValue(throwError(() => ({ error: { message: 'Load error' } })));
    const f = TestBed.createComponent(AdminProducts);
    f.detectChanges();
    expect(f.componentInstance.error).toBe('Load error');
  });

  it('applyFilter() should filter products by title', () => {
    component.search = 'shirt';
    component.applyFilter();
    expect(component.filtered.length).toBe(1);
  });

  it('applyFilter() empty search shows all', () => {
    component.search = '';
    component.applyFilter();
    expect(component.filtered.length).toBe(2);
  });

  it('openAdd() should show modal in add mode', () => {
    component.openAdd();
    expect(component.showModal).toBe(true);
    expect(component.isEdit).toBe(false);
  });

  it('openEdit() should populate form and show modal', () => {
    component.openEdit(mockProducts[0]);
    expect(component.showModal).toBe(true);
    expect(component.isEdit).toBe(true);
    expect(component.form.title).toBe('Shirt');
  });

  it('closeModal() should hide modal', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBe(false);
  });

  it('splitCSV() should split comma-separated values', () => {
    expect(component.splitCSV('a, b, c')).toEqual(['a', 'b', 'c']);
    expect(component.splitCSV('')).toEqual([]);
  });

  it('save() in add mode should call createProduct', () => {
    component.openAdd();
    component.form.title = 'New Product';
    component.form.price = 50;
    component.form.productId = 99;
    component.save();
    expect(adminMock.createProduct).toHaveBeenCalled();
    expect(component.showModal).toBe(false);
  });

  it('save() in edit mode should call updateProduct', () => {
    component.openEdit(mockProducts[0]);
    component.save();
    expect(adminMock.updateProduct).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('save() handles error', () => {
    adminMock.createProduct.mockReturnValue(throwError(() => ({ error: { message: 'Save failed' } })));
    component.openAdd();
    component.save();
    expect(component.saveError).toBe('Save failed');
    expect(component.saving).toBe(false);
  });

  it('confirmDelete() and cancelDelete()', () => {
    component.confirmDelete(1);
    expect(component.confirmDeleteId).toBe(1);
    component.cancelDelete();
    expect(component.confirmDeleteId).toBeNull();
  });

  it('deleteProduct() should call deleteProduct service', () => {
    component.confirmDelete(1);
    component.deleteProduct();
    expect(adminMock.deleteProduct).toHaveBeenCalledWith(1);
    expect(component.confirmDeleteId).toBeNull();
  });

  it('deleteProduct() handles error', () => {
    adminMock.deleteProduct.mockReturnValue(throwError(() => ({ error: { message: 'Delete failed' } })));
    component.confirmDelete(1);
    component.deleteProduct();
    expect(component.error).toBe('Delete failed');
  });
});
