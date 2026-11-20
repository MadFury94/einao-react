import type { Route } from "./+types/industries";
import { IndustriesOverview } from "~/components/industries/Industries";
import { seoMeta } from "~/lib/seo";
export function meta(_:Route.MetaArgs){return seoMeta({title:"Technology Solutions for Government, Business & Institutions | Einao",description:"Explore how Einao's technology consulting, automation, and digital solution capabilities can support government, business, regulatory, and service organisations.",path:"/industries/"});}
export default function Industries(){return <IndustriesOverview/>;}
