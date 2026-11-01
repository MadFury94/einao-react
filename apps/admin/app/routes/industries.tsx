import CollectionEditor from '../components/collection-editor'
import { collections, loadCollection, saveCollection } from '../lib/collections'
import type { Route } from './+types/industries'
export function meta() { return [{ title: `${collections.industries.title} - Admin` }] }
export function loader({ request }: Route.LoaderArgs) { return loadCollection('industries', request) }
export function action({ request }: Route.ActionArgs) { return saveCollection('industries', request) }
export default function CollectionRoute({ loaderData }: Route.ComponentProps) { return <CollectionEditor data={loaderData} /> }
