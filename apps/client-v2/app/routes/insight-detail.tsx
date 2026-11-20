import type { Route } from "./+types/insight-detail";
import { InsightArticle, insights } from "~/components/company-pages/CompanyPages";
import { seoMeta } from "~/lib/seo";
export function meta({params}:Route.MetaArgs){const article=insights.find(item=>item.slug===params.slug)??insights[0];return seoMeta({title:`${article.title} | Einao Insights`,description:article.body,path:`/insights/${article.slug}/`,image:article.image,type:"article"});}
export default function InsightDetail({params}:Route.ComponentProps){return <InsightArticle slug={params.slug??insights[0].slug}/>;}
