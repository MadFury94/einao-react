import CollectionEditor from '../components/collection-editor'
import { collections, loadCollection, saveCollection } from '../lib/collections'
import type { Route } from './+types/work'
export function meta() { return [{ title: `${collections.work.title} - Admin` }] }
export function loader({ request }: Route.LoaderArgs) { return loadCollection('work', request) }
export function action({ request }: Route.ActionArgs) { return saveCollection('work', request) }
export default function CollectionRoute({ loaderData }: Route.ComponentProps) { return <CollectionEditor data={loaderData} /> }
