import type { Route } from "./+types/not-found";
import { NotFoundPage } from "~/components/not-found/NotFound";
import { seoMeta } from "~/lib/seo";

export function meta(_: Route.MetaArgs) {
  return [{ ...seoMeta({ title: "Page Not Found | Einao Solutions", description: "The page you requested could not be found on Einao Solutions.", path: "/404/" })[0] }, { name: "robots", content: "noindex, follow" }];
}

export default function NotFoundRoute() {
  return <NotFoundPage />;
}
