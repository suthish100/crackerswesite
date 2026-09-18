# Crackers E-Commerce Platform — End-to-End Build Specification

## 1. System Overview

Three layers:
- **Frontend** — customer-facing storefront (products, ready-made packages, basket, order tracking) + admin panel (product/package/order management)
- **Backend** — API layer handling business logic, order processing, WhatsApp forwarding
- **Database** — PostgreSQL, single source of truth for products, packages, orders, and status history

**Order flow in one line:** Customer builds a basket (individual products and/or ready-made packages, customizable) → clicks Buy Now → order is saved with status `Received` and forwarded to admin's WhatsApp → admin calls customer, verifies, confirms payment → admin updates status in the admin panel at each step → customer checks progress anytime on a no-login tracking page.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js (React) + Tailwind CSS |
| Backend | Node.js — Next.js API routes, or a separate NestJS service if you want cleaner separation |
| Database | PostgreSQL |
| ORM | Prisma (pairs well with Postgres + Next.js, makes schema migrations easy) |
| Image storage | Cloudflare R2 or AWS S3, served through a CDN |
| Caching | Redis (product/category/package listings) |
| Admin auth | NextAuth or a simple JWT-based login, restricted to admin/staff accounts |
| WhatsApp forwarding | `wa.me` deep link (free, MVP) or WhatsApp Business Cloud API (Meta, for full automation later) |
| Hosting | Vercel (frontend) + Railway/Render (backend + Postgres + Redis) |

---

## 3. Database Schema

### `categories`
- `id` (PK)
- `name`
- `slug`
- `description`
- `is_active`

### `products`
- `id` (PK)
- `category_id` (FK → categories)
- `name`
- `slug`
- `sku`
- `description`
- `price`
- `stock_qty`
- `image_url`
- `is_active`
- `created_at`, `updated_at`

### `packages` (ready-made packages, e.g. "Diwali Family Combo")
- `id` (PK)
- `name`
- `slug`
- `description`
- `image_url`
- `base_price` (sum of default items, editable by admin)
- `is_active`
- `created_at`, `updated_at`

### `package_items` (defines what's inside a ready-made package by default)
- `id` (PK)
- `package_id` (FK → packages)
- `product_id` (FK → products)
- `default_qty`

### `admin_users`
- `id` (PK)
- `name`
- `phone`
- `role` (owner / staff)
- `password_hash`

### `orders`
- `id` (PK, internal)
- `public_order_id` (human-readable, e.g. `CR2026-0143`, shown to customer)
- `customer_name`
- `customer_phone`
- `customer_address`
- `status` — enum: `Received → Verifying → Confirmed → Payment Done → Packed → Dispatched` (add `Cancelled` too)
- `total_amount`
- `created_at`, `updated_at`

### `order_items` (flattened list of what was actually ordered — individual products, and package contents, including any customizations)
- `id` (PK)
- `order_id` (FK → orders)
- `product_id` (FK → products)
- `source_package_id` (nullable FK → packages — set if this item came from a ready-made package, null if added individually)
- `quantity`
- `unit_price`

This flattened structure is what makes the "customize a package" feature work cleanly: when a customer picks a ready-made package and then removes or adds items, you don't need to store a "modified package" object — you just store the final resulting list of `order_items`, each optionally tagged with which package it originated from (useful for admin reporting, e.g. "which packages are most popular").

### `order_status_history` (drives the customer tracking timeline)
- `id` (PK)
- `order_id` (FK → orders)
- `status`
- `note` (optional, admin can add e.g. "Payment received via UPI")
- `changed_at`

---

## 4. Customer-Facing Frontend

### Pages
1. **Home** — banners, featured packages, featured categories
2. **Category / product listing** — filter by category, price, search
3. **Product detail** — image, price, description, stock status, "Add to basket"
4. **Packages page** (separate section/log, as you asked) — grid of ready-made packages, each card shows image, name, base price, and a short "what's inside" preview
5. **Package detail (with customization)** — shows the full default item list with quantities; customer can:
   - Increase/decrease quantity of any item
   - Remove an item entirely
   - Add extra items from the catalog into this package
   - Price recalculates live as they customize
   - "Add to basket" saves this as a set of `order_items` tagged with `source_package_id`
6. **Basket** — shows everything added: standalone products + customized/uncustomized packages, combined into one list, with running total
7. **Checkout** — simple form: name, phone, delivery address, optional note
8. **Order confirmation** — shows `public_order_id`, order summary, and a message like "We've received your order. Our team will call you shortly to confirm."
9. **Track order** (Option 2, as agreed) — no-login lookup by phone number + order ID, shows a status timeline pulled from `order_status_history`

### Basket logic
Keep the basket in client-side state (React context or localStorage) until checkout — no need for a database table for in-progress baskets. Only once "Buy Now" is clicked does it get written to `orders` + `order_items`.

