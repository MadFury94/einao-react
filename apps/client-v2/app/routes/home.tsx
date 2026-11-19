import type { Route } from "./+types/home";
import { HomeHero } from "~/components/home-hero/HomeHero";
import { HomeMission } from "~/components/home-mission/HomeMission";
import { HomeCards } from "~/components/home-cards/HomeCards";
import { HomeJourney } from "~/components/home-journey/HomeJourney";
import { HomeSolutions } from "~/components/home-solutions/HomeSolutions";
import { HomeStories } from "~/components/home-stories/HomeStories";
import { HomePlatform } from "~/components/home-platform/HomePlatform";
import { HomeNews } from "~/components/home-news/HomeNews";

export function meta(_: Route.MetaArgs) {
    return [
        { title: "Einao Solutions — Practical technology delivery" },
        { name: "description", content: "Technology consulting, process automation, enterprise solutions, and custom digital development for organisations." },
    ];
}

export default function Home() {
    return (
        <>
            <HomeHero />
            <HomeMission />
            <HomeCards />
            <HomeJourney />
            <HomeSolutions />
            <HomeStories />
            <HomePlatform />
            <HomeNews />
        </>
    );
}
