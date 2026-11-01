import { ArrowIcon } from "./ArrowIcon";
import { Link } from "react-router";
import type { BlockConfig } from "@einao/content";
import { ActionLink } from "./primitives";

export function ProjectShowcase({ proof }: { proof?: BlockConfig }) {
	const projects = proof?.items ?? [];
	return <section className={`section project-showcase${projects.length <= 1 ? " project-showcase-single" : ""}`} aria-labelledby="project-showcase-title" data-home-section="institutional-experience">
		<div className="container project-showcase-layout">
			<div className="project-showcase-intro">
				<p className="project-showcase-eyebrow"><span aria-hidden="true"></span> Institutional experience</p>
				<h2 id="project-showcase-title">{proof?.title}</h2>
				{proof?.cta && <ActionLink link={proof.cta} />}
			</div>
			<div className="project-showcase-list">
				{projects.map((item, i) => {
					const href = item.link?.href ?? proof?.cta?.href ?? "/work/";
					return <article className="project-showcase-card" key={`${item.title}-${i}`}>
						<Link className="project-showcase-image" to={href} tabIndex={-1} aria-hidden="true"><img src={`/assets/images/placeholder-card-${(i % 4) + 1}.webp`} alt="" width="900" height="620" loading="lazy" /></Link>
						<div className="project-showcase-content"><span className="project-showcase-number">{item.label}</span><h3><Link to={href}>{item.title}</Link></h3><p>{item.body}</p><Link className="project-showcase-arrow" to={href} aria-label={`View ${item.title} case study`}><span aria-hidden="true"><ArrowIcon /></span></Link></div>
					</article>;
				})}
				<div className="project-showcase-context">{proof?.body?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
			</div>
		</div>
	</section>;
}

