import { redirect } from 'react-router'
import type { Route } from './+types/case-studies'
export function loader({ request }: Route.LoaderArgs) { return redirect(`/work${new URL(request.url).search}`) }
export default function LegacyWorkRoute() { return null }
