# Nexora — Full-Stack E-Commerce Platform

A full-featured e-commerce web application built with **Angular 21** on the frontend and **Node.js + Express 5 + MongoDB** on the backend.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Available Scripts](#available-scripts)
  - [Backend Scripts](#backend-scripts)
  - [Frontend Scripts](#frontend-scripts)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Project Architecture](#project-architecture)

---

## Project Structure

```
AngulPrj/
├── backend/          # Node.js + Express REST API
│   ├── config/       # Database connection
│   ├── controllers/  # HTTP request handlers
│   ├── middleware/   # Auth, error handling, validation
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route definitions
│   ├── services/     # Business logic layer
│   ├── scripts/      # DB seed & migration scripts
│   └── utils/        # AppError, Pino logger
└── frontend/         # Angular 21 SPA
    └── src/app/
        ├── core/     # Guards, interceptors, services, models
        ├── features/ # Feature pages (home, products, cart, etc.)
        ├── layout/   # Header, footer, main/auth layouts
        └── shared/   # Reusable components (product-card, etc.)
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.1.0 | SPA framework |
| Angular CLI | 21.1.5 | Tooling & build |
| Tailwind CSS | v4 | Utility-first styling |
| RxJS | ~7.8 | Reactive state & HTTP |
| Vitest | latest | Unit testing |

- **Standalone components** — no NgModules
- **Zoneless change detection** via `provideZonelessChangeDetection()`
- **Lazy-loaded routes** via `loadComponent()`
- **Signals & Computed** for reactive state

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 5.x | Web framework |
| TypeScript | 6.x | Type safety |
| MongoDB | — | Database |
| Mongoose | 9.x | ODM |
| JWT (jsonwebtoken) | 9.x | Authentication |
| bcryptjs | 3.x | Password hashing |
| Joi | 18.x | Request validation |
| Helmet | 8.x | Security headers |
| Pino | 10.x | Structured logging |
| Morgan | 1.x | HTTP access logging |
| express-rate-limit | 8.x | Rate limiting |
| Jest | 30.x | Unit testing |

---

## Features

### Storefront
- **Home page** — Hero banner, trending products, color collections, testimonials, blog highlights, why-shop section
- **Product listing** — Filter by category, color, tags; sort by price/name; pagination
- **Product detail** — Image gallery, size selector, quantity control, add-to-cart, buy-now, customer reviews & ratings
- **Search** — Live search with dropdown results
- **Blog** — Blog listing and individual post pages
- **Collections** — Curated product collections
- **FAQ, About, Contact, Terms** — Static pages

### Shopping
- **Cart** — Add/remove/update items, persisted in localStorage and synced with backend
- **Wishlist** — Toggle products, persisted in localStorage
- **Checkout** — Multi-step checkout (address → payment → confirmation)
- **Orders** — Order history and order detail

### Authentication
- **Signup / Login** — JWT-based authentication
- **Protected routes** — Auth guard for cart, checkout, profile, wishlist
- **Persistent session** — Token stored in localStorage

### User Profile
- View and update personal info
- Manage saved addresses

### Admin Panel (`/admin`)
- Secure admin login (separate from user login)
- **Dashboard** — Key metrics overview
- **Products** — Manage product catalog (CRUD)
- **Orders** — View and manage all orders
- **Users** — View and manage registered users

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v10 or higher
- **MongoDB** instance (local or Atlas)
- **Angular CLI** (`npm install -g @angular/cli`)

### Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nexora
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:4200
LOG_LEVEL=info
NODE_ENV=development
```

> **Note:** There is no `.env.example` committed to the repo. Use the variables listed above as a reference.

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the development server (tsx watch — hot reload)
npm run dev
```

The API will be available at `http://localhost:3000`.

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server (proxies API calls to localhost:3000)
npm start
```

The app will be available at `http://localhost:4200`.

> The frontend uses a proxy config (`proxy.conf.json`) to forward `/api` requests to the backend during development. Ensure the backend is running before starting the frontend.

---

## Available Scripts

### Backend Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start with `tsx watch` (hot reload) |
| Build | `npm run build` | Compile TypeScript to `dist/` |
| Start (prod) | `npm start` | Run compiled `dist/server.js` |
| Tests | `npm test` | Run all Jest tests |
| Coverage | `npm run test:coverage` | Run tests with coverage report |
| Seed products | `npm run seed:products` | Seed the products collection |
| Seed blogs | `npm run seed:blogs` | Seed the blogs collection |
| Migrate slugs | `npm run migrate:slug` | Migrate product slug field |
| Migrate users | `npm run migrate:users` | Migrate user records |

### Frontend Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm start` | Serve with proxy config |
| Build | `npm run build` | Production build to `dist/` |
| Watch build | `npm run watch` | Development watch build |
| Tests | `npm test` | Run Vitest unit tests |
| Coverage | `npm run test:coverage` | Run tests with coverage report |

---

## API Overview

All API routes are prefixed with `/api`.

| Resource | Base Path | Auth Required |
|---|---|---|
| Health check | `GET /api/health` | No |
| Authentication | `/api/auth` | No (public) |
| Products | `/api/products` | Partial |
| Reviews | `/api/reviews` | Yes |
| Cart | `/api/cart` | Yes |
| Orders | `/api/orders` | Yes |
| Wishlist | `/api/wishlist` | Yes |
| Profile | `/api/profile` | Yes |
| Blog | `/api/blogs` | No (public) |
| Admin | `/api/admin` | Admin only |

**Rate Limiting:**
- Global: 300 requests per 15 minutes on all `/api` routes
- Auth endpoints: 10 requests per 15 minutes on `/login` and `/signup`

---

## Testing

### Backend — Jest

```bash
cd backend
npm test                # Run all tests
npm run test:coverage   # Generate HTML coverage report
```

- **12 test suites, 99 tests** — all controllers and middleware are covered
- Coverage report is output to `backend/coverage/`

### Frontend — Vitest

```bash
cd frontend
npm test                # Run unit tests
npm run test:coverage   # Generate coverage report
```

- Coverage report is output to `frontend/coverage/`

---

## Project Architecture

### Backend Layers

```
Request → Route → Middleware (auth/validate) → Controller → Service → Model → MongoDB
                                                                 ↓
                                                          AppError → errorHandler → Response
```

- **Routes** — Define HTTP methods and paths; apply middleware per route
- **Controllers** — Thin handlers: extract params, call service, send response
- **Services** — All business logic and database interaction
- **Models** — Mongoose schemas with validators, indexes, and hooks
- **Middleware** — `protect` (JWT auth), `adminOnly`, `validate` (Joi), `errorHandler`

### Frontend Layers

```
Router → Layout (MainLayout / AuthLayout) → Feature Component
                                                   ↓
                                            Service (HTTP / State)
                                                   ↓
                                            Backend REST API
```

- **Core** — Singleton services, route guards, TypeScript models
- **Features** — One folder per page/feature; each is a lazy-loaded standalone component
- **Layout** — Shell components (header, footer, layouts) shared across routes
- **Shared** — Reusable presentational components (e.g., `ProductCard`)
