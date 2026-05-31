import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductService } from '../../core/services/product.service';

interface Collection {
  gender: string;
  subcategory: string;
  image: string;
  count: number;
}

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './collections.html',
  styleUrl: './collections.css',
})
export class Collections {
  private productService = inject(ProductService);

  private allCollections = toSignal(
    this.productService.getProducts().pipe(
      map(products => {
        const map = new Map<string, Collection>();
        for (const p of products) {
          const key = `${p.category}/${p.subcategory}`;
          if (!map.has(key)) {
            map.set(key, {
              gender: p.category,
              subcategory: p.subcategory,
              image: p.image,
              count: 0,
            });
          }
          map.get(key)!.count++;
        }
        return Array.from(map.values());
      })
    ),
    { initialValue: [] }
  );

  get menCollections(): Collection[] {
    return this.allCollections().filter(c => c.gender === 'men');
  }

  get womenCollections(): Collection[] {
    return this.allCollections().filter(c => c.gender === 'women');
  }

  get kidsCollections(): Collection[] {
    return this.allCollections().filter(c => c.gender === 'kids');
  }
}
