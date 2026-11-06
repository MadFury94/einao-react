import { HomeSolutions, HomeAudiences } from "./home-offerings/HomeOfferings";
import type { Page, PageBlock } from "@einao/content";


import { Marquee } from "./Marquee";
import { HomeHero } from "./home-hero/HomeHero";
import { HomeAbout } from "./home-about/HomeAbout";
import { HomeServices } from "./home-services/HomeServices";
import { HomeWhyChooseUs } from "./home-expertise/HomeWhyChooseUs";
import { HomeWorkingProcess } from "./home-expertise/HomeWorkingProcess";
import { HomeDigitalSolutions } from "./home-digital-solutions/HomeDigitalSolutions";
import { HomeTestimonials } from "./home-testimonials/HomeTestimonials";
import { HomeTeam } from "./home-team/HomeTeam";
import { ProjectShowcase } from "./ProjectShowcase";
import { ConnectedSystems } from "./ConnectedSystems";
import { HomeNews } from "./home-news/HomeNews";
import type { LeadershipProfile } from "@einao/content";
import type { Insight } from "~/routes/home";

function block(page: Page, type: PageBlock["block_type"], index = 0) {

	return page.blocks.filter((item) => item.block_type === type)[index];
}
export function HomePage({ page, leader, latestInsights = [] }: { page: Page; leader: LeadershipProfile; latestInsights?: Insight[] }) {
	const hero = block(page, "hero")?.config;

	const process = block(page, "process")?.config;
	const services = block(page, "services")?.config;
	const proof = block(page, "proof")?.config;
	const solutions = block(page, "solutions")?.config;
	const industries = block(page, "industries")?.config;
	

	if (!hero) return null;

	return <div className="index3-home">
		<HomeHero config={hero} />

		<HomeAbout />

		<HomeServices config={services} />

		<HomeWhyChooseUs />

		<Marquee label="Einao principles" words={["Operational understanding", "Practical transformation", "Technical delivery", "Long-term partnership"]} />

		<HomeWorkingProcess config={process} />

		<ProjectShowcase proof={proof} />

		<HomeDigitalSolutions />

		<ConnectedSystems />

		<HomeTestimonials />

		<HomeTeam leader={leader} />

		<HomeSolutions config={solutions} />

		<HomeAudiences config={industries} />

		<HomeNews posts={latestInsights} />
	</div>;
}

