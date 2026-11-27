# Admin Section Shortcuts — Implementation Plan

## Purpose

Help a logged-in administrator identify which website sections have editable settings and jump directly to the corresponding settings inside the existing admin dashboard. All content editing happens in the dashboard. The website provides visual markers and navigation shortcuts only.

---

## What we found

### Authentication
- Cookie name: `einao_session` (JWT, 30-day expiry)
- Validation endpoint: `GET /api/v1/admin/me`
- Returns `{ id, name, email, role }` for a valid session, `401` otherwise
- The client-v2 app currently does **not** check this — it is public-only
- The admin app checks it on every request via `authMiddleware`

### Admin dashboard URL structure
| Destination | URL |
|---|---|
| Home page blocks (all sections) | `/page-blocks?page=home` |
| Capabilities blocks | `/capabilities` |
| Solutions blocks | `/solutions` |
| Work blocks | `/work` |
| Industries blocks | `/page-blocks?page=industries` |
| About blocks | `/page-blocks?page=about` |
| Insights blocks | `/page-blocks?page=insights` |
| Contact blocks | `/page-blocks?page=contact` |
| Any page hero settings | `/page-hero-settings/{pageSlug}` |
| Individual block edit | `/page-blocks/{numericId}` |
| Global page settings | `/page-settings` |

> **Important:** Blocks use numeric IDs, not stable string slugs. There is no `/admin/pages/home#capabilities` URL. The correct destination for a home section is `/page-blocks?page=home`.

### Home page sections and their CMS backing
| Section component | CMS-backed | Admin destination |
|---|---|---|
| `HomeHero` | Yes (hero block) | `/page-blocks?page=home` |
| `HomeMission` | No — hardcoded | — |
| `HomeCards` (capabilities) | Yes | `/capabilities` |
| `HomeJourney` | No — hardcoded | — |
| `HomeSolutions` | Yes | `/solutions` |
| `HomeStories` | Yes | `/work` |
| `HomePlatform` | Yes | `/solutions` |
| `HomeNews` | No — layout only | — |

Inner page heroes (capabilities, solutions, industries detail pages) link to `/page-hero-settings/{pageSlug}`.

---

## Visual design

### Admin utility bar
- Height: ~44px
- Background: `#0C1710` (deep forest green)
- Padding inline: 24–32px
- Left: small lime outline shield icon + "Admin view" (white, 14px)
- Right: toggle "Show section shortcuts" + vertical divider + "Dashboard ↗" link
- Toggle: lime track, white thumb when enabled
- Sticks to top while scrolling
- Accounts for its height in the sticky nav so both bars stack without covering content

### Section shortcut badge
- Position: absolute, upper-right of the section, ~16–24px from right edge, slightly overlapping the top boundary
- Background: `#0C1710`
- White text, ~13–14px, medium/semibold
- Corner radius: ~8–10px
- Height: ~36–40px, horizontal padding ~14–16px
- Left: small outline settings icon
- Label: `{Section name} · Section settings ↗`
- Right: northeast arrow icon
- Subtle shadow
- Entire badge is a real link

### Section boundary on hover/focus
- Thin lime outline (1–2px) around the entire section
- Border radius ~12–16px
- Does not affect layout, no horizontal scroll
- Transition: ~150ms
- Respects `prefers-reduced-motion`
- Only the hovered/focused section highlights

### Tooltip
- Appears on badge hover or keyboard focus
- Text: "Open this section in the admin dashboard"
- White background, dark text, ~12–13px
- Rounded corners ~8px, padding ~10–12px, soft shadow
- Positioned beneath badge, aligned to right edge
- Stays within viewport
- Works for keyboard users too

---

## Toggle behaviour
- Label: "Show section shortcuts" (desktop), "Section shortcuts" (mobile)
- Default: **enabled** for authenticated admins on first visit
- Persisted in `localStorage` key: `einao_admin_shortcuts`
- Read only after hydration to avoid SSR mismatch
- When disabled: hides all badges, outlines, tooltips
- Admin utility bar and Dashboard link remain visible regardless

---

## Implementation plan

### Files to create
| File | Purpose |
|---|---|
| `app/components/admin/AdminBar.tsx` | Utility bar component |
| `app/components/admin/AdminBar.module.css` | Utility bar styles |
| `app/components/admin/SectionShortcut.tsx` | Per-section wrapper with badge, outline, tooltip |
| `app/components/admin/SectionShortcut.module.css` | Shortcut styles |
| `app/components/admin/AdminContext.tsx` | React context: `isAdmin`, `shortcutsEnabled`, `toggleShortcuts` |

### Files to modify
| File | Change |
|---|---|
| `app/layouts/main.tsx` | Add `GET /api/v1/admin/me` to loader; render `AdminBar`; provide `AdminContext` |
| `app/routes/home.tsx` | Wrap CMS-backed sections with `<SectionShortcut>` |
| `app/components/layout/Header.module.css` | Account for `--admin-bar-height` CSS variable (44px or 0) |
| `app/lib/catalog.server.ts` | Add `checkAdminSession(request, env)` helper |

