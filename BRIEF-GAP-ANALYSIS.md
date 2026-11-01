# Einao brief gap analysis

This document records what remains incomplete or only partially implemented against `Einao Full Website Copy and Experience Blueprint (1).pdf`. It was updated after the latest brief-alignment release.

## Completed in the latest update

- Privacy Notice and Terms of Use are now published content pages with baseline approved-for-review copy.
- The About page now displays mission and vision content.
- The fourth working principle, **Treat implementation as part of the work**, is now included.
- The footer now includes Privacy Notice, Terms of Use, Abuja, and Lagos.
- Work now has an IPO Nigeria case-study submenu.
- Solutions now includes a Custom Enterprise Systems navigation item and route.
- The Solutions overview title now matches the brief: `Enterprise Solutions & Digital Systems | Einao Solutions`.

## Implemented foundations

The current build includes the main page routes, the approved core messaging, the visual direction, the primary navigation, page metadata, canonical URLs, Open Graph and X metadata, a social preview image, JSON-LD page data, sitemap and robots routes, and the main homepage, About, Capabilities, Solutions, Industries, Work, Insights, and Contact layouts.

## Not implemented yet

### Working contact form

The form now submits through the Worker to Resend, with required-field and email validation, a honeypot, reply-to handling, and accessible success and failure messages. The `RESEND_API_KEY` secret still needs to be added to the Cloudflare Worker before live delivery can succeed. Setup is documented in `CONTACT-FORM-SETUP.md`.

The form still needs a later persistence/routing decision if enquiries should also be stored in the Einao backend or admin.

### Individual Insights articles

The Insights landing page and article cards exist, but the project does not yet have:

- Individual article routes
- Published article content
- Author and publication date fields
- Article introductions, subheadings, examples, conclusions, or related links
- Context-specific article CTAs
- Complete Article schema with author, publication date, modified date, and article image

The metadata helper is prepared to emit Article schema for future slugs under `insights/`.

### About leadership profile

The founder section still shows a placeholder instead of Collins Nkwoji’s approved professional portrait and biography.

### Official contact details

The phone link is still a placeholder (`+2340000000000`). LinkedIn and X currently point to generic platform URLs rather than Einao’s official profiles.

### Editable case-study system

The current content is file-backed seed data. The admin and backend architecture is documented, but the actual admin editing interface, API persistence, authentication, and database-backed content workflow have not been built.

The brief also calls for a way to add and edit case studies over time. Only the IPO Nigeria case study is currently represented.

### Product detail completion

PayX and Fileonn are intentionally described at a high level because their product-specific capabilities have not been verified. The brief still calls for approved details covering, where applicable:

- Supported channels and integrations
- Workflow and reconciliation behaviour
- Reporting and export capabilities
- User roles and permissions
- Audit history and security controls
- Deployment, support, implementation, and pricing approach

These should be added only after product-owner approval.

## Partially implemented

### Search indexing

SEO metadata, canonical URLs, social previews, JSON-LD, sitemap, and robots routes are implemented. The Worker is still configured with `SITE_INDEXABLE=false`, so the preview remains blocked from search engines. This should be changed only for the intended production release.

### Case-study evidence

The IPO Nigeria case study content is present, but the brief requires verified metrics and approved evidence before publication. The supplied figures for registered users and applications processed remain intentionally unpublished.

### Accessibility and form states

The app has accessible labels, navigation semantics, focus foundations, and descriptive controls in many areas. The disabled form means the brief’s validation, error, and success states have not yet been implemented or tested through a real submission flow.

## Recommended order of completion

1. Add `RESEND_API_KEY` and verify a live contact submission.
2. Replace the baseline legal copy with the final approved Privacy Notice and Terms of Use.
3. Add the founder portrait and approved biography.
4. Replace the placeholder phone and generic social links with official contact details.
5. Build the individual Insights article model and routes.
6. Build the admin and backend persistence needed to edit text and add case studies.
7. Complete verified PayX, Fileonn, and case-study details after owner approval.
8. Enable indexing only on the production domain.
