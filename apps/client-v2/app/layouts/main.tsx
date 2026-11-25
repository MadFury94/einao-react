import type { Route } from './+types/main';
import { createCatalogApi } from '~/lib/catalog.server';
import { Outlet } from "react-router";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { NewsletterBanner } from "~/components/layout/NewsletterBanner";

export async function loader({ request, context }: Route.LoaderArgs) {
    const api = createCatalogApi(request, context.cloudflare.env);
    const [catalog, home] = await Promise.all([api.getCatalog(), api.getPage('home')]);
    return { catalog, home };
}
export default function MainLayout({ loaderData }: Route.ComponentProps) {
    return (
        <>
            <Header />
            <Outlet />
            <NewsletterBanner />
            <Footer catalog={loaderData.catalog} />
        </>
    );
}