### Step-by-step

1. **`catalog.server.ts`** — add `checkAdminSession`: calls `/api/v1/admin/me` with the request cookie, returns the user object or `null`. Swallows all errors silently so a backend hiccup never breaks the public site.

2. **`main.tsx` loader** — call `checkAdminSession`, add `adminUser` to loader data. No impact on public visitors.

3. **`AdminContext.tsx`** — context with `isAdmin: boolean`, `shortcutsEnabled: boolean`, `toggleShortcuts: () => void`. Reads/writes `localStorage` after hydration. Provides a `useAdminShortcuts()` hook.

4. **`AdminBar.tsx`** — renders only when `isAdmin`. Shield icon, "Admin view", toggle, divider, Dashboard link. Dashboard URL: `http://localhost:5931` in dev, configurable for production.

5. **`SectionShortcut.tsx`** — wraps children in `position: relative` container. Reads `shortcutsEnabled` from context. Renders badge as an `<a>` tag. Applies outline class on hover/focus-within. Renders tooltip via `aria-describedby`.

6. **`home.tsx`** — wrap `HomeHero`, `HomeCards`, `HomeSolutions`, `HomeStories`, `HomePlatform` with `<SectionShortcut>`. Leave `HomeMission`, `HomeJourney`, `HomeNews` unwrapped.

7. **`Header.module.css`** — set `top: var(--admin-bar-height, 0)` on the sticky header. `main.tsx` sets `--admin-bar-height: 44px` on `<html>` when admin bar is present.

---

## Section badge labels and destinations

| Section | Badge label | Admin destination |
|---|---|---|
| Home hero | Hero · Section settings ↗ | `/page-blocks?page=home` |
| Capabilities cards | Capabilities · Section settings ↗ | `/capabilities` |
| Delivering outcomes (solutions) | Solutions · Section settings ↗ | `/solutions` |
| Work / Stories | Work · Section settings ↗ | `/work` |
| Platform | Platform · Section settings ↗ | `/solutions` |
| Any inner page hero | Hero · Section settings ↗ | `/page-hero-settings/{slug}` |

---

## Sections without shortcuts (no CMS backing)
- `HomeMission` — hardcoded copy
- `HomeJourney` — hardcoded timeline
- `HomeNews` — layout only, content from blog API

---

## Permissions
- Render utility bar and shortcuts only for authenticated users (`adminUser !== null`)
- Dashboard authorization is independently enforced by the backend
- Public visitors see the ordinary website with zero extra requests beyond the one `GET /api/v1/admin/me` check in the layout loader

---

## Responsive notes
- Mobile: shorten toggle label to "Section shortcuts", keep touch targets ≥44px
- Badges: show section name + icons only on small screens if needed
- Tooltips: must fit within viewport on mobile
- No horizontal overflow at any breakpoint

---

## Acceptance checklist
- [ ] Public visitors see the ordinary website
- [ ] Authenticated admins see the utility bar
- [ ] Toggle hides and restores all section markers
- [ ] Each badge opens the correct admin content page
- [ ] Hover and keyboard focus highlight the correct section with lime outline
- [ ] Existing links, buttons, image sizes, and layouts are unchanged
- [ ] No horizontal overflow on desktop or mobile
- [ ] SSR renders without hydration errors
- [ ] `prefers-reduced-motion` respected for outline transition


## Implementation notes (2026-11-26)

- The utility bar and five homepage shortcuts are implemented in client-v2.
- CMS-backed collection and detail heroes link to their numeric block editor with a URL-encoded page query. The old hero-settings editor uses a different block format.
- Industry pages currently render hardcoded content, so they have no shortcuts.
- The admin block editor now accepts the page query and encodes nested page slugs during lookup.
- The existing header is fixed. Its top offset and mobile drawer height account for the 44px admin bar.
- Local dashboard links use the current hostname on port 5931. Use the same hostname for the website and admin login so their session cookie is shared.
- Production defaults to https://einao-admin.einaodevv.workers.dev; set the client worker environment variable ADMIN_DASHBOARD_URL to override it.
- Visitors without a session cookie skip the session API call. Failed session checks return the ordinary public view.


## Menu-first shortcuts
- Capabilities opens /capabilities; Work opens /work; Solutions and Platform open /solutions.
- These badges say "Manage items": they open the same editor as the dashboard sidebar.
- Collection detail heroes open the corresponding menu with a page query to edit that item's page.
- Generic section settings remain for content without a dedicated menu editor.

Our Journey now has a Manage cards shortcut to its homepage block editor. The editor supports adding, editing, and deleting milestones; an explicitly empty card list stays empty.
