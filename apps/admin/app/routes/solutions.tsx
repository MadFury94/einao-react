import CollectionEditor from '../components/collection-editor'
import { collections, loadCollection, saveCollection } from '../lib/collections'
import type { Route } from './+types/solutions'
export function meta() { return [{ title: `${collections['solutions'].title} - Admin` }] }
export function loader({ request }: Route.LoaderArgs) { return loadCollection('solutions', request) }
export function action({ request }: Route.ActionArgs) { return saveCollection('solutions', request) }
export default function CollectionRoute({ loaderData }: Route.ComponentProps) { return <CollectionEditor data={loaderData} /> }
