# Einao Project Review

Reviewed: 11 November 2026

The project has substantial functionality, but is not production-ready yet. The biggest gaps are security, reliable publishing, and connecting admin controls to what visitors actually see.

The review covered the client, admin, backend, content store, configuration, and tests. No source files were changed during the review.

## Issues, in priority order

### 1. Admin permissions are not enforced adequately

Protected endpoints verify a session, but do not check the user's role or current account status. A logged-in non-admin can reach administrative operations, including user management. Suspending an account does not invalidate its existing access.

Source: [Authentication middleware](backend/src/lib/auth-middleware.ts)

### 2. User account information is publicly exposed

Unauthenticated user-list and user-detail endpoints return emails, roles, account status, and last-login information. These should be protected; public team profiles should expose only approved profile fields.

Source: [User endpoints](backend/src/users/index.ts)

### 3. Admin requests share authentication state

Cookies, fetch configuration, and the API client are stored in mutable module-level variables. Concurrent requests can overwrite each other's credentials. This needs request-scoped API clients.

Source: [Admin API configuration](apps/admin/app/lib/api.ts)

### 4. Logout and password changes have incomplete session handling

Logout clears the cookie without deleting the database session. The password-change endpoint validates the JWT without checking whether the session still exists. A retained token can therefore remain useful after logout.

Source: [Authentication routes](backend/src/auth/index.ts)

### 5. Unpublishing pages can fail visibly

When the content API returns 404, the client falls back to its bundled seed page. Changing a seeded page to draft can therefore leave the original version publicly accessible. API failures also silently show outdated content.

Source: [Content adapter](apps/client/app/lib/content.server.ts)

### 6. Some admin editors do not control the public website

For example, the homepage About editor saves a content block, while the public About section uses hardcoded text and imagery. The contact editor saves `page_hero` fields such as `titlePre`, whereas the client reads `title` and `accent` from its first block. A successful save does not reliably mean a visible change.

Sources: [Homepage About component](apps/client/app/components/home-about/HomeAbout.tsx), [Homepage About editor](apps/admin/app/routes/home/about.tsx), [Contact editor](apps/admin/app/routes/contact.tsx), [Public contact page](apps/client/app/routes/contact.tsx)

### 7. There are two inconsistent contact implementations

The client sends through Resend and correctly reports missing configuration. The backend endpoint instead reports success when no API key exists, logs the enquiry, and inserts unescaped input into email HTML. The client also needs graceful network-error handling and stronger abuse controls beyond its honeypot.

Sources: [Backend contact handler](backend/src/contact/index.ts), [Client form](apps/client/app/routes/contact.tsx)

### 8. The quality checks do not cover the whole workspace

Root `test` runs only the content-store tests; root `typecheck` checks only the client. Admin and backend TypeScript errors are consequently easy to miss. `build:backend` also references a backend build script that does not exist.

Sources: [Workspace scripts](package.json), [Backend scripts](backend/package.json)

## Remaining work

- [ ] Map every intended admin field to its public component, including homepage sections and contact details.
- [ ] Fix permissions, request isolation, session revocation, and publishing fallback behavior.
- [ ] Consolidate contact delivery and verify actual receipt and Reply-To behavior.
- [ ] Confirm approval of testimonials, legal copy, product claims, and project imagery. Testimonials are currently hardcoded, including generic institutional attributions; the code cannot establish their authenticity.
- [ ] Remove remaining Game Studio fields and wording from active admin screens.
- [ ] Update the README and architecture plans: they still describe implemented functionality as deferred or disabled.
- [ ] Complete responsive, accessibility, and end-to-end checks against a running, integrated deployment.
- [ ] Verify production domain/configuration and enable indexing only when ready. The checked-in client configuration still has `SITE_INDEXABLE: "false"`.
- [ ] Fix admin and backend TypeScript errors and include all applications in routine quality checks.

## Verification results

| Check | Result |
| --- | --- |
| Client production build | Passed |
| Admin production build | Passed, with sourcemap warnings |
| Content tests | 4 passed |
| Admin tests | 26 passed |
| Additional client tests | 14 passed |
| Client TypeScript check | Passed |
| Admin project TypeScript check | Failed |
| Backend TypeScript check | Failed: 31 diagnostics |

Admin errors include possibly undefined API responses and incompatible editor-content types. Backend errors span AI, posts, uploads, generic content, and users.

The backend has no locally available `tsc` command in its package context. Its TypeScript check was performed using the client's installed compiler against `backend/tsconfig.json`. The admin check used `tsc -b` to check its referenced projects.

## Review limitations

This was a source-and-build review. Live deployment behavior, email delivery, and browser layouts were not verified. Passing builds and tests do not establish that the integration and security issues above are resolved.

## Recommended order

Fix issues 1-5 first, then complete the admin-to-client wiring and contact flow before spending more time on visual polish.
