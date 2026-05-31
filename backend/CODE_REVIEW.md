# Backend Code Review Report

> **Project:** Angular E-Commerce Platform — Backend
> **Stack:** Node.js · Express 5 · TypeScript · MongoDB / Mongoose 9 · Jest 30
> **Reviewer Role:** Backend Principal Engineer
> **Review Date:** May 26, 2026

---

## Overall Score: 91 / 100

| # | Category | Score |
|---|---|---|
| 1 | Server & Route Architecture | 95 / 100 |
| 2 | Express Middleware Usage | 91 / 100 |
| 3 | MongoDB with Mongoose | 90 / 100 |
| 4 | API Design & REST Principles | 90 / 100 |
| 5 | Error Handling & Logging | 95 / 100 |
| 6 | Security Best Practices | 90 / 100 |
| 7 | Performance & Optimization | 85 / 100 |
| 8 | Unit Testing with Jest | 91 / 100 |
| 9 | Additional Checks | 84 / 100 |

---

## 1. Server & Route Architecture — 95 / 100

### Strengths

- Textbook modular separation: `routes/`, `controllers/`, `services/`, `models/`, `middleware/`, `utils/` — each layer has a single, clear responsibility.
- All 9 controllers are thin HTTP handlers: extract params → call service → `res.json()`. Zero business logic in controllers.
- The service layer owns all DB interaction, error throws, and domain rules — every service is independently testable.
- `AppError` in `utils/AppError.ts` carries `statusCode`, enabling the centralised error handler to respond correctly without any per-controller try/catch.
- Express 5 async propagation used correctly — rejected promises auto-forward to the error handler.
- Environment variables (`JWT_SECRET`, `MONGODB_URI`) are validated at startup with clear error messages before the server begins accepting connections.
- Each resource has its own router file, cleanly mounted in `server.ts` with no route definition bleeding across files.

### Minor Improvements

| ID | Severity | Finding |
|----|----------|---------|
| 1.1 | Low | `products.routes.ts`, `reviews.routes.ts`, and `cart.routes.ts` still use `router.put()` for partial updates. `profile.routes.ts` and `orders.routes.ts` are already correct with `PATCH`. |

### Recommendation

```
products.routes.ts:  router.put('/:id', ...)     → router.patch('/:id', ...)
reviews.routes.ts:   router.put('/:id', ...)     → router.patch('/:id', ...)
cart.routes.ts:      router.put('/:itemId', ...) → router.patch('/:itemId', ...)
```

---

## 2. Express Middleware Usage — 91 / 100

### Strengths

- `validate()` factory in `middleware/validate.ts` is reusable across all routes: strips unknown fields (`stripUnknown: true`), returns a structured `400` with a full `errors[]` array.
- `protect` and `adminOnly` are cleanly separated and composed per-route — no auth logic inside controllers.
- Middleware order is correct: Helmet → CORS → `express.json()` → Morgan → rate-limiter → routes → 404 handler → error handler.
- Two-tier rate limiting: global 300 req / 15 min on all `/api` routes, plus a dedicated `authLimiter` at 10 req / 15 min on `/signup` and `/login`.
- Pino handles structured app-level logging; Morgan handles HTTP access logging separately.

### Minor Improvements

| ID | Severity | Finding |
|----|----------|---------|
| 2.1 | Low | `protect` uses an inline `try/catch` that calls `res.status(401).json()` directly, bypassing the centralised error handler and Pino logger. Token failures do not appear in structured logs. |

### Recommendation

```typescript
// protect middleware — replace inline catch
} catch {
  next(new AppError('Not authorized, invalid token', 401));
}
```

---

## 3. MongoDB with Mongoose — 90 / 100

### Strengths

- **User:** required fields, unique email with lowercase/trim normalisation, bcrypt pre-save hook, `comparePassword` instance method.
- **Product:** `productId` (unique, indexed), `slug` (unique, indexed); price/stock min constraints; slug auto-generated in pre-save hook from title + productId.
- **Review:** compound unique index `{ user, product }` prevents duplicate reviews at the DB level. `refreshProductRatings` static keeps `ratingsAverage` and `ratingsCount` in sync after every save or delete automatically.
- **Blog:** explicit indexes on `category`, `tags`, and `publishedAt` — well aligned with the filters exposed by `listBlogs`.
- **Address:** `user` field indexed — `Address.find({ user })` is fast by design.
- **Order:** embedded `addressSnapshotSchema` correctly snapshots the shipping address at order time so future address changes never corrupt order history.
- **Cart:** `totalAmount` computed in a pre-save hook; `user` is unique-indexed (one cart per user enforced at DB level).

