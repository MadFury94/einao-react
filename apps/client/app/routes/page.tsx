import { redirect, useLoaderData } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { pageMeta } from "~/lib/metadata";
import { PageBlocks } from "~/components/page-blocks";
import type { Route } from "./+types/page";
export async function loader({ params }: Route.LoaderArgs) {
	if (params["*"]?.replace(/\/$/, "") === "home") throw redirect("/", 301);
	const page = await getContentStore().getPage(params["*"] ?? "");
	if (!page) throw new Response("Page not found", { status: 404 });
	return { page };
}
export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page);
export default function ContentPage() {
	const { page } = useLoaderData<typeof loader>();
	return <PageBlocks key={page.slug} blocks={page.blocks} />;
}
