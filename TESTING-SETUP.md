# Testing setup for Crackers

Matches your real stack: Next.js + Prisma + Postgres (Neon), custom `AdminUser`
phone/password auth, no third-party payment gateway (orders go through a
manual status flow instead).

## Files and where they go

```
crackers-web/
├── .github/workflows/playwright.yml
├── tests/
│   ├── smoke.spec.ts
│   ├── cart-checkout.spec.ts
│   └── admin.spec.ts
├── playwright.config.ts
└── TESTING-SETUP.md
```

## Setup steps

1. `npm install --save-dev @playwright/test wait-on`
2. `npx playwright install`
3. Add `data-testid` attributes to your components — the tests reference:
   - `product-card`, `category-link`, `product-price`, `add-to-cart`
   - `package-card`, `package-price`, `package-item`
   - `cart-count`, `cart-total`, `qty-increase`
   - `customer-name`, `customer-phone`, `customer-address`, `place-order`, `checkout-error`, `order-confirmation`, `public-order-id`
   - `admin-phone`, `admin-password`, `admin-login-submit`, `order-row`, `order-status-select`, `order-status-badge`
4. Run locally: `npx playwright test`, then `npx playwright show-report` for the visual results.
5. For the admin tests to run (they're skipped otherwise), either:
   - add a known admin to your existing `seed.ts`, or
   - add a small extra seed step, then
   - set `TEST_ADMIN_PHONE` and `TEST_ADMIN_PASSWORD` as GitHub Actions secrets to match.
6. Push and open a PR — `playwright.yml` spins up a real Postgres container in CI, runs `prisma migrate deploy` + your seed script against it, builds and starts the app, then runs the full suite. No Neon, no staging DB, and no Claude/API billing involved.

## A note on "checkout"

There's no Razorpay/Stripe step here — `Order.status` starts at `Received`
and moves through `Verifying → Confirmed → Payment Done → Packed →
Dispatched` manually via the admin panel. So the checkout test just confirms
the order is created correctly (name/phone/address captured, `publicOrderId`
returned) — there's no external payment redirect to account for.
