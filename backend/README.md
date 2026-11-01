```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Database migrations (D1)

Schema changes live in `backend/migrations/` as ordered, apply-once SQL files
(`0001_initial.sql`, `0002_ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦`, etc.). Wrangler tracks which files have been
applied via a `d1_migrations` table inside the database, so each file runs
exactly once per environment.

### Create a new migration

```sh
cd backend
npx wrangler d1 migrations create einao_db <short_name>
# scaffolds backend/migrations/000N_<short_name>.sql ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â fill it in
```

Use real `ALTER TABLE` / `CREATE TABLE` / `UPDATE` statements. Do **not** edit
already-applied files (e.g. `0001_initial.sql`); add a new numbered file
instead.

### Apply migrations

```sh
# Local dev DB (the one wrangler dev uses)
npx wrangler d1 migrations apply einao_db --local

# Production D1
npx wrangler d1 migrations apply einao_db --remote --config wrangler.jsonc

# Inspect what's pending vs applied
npx wrangler d1 migrations list einao_db --remote
```

### Seed blog content from client JSON

Use this when your local D1 has missing/empty blog post bodies and you want to
re-sync from `apps/client/app/data/content.json`.

```sh
cd backend
npm run seed:blog
```

Optional: seed the remote database (be careful, this updates existing blog posts
with matching slugs):

```sh
cd backend
npm run seed:blog:remote
```

### Bootstrapping an existing database

If a database already has the schema (applied via the old `schema.sql` flow)
but no `d1_migrations` table yet, mark `0001_initial.sql` as applied without
re-running it:

```sh
npx wrangler d1 execute einao_db --remote --command \
  "CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
   INSERT OR IGNORE INTO d1_migrations (name) VALUES ('0001_initial.sql');"
```
