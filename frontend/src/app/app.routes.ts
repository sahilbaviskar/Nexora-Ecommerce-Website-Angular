import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'products/:gender',
        loadComponent: () =>
          import('./features/products/products/products').then((m) => m.Products),
      },
      {
        path: 'products/:gender/:category',
        loadComponent: () =>
          import('./features/products/products/products').then((m) => m.Products),
      },
      {
        path:'product/:slug',
        loadComponent: () => 
            import('./features/product-detail/product-detail/product-detail').then((m)=>m.ProductDetail),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'wishlist',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/wishlist/wishlist').then((m) => m.Wishlist),
      },
      {
        path: 'collections',
        loadComponent: () =>
          import('./features/collections/collections').then((m) => m.Collections),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/cart/cart').then((m) => m.Cart),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/checkout/checkout').then((m) => m.Checkout),
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./features/blog/blog').then((m) => m.BlogPage),
      },
      {
        path: 'blog/:slug',
        loadComponent: () =>
          import('./features/blog/blog-detail/blog-detail').then((m) => m.BlogDetail),
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search').then((m) => m.SearchPage),
      },
      {
        path: 'faq',
        loadComponent: () => import('./features/faq/faq').then((m) => m.Faq),
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about').then((m) => m.About),
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
      },
      {
        path: 'terms',
        loadComponent: () => import('./features/terms/terms').then((m) => m.Terms),
      }
    ],
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'signup',
        loadComponent: () => import('./features/auth/signup/signup').then((m) => m.Signup),
      },
    ],
  },
  {
    path: 'admin',
    pathMatch: 'full',
    loadComponent: () => import('./features/admin/login/admin-login').then((m) => m.AdminLogin)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then((m) => m.AdminDashboard) },
      { path: 'products',  loadComponent: () => import('./features/admin/products/admin-products').then((m) => m.AdminProducts) },
      { path: 'orders',    loadComponent: () => import('./features/admin/orders/admin-orders').then((m) => m.AdminOrders) },
      { path: 'users',     loadComponent: () => import('./features/admin/users/admin-users').then((m) => m.AdminUsers) }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