---

## 5. Admin Panel

### Pages
1. **Login** (admin/staff only)
2. **Dashboard** — recent orders, orders by status count, low-stock alerts
3. **Products** — CRUD, image upload, stock/price editing, **bulk upload via CSV/Excel** (for when a new distributor price list comes in)
4. **Categories** — CRUD
5. **Packages** — build ready-made packages: pick products + default quantities, set package name/image/base price, activate/deactivate
6. **Orders** — list with filters by status; detail view shows full item breakdown (including which items came from which package and any customer customizations); dropdown to update status, which:
   - Updates `orders.status`
   - Appends a row to `order_status_history` (this is what powers the customer's tracking page automatically)
   - Optionally lets admin add a note visible to the customer ("Payment confirmed, packing in progress")

---

## 6. WhatsApp Forwarding — Two Implementation Options

**Option A — `wa.me` link (MVP, free, simplest)**
On order submission, generate a pre-filled WhatsApp message (order ID, items, total, customer phone) and open a `wa.me/<admin_number>?text=<encoded order summary>` link. Simplest to build, and technically it's the *customer's own device* opening WhatsApp to message the admin — since it never touches the paid API, it costs nothing regardless of volume. Works reliably on both desktop and mobile.

**Option B — WhatsApp Business Cloud API (Meta)**
Backend sends the order summary directly to the admin's WhatsApp number via Meta's API, no manual click needed, and later can be extended to send customers automatic status updates. More reliable and fully automatic, but requires Meta Business verification and API setup — and under Meta's current (2026) per-message billing, only *customer-initiated* "service" conversations (replying within 24 hours of the customer messaging first) are free. Any *business-initiated* message — including an automated "order confirmed" or "order shipped" notification — is billed per message from the first one; there is no longer a monthly free allowance. Budget for this if you plan to automate customer-facing notifications.

Start with Option A — it fully covers the admin-forwarding requirement at zero cost. Move to Option B only if you later want to automate outbound status messages *to customers*, and budget for per-message charges on that part specifically.

---

## 7. API Endpoint Contract

A concrete REST contract so the backend, frontend, and admin panel are built against the same interface.

### Public (customer-facing)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/categories` | List active categories |
| GET | `/api/products?category=&search=&page=` | List/filter products |
| GET | `/api/products/:slug` | Single product detail |
| GET | `/api/packages` | List active ready-made packages |
| GET | `/api/packages/:slug` | Package detail with default `package_items` |
| POST | `/api/orders` | Create an order — body: customer info + array of `{product_id, quantity, source_package_id?}`; returns `public_order_id` |
| GET | `/api/orders/track?phone=&order_id=` | Lookup order status + `order_status_history` timeline (no login) |

### Admin (auth-protected)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/admin/login` | Admin authentication |
| POST/PUT/DELETE | `/api/admin/products` / `/api/admin/products/:id` | Product CRUD |
| POST | `/api/admin/products/bulk-upload` | CSV/Excel bulk product import |
| POST/PUT/DELETE | `/api/admin/categories` / `/api/admin/categories/:id` | Category CRUD |
| POST/PUT/DELETE | `/api/admin/packages` / `/api/admin/packages/:id` | Package CRUD, including setting `package_items` |
| GET | `/api/admin/orders?status=&page=` | List orders, filterable by status |
| GET | `/api/admin/orders/:id` | Full order detail, including item breakdown |
| PATCH | `/api/admin/orders/:id/status` | Update order status — body: `{status, note?}`; writes to `order_status_history` |

---

## 8. Build Phases

1. **Schema & seed data** — set up Postgres + Prisma, extract your existing PDF product list (via OCR/AI) into clean data, seed `categories` and `products`
2. **Admin panel MVP** — login, product CRUD, bulk upload, package builder
3. **Customer storefront** — product browsing, package browsing, package customization, basket
4. **Checkout & WhatsApp forwarding** — order creation, `wa.me` integration, order confirmation screen
5. **Order tracking page** — status lookup by phone + order ID, timeline view
6. **Admin order management** — status updates, `order_status_history` writes
7. **Performance layer** — Redis caching for listings, CDN for images, ISR for product/package pages
8. **Testing & launch** — load test around expected Diwali-season traffic, mobile responsiveness check, deploy

---

## 9. Key Design Decisions Recap

- **No online payment gateway in MVP** — admin verifies and confirms payment by phone call, consistent with common practice for regulated fireworks sales
- **Ready-made packages are first-class objects** (`packages` + `package_items`), separate from the catalog, but customization always resolves down into plain `order_items` — keeping the order model simple regardless of how complex the customization gets
- **Order tracking uses a public order ID + phone lookup**, no customer account/login required, keeping friction low
