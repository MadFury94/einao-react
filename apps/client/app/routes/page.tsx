import { getWorkCollection } from '~/lib/work';
import { WorkListing, WorkDetail } from '~/components/WorkPages';
import { redirect, useLoaderData } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { pageMeta } from "~/lib/metadata";
import { PageBlocks } from "~/components/page-blocks";
import type { Route } from "./+types/page";
export async function loader({ params, request, context }: Route.LoaderArgs) {
	if (params["*"]?.replace(/\/$/, "") === "home") throw redirect("/", 301);
	const env = context.cloudflare.env as unknown as { CONTENT_API_URL?: string };
	const store = getContentStore(env.CONTENT_API_URL, request.url);
	const page = await store.getPage(params["*"] ?? "");
	if (!page) throw new Response("Page not found", { status: 404 });
	const work = page.slug === 'work' || page.slug.startsWith('work/') ? await getWorkCollection(store) : null;
	return { page, work, siteUrl: new URL(request.url).origin };
}
export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page, data?.siteUrl);
export default function ContentPage() {
	const { page, work } = useLoaderData<typeof loader>();
	if (page.slug === 'work' && work) return <WorkListing page={page} entries={work.entries} />;
	if (page.slug.startsWith('work/') && work) return <WorkDetail key={page.slug} page={page} entries={work.entries} />;
	return <PageBlocks key={page.slug} blocks={page.blocks} />;
}
