import type { Route } from "./+types/solutions";
import { SolutionsOverview } from "~/components/solutions/Solutions";
import { seoMeta } from "~/lib/seo";
export function meta(_:Route.MetaArgs){return seoMeta({title:"Enterprise Solutions & Digital Systems | Einao Solutions",description:"Explore Einao's digital solutions and enterprise systems for payment processes, organisational workflows, and specific operational requirements.",path:"/solutions/"});}
export default function Solutions(){return <SolutionsOverview/>;}
