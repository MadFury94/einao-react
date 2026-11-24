import type { Route } from './+types/capability-detail';
import { createCatalogApi } from '~/lib/catalog.server';
import { catalogMeta } from '~/lib/catalog-meta';
import { DetailPage, CatalogError } from '~/components/catalog/CatalogPages';
export async function loader({ request, context, params }: Route.LoaderArgs) {
  return { page: await createCatalogApi(request, context.cloudflare.env).getDetail('capabilities', params.slug), origin: new URL(request.url).origin };
}
export function meta({ data }: Route.MetaArgs) { return catalogMeta(data); }
export default function Page({ loaderData }: Route.ComponentProps) { return <DetailPage page={loaderData.page} collectionKey="capabilities" />; }
export const ErrorBoundary = CatalogError;
