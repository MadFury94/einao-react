# Orixo-Inspired Redesign — Task Sheet

Reference: Orixo White Theme (`index-white.html`)
Goal: Replicate Orixo's animations, transitions, image placements, and layout patterns using Einao content and brand.

---

## STATUS KEY
- [ ] Not started
- [x] Done
- [-] Skipped / deferred

---

## 1. GLOBAL DESIGN TOKENS & TYPOGRAPHY
- [ ] 1.1 Switch default background to white (`--paper: #fff`) and body text to dark (`--ink: #0c1710`)
- [ ] 1.2 Reduce base font size to 15–16px body (Orixo uses 16px/1.56 line-height)
- [ ] 1.3 Ensure `font-weight: 400–500` for body (not 450), bold headings at 600–700
- [ ] 1.4 Add `--section-bg-light: #f5f5f5` and `--section-bg-dark: #101010` tokens for alternating sections
- [ ] 1.5 Update heading letter-spacing to be less aggressive (Orixo: -0.01em not -0.07em)

---

## 2. SCROLL-TRIGGERED ANIMATIONS (WOW.js equivalent)
Orixo uses `wow fadeInUp` with `data-wow-delay` on most content blocks.
Our equivalent: Intersection Observer (already in `Reveal` component — extend it).

- [ ] 2.1 Add `fadeInUp` animation variant to `Reveal` — translate Y 40px → 0 with opacity (already close, verify delay support)
- [ ] 2.2 Add staggered delay support to `Reveal` (prop: `delay?: number`) so sibling elements animate in sequence
- [ ] 2.3 Add `fadeInLeft` and `fadeInRight` variants for two-column sections (image slides in from left, text from right)
- [ ] 2.4 Add `zoomIn` variant for counter/stat elements
- [ ] 2.5 Apply staggered reveals to: capability cards, process steps, industry list items, footer columns

---

## 3. COUNTER ANIMATIONS (count up on scroll)
Orixo uses `.count` spans with jQuery counterUp. We need a React equivalent.

- [ ] 3.1 Build `AnimatedCounter` component — counts from 0 to target when element enters viewport
- [ ] 3.2 Apply to: "Founded 2011" / "Since 2013" counters on About page
- [ ] 3.3 Apply to any stat numbers on the home proof section

---

## 4. HOVER TRANSITIONS ON CARDS & IMAGES
Orixo: cards lift on hover (translateY -8px), images zoom slightly, borders/shadows appear.

- [ ] 4.1 Standardise card hover: `transform: translateY(-8px)` + `box-shadow` across all card types
- [ ] 4.2 Image hover zoom: `transform: scale(1.06)` with `overflow: hidden` container — apply sitewide consistently
- [ ] 4.3 Capability cards: add border-bottom lime accent that slides in on hover
- [ ] 4.4 Insight/blog cards: confirm reveal animation (dual-image slide) is working and consistent
- [ ] 4.5 Navigation links: underline slide-in (already done — verify)

---

## 5. IMAGE PLACEMENT PATTERNS

### 5.1 About section — image with floating small accent image
Orixo: large image left + small circular/square image floating bottom-right over it + counter stats.
- [ ] 5.1a Add small accent image overlay on the About page hero/proof image (positioned absolutely, `bottom: -20px; right: -20px`)
- [ ] 5.1b Add counter stat block beside/below the image in the about proof section

### 5.2 Hero section — decorative elements
Orixo: orbit/ring decorative SVG behind hero, floating badge/pill elements.
- [ ] 5.2a Add subtle decorative background element to hero (ring/orbit or abstract shape)
- [ ] 5.2b Floating eyebrow pill with icon before section headings (Orixo: small icon + "About us" label)

### 5.3 Capabilities/Services — image+text with small decorative image
Orixo: service section has image column with small overlapping accent image.
- [ ] 5.3a Update capabilities panels to have image column with small accent image overlap

### 5.4 Proof/Stats section
Orixo: about-counter-items has large number + small square image beside it.
- [ ] 5.4a Ensure proof section counters have small image accent beside stat numbers (already partially done on About)

---

## 6. SECTION LAYOUTS

- [ ] 6.1 Home "About" section: two-column, image left with floating accent image, content right with counter + small image
- [ ] 6.2 Home "Services/Capabilities": numbered cards in a grid, each with hover border-bottom accent
- [ ] 6.3 Home "Process/Approach": horizontal numbered steps with connecting lines
- [ ] 6.4 Industries section: large bordered list items with hover fill effect (Orixo-style)
- [ ] 6.5 Alternating light/dark sections (Orixo uses white → grey → dark stripes)
- [ ] 6.6 "Eyebrow" labels: add small decorative icon/image before eyebrow text on each section (Orixo uses a small star/dot image)

---

## 7. MARQUEE / TICKER
Orixo: uses star image between words, smooth CSS scroll.
- [x] 7.1 ✦ separators between marquee words (done)
- [ ] 7.2 Increase marquee text size slightly to match Orixo (Orixo: ~28–32px, bold)
- [ ] 7.3 Confirm smooth infinite scroll with no gaps on all marquee strips

---

## 8. HERO SECTION
- [ ] 8.1 Home hero: add animated background element (subtle grid lines or ring, like Orixo's `work-breadcrumb-lines.png`)
- [ ] 8.2 Hero pills/tabs at top with hover highlight (already partially done — verify style)
- [ ] 8.3 Hero bottom info strip: ratings/orbit element (already present — verify animations work)

---

## 9. PAGE TRANSITIONS
- [ ] 9.1 Add smooth page transition (fade or slide) between route changes using React Router navigation state
- [ ] 9.2 Progress bar on navigation (already exists — verify visibility)

---

## 10. FOOTER
- [x] 10.1 Footer missing on home page — fixed (added Footer to home route branch)
- [ ] 10.2 Footer styling: verify closing CTA section renders correctly on all pages
- [ ] 10.3 Footer links: confirm all nav groups display correctly

---

## 11. HEADER
- [x] 11.1 Home link added to navigation
- [x] 11.2 Our Work renamed and repositioned
- [ ] 11.3 Header: add glassmorphism scroll effect (already partially done with `is-scrolled`)
- [ ] 11.4 Mobile menu: verify hamburger open/close animation is smooth

---

## 12. SPECIFIC PAGES
- [ ] 12.1 About page: rebuild proof section with Orixo "why choose us" layout (large image + floating accent + counter + small image)
- [ ] 12.2 Capabilities listing: add image columns to each capability card with hover zoom
- [ ] 12.3 Solutions page: differentiate cards visually (different images, layout variation between left/right offset)
- [ ] 12.4 Insights listing: verify card animations and image reveal on hover

---

## 13. COPY & CONTENT
- [x] 13.1 Fileonn → Fylonn renamed throughout
- [x] 13.2 PayX "Coming soon" badge added
- [x] 13.3 IP PRO added as third solution
- [x] 13.4 Nav reordered (Home, Capabilities, Solutions, Industries, Insights, Our Work, About)
- [ ] 13.5 Remote DB reseeded with latest seed changes

---

## EXECUTION ORDER
1. Fix footer (done ✅), fix double header (done ✅)
2. Global tokens + typography (#1)
3. Scroll animations — extend Reveal with delay + variants (#2)
4. Image placement patterns — About section first (#5.1), then home (#5.2–5.4)
5. Section layouts home page (#6)
6. Counter animations (#3)
7. Hover transitions sitewide (#4)
8. Marquee polish (#7)
9. Page-specific layouts (#12)
10. Deploy + reseed

---
*Last updated: working session*