### Minor Improvements

| ID | Severity | Finding |
|----|----------|---------|
| 3.1 | Medium | `Order` model has no index on `user`. `Order.find({ user: userId })` becomes a full collection scan as order volume grows. |
| 3.2 | Low | `listProducts` does not use `.lean()` — returns full Mongoose Documents on a read-only, high-traffic endpoint. |

### Recommendations

```typescript
// 3.1 — Order model
orderSchema.index({ user: 1, createdAt: -1 });

// 3.2 — products.service.ts
Product.find(query).sort(...).skip(...).limit(numericLimit).lean()
```

---

## 4. API Design & REST Principles — 90 / 100

### Strengths

- Status codes are accurate throughout: `201` on resource creation, `200` on reads and updates, `400/401/403/404/409` for client errors, `500` for unhandled server errors.
- Pagination implemented on all collection endpoints: products, blogs, admin users, admin orders — all return `{ page, limit, total, totalPages }`.
- Consistent response envelope: `{ message, <resource> }` across every endpoint.
- `/api/health` available for uptime monitoring and liveness checks.
- `GET /api/products/collections` is a clean, self-documenting sub-resource.
- Every mutating endpoint is protected with Joi validation before it reaches the controller.

### Minor Improvements

| ID | Severity | Finding |
|----|----------|---------|
| 4.1 | Low | `PUT` remains on product, review, and cart item update routes. These are partial updates and should use `PATCH` for consistency with `profile` and `orders`. |
| 4.2 | Low | `GET /api/orders` (user order list) returns an unbounded array. It should be paginated consistently with the admin order list. |

---

## 5. Error Handling & Logging — 95 / 100

### Strengths

- `AppError` carries `statusCode`. The centralised error handler uses `instanceof AppError` to branch: operational errors expose their message; all others return `'Internal server error'` — no accidental data leakage.
- Stack traces are stripped in production (`NODE_ENV === 'production'`).
- Pino logger in `utils/logger.ts` emits structured JSON with ISO timestamps and a configurable `LOG_LEVEL` environment variable.
- `errorHandler` logs full error context including HTTP method and originating URL.
- Morgan provides HTTP access logs independently — separation of concerns maintained.
- Fatal startup errors are caught, logged via Pino, and trigger `process.exit(1)`.

### Minor Improvements

| ID | Severity | Finding |
|----|----------|---------|
| 5.1 | Low | `protect` middleware and the `notFound` handler respond without routing through Pino, making certain 401 and 404 events invisible in structured logs. |

---

## 6. Security Best Practices — 90 / 100

### Strengths

- Passwords hashed with bcryptjs at salt round 10 in a pre-save hook — never stored in plain text.
- Helmet applied globally for secure HTTP response headers (HSTS, X-Frame-Options, CSP defaults, etc.).
- CORS restricted to a single configurable origin (`FRONTEND_ORIGIN` env var).
- Global rate limit: 300 req / 15 min. Auth-specific rate limit: 10 req / 15 min on `/signup` and `/login` — brute-force protected.
- User input is escaped before use in `$regex` — ReDoS prevented in both product and blog search.
- Joi `stripUnknown: true` prevents mass-assignment on all mutating endpoints.
- `.env` excluded from version control via `.gitignore`. `JWT_SECRET` validated at startup.

### Minor Improvements

| ID | Severity | Finding |
|----|----------|---------|
| 6.1 | Low | JWT returned in the response body. If the frontend stores it in `localStorage` it is exposed to XSS. An `HttpOnly` cookie is the more secure storage mechanism. |
| 6.2 | Low | Password minimum is 6 characters with no complexity requirement. A minimum of 8 characters provides a stronger baseline. |

---

## 7. Performance & Optimization — 85 / 100

### Strengths

- `Promise.all()` used for parallel DB queries in `fetchDashboard`, `listProducts`, and `listBlogs` — no sequential awaits where parallel is possible.
- Pagination on every collection endpoint — no unbounded response payloads.
- Product lookups in order and cart services use `find({ productId: { $in: [...] } })` — no N+1 queries.
- Cart and product lookups operate entirely on indexed fields.
- `fetchCart` enriches cart items with live stock data in a single batched query.

