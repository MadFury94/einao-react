import { ArrowIcon } from "../ArrowIcon";
import type { BlockConfig, PageBlock } from "@einao/content";
import { Link } from "react-router";
import { ActionLink, AnimatedTitle, Reveal, Typewriter } from "../primitives";
import { HeroVideo } from "../HeroVideo";
import { ProcessCard } from "../ProcessCard";
import { EditorialImage } from "../EditorialImage";
import { FounderProfile } from "../FounderProfile";
import { leadershipProfile } from "@einao/content";
import { GovPage } from "../GovPage";

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

/**
 * PageHero — shared dark-ink hero used across all interior pages.
 *
 * Mirrors the Work page hero layout:
 *  • Full min-height viewport, dark ink background, radial lime glow
 *  • Eyebrow top-left (small, lime)
 *  • Large AnimatedTitle fills the available vertical space (keeps char animation)
 *  • Bottom strip: metadata lines left + optional large italic page label right
 */
function PageHero({
	eyebrow,
	title,
	accent,
	pageLabel,
	metaLines,
	children,
}: {
	eyebrow: string;
	title: string;
	accent?: string;
	/** Large italic serif label shown bottom-right (e.g. "Capabilities") */
	pageLabel?: string;
	/** 2–3 short lines shown bottom-left */
	metaLines?: string[];
	/** Optional extra content (e.g. a CTA) */
	children?: React.ReactNode;
}) {
	return (
		<section className="page-hero-shared">
			<div className="container page-hero-shared-inner">
				{/* Top: eyebrow */}
				<p className="eyebrow page-hero-shared-eyebrow">{eyebrow}</p>

				{/* Middle: giant animated title — takes up all available space */}
				<div className="page-hero-shared-title">
					<AnimatedTitle text={title} accent={accent} />
				</div>

				{/* Bottom strip: meta left + page label right */}
				<div className="page-hero-shared-bottom">
					<div className="page-hero-shared-meta">
						{metaLines?.map((line) => <span key={line}>{line}</span>)}
					</div>
					{pageLabel && (
						<span
							className="page-hero-shared-label"
							aria-hidden="true"
							style={{ fontSize: pageLabel.length > 12 ? `clamp(3rem, ${Math.max(5, 11 - (pageLabel.length - 12) * 0.4)}vw, ${Math.max(60, 160 - (pageLabel.length - 12) * 6)}px)` : undefined }}
						>
							{pageLabel}
						</span>
					)}
				</div>

				{children}
			</div>
		</section>
	);
}

export function InsightCard({ item, index, author = "Einao" }: { item: NonNullable<BlockConfig["items"]>[number]; index: number; author?: string }) {
	return (
		<Reveal className="insight-news-card" >
			<article>
				<div className="insight-news-thumb">
					{item.image ? (
						<>
							<img className="insight-news-image insight-news-image-reveal" src={item.image} alt="" width="900" height="620" loading="lazy" />
							<img className="insight-news-image" src={item.image} alt="" width="900" height="620" loading="lazy" />
						</>
					) : <div className="insight-news-placeholder" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>}
				</div>
				<div className="insight-news-content">
					<div className="insight-news-meta">
						{item.label && <span>{item.label}</span>}
						<span>By {author}</span>
					</div>
					<h3>{item.link ? <Link to={item.link.href}>{item.title}</Link> : item.title}</h3>
					<p>{item.body}</p>
					{item.link && (
						<Link className="insight-news-link" to={item.link.href}>
							<span className="insight-news-link-text">
								<span className="insight-news-link-default">Read more <span aria-hidden="true"><ArrowIcon /></span></span>
								<span className="insight-news-link-hover">Read more <span aria-hidden="true"><ArrowIcon /></span></span>
							</span>
						</Link>
					)}
				</div>
			</article>
		</Reveal>
	);
}

