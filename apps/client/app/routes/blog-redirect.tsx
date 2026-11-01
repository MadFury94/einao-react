import { redirect } from 'react-router';
import type { Route } from './+types/blog-redirect';
export function loader({ params, request }: Route.LoaderArgs) { return redirect(`${params.slug ? `/insights/${encodeURIComponent(params.slug)}/` : '/insights/'}${new URL(request.url).search}`, 301); }
export default function LegacyBlog() { return null; }
