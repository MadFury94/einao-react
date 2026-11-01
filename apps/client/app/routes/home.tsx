import { useLoaderData } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { pageMeta } from "~/lib/metadata";
import { HomePage } from "~/components/HomePage";
import type { Route } from "./+types/home";
export async function loader({ request, context }: Route.LoaderArgs) {
	const env = context.cloudflare.env as unknown as { CONTENT_API_URL?: string };
	return { page: (await getContentStore(env.CONTENT_API_URL, request.url).getPage("home"))!, siteUrl: new URL(request.url).origin };
}
export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page, data?.siteUrl);
export default function Home() {
	const { page } = useLoaderData<typeof loader>();
	return <HomePage page={page} />;
}
