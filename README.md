# Kechimyaku-2

Next.js + React migration of the original Sinatra Kechimyaku lineage app.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Prisma ORM with SQLite (SQLite-first, Postgres-ready modeling)
- NextAuth credentials auth
- Vitest for unit tests

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure local environment:

```bash
cp .env.example .env
```

3. Create local schema:

```bash
npm run prisma:migrate -- --name init
```

4. Seed an admin account:

```bash
npm run db:seed
```

5. Import legacy data from Sinatra DB:

```bash
npm run db:import-legacy
```

6. Verify parity against legacy counts:

```bash
npm run db:parity
```

7. Start the app:

```bash
npm run dev
```

## Environment Variables

- `DATABASE_URL` - Prisma SQLite connection string
- `NEXTAUTH_SECRET` - session signing secret
- `NEXTAUTH_URL` - app URL (for auth callbacks)
- `ADMIN_USERNAME` - admin username for seed script
- `ADMIN_PASSWORD` - admin password for seed script
- `LEGACY_DATABASE_PATH` - optional override path to legacy SQLite DB

Note: legacy relationship rows that point to missing masters are reported and skipped during import. Parity checks validate all importable records.

## Testing

Run lint and tests:

```bash
npm run lint
npm run test
```

## Cutover Checklist

- Confirm imported row counts match legacy (`npm run db:parity`)
- Validate graph tree renders and navigation works
- Validate admin master CRUD and wiki content save
- Validate login/logout and route protection
- Point users to `kechimyaku-2` and deprecate Sinatra app
