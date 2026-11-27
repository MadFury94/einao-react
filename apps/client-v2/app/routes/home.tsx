import { SectionShortcut } from '~/components/admin/SectionShortcut';
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
const { catalog, home } = useRouteLoaderData<typeof mainLoader>('layouts/main')!;
const journeyBlock = home.blocks.find(block => block.block_type === 'journey');
return <><SectionShortcut name="Hero" path="/page-blocks?page=home" hero><HomeHero/></SectionShortcut><HomeMission/><SectionShortcut name="Capabilities" path="/capabilities" action="Manage items"><HomeCards collection={catalog.capabilities}/></SectionShortcut><SectionShortcut name="Our Journey" action="Manage cards" path={journeyBlock ? '/page-blocks/' + journeyBlock.id + '?page=home' : '/page-blocks?page=home'}><HomeJourney/></SectionShortcut><SectionShortcut name="Solutions" path="/solutions" action="Manage items"><HomeSolutions catalog={catalog}/></SectionShortcut><SectionShortcut name="Work" path="/work" action="Manage items"><HomeStories collection={catalog.work}/></SectionShortcut><SectionShortcut name="Platform" path="/solutions" action="Manage items"><HomePlatform collection={catalog.solutions}/></SectionShortcut><HomeNews posts={loaderData.posts} unavailable={loaderData.unavailable}/></>;}
