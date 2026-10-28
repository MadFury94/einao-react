import type { BlockConfig, PageBlock } from "@einao/content";
import { Link } from "react-router";
import { ActionLink, AnimatedTitle, Reveal } from "../primitives";
import { HeroVideo } from "../HeroVideo";

function Copy({ config }: { config: BlockConfig }) {
	return (
		<>
			{config.body?.map((p) => (
				<p key={p}>{p}</p>
			))}
		</>
	);
}
function Heading({ config }: { config: BlockConfig }) {
	return (
		<>
			{config.eyebrow && <p className="eyebrow">{config.eyebrow}</p>}
			<h2>{config.title}</h2>
		</>
	);
}
export function Hero({
	config,
	home = false,
}: {
	config: BlockConfig;
	home?: boolean;
}) {
	if (!home) {
		return (
			<section className="hero page-hero">
				{config.video && config.image && (
					<HeroVideo poster={config.image} src={config.video} />
				)}
				<div className="container hero-content">
					<p className="eyebrow">{config.eyebrow}</p>
					<AnimatedTitle text={config.title} accent={config.accent} />
					<div className="hero-lower">
						<div className="hero-copy">
							<Copy config={config} />
							<div className="actions">
								{config.cta && <ActionLink link={config.cta} />}
								{config.secondaryCta && (
									<ActionLink link={config.secondaryCta} plain />
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		);
	}
	return (
		<section className="hero home-hero">
			<div className="hero-card">
				{config.video && config.image && (
					<HeroVideo poster={config.image} src={config.video} />
				)}
				<div className="container hero-content">
					{/* Top: process pills */}
					<ul className="hero-list">
						{config.items?.map((item) => (
							<li key={item.title}>
								<span className="hero-pill">{item.title}</span>
							</li>
						))}
					</ul>
					{/* Middle: large title with serif-italic accent word */}
					<AnimatedTitle text={config.title} accent={config.accent} />
					{/* Bottom: eyebrow + copy on the left, actions on the right */}
					<div className="hero-info-items">
						<div className="hero-info-copy">
							{config.eyebrow && <p className="eyebrow">{config.eyebrow}</p>}
							<Copy config={config} />
						</div>
						<div className="actions">
							{config.cta && <ActionLink link={config.cta} />}
							{config.secondaryCta && (
								<ActionLink link={config.secondaryCta} plain />
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
function Section({ block }: { block: PageBlock }) {
	const c = block.config;
	if (block.block_type === "hero")
		return <Hero config={c} home={block.page_slug === "home"} />;
	if (block.block_type === "marquee")
		return (
			<section className="einao-marquee" aria-label={c.title}>
				<div className="einao-marquee-track">
					{[...(c.items ?? []), ...(c.items ?? [])].map((item, index) => (
						<span key={`${item.title}-${index}`}><b aria-hidden="true">✳</b>{item.title}</span>
					))}
				</div>
			</section>
		);
	if (block.block_type === "process")
		return (
			<section className="section process-section"><div className="container">
				<div className="section-title-area"><Heading config={c} /><div className="section-intro"><Copy config={c} /></div></div>
				<div className="process-track">{c.items?.map((item, index) => <Reveal key={item.title} className={`process-step ${index === 0 ? "is-active" : ""}`}><div className="process-icon">{String(index + 1).padStart(2, "0")}</div><h3>{item.title}</h3><p>{item.body}</p></Reveal>)}</div>
			</div></section>
		);
	if (block.block_type === "projects")
		return (
			<section className="section project-list-section"><div className="container"><Reveal><Heading config={c} /><div className="section-intro"><Copy config={c} /></div></Reveal>
				<div className="project-list">{c.items?.map((item, index) => <Reveal key={item.title} className="project-row"><div className="project-thumb"><img src={item.image ?? "/assets/images/placeholder-card-1.webp"} alt="" width="900" height="620" loading="lazy" /></div><div className="project-meta"><span>{item.label ?? `[0${index + 1}]`}</span><h3>{item.title}</h3><p>{item.body}</p>{item.link && <ActionLink link={item.link} plain />}</div></Reveal>)}</div>
			</div></section>
		);
	if (block.block_type === "feature")
		return (
			<section className="section feature">
				<Reveal className="container two-col">
					<div className="feature-media">
						<img
							src={c.image}
							alt={c.imageAlt ?? ""}
							width="1200"
							height="900"
							loading="lazy"
						/>
					</div>
					<div>
						<Heading config={c} />
						<Copy config={c} />
						{c.cta && <ActionLink link={c.cta} />}
					</div>
				</Reveal>
			</section>
		);
	if (block.block_type === "proof")
		return (
			<section className="section proof">
				<Reveal className="container two-col">
					<div>
						<Heading config={c} />
						<Copy config={c} />
						{c.cta && <ActionLink link={c.cta} />}
					</div>
					<div className="proof-panel">
						<p className="small-label">{c.items?.[0]?.label}</p>
						<p className="proof-name">{c.items?.[0]?.title}</p>
						<p className="proof-description">{c.items?.[0]?.body}</p>
						<div className="proof-tags">
							<span>Trademarks</span>
							<span>Patents</span>
							<span>Industrial designs</span>
						</div>
						<p className="proof-caption">
							Supporting the processes behind intellectual property services.
						</p>
					</div>
				</Reveal>
			</section>
		);
	if (block.block_type === "insights")
		return (
			<section className="section insights">
				<Reveal className="container two-col">
					<div>
						<Heading config={c} />
					</div>
					<div>
						<Copy config={c} />
						{c.cta && <ActionLink link={c.cta} />}
					</div>
				</Reveal>
			</section>
		);
	return (
		<section
			id={block.block_type === "approach" ? "approach" : undefined}
			className={`section ${block.block_type}`}
		>
			<div className="container">
				<Reveal>
					<Heading config={c} />
					{block.block_type !== "reality" && (
						<div className="section-intro">
							<Copy config={c} />
						</div>
					)}
				</Reveal>
				{block.block_type === "reality" ? (
					<div className="two-col">
						<div className="issue-list">
							{c.items?.map((item, i) => (
								<div className="issue" key={item.title}>
									<span>{String(i + 1).padStart(2, "0")}</span>
									<h3>{item.title}</h3>
								</div>
							))}
						</div>
						<div className="reality-copy">
							<Copy config={c} />
							{c.cta && <ActionLink link={c.cta} plain />}
						</div>
					</div>
				) : (
					<div className={`items items-${block.block_type}`}>
						{c.items?.map((item, i) => (
							<Reveal key={item.title} className="item">
								{block.block_type === "services" && (
									<span className="item-number">
										{String(i + 1).padStart(2, "0")}
									</span>
								)}
								{block.block_type === "approach" && (
									<p className="step-number">
										{String(i + 1).padStart(2, "0")}
									</p>
								)}
								{block.block_type === "cards" && item.image && (
									<img
										className="card-image"
										src={item.image}
										alt=""
										width="640"
										height="800"
										loading="lazy"
									/>
								)}
								<div className="item-heading">
									{item.label && <p className="small-label">{item.label}</p>}
									<h3>{item.title}</h3>
								</div>
								<div className="item-copy">
									<p>{item.body}</p>
									{item.link && <ActionLink link={item.link} plain />}
								</div>
								{block.block_type === "cards" && item.link && (
									<Link
										className="card-overlay"
										to={item.link.href}
										aria-label={item.link.label}
									>
										<span aria-hidden="true">↗</span>
									</Link>
								)}
							</Reveal>
						))}
					</div>
				)}
				{block.block_type !== "reality" && c.cta && (
					<div className="section-action">
						<ActionLink link={c.cta} />
					</div>
				)}
			</div>
		</section>
	);
}
export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
	return (
		<>
			{blocks
				.filter((b) => b.visible)
				.map((block) => (
					<Section key={block.id} block={block} />
				))}
		</>
	);
}
