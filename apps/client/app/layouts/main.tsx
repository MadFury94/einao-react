import { getWorkCollection, workNavigation } from '~/lib/work';
import { Outlet, useLoaderData, useNavigation } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { Header, Footer } from "~/components/Shell";
import { closingCta } from "@einao/content";
export async function loader({ request, context }: { request: Request; context: { cloudflare: { env: Env } } }) {
	const env = context.cloudflare.env as unknown as { CONTENT_API_URL?: string };
	const store = getContentStore(env.CONTENT_API_URL, request.url);
	const [site, work] = await Promise.all([store.getSiteConfig(), getWorkCollection(store)]);
	return {
		site: workNavigation(site, work.entries),
		year: new Date().getUTCFullYear(),
		closingCta,
	};
}
export const shouldRevalidate = () => true;
export default function MainLayout() {
	const { site, year, closingCta: cta } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	return (
		<>
			<a className="skip-link" href="#main-content">
				Skip to content
			</a>
			<Header site={site} />
			<div className="navigation-progress" role="status" aria-live="polite">
				{navigation.state !== "idle" && (
					<>
						<span className="sr-only">Loading page</span>
						<span className="progress-bar" />
					</>
				)}
			</div>
			<main id="main-content" tabIndex={-1}>
				<Outlet />
			</main>
			<Footer site={site} year={year} closingCta={cta} />
		</>
	);
}
