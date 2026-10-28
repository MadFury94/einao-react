# Einao client-first implementation

Updated 27 October 2026. This supersedes the WordPress/Gutenberg implementation approach. The blueprint's content, route map, visitor journeys and Einao visual direction remain applicable.

## Phase 1 — React client foundation

- [x] Create pnpm workspaces following game-studio's `apps` and `packages` structure.
- [x] Build `apps/client` with React Router SSR, Cloudflare Vite integration and a Worker entry.
- [x] Add an asynchronous, typed content-store contract, file-backed seed records and visibility filtering.
- [x] Use the game-studio page-block envelope to prepare for later admin reuse.
- [x] Keep WordPress and reference materials outside the client runtime.

## Phase 2 — Einao design and content

- [x] Port the Einao palette, fonts, shared container, navigation, animated buttons and footer.
- [x] Build the nine-section homepage journey, including the existing video, scroll-feature and reveal-card treatments.
- [x] Populate service, product, audience, company and case-study routes from the blueprint.
- [x] Add the Insights landing page while keeping article briefs unpublished.
- [x] Add contextual contact selections and a disabled form preview, without simulated delivery.
- [ ] Review the client with the owner and refine visual details against Orixo `index-3.html` and the established Einao design.
- [ ] Add approved product/project imagery, detailed product specifications, finished articles and legal copy.

## Phase 3 — Reuse game-studio admin and backend

This phase is deferred. No admin, database or API is required to run the client.

- [ ] Copy and adapt the admin shell, page-block editor, media picker, publishing controls, services/projects/posts and site configuration.
- [ ] Provide Einao field schemas for every section; store content and presentation settings independently.
- [ ] Adapt Hono/D1/R2 configuration, authentication, roles, sessions and CORS for Einao.
- [ ] Use request-scoped server API clients instead of game-studio's shared mutable cookie state.
- [ ] Import the seed data and replace the file-backed store with the API implementation.
- [ ] Implement validated enquiry delivery, spam controls and useful failure handling. Never copy the source's log-only success fallback.
- [ ] Add meaningful integration tests for permissions, publishing, media and enquiry handling.

## Phase 4 — Cloudflare release

- [ ] Connect the intended Cloudflare account and domain.
- [ ] Verify public content, approved legal copy, enquiry delivery, SEO metadata and production URL behaviour.
- [ ] Run type checks, production build, store tests, responsive/browser/accessibility checks.
- [ ] Deploy the reviewed client and verify live Worker/static assets and routes.
- [ ] Enable public indexing only on the intended production release.

Local setup and the exact store/admin mapping are documented in `CLIENT-ARCHITECTURE.md`. The React project is independent at `D:\My Web Sites\einao-react`. WordPress remains in the separate `einao-app` folder. The Orixo template and PDF blueprint are copied into this projectâ€™s own `theme-reference` folder.
