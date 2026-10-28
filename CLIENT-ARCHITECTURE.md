# Einao React Router client

The active application is `apps/client`, a React Router SSR application running on Cloudflare Workers. It follows game-studio's client structure: `app/routes`, `app/layouts`, `app/components/page-blocks`, route loaders, a Worker entry and Vite/Cloudflare integration. The streaming server entry is reused from game-studio. Einao's visual components and content are specific to Einao.

## Run

Use Node 22.21 or later and pnpm 9. From the project root:

```sh
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @einao/client preview
```

Development normally uses port 5173; the built Worker preview uses port 4173. `pnpm check:client` checks the running preview with installed Google Chrome. Screenshots and results go into `.local/react-client/`.

## Content and future admin

`packages/content/src/seed.ts` is the current file-backed content store. It contains navigation, site settings, page metadata, sections, capability/product/industry records, and unpublished Insight briefs. `types.ts` defines the contracts. `store.ts` provides asynchronous read methods; it snapshots its inputs and clones results to prevent cross-request mutation.

`apps/client/app/lib/content.server.ts` is the single loader-facing adapter boundary. There is no browser localStorage database, browser-only data fetch, or mutable request-global client. Content is rendered on the server and passed through React Router loader data.

The page block envelope follows game-studio exactly: `id`, `page_slug`, `block_type`, `position`, `config`, `visible`. When admin work starts:

1. Reuse the game-studio Hono page-block API and admin media, publishing, settings, forms and rich-text editor foundations.
2. Import the Einao page records into new Einao storage; retain page slugs, order and visibility. Database IDs become authoritative after import.
3. Add Einao field definitions for these block types to the existing admin block editor. The existing game-studio field schemas are specific to its site and need adaptation.
4. Implement `ContentStore` using a request-scoped API client. Replace the factory at `content.server.ts`; page components remain unchanged.
5. Map capabilities to services, case studies to projects, finished Insights to posts, products/industries to generic content, and shared shell content to site configuration.

The current store is read-only. Editing `seed.ts` and rebuilding updates content. It is not a persistent admin backend. Draft pages and hidden blocks are filtered before they reach public loaders. The six Insight briefs remain drafts. Approved Privacy and Terms copy, detailed product specifications and verified project metrics are still needed.

## Design and sources

- Content: `theme-reference/Einao Full Website Copy and Experience Blueprint (1).pdf`, including the nine-section homepage journey and contextual enquiry routes.
- Composition and interaction reference: `theme-reference/themeforest-xASBMjuU-orixo-digital-agency-portfolio-html-template/Main files/index-3.html` and its associated CSS/JS.
- Existing Einao implementation supplies green/paper tokens, self-hosted Urbanist and Instrument Serif fonts, logo assets, conceptual workflow artwork/video, arrow-button interaction, reveal cards and scroll-feature treatment.
- Runtime assets are copied into `apps/client/public/assets`; runtime does not access WordPress, PHP, the theme-reference folder or a WordPress database. Font license files accompany the fonts. No Orixo demo testimonials, counters, product screenshots or game-studio branding are used.

The established Einao design remains the visual baseline. The client uses scoped React effects with cleanup, CSS transitions/view timelines and Web Animations for the interactions already implemented. Native `details` handles desktop dropdowns; React controls mobile navigation. No jQuery or WordPress scripts run in the client. More elaborate Orixo-only GSAP/slider effects are not introduced without a corresponding section; if needed later, use GSAP's React lifecycle integration or Swiper React rather than the reference's global initializers.

Hero video sources are absent from SSR HTML. Sources attach only on eligible visible desktop playback, with pause/play, hidden-tab/offscreen pausing and reduced-motion/Save-Data handling. A poster is used on restricted devices. Heading text is present in server HTML and remains readable without JavaScript.

## Cloudflare

`apps/client/wrangler.jsonc` names the Worker `einao-client`. It contains no game-studio account, domain, database, bucket or API endpoint. The Cloudflare Vite plugin produces Worker and static-asset output in `apps/client/build`.

```sh
pnpm --filter @einao/client exec wrangler login
pnpm deploy:client
```

Deployment has not been performed. Connect the intended Cloudflare account and domain when ready. `SITE_INDEXABLE` is initially `false`: previews return an `X-Robots-Tag` noindex header, a disallow robots file and an empty sitemap. Set it to `true` only for the intended public release after contact delivery and content review. Public sitemap URLs derive from the serving origin.

Contact is a visible, disabled form preview with the blueprint fields and contextual enquiry selection. Its action returns 503 and never claims delivery. No personal data is stored or sent. Wire the actual enquiry action and approved privacy copy in the backend phase.

## Remaining work

- Review the React visual baseline against the current Einao design and refine any reference-specific interactions.
- Replace conceptual placeholder media with approved project/product assets where available.
- Reuse and adapt the admin/backend in a separate phase, with Einao-specific configuration and content schemas.
- Correct source admin request-global cookie state, enforce roles/status on protected API routes, and replace the source contact handler's log-only success fallback when those modules are reused.
- Approve legal copy, detailed product content and finished articles before publication.

This project lives independently at `D:\My Web Sites\einao-react`. The WordPress project remains separately at `D:\My Web Sites\einao-app`; the React app does not require it. Design references and all runtime assets are included locally.

References: [Cloudflare React Router guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/), [GSAP React lifecycle integration](https://gsap.com/resources/React/), [Swiper React](https://swiperjs.com/react).
