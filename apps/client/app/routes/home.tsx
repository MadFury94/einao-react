import { useLoaderData } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { pageMeta } from "~/lib/metadata";
import { HomePage } from "~/components/HomePage";
import { leadershipProfile, type LeadershipProfile } from "@einao/content";
import { getInsights, insightsApiBase, insightsApiFetch, type Insight } from "~/lib/insights.server";
import type { Route } from "./+types/home";

export type { Insight };

export async function loader({ request, context }: Route.LoaderArgs) {
	const env = context.cloudflare.env as unknown as {
		CONTENT_API_URL?: string;
		CONTENT_API?: { fetch: typeof fetch };
	};
	const apiFetch = insightsApiFetch(request.url, env.CONTENT_API);
	const store = getContentStore(env.CONTENT_API_URL, request.url);
	const base = insightsApiBase(env.CONTENT_API_URL, request.url);

	const [page, aboutPage, insightList] = await Promise.all([
		store.getPage("home"),
		store.getPage("about").catch(() => null),
		getInsights(base, 1, 3, "", apiFetch).catch(() => ({ items: [], total: 0, page: 1, pageSize: 3 })),
	]);

	const heroBlock = aboutPage?.blocks.find(b => b.block_type === "hero");
	const leader: LeadershipProfile = leadershipProfile(
		(heroBlock?.config as { leadership?: Partial<LeadershipProfile> })?.leadership
	);

	return {
		page: page!,
		siteUrl: new URL(request.url).origin,
		leader,
		latestInsights: insightList.items.slice(0, 3),
	};
}

export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page, data?.siteUrl);

export default function Home() {
	const { page, leader, latestInsights } = useLoaderData<typeof loader>();
	return <HomePage page={page} leader={leader} latestInsights={latestInsights} />;
}
