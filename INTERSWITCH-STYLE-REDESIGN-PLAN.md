# Einao visual redesign plan

## Purpose

Restyle the existing Einao public website toward the bright, airy, editorial feel of Interswitch Group while keeping Einao's identity and approved website structure. This is a visual and interaction redesign, not a content reset or a new site architecture.

The current client already has a React Router application, a shared `Shell` header/footer, reusable page components, file-backed content, a hero video component, and a substantial stylesheet in `apps/client/app/app.css`. The redesign should build on those foundations instead of introducing a second design system.

## Non-negotiable constraints

- Keep Einao's logo, lime/forest brand colors, approved copy, routes, forms, integrations, SEO metadata, and content model.
- Preserve the completed navigation changes: Home, Our Work after Insights, Fylonn spelling, IP PRO, and PayX as coming soon.
- Do not copy Interswitch branding, wording, imagery, or layouts exactly. Use it only as a reference for visual tone and information density.
- Keep pages server-renderable and usable before JavaScript loads.
- Respect `prefers-reduced-motion`, keyboard navigation, visible focus, alt text, and WCAG AA contrast.
- Use video, GSAP/ScrollTrigger, and any Three.js scene only for the defined interactions in this plan, with a static fallback and reduced-motion path for each.

## What changes

### 1. Establish the light visual system

Update the public client tokens in `apps/client/app/app.css`:

- Make white the primary page background and use `#F8FAFC` or `#F5F7FA` for alternating sections.
- Use near-black headings (`#0F172A`) and slate body text (`#475569`).
- Keep Einao lime and forest as restrained accents for actions, active states, links, icons, and small highlights.
- Replace heavy dark surfaces and strong gradients outside the hero, footer, and one feature band.
- Use soft borders (`#E5E7EB`), small shadows, 12–16px image/card radii, and pill-shaped status labels.
- Keep the existing font files where possible; retune the scale and weights before adding another font dependency.
- Set body text around 15–16px, nav and buttons around 14–15px, card titles around 18–20px, section headings around 32–40px, and hero headings no larger than roughly 56px on desktop.
- Constrain paragraphs and headings to readable measure instead of allowing very wide lines.

The current stylesheet uses oversized `h1`/`h2` values and a dark green `--paper`/`--surface` direction. Those are the first high-impact changes because they affect every route.

### 2. Make the header calmer and clearer

Update `apps/client/app/components/Shell.tsx` and its header styles:

- Use a white sticky header on inner pages and a transparent-over-hero state only on the home hero.
- Keep the existing Home link and current navigation order, with Our Work after Insights.
- Retain dropdown groups, but give each dropdown item a short description and clearer grouping where content supports it.
- Add a subtle shadow/backdrop treatment after scrolling rather than a dramatic color change.
- Keep the current accessible mobile drawer, adding a visible back/drill-down state only if the menu hierarchy requires it.
- Use a restrained animated underline and clear active-page styling.

### 3. Vary the page rhythm

Use a repeatable section pattern without making every page look identical:

1. Eyebrow, short heading, one or two lines of context, and one clear action.
2. A composition chosen for the content: split text/image, editorial links, cards, stats, or a full-width band.
3. Generous vertical spacing, with tighter spacing between related elements.

Recommended page treatments:

- **Home:** video hero, proof/intro split, solutions overview, selected work, operating model, insights, and a light closing CTA.
- **Solutions:** differentiated product cards/list rows for Fylonn, IP PRO, and PayX; PayX retains a visible Coming soon badge and cannot read like an available product.
- **Our Work:** editorial case-study cards with stronger imagery and a clear project outcome; keep IPO Nigeria and future case studies extensible.
- **Insights:** compact editorial/news card row with image, category, title, date, and a clear article link.
- **About:** calmer story sections, principles, founder profile, and a restrained timeline or stats strip if approved content supports it.
- **Capabilities/Industries:** alternating content rows and grouped capability cards instead of repeated identical grids.
- **Contact:** focused form layout with supporting contact information and no unnecessary decorative density.

