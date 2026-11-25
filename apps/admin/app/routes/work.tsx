import CollectionEditor from '../components/collection-editor'
import { collections, deleteCollectionItem, deleteCollectionPage, loadCollection, saveCollection } from '../lib/collections'
import type { Route } from './+types/work'
export function meta() { return [{ title: `${collections.work.title} - Admin` }] }
export function loader({ request }: Route.LoaderArgs) { return loadCollection('work', request) }
export async function action({ request }: Route.ActionArgs) { const form = await request.formData(); if (form.get('intent') === 'delete-page') return deleteCollectionPage(String(form.get('slug'))); if (form.get('intent') === 'delete') return deleteCollectionItem('work', Number(form.get('index')), Number(form.get('blockId')), String(form.get('snapshot'))); return saveCollection('work', request, form) }
export default function CollectionRoute({ loaderData }: Route.ComponentProps) { return <CollectionEditor data={loaderData} /> }




