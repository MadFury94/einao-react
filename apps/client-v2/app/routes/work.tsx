import type { Route } from "./+types/work";
import { WorkPage } from "~/components/company-pages/CompanyPages";
import { seoMeta } from "~/lib/seo";
export function meta(_:Route.MetaArgs){return seoMeta({title:"Digital Transformation Projects & Case Studies | Einao Solutions",description:"Explore selected work involving institutional digital platforms, technology consulting, process improvement, and enterprise solutions delivered or supported by Einao.",path:"/work/"});}
export default function Work(){return <WorkPage/>;}
