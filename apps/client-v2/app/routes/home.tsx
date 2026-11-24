import { useRouteLoaderData } from 'react-router';
import type { loader as mainLoader } from '../layouts/main';
import { blogConnection, getInsights, type Insight } from "~/lib/insights.server";
import type { Route } from "./+types/home";
import { HomeHero } from "~/components/home-hero/HomeHero";
import { HomeMission } from "~/components/home-mission/HomeMission";
import { HomeCards } from "~/components/home-cards/HomeCards";
import { HomeJourney } from "~/components/home-journey/HomeJourney";
import { HomeSolutions } from "~/components/home-solutions/HomeSolutions";
import { HomeStories } from "~/components/home-stories/HomeStories";
import { HomePlatform } from "~/components/home-platform/HomePlatform";
import { HomeNews } from "~/components/home-news/HomeNews";
import { seoMeta } from "~/lib/seo";
export function meta(_:Route.MetaArgs){return seoMeta({title:"Technology Consulting & Business Process Automation | Einao Solutions",description:"Einao helps organisations improve operations through technology consulting, process automation, enterprise solutions, and custom digital systems.",path:"/"});}
export async function loader({ request, context }: Route.LoaderArgs) {
  const { base, apiFetch } = blogConnection(request, context.cloudflare.env);
  try { return { posts: (await getInsights(base, 1, 5, '', apiFetch)).items, unavailable: false }; }
  catch { return { posts: [] as Insight[], unavailable: true }; }
}
export default function Home({ loaderData }: Route.ComponentProps){
const { catalog } = useRouteLoaderData<typeof mainLoader>('layouts/main')!;
return <><HomeHero/><HomeMission/><HomeCards collection={catalog.capabilities}/><HomeJourney/><HomeSolutions catalog={catalog}/><HomeStories collection={catalog.work}/><HomePlatform collection={catalog.solutions}/><HomeNews posts={loaderData.posts} unavailable={loaderData.unavailable}/></>;}
