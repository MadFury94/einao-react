import type { Route } from "./+types/industry-detail";
import { IndustryDetail, industryDetails } from "~/components/industries/Industries";
import { seoMeta } from "~/lib/seo";
export function meta({params}:Route.MetaArgs){const key=params.slug??"government";const item=industryDetails[key]??industryDetails.government;return seoMeta({title:`${item.label.split(" / ").at(-1)} | Technology Solutions | Einao`,description:item.intro,path:`/industries/${key}/`});}
export default function IndustryDetailRoute({params}:Route.ComponentProps){return <IndustryDetail slug={params.slug??"government"}/>;}
