import type { Route } from './+types/capabilities';
import { createCatalogApi } from '~/lib/catalog.server';
import { catalogMeta } from '~/lib/catalog-meta';
import { CollectionPage, CatalogError } from '~/components/catalog/CatalogPages';
export async function loader({ request, context }: Route.LoaderArgs) {
  return { collection: await createCatalogApi(request, context.cloudflare.env).getCollection('capabilities'), origin: new URL(request.url).origin };
}
export function meta({ data }: Route.MetaArgs) { return catalogMeta(data); }
export default function Page({ loaderData }: Route.ComponentProps) { return <CollectionPage collection={loaderData.collection} />; }
export const ErrorBoundary = CatalogError;