### 4. Improve cards and controls

Consolidate reusable visual primitives in `apps/client/app/components/primitives.tsx` and related styles:

- Primary button: solid brand color, 44–48px high, 10–12px radius.
- Secondary button: light border and white background.
- Text link: arrow that shifts slightly on hover.
- Card: white surface, soft border, 12–16px radius, and image zoom capped around 1.04–1.06. Featured insight rows use the expanding-card interaction defined below.
- Eyebrow: small uppercase label with wide tracking and a brand-colored marker.
- Status badge: compact pill for `Coming soon`, category, or availability state.

Cards must have genuinely different content and hierarchy. Changing only their color or badge is not enough; each solution needs a distinct label, description, capability emphasis, and CTA.

### 5. Use imagery deliberately

- Replace weak or repetitive stock images with a consistent, high-quality people/workflow image direction.
- Keep image crops, aspect ratios, and focal points stable to avoid layout shift.
- Use WebP/AVIF where the pipeline supports it, retain meaningful alt text, and provide a deliberate fallback for every remote or generated visual.
- Add the supplied Collins image once received and approved.
- Do not add random stock imagery merely to fill a grid; every image should support the adjacent content.

### 6. Required signature interactions

These interactions are part of the redesign. They use Einao content, bright backgrounds, and Einao's lime/forest palette; reference-site copy, imagery, and branding are not carried over.

Implement the mechanics in `apps/client/app/lib/motion.ts` and related isolated modules. GSAP and ScrollTrigger must be lazy-loaded, scoped to the routes that use them, and safe for SSR. Every interaction needs a complete static layout and a mobile fallback. Check `prefers-reduced-motion` before creating animations; reduced-motion users receive the final readable state without pinning or scrubbing.

#### A. Expanding insight cards — Home

The Home page gets a row of four equal-height portrait cards, with a minimum height of approximately 440px at desktop. Each card has two complete layers:

- A rest layer with its own background/image treatment, eyebrow, and title.
- A hover/focus layer with its own contrasting background, image or illustration treatment, short copy, and `Learn more` link.

On hover or focus, the active card grows roughly 6–8% while neighboring cards compress, or uses an equivalent 1.04 scale treatment. The rest layer fades out as the hover layer fades in; the title moves upward and the supporting copy/link appear near the bottom. Use a 300–400ms ease-out transition. Use `:focus-within` so the first tap on touch devices reveals the hover state before a link is followed. The interaction must remain usable with keyboard focus and must work without JavaScript.

#### B. Pinned heading with rising cards — Solutions or Home

Use one large centered heading with two or three colored cards rising from below and overlapping it. Cards sit above the heading with clear z-index ordering, staggered left/right offsets, and different parallax speeds. Each card contains a short bold statement and one or two lines of supporting copy.

Define tuneable pin values as named constants rather than inline numbers, for example `RISING_CARDS_PIN_VH`, `RISING_CARD_OFFSET_PX`, and `RISING_CARD_STAGGER`. The card-rise pin is intentionally shorter than the image-shrink sequence. On mobile and reduced motion, remove the pin and render the heading followed by a normal stacked card layout.

#### C. Full-bleed image shrinking aside — About

The About page gets a pinned section lasting approximately `IMAGE_SHRINK_PIN_VH = 120` viewport heights. The image begins full-width, then scrubs to approximately 48vw aligned to the left. The right column fades and slides in from `opacity: 0, y: 40px, x: 60px` to its final position with an eyebrow, heading, serif paragraph, and CTA. An oversized accent phrase may overlap the lower image edge when it remains readable and does not create layout shift.

Define the sequence values as named constants such as `IMAGE_SHRINK_PIN_VH`, `IMAGE_SHRINK_TARGET_WIDTH`, `IMAGE_TEXT_ENTER_Y`, and `IMAGE_TEXT_ENTER_X`. On mobile, do not pin: stack the image above the text and use a simple reveal.

