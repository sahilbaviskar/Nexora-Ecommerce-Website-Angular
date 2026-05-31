import { Component, signal, computed, inject } from '@angular/core';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { TitleCasePipe } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-trending',
  standalone: true,
  imports: [ProductCard, TitleCasePipe],
  templateUrl: './trending.html',
  styleUrl: './trending.css',
})
export class Trending {
  hoverIndex: number | null = null;

  categories = ['shoes', 'hats', 'jackets', 'shorts', 't-shirts'];

  activeCategory = signal('shoes');

  private productService = inject(ProductService);
  private allProducts = toSignal(this.productService.getProducts(), { initialValue: [] as Product[] });

  products = computed(() => {
    return this.allProducts().filter((p) => p.subcategory === this.activeCategory()).slice(0, 6);
  });

  filterByCategory(category: string) {
    this.activeCategory.set(category);
  }

  getRow1Class(i:number){
  
  // default
  if(this.hoverIndex === null){
    return i === 2 ? 'col-span-6' : 'col-span-3';
  }

  // hovered first small
  if(this.hoverIndex === 0){
    return i === 0 ? 'col-span-6' : 'col-span-3';
  }

  // hovered second small
  if(this.hoverIndex === 1){
    return i === 1 ? 'col-span-6' : 'col-span-3';
  }

  // hovered large
  if(this.hoverIndex === 2){
    return i === 2 ? 'col-span-6' : 'col-span-3';
  }

  return i === 2 ? 'col-span-6' : 'col-span-3';
}



getRow2Class(i:number){

  if(this.hoverIndex === null){
    return i === 0 ? 'col-span-6' : 'col-span-3';
  }

  if(this.hoverIndex === 3){
    return i === 0 ? 'col-span-6' : 'col-span-3';
  }

  if(this.hoverIndex === 4){
    return i === 1 ? 'col-span-6' : 'col-span-3';
  }

  if(this.hoverIndex === 5){
    return i === 2 ? 'col-span-6' : 'col-span-3';
  }

  return i === 0 ? 'col-span-6' : 'col-span-3';
}

}