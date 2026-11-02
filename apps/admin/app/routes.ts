import { index, prefix, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('config', 'routes/config.tsx'),
  route('page-settings', 'routes/page-settings.tsx'),
  route('case-studies', 'routes/case-studies.tsx'),
  route('auth/login', 'routes/auth.login.ts'),
  route('auth/logout', 'routes/auth.logout.ts'),
  route('work', 'routes/work.tsx'),
  route('industries', 'routes/industries.tsx'),
  route('solutions', 'routes/solutions.tsx'),
  route('capabilities', 'routes/capabilities.tsx'),
  route('media', 'routes/media.tsx'),
  route('tags', 'routes/tags.tsx'),
  route('categories', 'routes/categories.tsx'),
  route('team', 'routes/team.tsx'),
  route('contact', 'routes/contact.tsx'),
  route('page-hero-settings/:pageSlug', 'routes/page-hero-settings.$pageSlug.tsx'),

  ...prefix('home', [
    index('routes/home/index.tsx'),
    route('hero', 'routes/home/hero.tsx'),
    route('about', 'routes/home/about.tsx'),
  ]),

  ...prefix('page-blocks', [
    index('routes/content.tsx'),
    route(':id', 'routes/page-blocks.$id.tsx'),
  ]),

  ...prefix('users', [index('routes/users/index.tsx'), route('new', 'routes/users/new.tsx'), route(':id', 'routes/users/$id.tsx')]),

  ...prefix('projects', [
    index('routes/projects/index.tsx'),
    route('new', 'routes/projects/new.tsx'),
    route(':slug', 'routes/projects/$slug.tsx'),
  ]),

  ...prefix('services', [
    index('routes/services/index.tsx'),
    route('new', 'routes/services/new.tsx'),
    route(':id', 'routes/services/$id.tsx'),
  ]),

  ...prefix('events', [
    index('routes/events/index.tsx'),
    route('new', 'routes/events/new.tsx'),
    route(':id', 'routes/events/$id.tsx'),
  ]),

  ...prefix('posts', [
    index('routes/posts/index.tsx'),
    route('new', 'routes/posts/new.tsx'),
    route(':id', 'routes/posts/$id.tsx'),
    route(':id/revisions', 'routes/posts/$id.revisions.tsx'),
  ]),

  ...prefix('content', [
    index('routes/content/index.tsx'),
    route('new', 'routes/content/new.tsx'),
    route(':id', 'routes/content/$id.tsx'),
  ]),
] satisfies RouteConfig


