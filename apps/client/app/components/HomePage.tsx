import { ArrowIcon } from "./ArrowIcon";
import type { BlockConfig, Page, PageBlock } from "@einao/content";
import { Link } from "react-router";
import { ActionLink, AnimatedTitle, Reveal } from "./primitives";
import { HeroVideo } from "./HeroVideo";
import { OperationalSection } from "./OperationalSection";
import { ProjectShowcase } from "./ProjectShowcase";
import { ConnectedSystems } from "./ConnectedSystems";

const image = (name: string) => `/assets/images/${name}`;
function block(page: Page, type: PageBlock["block_type"], index = 0) {

	return page.blocks.filter((item) => item.block_type === type)[index];
}
function Copy({ config }: { config: BlockConfig }) {
	return <>{config.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</>;
}

export function HomePage({ page }: { page: Page }) {
	const hero = block(page, "hero")?.config;
	const reality = block(page, "feature")?.config;
	const process = block(page, "process")?.config;
	const services = block(page, "services")?.config;
	const proof = block(page, "proof")?.config;
	const solutions = block(page, "solutions")?.config;
	const industries = block(page, "industries")?.config;
	const insights = block(page, "insights")?.config;
	const serviceItems = services?.items ?? [];
	if (!hero) return null;

	return <div className="index3-home">
		<section className="index3-hero" data-home-section="hero">
			<div className="index3-hero-card"><HeroVideo poster={hero.image ?? image("placeholder-hero-poster.webp")} src={hero.video ?? ""} />
				<div className="container index3-hero-inner">
					<ul className="index3-hero-pills">{hero.items?.map((item, i) => <li key={item.title}><Link to={i === 0 ? "/capabilities/" : i === 1 ? "/solutions/" : "/work/"}>{item.title.replace(/^\d+\s*\/\s*/, "")}</Link></li>)}</ul>
					<AnimatedTitle text={hero.title} accent={hero.accent} />
					<div className="home-hero-copy"><Copy config={hero} /><div className="home-hero-actions">{hero.cta && <ActionLink link={hero.cta} />}{hero.secondaryCta && <ActionLink link={hero.secondaryCta} plain />}</div></div>
					<div className="index3-hero-info"><div className="index3-hero-orbit" aria-hidden="true"><span></span><i /><b>01</b><i /><b>02</b></div><div className="index3-hero-rating"><strong>Einao</strong><span>Technology shaped<br />around your organisation</span><em></em></div></div>
				</div>
			</div>
		</section>

		<OperationalSection config={reality} />

		<section className="section index3-process" id="index3-process" data-home-section="approach"><div className="container"><div className="index3-section-head"><div><p className="eyebrow">{process?.eyebrow ?? "Our approach"}</p><h2>{process?.title}</h2></div><div><Copy config={process ?? { title: "" }} /></div></div><div className="index3-process-track">{process?.items?.map((item, i) => <Reveal className="index3-process-step" key={item.title}><div className="index3-process-icon">{String(i + 1).padStart(2, "0")}</div><h3>{item.title}</h3><p>{item.body}</p></Reveal>)}</div>{process?.cta && <div className="home-section-action"><ActionLink link={process.cta} /></div>}</div></section>

		<div className="index3-marquee" aria-label="Einao principles"><div className="index3-marquee-track">{["Operational understanding", "Practical transformation", "Technical delivery", "Long-term partnership", "Operational understanding", "Practical transformation", "Technical delivery", "Long-term partnership"].map((item, i) => <span key={`${item}-${i}`}><b aria-hidden="true">✳</b>{item}</span>)}</div></div>

		<section className="section index3-services" data-home-section="capabilities"><div className="container"><div className="index3-section-head"><div><p className="eyebrow">{services?.eyebrow ?? "Our capabilities"}</p><h2>{services?.title}</h2></div></div><div className="home-capability-grid">{serviceItems.map((item, i) => <Reveal className="index3-service-card" key={item.title}><span className="index3-number">{String(i + 1).padStart(3, "0")}</span><h3>{item.title}</h3><p>{item.body}</p><div className="index3-card-footer"><Link to={item.link?.href ?? "/capabilities/"} className="home-capability-link">Explore {item.title} <span aria-hidden="true"><ArrowIcon /></span></Link></div></Reveal>)}</div></div></section>

		<ConnectedSystems />

		<ProjectShowcase proof={proof} />

		<section className="section index3-products" data-home-section="solutions"><div className="container"><div className="index3-section-head"><div><p className="eyebrow">{solutions?.eyebrow ?? "Our solutions"}</p><h2>{solutions?.title}</h2></div><div><Copy config={solutions ?? { title: "" }} /></div></div><div className="index3-product-grid">{solutions?.items?.map((item, i) => <Reveal className="index3-product-card" key={item.title}><span>{String(i + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p>{item.link && <Link to={item.link.href}>{item.link.label} <span aria-hidden="true"><ArrowIcon /></span></Link>}</Reveal>)}</div></div></section>

		<section className="section index3-industries" data-home-section="audiences"><div className="container"><p className="eyebrow">{industries?.eyebrow ?? "Who we work with"}</p><h2>{industries?.title}</h2><div className="index3-industry-list">{industries?.items?.map((item, i) => <Link key={item.title} to={item.link?.href ?? "/industries/"}><span>0{i + 1}</span><div>{item.title}<p className="home-industry-description">{item.body}</p></div><b aria-hidden="true"><ArrowIcon /></b></Link>)}</div></div></section>
		{insights && <section className="section index3-insights" data-home-section="insights"><div className="container"><p className="eyebrow">{insights.eyebrow ?? "Insights"}</p><h2>{insights.title}</h2><div className="home-insights-copy"><Copy config={insights} /></div>{insights.cta && <ActionLink link={insights.cta} />}</div></section>}
	</div>;
}

