# Einao Solutions

React Router client for Cloudflare Workers, organised like the game-studio monorepo and built around Einao's existing design and website blueprint.

```sh
pnpm install
pnpm dev
```

- `apps/client`: SSR routes, layouts, Einao components, styles and public assets.
- `packages/content`: typed file-backed content store, page blocks, navigation and metadata.
- `theme-reference`: original Orixo template and Einao PDF blueprint (retained in the project).

Page copy is edited in `packages/content/src/seed.ts`. React components consume store records through route loaders. The record structure prepares the client for reuse of game-studio's admin and backend in a later phase.

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @einao/client preview
# With the preview running and Google Chrome installed:
pnpm check:client
```

See [Client architecture and setup](CLIENT-ARCHITECTURE.md) and [Active implementation plan](REACT-IMPLEMENTATION-PLAN.md).

Cloudflare configuration is in `apps/client/wrangler.jsonc`. `pnpm deploy:client` builds and deploys after the correct account is connected. No deployment has been performed. Preview indexing is disabled by default.

The current scope is the client. The contact form is a disabled preview pending actual delivery and approved privacy copy. Article briefs and legal pages remain unpublished. This is an independent React project at `D:\My Web Sites\einao-react`. The separate WordPress project remains at `D:\My Web Sites\einao-app`. The React project includes its own copy of the Orixo template and PDF blueprint in `theme-reference`.
