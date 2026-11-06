import { ClosingCta } from '~/components/site-footer/ClosingCta';
import { SiteFooter } from '~/components/site-footer/SiteFooter';
import { getWorkCollection, workNavigation } from '~/lib/work';
import { Outlet, useLoaderData, useLocation, useNavigation } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { Header } from "~/components/Shell";
import { closingCta, footerContent } from "@einao/content";
export async function loader({ request, context }: { request: Request; context: { cloudflare: { env: Env } } }) {
	const env = context.cloudflare.env as unknown as { CONTENT_API_URL?: string };
	const store = getContentStore(env.CONTENT_API_URL, request.url);
	const [site, work] = await Promise.all([store.getSiteConfig(), getWorkCollection(store)]);
	return {
		site: workNavigation(site, work.entries),
		year: new Date().getUTCFullYear(),
		closingCta,
		footerContent,
	};
}
export const shouldRevalidate = () => true;
export default function MainLayout() {
	const { site, year, closingCta: cta, footerContent: footer } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const location = useLocation();

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
			<main id="main-content" tabIndex={-1} aria-busy={navigation.state !== "idle"}><div key={location.pathname} className="route-transition">
				<Outlet />
			</div>
			</main>
			<ClosingCta key={location.pathname} config={cta} />
			<SiteFooter key={"footer-" + location.pathname} site={site} year={year} content={footer} />
		</>
	);
}
