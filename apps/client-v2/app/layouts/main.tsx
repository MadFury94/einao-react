import type { CSSProperties } from 'react';
import { AdminBar } from '~/components/admin/AdminBar';
import { AdminProvider } from '~/components/admin/AdminContext';
import type { Route } from './+types/main';
import { checkAdminSession, createCatalogApi } from '~/lib/catalog.server';
import { data, Outlet } from "react-router";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { NewsletterBanner } from "~/components/layout/NewsletterBanner";

export async function loader({ request, context }: Route.LoaderArgs) {
    const api = createCatalogApi(request, context.cloudflare.env);
    const [catalog, home, adminUser] = await Promise.all([api.getCatalog(), api.getPage('home'), checkAdminSession(request, context.cloudflare.env)]);
    const hostname = new URL(request.url).hostname;
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
    const configured = (context.cloudflare.env as { ADMIN_DASHBOARD_URL?: string }).ADMIN_DASHBOARD_URL;
    const dashboardUrl = local ? new URL(request.url).protocol + '//' + hostname + ':5931' : configured || 'https://einao-admin.einaodevv.workers.dev';
    return data({ catalog, home, adminUser, dashboardUrl }, { headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } });
}
export const headers: Route.HeadersFunction = ({ loaderHeaders }) => loaderHeaders;

export default function MainLayout({ loaderData }: Route.ComponentProps) {
    return (
        <AdminProvider isAdmin={loaderData.adminUser !== null} dashboardUrl={loaderData.dashboardUrl}>
          <div style={{ '--admin-bar-height': loaderData.adminUser ? '44px' : '0px' } as CSSProperties}>
            <AdminBar />
            <Header />
            <Outlet />
            <NewsletterBanner />
            <Footer catalog={loaderData.catalog} />
        </div>
        </AdminProvider>
    );
}
