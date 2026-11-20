import type { Route } from "./+types/insights";
import { InsightsPage } from "~/components/company-pages/CompanyPages";
import { seoMeta } from "~/lib/seo";
export function meta(_:Route.MetaArgs){return seoMeta({title:"Insights on Technology, Automation & Operations | Einao Solutions",description:"Practical perspectives on technology strategy, business process automation, enterprise systems, and digital transformation from Einao Solutions.",path:"/insights/"});}
export default function Insights(){return <InsightsPage/>;}
