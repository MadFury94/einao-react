import type { Route } from "./+types/contact";
import { ContactPage } from "~/components/contact/Contact";
import { seoMeta } from "~/lib/seo";

export function meta(_: Route.MetaArgs) {
  return seoMeta({
    title: "Contact Einao Solutions | Discuss Your Technology Requirements",
    description: "Talk to Einao about technology consulting, process automation, enterprise systems, and digital transformation requirements.",
    path: "/contact/",
  });
}

export default function ContactRoute() {
  return <ContactPage />;
}
