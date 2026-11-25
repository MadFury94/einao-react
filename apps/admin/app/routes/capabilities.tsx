import CollectionEditor from '../components/collection-editor'
import { collections, deleteCollectionItem, deleteCollectionPage, loadCollection, saveCollection } from '../lib/collections'
import type { Route } from './+types/capabilities'
export function meta() { return [{ title: `${collections['capabilities'].title} - Admin` }] }
export function loader({ request }: Route.LoaderArgs) { return loadCollection('capabilities', request) }
export async function action({ request }: Route.ActionArgs) { const form = await request.formData(); if (form.get('intent') === 'delete-page') return deleteCollectionPage(String(form.get('slug'))); if (form.get('intent') === 'delete') return deleteCollectionItem('capabilities', Number(form.get('index')), Number(form.get('blockId')), String(form.get('snapshot'))); return saveCollection('capabilities', request, form) }
export default function CollectionRoute({ loaderData }: Route.ComponentProps) { return <CollectionEditor data={loaderData} /> }




