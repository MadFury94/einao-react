-- The Insights supplied in the website brief are launch content and should be
-- visible on the client after the initial seed.
UPDATE posts
SET status = 'published',
    published_at = COALESCE(published_at, datetime('now')),
    updated_at = datetime('now')
WHERE post_type = 'blog'
  AND slug IN (
    'before-you-buy-software-five-questions',
    'digitising-a-broken-process-does-not-fix-it',
    'where-manual-work-creates-hidden-operational-costs',
    'integrate-existing-systems-instead-of-replacing-them',
    'what-to-plan-for-after-a-digital-platform-goes-live',
    'how-to-write-better-requirements-for-an-enterprise-portal'
  );
