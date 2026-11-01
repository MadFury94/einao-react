# Einao backend and admin foundation

The Einao workspace now reuses the Game Studio architecture and admin visual system while keeping Einao content and branding separate.

## Added applications

- `apps/admin`: React Router admin Worker with the existing Game Studio shell, authentication screen, sidebar, form controls, media picker, publishing components, and API client wiring. Branding is Einao and the existing Einao logo is used.
- `backend`: Hono API Worker with D1-backed authentication, sessions, content/page blocks, media uploads, contact handling, users, and the reusable admin endpoints.
- `packages/ui`, `packages/api-client`, `packages/types`, `packages/utils`: shared packages copied from the proven admin implementation and renamed to `@einao/*`.

## Einao content model

`backend/migrations/0027_einao_content.sql` creates the Einao page metadata and site-content envelope. `backend/scripts/seed-einao-content.mjs` imports the existing `packages/content/src/seed.ts` store into D1, including every page and its ordered blocks.

Run after creating the Einao D1 database and applying migrations:

```sh
pnpm --filter backend exec wrangler d1 migrations apply einao_db --local
pnpm --filter backend seed:einao
```

Use `seed:einao:remote` only after the production database ID is placed in `backend/wrangler.jsonc`.

The public API exposes:

- `GET /api/v1/content/site`
- `GET /api/v1/content/pages`
- `GET /api/v1/content/pages/:slug`

Authenticated editing is available at `PATCH /api/v1/admin/content/blocks/:id`. It accepts the block's editable `config` and `visible` flag only. Position, block type, section creation, deletion, and reordering are deliberately excluded from this Einao route.

The admin `Page Copy` screen follows the same rule: it lists the fixed sections and opens the existing editor for copy/media fields without add, delete, drag, or reorder controls.

## Cloudflare resources still required

Before deployment, create Einao-owned resources and update any remaining secrets:

- D1 database: `einao_db` (`a32ade85-2ec7-4be5-bbd1-4bfedbf450b3`) is configured, migrated, and seeded.
- R2 bucket: `einao-media` is created and bound to the API Worker.
- Worker secrets: `JWT_SECRET`, `RESEND_API_KEY`.
- `ALLOWED_ORIGINS`, `MEDIA_PUBLIC_BASE_URL`, and `RESEND_FROM_EMAIL` should use the final production domains/email.

The first validation pass is complete: the admin production build passes and the API Worker `wrangler deploy --dry-run` passes with the Einao D1/R2 bindings.
## Official deployment

- Cloudflare account: 9737fa56ccbd9abf554110c0f94e9455`n- API: https://einao-api.einaodevv.workers.dev`n- Admin: https://einao-admin.einaodevv.workers.dev`n- Client: https://einao-client.einaodevv.workers.dev`n- D1: einao_db (32ade85-2ec7-4be5-bbd1-4bfedbf450b3)
- R2: einao-media`n