function InsightsPage({ blocks }: { blocks: PageBlock[] }) {
	const hero = blocks.find((block) => block.block_type === "hero")?.config;
	const grid = blocks.find((block) => block.block_type === "insights")?.config;
	return (
		<div className="insights-page">
			<PageHero
				eyebrow="01 / Insights"
				title="Latest insights and practical perspectives"
				pageLabel="Insights"
				metaLines={["Technology, operations, and change", "Einao Solutions"]}
			/>
			<section className="section insights-news-section">
				<div className="container">
					<Reveal className="insights-news-heading">
						<div>
							<p className="eyebrow">02 / The thinking behind the work</p>
							<h2>{grid?.title ?? "Practical perspectives on better operations."}</h2>
						</div>
						{grid?.body?.[0] && <p>{grid.body[0]}</p>}
					</Reveal>
					<div className="insight-news-grid">
						{grid?.items?.map((item, index) => <InsightCard key={item.title} item={item} index={index} />)}
					</div>
				</div>
			</section>
		</div>
	);
}

function AboutPage({ blocks }: { blocks: PageBlock[] }) {
	const hero = blocks.find((block) => block.block_type === "hero")?.config;
	const editorials = blocks.filter((block) => block.block_type === "editorial").map((block) => block.config);
	const approach = blocks.find((block) => block.block_type === "approach")?.config;

	// Background images for each process step card
	const processImages = [
		"/assets/images/Faint process sketch in deep green.png",
		"/assets/images/Calm Green Network in Negative Space (1).png",
		"/assets/images/Quiet deep green blueprint grid.png",
		"/assets/images/Tangled thread becoming simplicity.png",
	];
	// The Team editor and this profile share the About page leadership content.
	const leader = leadershipProfile(hero?.leadership);

	return (
		<div className="about-page">
			<PageHero
				eyebrow="01 / About Einao"
				title={hero?.title ?? "Technology shaped around the organisation"}
				accent={hero?.accent}
				pageLabel="About"
				metaLines={["Established 2011", "Technology, operations, and delivery"]}
			/>

			<Reveal className="about-page-image-wrap">
				<div className="about-page-image">
					<img src="/assets/images/Collaborative technology team in Abuja office.png" alt="Einao technology team collaborating in an Abuja office" width="1600" height="900" />
					<div className="about-page-image-shade" />
					<div className="about-page-stat"><span>Operational impact</span><strong>1 system at a time</strong></div>
				</div>
			</Reveal>

			{/*  02 Our Perspective 
			    Grid: image column (5/12) on left, text column (7/12) on right.
			    Image is sticky so it stays in view while the text scrolls.
			    DOM order: text first for screen readers; CSS grid moves image left.
			 */}
			<section className="section about-page-intro">
				<div className="container">
					<div className="about-page-intro-grid">
						{/* Image column - visually first via grid-column, DOM second */}
						<div className="about-page-intro-image-col">
							<div className="about-page-intro-sticky">
								<EditorialImage
									src="/assets/images/perspective.png"
									alt="Einao team working through an operational requirement"
									ratio="4/5"
								/>
							</div>
						</div>

						{/* Text column */}
						<div className="about-page-intro-text-col">
							<div className="about-page-mark"><span>02</span><b>OUR PERSPECTIVE</b></div>
							<h2>Technology should work around the organisation.</h2>
							<div className="about-page-copy-columns">
								{editorials[0]?.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/*  03 How we work - process cards 
			    4 cards in a 22 grid on tablet, 4-column row on desktop.
			    Each card uses ProcessCard for consistent hover behaviour.
			 */}
			<section className="section about-page-process">
				<div className="container">
					<Reveal className="about-page-section-heading">
						<div><p className="eyebrow">03 / How we work</p><h2>We understand first, then build what the organisation needs.</h2></div>
						<p>From the first conversation to implementation, our work follows the operating reality. Each step makes the next decision clearer.</p>
					</Reveal>
					<div className="about-page-process-grid">
						{approach?.items?.map((item, index) => (
							<Reveal key={item.title}>
								<ProcessCard
									number={String(index + 1).padStart(2, "0")}
									title={item.title}
									description={item.body}
									image={processImages[index] ?? processImages[0]}
								/>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			<section className="about-page-proof">
				<div className="container">
					{/* ── Top: eyebrow + full-width heading ── */}
					<Reveal className="about-page-proof-heading">
						<p className="eyebrow">04 / Why Einao</p>
						<h2>
							<em>Practical technology</em> built around how your organisation actually operates.
						</h2>
					</Reveal>

					{/* ── Bottom: image left | copy + counters right ── */}
					<div className="about-page-proof-grid">

						{/* Left: main image */}
						<Reveal className="about-page-proof-image">
							<img
								src="/assets/about-reference/choose-us.jpg"
								alt="Einao team working with an institutional client"
								width="540"
								height="620"
							/>
						</Reveal>

						{/* Right: copy, CTA, counter tiles, secondary image */}
						<Reveal className="about-page-proof-copy">
							<p>{editorials[1]?.body?.[0] ?? "We work with organisations to understand how operations actually run before deciding what technology to use — then we build and support the systems that make those operations work reliably."}</p>

							<ActionLink link={{ label: "Start a conversation", href: "/contact/" }} />

							<div className="about-page-counters">
								<div className="about-page-counter-box">
									<span>Founded</span>
									<strong>2011</strong>
									<p>Built around practical technology delivery.</p>
								</div>
								<div className="about-page-counter-box">
									<span>Since</span>
									<strong>2013</strong>
									<p>Supporting institutional digital services.</p>
								</div>
								<div className="about-page-counter-small-img">
									<img
										src="/assets/about-reference/choose-us-small.jpg"
										alt=""
										width="260"
										height="200"
									/>
								</div>
							</div>
						</Reveal>

					</div>
				</div>
			</section>

			<section className="section about-page-history">
				<div className="container">
					<Reveal className="about-page-history-heading"><p className="eyebrow">05 / Our history</p><h2>Built around practical technology delivery.</h2></Reveal>
					<div className="about-page-history-summary">
						<div className="about-page-history-copy">{editorials[1]?.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
						<div className="about-page-history-founded"><span>Founded</span><strong>2011</strong><p>Practical technology delivery.</p></div>
					</div>
					<FounderProfile image={leader.image} alt={leader.imageAlt} role={leader.role} name={leader.name} credentials={leader.credentials} bio={leader.bio} />
				</div>
			</section>

			{editorials[2] && (
				<section className="section about-page-purpose">
					<div className="container two-col">
						{/* Left column: section label + large heading, kept as-is */}
						<div>
							<p className="eyebrow">06 / Our direction</p>
							<h2>{editorials[2].title}</h2>
						</div>

						{/* Right column: Mission and Vision as a definition list.
					    dl/dt/dd gives screen readers "term  definition" semantics
					    so the label is always read before the body text. */}
						<dl className="about-page-purpose-copy">
							{editorials[2].body?.map((paragraph, index) => (
								<div key={paragraph} className="about-page-purpose-item">
									{/* dt = the term / label */}
									<dt className="about-page-purpose-label">
										{index === 0 ? "Mission" : "Vision"}
									</dt>
									{/* dd = the definition / body */}
									<dd className="about-page-purpose-body">{paragraph}</dd>
								</div>
							))}
						</dl>
					</div>
				</section>
			)}

			<div className="about-page-marquee" aria-label="Einao values"><div><span>Understand</span><b>✦</b><span>Improve</span><b>✦</b><span>Connect</span><b>✦</b><span>Deliver</span><b>✦</b><span>Understand</span><b>✦</b><span>Improve</span><b>✦</b><span>Connect</span><b>✦</b><span>Deliver</span><b>✦</b></div></div>
		</div>
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
				{config.image && !config.video && <img className="page-content-image" src={config.image} alt={config.imageAlt ?? ""} width="1600" height="900" />}
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
				{config.image && !config.video && <img className="page-content-image" src={config.image} alt={config.imageAlt ?? ""} width="1600" height="900" />}
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
						<span key={`${item.title}-${index}`}><b aria-hidden="true">✦</b>{item.title}</span>
					))}
				</div>
			</section>
		);
	if (block.block_type === "process")
		return (
			<section className="section process-section"><div className="container">
				<div className="section-title-area">{c.image && <img className="page-content-image" src={c.image} alt={c.imageAlt ?? ""} width="1200" height="800" loading="lazy" />}
					<Heading config={c} /><div className="section-intro"><Copy config={c} /></div></div>
				<div className="process-track">{c.items?.map((item, index) => <Reveal key={item.title} className={`process-step ${index === 0 ? "is-active" : ""}`}><div className="process-icon">{String(index + 1).padStart(2, "0")}</div><h3>{item.title}</h3><p>{item.body}</p></Reveal>)}</div>
			</div></section>
		);
	if (block.block_type === "projects")
		return (
			<section className="section project-list-section"><div className="container"><Reveal>{c.image && <img className="page-content-image" src={c.image} alt={c.imageAlt ?? ""} width="1200" height="800" loading="lazy" />}
				<Heading config={c} /><div className="section-intro"><Copy config={c} /></div></Reveal>
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
						{c.image && <img className="page-content-image" src={c.image} alt={c.imageAlt ?? ""} width="1200" height="800" loading="lazy" />}
						<Heading config={c} />
						<Copy config={c} />
						{c.cta && <ActionLink link={c.cta} />}
					</div>
					<div className="proof-panels">
						{c.items?.map((item, index) => <div className="proof-panel" key={`${item.title}-${index}`}>
							{item.image && <img className="card-image" src={item.image} alt="" width="640" height="420" loading="lazy" />}
							<p className="small-label">{item.label}</p>
							<p className="proof-name">{item.title}</p>
							<p className="proof-description">{item.body}</p>
							{item.link && <ActionLink link={item.link} plain />}
						</div>)}
					</div>
				</Reveal>
			</section>
		);
	if (block.block_type === "insights")
		return (
			<section className="section insights">
				<Reveal className="container two-col">
					<div>
						{c.image && <img className="page-content-image" src={c.image} alt={c.imageAlt ?? ""} width="1200" height="800" loading="lazy" />}
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
					{c.image && <img className="page-content-image" src={c.image} alt={c.imageAlt ?? ""} width="1200" height="800" loading="lazy" />}
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
								{item.image && (
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
										<span aria-hidden="true"><ArrowIcon /></span>
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

function CapabilitiesPage({ blocks }: { blocks: PageBlock[] }) {
	const hero = blocks.find((block) => block.block_type === "hero")?.config;
	const services = blocks.find((block) => block.block_type === "services")?.config;
	const items = services?.items ?? [];
	const fallbackImages = [
		"/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
		"/assets/images/Hands mapping a streamlined workflow.png",
		"/assets/images/Graphite monitor with enterprise dashboard.png",
	];
	return (
		<div className="capabilities-reference-page">
			<PageHero
				eyebrow="01 / Our capabilities"
				title={hero?.title ?? "Our capabilities"}
				accent={hero?.accent}
				pageLabel="Capabilities"
				metaLines={["Technology, operations, and delivery", hero?.body?.[0] ?? ""].filter(Boolean)}
			/>
			<section className="capabilities-reference-services">
				<div className="container"><div className="capabilities-reference-section-heading"><p className="eyebrow">02 / Our capabilities</p><h2><Typewriter phrases={[services?.title ?? "From understanding to implementation.", "The right technology starts with the right understanding.", "Define. Improve. Connect. Deliver."]} /></h2></div><div className="capabilities-reference-panels">{items.map((item, index) => { const image = item.image || fallbackImages[index % fallbackImages.length]; return <Reveal key={item.title} className="capabilities-reference-panel"><div className="capabilities-reference-content"><p className="capabilities-reference-number">{String(index + 1).padStart(3, "0")} / capability</p><h3>{item.link ? <Link to={item.link.href}>{item.title}</Link> : item.title}</h3><div className="capabilities-reference-list"><span>+ Understand</span><span>+ Design</span><span>+ Deliver</span></div><p className="capabilities-reference-description">{item.body}</p><ul><li><Link to={item.link?.href ?? "/contact/"}>Explore</Link></li><li><Link to="/contact/">Discuss a requirement</Link></li></ul></div><div className="capabilities-reference-thumb"><img src={image} alt="" width="900" height="1100" /><img src={image} alt="" width="900" height="1100" /></div></Reveal> })}</div></div>
			</section>
		</div>
	);
}

function CapabilityDetailPage({ blocks }: { blocks: PageBlock[] }) {
	const pageSlug = blocks[0]?.page_slug ?? "";
	const hero = blocks.find((block) => block.block_type === "hero")?.config;
	const editorialBlocks = blocks.filter((block) => block.block_type === "editorial");
	const faqBlock = editorialBlocks.find((block) => /question/i.test(block.config.title));
	const contentEditorials = editorialBlocks.filter((block) => block !== faqBlock);
	const approach = blocks.find((block) => block.block_type === "approach")?.config;
	const items = contentEditorials[0]?.config.items ?? [];

	const visualImages = pageSlug.includes("automation")
		? ["/assets/images/Einao staff working on automation with client.jpg", "/assets/images/Einao staff working on automation.jpg"]
		: pageSlug.includes("enterprise")
			? ["/assets/images/Graphite monitor with enterprise dashboard.png", "/assets/images/Bridging paper records and digital systems.png"]
			: ["/assets/images/Nigerian IT Consultants Reviewing a Laptop.png", "/assets/images/Hands sketching a business workflow.png"];

	// Banner image: first visual image used as full-width banner
	const bannerImage = visualImages[0];

	return (
		<div className="capability-detail-page">

			{/* ── 01 Hero — Work-breadcrumb style with AnimatedTitle + CTA ── */}
			<PageHero
				eyebrow={hero?.eyebrow ? `Capability / ${hero.eyebrow}` : "01 / Capability"}
				title={hero?.title ?? "Capability"}
				accent={hero?.accent}
				pageLabel={hero?.eyebrow ?? "Capability"}
				metaLines={["Technology, operations, and delivery"]}
			>
				{hero?.cta && (
					<div className="page-hero-shared-cta">
						<ActionLink link={hero.cta} />
					</div>
				)}
			</PageHero>

			{/* ── 02 Intro — two-column: h2 + body left, checklist right ── */}
			<section className="cap-detail-intro">
				<div className="container cap-detail-intro-grid">
					<div className="cap-detail-intro-left">
						<h2>{contentEditorials[0]?.config.title ?? hero?.title}</h2>
						<p>{hero?.body?.[0]}</p>
					</div>
					<ul className="cap-detail-checklist">
						{items.slice(0, 4).map((item) => (
							<li key={item.title}>
								<span aria-hidden="true">✓</span>
								{item.title}
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* ── 03 Full-width banner image ── */}
			<div className="cap-detail-banner">
				<img src={bannerImage} alt="" width="1680" height="700" loading="lazy" />
			</div>

			{/* ── 04 Process — image left, numbered steps right ── */}
			{approach?.items && (
				<section className="section cap-detail-concept">
					<div className="container cap-detail-concept-grid">
						{/* Left: heading + image */}
						<div className="cap-detail-concept-left">
							<p className="eyebrow">How we approach it</p>
							<h2>{approach.title ?? "From requirement to delivery."}</h2>
							<div className="cap-detail-concept-thumb">
								<img src={visualImages[1] ?? visualImages[0]} alt="" width="540" height="600" loading="lazy" />
							</div>
						</div>
						{/* Right: numbered step list */}
						<div className="cap-detail-concept-right">
							{approach.items.map((item, index) => (
								<Reveal key={item.title} className="cap-detail-concept-box">
									<span className="cap-detail-step-num">{String(index + 1).padStart(2, "0")}</span>
									<div>
										<h3>{item.title}</h3>
										<p>{item.body}</p>
									</div>
								</Reveal>
							))}
						</div>
					</div>
				</section>
			)}

			{/* ── 05 Visual section — two columns: copy + image ── */}
			<section className="cap-detail-visuals">
				<div className="container cap-detail-visual-grid">
					{visualImages.map((image, index) => (
						<Reveal key={image} className="cap-detail-visual-item">
							<p>{contentEditorials[index + 1]?.config.body?.[0] ?? hero?.body?.[0]}</p>
							<div className="cap-detail-visual-img">
								<img src={image} alt="" width="900" height="700" loading="lazy" />
							</div>
						</Reveal>
					))}
				</div>
			</section>

			{/* ── 06 FAQ — two-column accordion ── */}
			{faqBlock?.config.items && faqBlock.config.items.length > 0 && (
				<section className="section cap-detail-faq">
					<div className="container cap-detail-faq-grid">
						<div>
							<p className="eyebrow">Common questions</p>
							<h2>Quick answers before the work begins.</h2>
						</div>
						<div className="cap-detail-accordion">
							{faqBlock.config.items.map((item, index) => (
								<details key={item.title} open={index === 0}>
									<summary>
										{item.title}
										<span aria-hidden="true">+</span>
									</summary>
									<p>{item.body}</p>
								</details>
							))}
						</div>
					</div>
				</section>
			)}

		</div>
	);
}
function SolutionsPage({ blocks }: { blocks: PageBlock[] }) {
	const hero = blocks.find((b) => b.block_type === "hero")?.config;
	const solutionsBlock = blocks.find((b) => b.block_type === "solutions")?.config;
	const editorial = blocks.find((b) => b.block_type === "editorial")?.config;
	const items = solutionsBlock?.items ?? [];

	// Split into two columns (Orixo-style alternating offset)
	const left = items.filter((_, i) => i % 2 === 0);
	const right = items.filter((_, i) => i % 2 === 1);

	const fallbackImages = [
		"/assets/images/Hands mapping a streamlined workflow.png",
		"/assets/images/Graphite monitor with enterprise dashboard.png",
		"/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
		"/assets/images/Bridging paper records and digital systems.png",
	];

	function SolutionCard({ item, index }: { item: NonNullable<typeof items>[number]; index: number }) {
		const image = item.image ?? fallbackImages[index % fallbackImages.length];
		// Parse label: "Digital payments / 01" → tags=["Digital payments"], year="01"
		const labelParts = item.label?.split("/") ?? [];
		const tags = labelParts[0]?.trim() ? [labelParts[0].trim()] : [];
		const year = new Date().getFullYear();

		return (
			<Reveal className="solutions-card">
				<div className="solutions-card-thumb">
					{/* Dual-image hover reveal — same as work-card */}
					<img src={image} alt="" width="900" height="620" loading="lazy" />
					<img src={image} alt="" width="900" height="620" loading="lazy" aria-hidden="true" />
					{item.link && (
						<Link to={item.link.href} className="solutions-card-arrow" aria-label={`Explore ${item.title}`}>
							<ArrowIcon />
						</Link>
					)}
				</div>
				<div className="solutions-card-content">
					<div className="solutions-card-info">
						<h2 className="solutions-card-title">
							{item.link
								? <Link to={item.link.href}>{item.title}</Link>
								: item.title}
						</h2>
						{tags.length > 0 && (
							<div className="solutions-card-tags">
								{tags.map((tag) => <span key={tag}>{tag}</span>)}
							</div>
						)}
					</div>
					<span className="solutions-card-year">[ {year} ]</span>
				</div>
			</Reveal>
		);
	}

	return (
		<div className="solutions-page">
			{/* Hero — shared Work-style header */}
			<PageHero
				eyebrow="01 / Our solutions"
				title={hero?.title ?? "Digital solutions for real operational requirements."}
				accent={hero?.accent}
				pageLabel="Solutions"
				metaLines={["Einao Solutions", "©2011 — 2026"]}
			/>

			{/* Project-style two-column grid */}
			<section className="section solutions-grid-section">
				<div className="container solutions-grid-container">
					<div className="solutions-grid">
						{/* Left column */}
						<div className="solutions-col">
							{left.map((item, i) => (
								<SolutionCard key={item.title} item={item} index={i * 2} />
							))}
						</div>
						{/* Right column — offset down to create staggered layout */}
						<div className="solutions-col solutions-col-offset">
							{right.map((item, i) => (
								<SolutionCard key={item.title} item={item} index={i * 2 + 1} />
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Custom enterprise CTA strip */}
			{editorial && (
				<section className="section solutions-cta-strip">
					<div className="container">
						<Reveal className="solutions-cta-inner">
							<div>
								<p className="eyebrow">Custom solutions</p>
								<h2>{editorial.title}</h2>
								{editorial.body?.map((p) => <p key={p}>{p}</p>)}
							</div>
							<ActionLink link={{ label: "Discuss a requirement", href: "/contact/" }} />
						</Reveal>
					</div>
				</section>
			)}
		</div>
	);
}

export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
	if (blocks[0]?.page_slug === "insights") return <InsightsPage blocks={blocks} />;
	if (blocks[0]?.page_slug === "about") return <AboutPage blocks={blocks} />;
	if (blocks[0]?.page_slug === "capabilities") return <CapabilitiesPage blocks={blocks} />;
	if (blocks[0]?.page_slug?.startsWith("capabilities/")) return <CapabilityDetailPage blocks={blocks} />;
	if (blocks[0]?.page_slug === "solutions") return <SolutionsPage blocks={blocks} />;

	/* Government industry page - bespoke layout with hero, IPO proof, services, process */
	if (blocks[0]?.page_slug === "industries/government") {
		const heroBlock = blocks.find((b) => b.block_type === "hero")?.config;
		const proofBlock = blocks.find((b) => b.block_type === "proof")?.config;
		if (heroBlock && proofBlock) {
			return <GovPage hero={heroBlock} proof={proofBlock} />;
		}
	}

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






