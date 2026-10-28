import { useLoaderData } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { pageMeta } from "~/lib/metadata";
import { HomePage } from "~/components/HomePage";
import type { Route } from "./+types/home";
export async function loader() {
	return { page: (await getContentStore().getPage("home"))! };
}
export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page);
export default function Home() {
	const { page } = useLoaderData<typeof loader>();
	return <HomePage page={page} />;
}
