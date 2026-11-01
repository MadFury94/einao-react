import CollectionEditor from '../components/collection-editor'
import { collections, loadCollection, saveCollection } from '../lib/collections'
import type { Route } from './+types/capabilities'
export function meta() { return [{ title: `${collections['capabilities'].title} - Admin` }] }
export function loader({ request }: Route.LoaderArgs) { return loadCollection('capabilities', request) }
export function action({ request }: Route.ActionArgs) { return saveCollection('capabilities', request) }
export default function CollectionRoute({ loaderData }: Route.ComponentProps) { return <CollectionEditor data={loaderData} /> }
