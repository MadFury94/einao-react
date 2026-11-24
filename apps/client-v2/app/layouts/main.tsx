import type { Route } from './+types/main';
import { createCatalogApi } from '~/lib/catalog.server';
import { Outlet } from "react-router";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { NewsletterBanner } from "~/components/layout/NewsletterBanner";

export async function loader({ request, context }: Route.LoaderArgs) {
    return { catalog: await createCatalogApi(request, context.cloudflare.env).getCatalog() };
}
export default function MainLayout({ loaderData }: Route.ComponentProps) {
    return (
        <>
            <Header catalog={loaderData.catalog} />
            <Outlet />
            <NewsletterBanner />
            <Footer catalog={loaderData.catalog} />
        </>
    );
}
