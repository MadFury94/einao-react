# Einao SEO implementation

This document records the SEO work implemented for the Einao client in line with the Einao Website Copy and Experience Blueprint.

## Implemented

- Page titles and meta descriptions are sourced from the page content seed and match the SEO copy defined in the brief.
- Canonical URLs are generated from the request host, so they follow the current deployment domain or a future custom domain.
- Standard `robots` metadata is emitted for published pages.
- Open Graph metadata includes title, description, URL, image, image alt text, site name, and locale.
- X/Twitter metadata uses `summary_large_image` with the same page title, description, and social image.
- A 1200x630 social preview image is available at `/assets/seo/einao-social-card.jpg`.
- JSON-LD structured data is emitted for the organisation and each page. The Insights landing page uses `CollectionPage` schema; future individual insight routes can use `Article` schema.
- `robots.txt` and `sitemap.xml` routes are implemented. The sitemap includes page URLs, priorities, and monthly change frequency when indexing is enabled.
- The existing SVG favicon is linked from the root document.

## Implementation locations

- `apps/client/app/lib/metadata.ts` — shared title, description, canonical, social, and JSON-LD metadata.
- `apps/client/app/routes/home.tsx` — homepage metadata host information.
- `apps/client/app/routes/page.tsx` — metadata for content pages.
- `apps/client/app/routes/contact.tsx` — contact page metadata host information.
- `apps/client/app/routes/robots.ts` — robots policy.
- `apps/client/app/routes/sitemap.ts` — XML sitemap.
- `apps/client/app/root.tsx` — document language, viewport, favicon, and font preload.
- `apps/client/public/assets/seo/einao-social-card.jpg` — social preview image.

## Indexing safety

The current Worker configuration intentionally keeps the preview private from search engines:

```json
"vars": {
  "SITE_INDEXABLE": "false"
}
```

With this value, the Worker sends `X-Robots-Tag: noindex, nofollow`, `robots.txt` disallows crawling, and `sitemap.xml` contains no URLs. This prevents the temporary Worker URL from being indexed.

Before launching the production domain:

1. Set `SITE_INDEXABLE` to `true` in `apps/client/wrangler.jsonc` or the production Worker environment.
2. Deploy the client.
3. Confirm `/robots.txt` allows crawling and points to `/sitemap.xml`.
4. Confirm `/sitemap.xml` contains the published page URLs.
5. Register the production domain in Google Search Console and submit the sitemap.
6. Test the homepage and key pages with an Open Graph preview validator.

The metadata uses the request host, so switching from the Worker URL to the final custom domain does not require hardcoding a new canonical origin.

## Current limitation

The project currently has an Insights landing page but no individual article content model or article route. The metadata helper is prepared to emit `Article` schema for future slugs under `insights/`; individual articles should add an author, publication date, modified date, and article image when that content is introduced.

## Validation

The client production build passed with `npm run build`. The deployed Worker was smoke-tested for homepage metadata, `robots.txt`, and the social image asset.
