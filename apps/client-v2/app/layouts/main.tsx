import { Outlet } from "react-router";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { NewsletterBanner } from "~/components/layout/NewsletterBanner";

export default function MainLayout() {
    return (
        <>
            <Header />
            <Outlet />
            <NewsletterBanner />
            <Footer />
        </>
    );
}
