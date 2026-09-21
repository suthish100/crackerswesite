# Sivakasi Crackers Store

Next.js ecommerce storefront with Prisma/PostgreSQL persistence, Neon support, customer checkout, order tracking, and an authenticated admin order console.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to the Neon pooled connection string. Keep `.env` private.
2. Install dependencies and generate Prisma Client:

```bash
npm install
npm run db:generate
```

3. Apply the schema and seed the catalog/admin account:

```bash
npm run db:migrate
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`. The seeded admin login is the phone and password defined in `prisma/seed.ts`; change that password before production use.

## Production deployment

Use a host such as Vercel for the Next.js app and add these environment variables in the production environment:

- `DATABASE_URL`: Neon pooled PostgreSQL URL for runtime queries.
- `JWT_SECRET`: long random secret, different from development.
- `NEXT_PUBLIC_ADMIN_WHATSAPP`: support number used for order handoff.
- `SEED_ADMIN_PHONE` and `SEED_ADMIN_PASSWORD`: set these only when seeding a new environment; they are used to create the first admin account.

Run migrations during deployment with `npm run db:migrate`. Run `npm run db:seed` once for a new environment with `SEED_ADMIN_PHONE` and `SEED_ADMIN_PASSWORD` set, then remove those seed variables before accepting orders.

The GitHub Actions workflow uses an isolated PostgreSQL service, applies the checked-in migration, seeds it, builds the app, and runs Playwright tests. Pull-request Neon branches are created by `.github/workflows/neon_workflow.yml` when `NEON_PROJECT_ID` and `NEON_API_KEY` are configured in GitHub.

### Docker deployment

The production image uses Next.js standalone output and connects to Neon through `DATABASE_URL`. Create `.env` from `.env.example`, set the production secrets, apply migrations, and start the container:

```bash
npm run db:migrate
docker compose up --build -d
```

The app is available at `http://localhost:3000`. Run migrations outside the container with a direct Neon connection before deploying; keep the pooled URL in the running app for normal traffic.

## Order lifecycle

Checkout validates each product and quantity, reserves stock, and creates the order, order items, and initial status history in one database transaction. The admin order screen refreshes every five seconds, and status changes append to the status history used by customer order tracking.