#### D. Hero headline drift — Home

The Home hero headline is split into readable words. Scroll progress applies small opposing horizontal translations, capped around 8vw, so the words drift without becoming difficult to read. The server-rendered/static state remains fully legible before JavaScript and under reduced motion.

#### Motion lifecycle and cleanup

- Keep all ScrollTrigger instances in a route-scoped GSAP context.
- Kill and revert the context on component unmount and on route change; no trigger, listener, pin spacer, or inline style may survive navigation.
- Initialize scroll sequences only after their section is present and the motion module has loaded.
- Keep CSS hover/focus interactions independent of GSAP so card functionality survives script failure.
- Use CSS transitions or a small IntersectionObserver reveal for non-pinned sections.
- Counters, marquees, and Three.js may be added only where verified data/assets justify them; if used, they follow the same lazy-loading, fallback, and cleanup rules.

### 7. Keep the video hero focused

The existing `HeroVideo` component can remain the home hero foundation. Its implementation should provide:

- poster-first rendering;
- muted, looping, playsinline video only when appropriate;
- a reduced-motion/data-saver fallback;
- a compressed asset budget;
- readable text over a controlled dark overlay;
- no dependence on video for understanding the headline or CTA.

Inner page headers should stay shorter and lighter than the home hero. Do not add a video to every route.

### 8. Strengthen the footer

Keep the current footer content and legal/contact links, then adjust its presentation toward a clean multi-column directory:

- logo and short positioning statement;
- grouped Products, Solutions, Resources, Company, and contact links where those destinations exist;
- social links only when official URLs are available;
- legal links and location details in a quieter final row.

Avoid inventing links or contact details to fill columns.

## Implementation order

1. Audit current routes and capture desktop/mobile screenshots as a baseline.
2. Update tokens, typography, surfaces, containers, and shared controls.
3. Restyle the header, mobile drawer, footer, hero, and section primitives.
4. Rework Home and Solutions first because they establish the visual language and contain the most visible client feedback.
5. Rework Our Work, Insights, About, Capabilities, Industries, and Contact using the appropriate section compositions.
6. Replace approved imagery and verify all alt text and crop behaviour.
7. Implement the four required signature interactions in their assigned routes, then tune the named pin constants against desktop, tablet, mobile, and reduced-motion layouts.
8. Run typecheck, tests, production build, Lighthouse checks, keyboard review, reduced-motion review, route-change cleanup checks, and a mobile viewport review.

## Acceptance criteria

- The site reads as bright, calm, and editorial on every public route.
- The Home link is visible and works from every page.
- Our Work appears after Insights and is labelled consistently in navigation, metadata, headings, and CTAs.
- Fylonn is spelled correctly everywhere, including page copy and metadata.
- PayX is clearly marked Coming soon wherever it appears and does not imply that the product is ready for purchase.
- Solution cards have materially different copy and visual hierarchy.
- No page relies on JavaScript, video, or WebGL to expose its primary content.
- No static asset 404s occur in production; SSR document requests and asset requests remain separate in the Worker.
- Home includes the expanding insight cards and hero word drift; About includes the shrinking image sequence; Solutions or Home includes the pinned heading with rising cards.
- Insight cards expose a separate rest and hover layer, support `:focus-within`, and reveal the hover state on the first touch before navigation.
- Pin durations and offsets are named constants, and all ScrollTrigger instances are killed/reverted on unmount and route change.
- Motion is subtle, interruptible, and disabled or reduced when requested by the user.
- Layouts remain readable and usable at mobile, tablet, and desktop widths.

## Inputs still needed before visual implementation

- Final Collins portrait and approved biography.
- Approved high-quality image direction or a selected stock image set.
- The complete source document for any copy that has not yet been migrated.
- Final official social links, phone number, and any partner/logo list.
- Confirmation of which product capabilities and metrics are publishable.
