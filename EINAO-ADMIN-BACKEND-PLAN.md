# Einao admin and backend plan

Einao will reuse the proven admin and backend patterns from `D:\My Web Sites\game-studio`, while keeping Einao’s own content, branding, routes, and data model.

## Applications

- `apps/client`: public Einao website, deployed as the `einao-client` Cloudflare Worker.
- `apps/admin`: admin dashboard using the Game Studio admin layout, navigation, forms, publishing states, media picker, authentication flow, and visual language adapted to Einao.
- `backend`: Hono API Worker for Einao content, authentication, media, and admin operations.

## Shared packages

- `packages/types`: shared TypeScript types and Zod validation schemas.
- `packages/api-client`: generated or typed client for the backend API.
- `packages/utils`: shared helpers.

## Cloudflare services

- D1 for editable site content and admin data.
- R2 for uploaded images, video, and media assets.
- Worker secrets for authentication and protected credentials.
- Separate Worker deployments for `einao-client`, `einao-admin`, and `einao-api`.

## Editing rules

The admin edits approved content fields only: headings, paragraphs, labels, CTAs, SEO fields, repeatable cards, and media references. Section order, layout, animation, component type, and visual styling remain owned by the code. Admin users do not reorder or create arbitrary sections.

## Migration approach

Use ordered D1 migrations, following the Game Studio backend convention. Einao’s current seeded content becomes the initial data set, then is edited through the admin. The public client continues using the fixed homepage composition while loading editable content from the API.

## Reference implementation

The primary reference is `D:\My Web Sites\game-studio`, especially its `apps/admin`, `backend`, `packages/types`, `packages/api-client`, authentication, media, publishing, and migration patterns. Do not copy Game Studio branding or domain-specific models into Einao.