### Issues

| ID | Severity | Finding |
|----|----------|---------|
| 7.1 | High | `placeOrder` creates the Order and decrements stock in two separate, non-atomic operations. Concurrent requests can both pass the stock check and both succeed — resulting in negative stock (oversell). These operations should be wrapped in a MongoDB session transaction. |
| 7.2 | Low | `getOrCreateCart` issues two DB round trips: one `updateOne` upsert + one `findOne`. A single `findOneAndUpdate(..., { upsert: true, new: true })` achieves the same in one round trip. |

### Recommendation for 7.1

```typescript
// orders.service.ts
const session = await mongoose.startSession();
try {
  return await session.withTransaction(async () => {
    const order = await Order.create([{ ...orderData }], { session });
    await Promise.all(
      finalItems.map(item =>
        Product.updateOne(
          { productId: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session }
        )
      )
    );
    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { session });
    return order[0];
  });
} finally {
  await session.endSession();
}
```

---

## 8. Unit Testing with Jest — 91 / 100

### Strengths

- **12 test suites, 99 tests — all passing.**
- All 9 controllers covered with both success and error paths.
- All 3 middleware modules tested (`auth`, `errorHandler`, `validate`).
- Mongoose models fully mocked with `jest.mock()` — tests are isolated, fast, and reproducible.
- Error-case tests use `.rejects.toMatchObject({ statusCode })` — correctly asserting against the thrown `AppError`.
- `errorHandler` test correctly differentiates `AppError` (exposes message) from plain `Error` (returns `'Internal server error'`).
- `validate` middleware tested for both valid input (strips unknown, calls `next`) and invalid input (400 + `errors[]`).

### Minor Improvements

| ID | Severity | Finding |
|----|----------|---------|
| 8.1 | Medium | No service-level unit tests. Business logic inside services (e.g., the stock-check flow in `placeOrder`) has no direct test coverage — only the controller delegation is tested. |
| 8.2 | Low | Jest coverage thresholds are not enforced in `jest.config.js`. Coverage can drop silently without a gate. |

### Recommendation

```javascript
// jest.config.js
coverageThreshold: {
  global: { branches: 70, functions: 80, lines: 80, statements: 80 }
}
```

---

## 9. Additional Checks — 84 / 100

### Strengths

- `.env` correctly excluded via `backend/.gitignore`.
- `package.json` includes all necessary scripts: `dev`, `build`, `start`, `test`, `test:coverage`, and all seed/migrate utilities.
- TypeScript with `tsconfig.json`; dev via `tsx watch`, production build via `tsc`.

### Minor Improvements

| ID | Severity | Finding |
|----|----------|---------|
| 9.1 | Medium | No ESLint or Prettier configured. Unused variables, implicit `any` types, and formatting inconsistencies go undetected. |
| 9.2 | Low | No `.env.example`. New developers have no reference for required environment variables (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_ORIGIN`, `PORT`, `JWT_EXPIRES_IN`, `LOG_LEVEL`). |

---

## Action Plan

| Priority | ID | Action | Effort |
|---|---|---|---|
| 🔴 P0 | 7.1 | Wrap `placeOrder` in a MongoDB session transaction | Medium |
| 🟠 P1 | 3.1 | Add `index({ user, createdAt })` to Order model | Small |
| 🟠 P1 | 1.1 | Change `PUT` → `PATCH` in products, reviews, cart routes | Small |
| 🟠 P1 | 2.1 | Refactor `protect` to call `next(new AppError(...))` | Small |
| 🟠 P1 | 8.1 | Add service-level unit tests | Medium |
| 🟡 P2 | 7.3 | Add `.lean()` to `listProducts` | Small |
| 🟡 P2 | 7.4 | Replace double-query `getOrCreateCart` with single `findOneAndUpdate` | Small |
| 🟡 P2 | 8.2 | Enforce Jest coverage thresholds in `jest.config.js` | Small |
| 🟡 P2 | 9.1 | Configure ESLint + Prettier | Small |
| 🟢 P3 | 4.2 | Add pagination to `GET /api/orders` (user order list) | Small |
| 🟢 P3 | 9.2 | Add `.env.example` | Small |
