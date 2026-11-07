import { CapabilityDetailBody } from "../capability-details/CapabilityDetailBody";
import { CapabilitiesList } from "../capabilities-list/CapabilitiesList";
import { AnimatedCounter } from "../AnimatedCounter";
import { Marquee } from "../Marquee";
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
export function PageHero({
	eyebrow,
	title,
	accent,
	pageLabel,
	metaLines,
	bgImage,
	typewriterWords,
	secondaryLink,
	hideCtas,
	children,
}: {
	eyebrow: string;
	title: string;
	accent?: string;
	pageLabel?: string;
	metaLines?: string[];
	bgImage?: string;
	typewriterWords?: string[];
	secondaryLink?: { label: string; href: string };
	/** Pass true to suppress the default Start a conversation / Explore buttons */
	hideCtas?: boolean;
	children?: React.ReactNode;
}) {
	// metaLines[0] = subtitle line, metaLines[1] = body text (optional)
	const subtitle = metaLines?.[0];
	const bodyText = metaLines?.[1];
	const secondary = secondaryLink ?? (pageLabel ? { label: `Explore ${pageLabel.toLowerCase()}`, href: `/${pageLabel.toLowerCase().replace(/\s+/g, "-")}/` } : undefined);

	return (
		<section
			className="page-hero-shared"
			style={{ backgroundImage: `url("${bgImage || "/assets/images/about hero/Einao Profiles in emerald light.png"}")`, backgroundSize: "cover", backgroundPosition: "center" }}
		>
			<div className="container page-hero-shared-inner">
				{/* Eyebrow */}
				<p className="eyebrow page-hero-shared-eyebrow">{eyebrow}</p>

				{/* Large headline */}
				<div className="page-hero-shared-title">
					<AnimatedTitle text={title} accent={accent} />
				</div>

				{/* Typewriter */}
				{typewriterWords && typewriterWords.length > 0 && (
					<div className="page-hero-shared-typewriter">
						<Typewriter phrases={typewriterWords} className="page-hero-typewriter-text" />
					</div>
				)}

				{/* Subtitle */}
				{subtitle && <p className="page-hero-shared-subtitle">{subtitle}</p>}

				{/* Body text */}
				{bodyText && <p className="page-hero-shared-body">{bodyText}</p>}

				{/* CTAs */}
				{!hideCtas && (
					<div className="page-hero-shared-ctas">
						<Link className="page-hero-shared-cta-primary" to="/contact/">
							<span className="page-hero-shared-cta-arrow page-hero-shared-cta-arrow-left" aria-hidden="true"><ArrowIcon /></span>
							<span className="page-hero-shared-cta-label">Start a conversation</span>
							<span className="page-hero-shared-cta-arrow page-hero-shared-cta-arrow-right" aria-hidden="true">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m4 8 8 0M8 4l4 4-4 4" /></svg>
							</span>
						</Link>
						{secondary && (
							<Link className="page-hero-shared-cta-secondary" to={secondary.href}>
								{secondary.label}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
							</Link>
						)}
					</div>
				)}

				{/* Bottom: page label right-aligned */}
				{pageLabel && (
					<div className="page-hero-shared-bottom">
						<span />
						<span
							className="page-hero-shared-label"
							aria-hidden="true"
							style={{ fontSize: pageLabel.length > 12 ? `clamp(3rem, ${Math.max(5, 11 - (pageLabel.length - 12) * 0.4)}vw, ${Math.max(60, 160 - (pageLabel.length - 12) * 6)}px)` : undefined }}
						>
							{pageLabel}
						</span>
					</div>
				)}

				{children}
			</div>
		</section>
	);
}

export function InsightCard({ item, index, author = "Einao" }: { item: NonNullable<BlockConfig["items"]>[number]; index: number; author?: string }) {
	return (
		<Reveal className="insight-news-card" delay={(index % 3) * 100}>
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
				bgImage="/assets/images/about hero/DEinao ata Center Team Troubleshooting Together (1).png"
				typewriterWords={["Technology.", "Operations.", "Automation.", "Delivery."]}
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
				bgImage="/assets/images/about hero/Einao Profiles in emerald light.png"
				typewriterWords={["Consulting.", "Automating.", "Building.", "Delivering."]}
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

			{/*  03 How we work — sdp-style numbered cards, clean on light bg */}
			<section className="section about-page-process">
				<div className="container">
					<Reveal className="about-page-section-heading">
						<div><p className="eyebrow">03 / How we work</p><h2>We understand first, then build what the organisation needs.</h2></div>
						<p>From the first conversation to implementation, our work follows the operating reality. Each step makes the next decision clearer.</p>
					</Reveal>
					<div className="sdp-process-grid">
						{approach?.items?.map((item, index) => (
							<Reveal key={item.title} delay={index * 80} className="sdp-process-card">
								<span className="sdp-process-number">{String(index + 1).padStart(2, "0")}</span>
								<h3>{item.title}</h3>
								<p>{item.body}</p>
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
						<Reveal direction="left" className="image-composition"><div className="about-page-proof-image">
							<img
								src="/assets/images/Einao staff working on automation with client.jpg"
								alt="Einao team working with an institutional client"
								width="540"
								height="620"
							/>
						</div><img className="accent-image" src="/assets/images/Hands sketching a business workflow.png" alt="" width="240" height="240" loading="lazy" /></Reveal>

						{/* Right: copy, CTA, counter tiles, secondary image */}
						<Reveal direction="right" delay={120} className="about-page-proof-copy">
							<p>{editorials[1]?.body?.[0] ?? "We work with organisations to understand how operations actually run before deciding what technology to use — then we build and support the systems that make those operations work reliably."}</p>

							<ActionLink link={{ label: "Start a conversation", href: "/contact/" }} />

							<div className="about-page-counters">
								<Reveal direction="zoom" className="about-page-counter-box">
									<span>Founded</span>
									<strong><AnimatedCounter value={2011} /></strong>
									<p>Built around practical technology delivery.</p>
								</Reveal>
								<Reveal direction="zoom" className="about-page-counter-box">
									<span>Since</span>
									<strong><AnimatedCounter value={2013} /></strong>
									<p>Supporting institutional digital services.</p>
								</Reveal>
								<div className="about-page-counter-small-img">
									<img
										src="/assets/images/Nigerian IT Consultants Reviewing a Laptop.png"
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
					<div className="about-page-history-body">
						<div className="about-page-history-image">
							<img src="/assets/images/Einao staff working on automation.jpg" alt="" width="700" height="520" loading="lazy" />
						</div>
						<div className="about-page-history-text">
							<div className="about-page-history-founded">
								<span className="about-page-history-year"><AnimatedCounter value={2011} /></span>
								<p className="about-page-history-caption">Founded — practical technology delivery</p>
							</div>
							<div className="about-page-history-copy">{editorials[1]?.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
						</div>
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

			<Marquee label="Einao values" words={["Understand", "Improve", "Connect", "Deliver"]} />
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
		return <Marquee label={c.title} words={(c.items ?? []).map(item => item.title)} />;
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
							<Reveal key={item.title} delay={i * 90} className="item">
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
	return (
		<div className="capabilities-reference-page capabilities-index-page">
			<PageHero
				eyebrow="01 / Our capabilities"
				title={hero?.title ?? "Our capabilities"}
				accent={hero?.accent}
				pageLabel="Capabilities"
				metaLines={["Technology, operations, and delivery", hero?.body?.[0] ?? ""].filter(Boolean)}
				bgImage="/assets/images/about hero/Einao Profiles in emerald light.png"
				typewriterWords={["Consulting.", "Automating.", "Building.", "Delivering."]}
			/>
			{services && <CapabilitiesList config={services} />}
		</div>
	);
}

function IndustriesPage({ blocks }: { blocks: PageBlock[] }) {
	const hero = blocks.find((block) => block.block_type === "hero")?.config;
	const industriesBlock = blocks.find((block) => block.block_type === "industries")?.config;
	return (
		<div className="capabilities-reference-page industries-index-page">
			<PageHero
				eyebrow="01 / Who we work with"
				title={hero?.title ?? "Technology shaped around the realities of your organisation."}
				accent={hero?.accent}
				pageLabel="Industries"
				metaLines={["Government, business, and service organisations", hero?.body?.[0] ?? ""].filter(Boolean)}
				bgImage="/assets/images/about hero/Einao Profiles in emerald light.png"
				typewriterWords={["Government.", "Business.", "Regulatory.", "Institutions."]}
			/>
			{industriesBlock && <IndustriesList config={industriesBlock} />}
		</div>
	);
}

function IndustriesList({ config }: { config: BlockConfig }) {
	const items = config.items ?? [];
	const images = [
		"/assets/images/Collaborative technology team in Abuja office.png",
		"/assets/images/Einao staff working on automation with client.jpg",
		"/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
	];
	// Re-use identical layout/CSS as CapabilitiesList — same module, same scroll-pin GSAP
	// We pass it through a wrapper that matches the exact same DOM structure
	return <CapabilitiesList config={{ ...config, items: items.map((item, i) => ({ ...item, image: item.image ?? images[i % images.length], label: item.label ?? ["Government / Public Sector", "Business / Corporate", "Regulatory / Services"][i % 3] })) }} />;
}

function CapabilityDetailPage({ blocks }: { blocks: PageBlock[] }) {
	const pageSlug = blocks[0]?.page_slug ?? "";
	const hero = blocks.find((block) => block.block_type === "hero")?.config;
	return (
		<div className={`capability-detail-page${pageSlug === "capabilities/it-consulting" ? " it-consulting-page" : pageSlug === "capabilities/business-process-automation" ? " automation-page" : pageSlug === "capabilities/enterprise-solutions" ? " enterprise-page" : ""}`}>

			{/* ── 01 Hero — Work-breadcrumb style with AnimatedTitle + CTA ── */}
			<PageHero
				eyebrow={hero?.eyebrow ? `Capability / ${hero.eyebrow}` : "01 / Capability"}
				title={hero?.title ?? "Capability"}
				accent={hero?.accent}
				pageLabel={hero?.eyebrow ?? "Capability"}
				secondaryLink={{ label: "View all capabilities", href: "/capabilities/" }}
				metaLines={["Technology, operations, and delivery"]}
				bgImage={pageSlug === "capabilities/it-consulting" ? "/assets/images/about hero/Business Einao professionals reviewing laptop analytics.png" : pageSlug === "capabilities/business-process-automation" ? "/assets/images/about hero/Einao Hand Reaching Toward Glowing Workflow Nodes.png" : pageSlug === "capabilities/enterprise-solutions" ? "/assets/images/about hero/Focused duo Einao studying a tablet.png" : undefined}
			>
				{pageSlug !== "capabilities/it-consulting" && pageSlug !== "capabilities/business-process-automation" && pageSlug !== "capabilities/enterprise-solutions" && hero?.cta && (
					<div className="page-hero-shared-cta">
						<ActionLink link={hero.cta} />
					</div>
				)}
			</PageHero>

			<CapabilityDetailBody blocks={blocks} />

		</div>
	);
}
// ── Shared project showcase card (used by Solutions page + Industry detail pages) ──
const showcaseFallbackImages = [
	"/assets/images/Hands mapping a streamlined workflow.png",
	"/assets/images/Graphite monitor with enterprise dashboard.png",
	"/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
	"/assets/images/Bridging paper records and digital systems.png",
	"/assets/images/Collaborative technology team in Abuja office.png",
	"/assets/images/Team Navigates Pending Approvals.png",
];

type ShowcaseItem = {
	title: string;
	body?: string;
	image?: string;
	label?: string;
	badge?: string;
	link?: { label: string; href: string };
};

function ShowcaseCard({ item, index }: { item: ShowcaseItem; index: number }) {
	const image = item.image ?? showcaseFallbackImages[index % showcaseFallbackImages.length];
	const labelParts = item.label?.split("/") ?? [];
	const tags = labelParts[0]?.trim() ? [labelParts[0].trim()] : [];
	const year = new Date().getFullYear();
	const direction = index % 2 === 0 ? "left" : "right";
	return (
		<Reveal direction={direction} delay={index % 2 === 1 ? 150 : 0} className={`solutions-card${item.badge ? " solutions-card-soon" : ""}`}>
			<div className="solutions-card-thumb">
				<img src={image} alt="" width="900" height="620" loading="lazy" />
				<img src={image} alt="" width="900" height="620" loading="lazy" aria-hidden="true" />
				{item.badge && <span className="solutions-card-badge" aria-label={item.badge}>{item.badge}</span>}
				{item.link && !item.badge && (
					<Link to={item.link.href} className="solutions-card-arrow" aria-label={`Explore ${item.title}`}><ArrowIcon /></Link>
				)}
				<div className="solutions-card-content">
					<div className="solutions-card-info">
						<h2 className="solutions-card-title">
							{item.link && !item.badge ? <Link to={item.link.href}>{item.title}</Link> : item.title}
						</h2>
						{tags.length > 0 && (
							<div className="solutions-card-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
						)}
					</div>
					<span className="solutions-card-year">[ {year} ]</span>
				</div>
			</div>
		</Reveal>
	);
}

function ShowcaseGrid({ items, heading, subheading }: { items: ShowcaseItem[]; heading?: string; subheading?: string }) {
	const left = items.filter((_, i) => i % 2 === 0);
	const right = items.filter((_, i) => i % 2 === 1);
	return (
		<section className="section solutions-grid-section">
			{(heading || subheading) && (
				<div className="container">
					<Reveal className="showcase-heading">
						{subheading && <p className="eyebrow">{subheading}</p>}
						{heading && <h2>{heading}</h2>}
					</Reveal>
				</div>
			)}
			<div className="container solutions-grid-container">
				<div className="solutions-grid">
					<div className="solutions-col">
						{left.map((item, i) => <ShowcaseCard key={item.title} item={item} index={i * 2} />)}
					</div>
					<div className="solutions-col solutions-col-offset">
						{right.map((item, i) => <ShowcaseCard key={item.title} item={item} index={i * 2 + 1} />)}
					</div>
				</div>
			</div>
		</section>
	);
}

// Per-industry project/solution showcases
const industryProjects: Record<string, ShowcaseItem[]> = {
	"industries/government": [
		{
			title: "IP PRO",
			label: "Intellectual property management",
			body: "Structured IP application and registry management used in the IPO Nigeria portal engagement.",
			image: "/assets/images/about hero/Focused duo Einao studying a tablet.png",
			link: { label: "Explore IP PRO", href: "/solutions/ip-pro/" },
		},
		{
			title: "Fylonn",
			label: "Application & process management",
			body: "A modular platform for digitising, coordinating and monitoring applications and operational processes.",
			image: "/assets/images/about hero/Einao Profiles in emerald light.png",
			link: { label: "Explore Fylonn", href: "/solutions/fylonn/" },
		},
	],
	"industries/business": [
		{
			title: "Fylonn",
			label: "Application & process management",
			body: "Coordinate recurring business processes, reduce manual follow-ups and improve operational visibility.",
			image: "/assets/images/Collaborative technology team in Abuja office.png",
			link: { label: "Explore Fylonn", href: "/solutions/fylonn/" },
		},
		{
			title: "PayX",
			label: "Digital payments",
			body: "A structured digital payment solution for managing payment activity and maintaining visibility over transactions.",
			image: "/assets/images/about hero/Business Einao professionals reviewing laptop analytics.png",
			badge: "Coming soon",
			link: { label: "Explore PayX", href: "/solutions/payx/" },
		},
		{
			title: "Custom Enterprise Systems",
			label: "Bespoke development",
			body: "When a requirement needs a tailored approach — digital portals, integrations, workflow systems, or custom software.",
			image: "/assets/images/Graphite monitor with enterprise dashboard.png",
			link: { label: "Discuss a requirement", href: "/solutions/custom-enterprise-systems/" },
		},
	],
	"industries/regulatory-services": [
		{
			title: "Fylonn",
			label: "Application & process management",
			body: "Digital intake, back-office processing, and operational oversight for regulatory applications and service requests.",
			image: "/assets/images/Team Navigates Pending Approvals.png",
			link: { label: "Explore Fylonn", href: "/solutions/fylonn/" },
		},
		{
			title: "IP PRO",
			label: "Records & registry management",
			body: "Structured intellectual property application, records, and review management for service institutions.",
			image: "/assets/images/Hands mapping a streamlined workflow.png",
			link: { label: "Explore IP PRO", href: "/solutions/ip-pro/" },
		},
		{
			title: "Custom Enterprise Systems",
			label: "Bespoke development",
			body: "Tailored digital systems for structured service processes, defined workflows, and regulatory requirements.",
			image: "/assets/images/Bridging paper records and digital systems.png",
			link: { label: "Discuss a requirement", href: "/solutions/custom-enterprise-systems/" },
		},
	],
};

// ── Per-industry page content ──────────────────────────────────────────────
const industryContent: Record<string, {
	heading: string;
	intro: string;
	intro2: string;
	checks: string[];
	steps: { title: string; body: string }[];
	visual1: string;
	visual2: string;
	featureImage: string;
	visualImg1: string;
	visualImg2: string;
	ctaLabel: string;
}> = {
	"industries/business": {
		heading: "Technology that helps your business work better.",
		intro: "As businesses grow, processes can become fragmented across teams, spreadsheets, and disconnected applications. Einao helps organisations assess their operations, improve workflows, connect systems, and define digital solutions that support their business requirements.",
		intro2: "Whether the need is process automation, a new enterprise application, or integrating existing systems, we start by understanding how your business actually works before recommending a technical approach.",
		checks: [
			"Operations assessment and process mapping",
			"Workflow automation and digital approvals",
			"System integration and data flow",
			"Enterprise applications and portals",
			"Custom software development",
		],
		steps: [
			{ title: "Assess the operation", body: "We examine current workflows, identify fragmented processes, and define what technology needs to do." },
			{ title: "Design the approach", body: "Automation, integration, a new system — we define the right response to the operational problem." },
			{ title: "Build and support", body: "We implement the solution and can provide continued technical support and improvement." },
		],
		visual1: "When processes are fragmented across spreadsheets, emails, and disconnected tools, coordination becomes the bottleneck. Einao maps those workflows and defines digital systems that reduce the administrative effort and make progress visible.",
		visual2: "Integrating existing business systems — CRMs, ERPs, finance tools — can eliminate repeated data entry and create a more connected operational picture. We assess what's technically feasible before committing to an approach.",
		featureImage: "/assets/images/Einao staff working on automation with client.jpg",
		visualImg1: "/assets/images/Hands mapping a streamlined workflow.png",
		visualImg2: "/assets/images/Graphite monitor with enterprise dashboard.png",
		ctaLabel: "Discuss a business requirement",
	},
	"industries/regulatory-services": {
		heading: "Clearer processes for organisations that manage structured services.",
		intro: "Regulatory and service organisations manage defined applications, structured reviews, records, decisions, and public-facing processes. When these workflows are fragmented or manual, they become harder to track, audit, and improve.",
		intro2: "Einao can assess those requirements and determine an appropriate automation, integration, or development approach — helping organisations build digital systems that reflect how their service processes actually work.",
		checks: [
			"Application and request intake",
			"Back-office processing and case management",
			"Records and information management",
			"Structured review and approval workflows",
			"Public-facing service portals",
		],
		steps: [
			{ title: "Map the service process", body: "We document current workflows, hand-offs, decision points, and information requirements before suggesting a solution." },
			{ title: "Define the digital requirements", body: "Intake forms, routing rules, approval stages, records — we turn process knowledge into functional requirements." },
			{ title: "Build and maintain", body: "We implement the agreed system and provide ongoing support as requirements evolve." },
		],
		visual1: "Service organisations handling applications and cases often struggle with visibility — applicants don't know where things stand, and managers lack reliable operational data. A well-structured digital system addresses both.",
		visual2: "Einao's experience with the IPO Nigeria portal — which supports trademark, patent, and industrial design applications — demonstrates the kind of structured digital processes we help institutions build and maintain.",
		featureImage: "/assets/images/Team Navigates Pending Approvals.png",
		visualImg1: "/assets/images/Bridging paper records and digital systems.png",
		visualImg2: "/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
		ctaLabel: "Discuss your service process",
	},
};

function IndustryDetailPage({ blocks }: { blocks: PageBlock[] }) {
	const pageSlug = blocks[0]?.page_slug ?? "";
	const hero = blocks.find((b) => b.block_type === "hero")?.config;
	const projects = industryProjects[pageSlug] ?? [];
	const content = industryContent[pageSlug];

	// Per-industry hero images
	const bgImage =
		pageSlug === "industries/business"
			? "/assets/images/about hero/Business Einao professionals reviewing laptop analytics.png"
			: pageSlug === "industries/regulatory-services"
				? "/assets/images/about hero/Einao Hand Reaching Toward Glowing Workflow Nodes.png"
				: "/assets/images/about hero/Einao Profiles in emerald light.png";

	const industryLabel = pageSlug === "industries/business"
		? "Business"
		: pageSlug === "industries/regulatory-services"
			? "Regulatory"
			: hero?.eyebrow ?? pageSlug.split("/").pop()?.replace(/-/g, " ") ?? "Industry";

	return (
		<div className="industry-detail-page">
			{/* ── Hero ── */}
			<PageHero
				eyebrow={`Industry / ${hero?.eyebrow ?? industryLabel}`}
				title={hero?.title ?? industryLabel}
				accent={hero?.accent}
				pageLabel={industryLabel}
				metaLines={hero?.body?.slice(0, 1) ?? []}
				bgImage={bgImage}
				secondaryLink={{ label: "All industries", href: "/industries/" }}
			/>

			{content && (<>
				{/* ── Intro strip ── */}
				<section className="section gov-intro">
					<div className="container gov-intro-grid">
						<Reveal direction="left" className="gov-intro-left">
							<h2>{content.heading}</h2>
							<ul className="gov-checklist">
								{content.checks.map((item) => (
									<li key={item}>
										<span className="gov-check" aria-hidden="true">
											<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8.5 6.5 12.5 13.5 4" /></svg>
										</span>
										{item}
									</li>
								))}
							</ul>
						</Reveal>
						<Reveal direction="right" delay={100} className="gov-intro-right">
							<p>{content.intro}</p>
							<p>{content.intro2}</p>
							<ActionLink link={{ label: content.ctaLabel, href: "/contact/" }} />
						</Reveal>
					</div>
				</section>

				{/* ── Feature image ── */}
				<section className="gov-feature-image">
					<div className="container">
						<Reveal>
							<div className="gov-feature-thumb">
								<img src={content.featureImage} alt="" width="1400" height="700" loading="lazy" />
							</div>
						</Reveal>
					</div>
				</section>

				{/* ── How we work steps ── */}
				<section className="section gov-how-section">
					<div className="container">
						<div className="gov-how-grid">
							<Reveal direction="left" className="gov-how-left">
								<div className="gov-how-count">
									<span>0</span><span className="gov-how-count-num">{content.steps.length}</span>
								</div>
								<p className="gov-how-subtitle">Our engagement approach</p>
								<div className="gov-how-image">
									<img src={content.visualImg1} alt="" width="600" height="480" loading="lazy" />
								</div>
							</Reveal>
							<Reveal direction="right" delay={80} className="gov-how-right">
								<h2>From understanding the requirement to building the solution.</h2>
								{content.steps.map((step, i) => (
									<div key={step.title} className="gov-how-step">
										<h3><span className="gov-how-num">{String(i + 1).padStart(2, "0")}</span>{step.title}</h3>
										<p>{step.body}</p>
									</div>
								))}
							</Reveal>
						</div>
					</div>
				</section>

				{/* ── Visual pair ── */}
				<section className="section gov-visual-section">
					<div className="container">
						<Reveal className="gov-visual-heading">
							<h2>Technology shaped around operational reality.</h2>
						</Reveal>
						<div className="gov-visual-grid">
							<Reveal direction="left" className="gov-visual-item">
								<p>{content.visual1}</p>
								<div className="gov-visual-thumb">
									<img src={content.visualImg1} alt="" width="680" height="460" loading="lazy" />
								</div>
							</Reveal>
							<Reveal direction="right" delay={100} className="gov-visual-item">
								<p>{content.visual2}</p>
								<div className="gov-visual-thumb">
									<img src={content.visualImg2} alt="" width="680" height="460" loading="lazy" />
								</div>
							</Reveal>
						</div>
					</div>
				</section>
			</>)}

			{/* ── Solutions showcase ── */}
			{projects.length > 0 && (
				<ShowcaseGrid
					items={projects}
					heading="Relevant solutions for this industry"
					subheading="Solutions"
				/>
			)}

			{/* ── CTA strip ── */}
			<section className="section solutions-cta-strip">
				<div className="container">
					<Reveal className="solutions-cta-inner">
						<div>
							<p className="eyebrow">Work with us</p>
							<h2>Discuss a requirement for your organisation.</h2>
						</div>
						<ActionLink link={{ label: "Start a conversation", href: "/contact/" }} />
					</Reveal>
				</div>
			</section>
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

	return (
		<div className="solutions-page">
			{/* Hero — shared Work-style header */}
			<PageHero
				eyebrow="01 / Our solutions"
				title={hero?.title ?? "Digital solutions for real operational requirements."}
				accent={hero?.accent}
				pageLabel="Solutions"
				metaLines={["Digital solutions for real operations", hero?.body?.[0] ?? ""].filter(Boolean)}
				bgImage="/assets/images/about hero/DEinao ata Center Team Troubleshooting Together (1).png"
				typewriterWords={["Connecting.", "Simplifying.", "Automating.", "Delivering."]}
			/>

			{/* Project-style two-column grid */}
			<section className="section solutions-grid-section">
				<div className="container solutions-grid-container">
					<div className="solutions-grid">
						{/* Left column */}
						<div className="solutions-col">
							{left.map((item, i) => (
								<ShowcaseCard key={item.title} item={item} index={i * 2} />
							))}
						</div>
						{/* Right column — offset down to create staggered layout */}
						<div className="solutions-col solutions-col-offset">
							{right.map((item, i) => (
								<ShowcaseCard key={item.title} item={item} index={i * 2 + 1} />
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

function WorkPage({ blocks }: { blocks: PageBlock[] }) {
	const hero = blocks.find((b) => b.block_type === "hero")?.config;
	const proof = blocks.find((b) => b.block_type === "proof")?.config;

	const caseStudies: ShowcaseItem[] = (proof?.items ?? []).map((item, i) => ({
		title: item.title,
		label: item.label ?? "Case study",
		body: item.body,
		image: item.image ?? showcaseFallbackImages[i % showcaseFallbackImages.length],
		link: item.link,
	}));

	// Pad with a placeholder if we only have one real case study
	if (caseStudies.length === 1) {
		caseStudies.push({
			title: "More case studies coming",
			label: "In progress",
			body: "We are documenting additional engagements. Check back for updates on our institutional and enterprise work.",
			image: "/assets/images/Calm Green Network in Negative Space (1).png",
		});
	}

	return (
		<div className="work-page">
			<PageHero
				eyebrow="01 / Our work"
				title={hero?.title ?? "The work behind systems people rely on."}
				accent={hero?.accent}
				pageLabel="Our Work"
				metaLines={["Case studies and selected engagements", hero?.body?.[0] ?? ""].filter(Boolean)}
				bgImage="/assets/images/about hero/DEinao ata Center Team Troubleshooting Together (1).png"
				typewriterWords={["Consulting.", "Automating.", "Building.", "Delivering."]}
			/>

			{caseStudies.length > 0 && (
				<ShowcaseGrid
					items={caseStudies}
					heading="Selected work"
					subheading="02 / Engagements"
				/>
			)}

			<section className="section solutions-cta-strip">
				<div className="container">
					<Reveal className="solutions-cta-inner">
						<div>
							<p className="eyebrow">Work with us</p>
							<h2>Tell us what your organisation needs to do better.</h2>
						</div>
						<ActionLink link={{ label: "Start a conversation", href: "/contact/" }} />
					</Reveal>
				</div>
			</section>
		</div>
	);
}

export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
	if (blocks[0]?.page_slug === "insights") return <InsightsPage blocks={blocks} />;
	if (blocks[0]?.page_slug === "about") return <AboutPage blocks={blocks} />;
	if (blocks[0]?.page_slug === "capabilities") return <CapabilitiesPage blocks={blocks} />;
	if (blocks[0]?.page_slug?.startsWith("capabilities/")) return <CapabilityDetailPage blocks={blocks} />;
	if (blocks[0]?.page_slug === "solutions") return <SolutionsPage blocks={blocks} />;
	if (["solutions/fylonn", "solutions/payx", "solutions/ip-pro"].includes(blocks[0]?.page_slug ?? "")) {
		return <SolutionDetailPage blocks={blocks} />;
	}
	if (blocks[0]?.page_slug === "industries") return <IndustriesPage blocks={blocks} />;
	if (blocks[0]?.page_slug === "work") return <WorkPage blocks={blocks} />;

	/* Government industry page - bespoke layout with hero, IPO proof, services, process */
	if (blocks[0]?.page_slug === "industries/government") {
		const heroBlock = blocks.find((b) => b.block_type === "hero")?.config;
		const proofBlock = blocks.find((b) => b.block_type === "proof")?.config;
		if (heroBlock && proofBlock) {
			return <GovPage hero={heroBlock} proof={proofBlock} />;
		}
	}

	/* Other industry detail pages */
	if (blocks[0]?.page_slug?.startsWith("industries/")) {
		return <IndustryDetailPage blocks={blocks} />;
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

// ── Per-solution image sets ────────────────────────────────────────────────
const solutionAssets: Record<string, {
	hero: string;
	feature: string;
	detail: string;
	pair: [string, string];
	category: string;
	year: string;
}> = {
	"solutions/fylonn": {
		hero: "/assets/images/about hero/Einao Profiles in emerald light.png",
		feature: "/assets/images/Collaborative technology team in Abuja office.png",
		detail: "/assets/images/Team Navigates Pending Approvals.png",
		pair: [
			"/assets/images/Hands mapping a streamlined workflow.png",
			"/assets/images/Graphite monitor with enterprise dashboard.png",
		],
		category: "Application & Process Management",
		year: "2024",
	},
	"solutions/payx": {
		hero: "/assets/images/about hero/Business Einao professionals reviewing laptop analytics.png",
		feature: "/assets/images/Einao staff working on automation with client.jpg",
		detail: "/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
		pair: [
			"/assets/images/Bridging paper records and digital systems.png",
			"/assets/images/Hands sketching a business workflow.png",
		],
		category: "Digital Payments",
		year: "2024",
	},
	"solutions/ip-pro": {
		hero: "/assets/images/about hero/Focused duo Einao studying a tablet.png",
		feature: "/assets/images/Einao staff working on automation.jpg",
		detail: "/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
		pair: [
			"/assets/images/Faint process sketch in deep green.png",
			"/assets/images/Quiet deep green blueprint grid.png",
		],
		category: "Intellectual Property Management",
		year: "2023",
	},
};

function SolutionDetailPage({ blocks }: { blocks: PageBlock[] }) {
	const pageSlug = blocks[0]?.page_slug ?? "";
	const hero = blocks.find((block) => block.block_type === "hero")?.config;
	const label = hero?.eyebrow ?? pageSlug.split("/").pop()?.replace(/-/g, " ") ?? "Solution";
	const editorials = blocks.filter((b) => b.block_type === "editorial").map((b) => b.config);

	const assets = solutionAssets[pageSlug] ?? solutionAssets["solutions/fylonn"];

	const intro = editorials[0];
	const modules = editorials[1];
	const audience = editorials[2];

	const checklistItems = (modules?.items ?? audience?.items ?? []).slice(0, 5);
	const processSteps = (modules?.items ?? []).slice(0, 4);

	const slugs = ["solutions/fylonn", "solutions/payx", "solutions/ip-pro"];
	const currentIdx = slugs.indexOf(pageSlug);
	const prevSlug = currentIdx > 0 ? slugs[currentIdx - 1] : null;
	const nextSlug = currentIdx < slugs.length - 1 ? slugs[currentIdx + 1] : null;
	const prevLabel = prevSlug ? (prevSlug.split("/").pop()?.replace(/-/g, " ") ?? "") : null;
	const nextLabel = nextSlug ? (nextSlug.split("/").pop()?.replace(/-/g, " ") ?? "") : null;

	return (
		<div className="solution-detail-page">
			{/* ── 01 Hero ── */}
			<PageHero
				eyebrow={`Solution / ${label}`}
				title={hero?.title ?? label}
				accent={hero?.accent}
				pageLabel={label}
				metaLines={hero?.body?.slice(0, 1) ?? []}
				bgImage={assets.hero}
				secondaryLink={{ label: "All solutions", href: "/solutions/" }}
			/>

			{/* ── 02 Full-width feature image ── */}
			<section className="sdp-feature-image">
				<div className="container">
					<Reveal>
						<div className="sdp-feature-thumb">
							<img src={assets.feature} alt="" width="1400" height="700" loading="lazy" />
						</div>
					</Reveal>
				</div>
			</section>

			{/* ── 03 Info strip: heading + meta + intro ── */}
			<section className="section sdp-info-strip">
				<div className="container sdp-info-container">
					<Reveal direction="left" className="sdp-info-text">
						<h2>{intro?.title ?? hero?.title ?? label}</h2>
						<p>{intro?.body?.[0] ?? hero?.body?.[0] ?? ""}</p>
					</Reveal>
					<Reveal direction="right" delay={100} className="sdp-meta-grid">
						<div className="sdp-meta-item">
							<span>Category</span>
							<p>{assets.category}</p>
						</div>
						<div className="sdp-meta-item">
							<span>Developed by</span>
							<p>Einao Solutions</p>
						</div>
						<div className="sdp-meta-item">
							<span>Type</span>
							<p>Enterprise software</p>
						</div>
						<div className="sdp-meta-item sdp-meta-item-last">
							<span>Year</span>
							<p>{assets.year}</p>
						</div>
					</Reveal>
				</div>
			</section>

			{/* ── 04 Large detail image ── */}
			<section className="sdp-detail-image">
				<div className="container">
					<Reveal>
						<div className="sdp-detail-thumb">
							<img src={assets.detail} alt="" width="1400" height="800" loading="lazy" />
						</div>
					</Reveal>
				</div>
			</section>

			{/* ── 05 Two-column body + checklist ── */}
			<section className="section sdp-body-section">
				<div className="container">
					<div className="sdp-body-grid">
						<Reveal direction="left" className="sdp-body-left">
							<h2>{modules?.title ?? "Key capabilities"}</h2>
						</Reveal>
						<Reveal direction="right" delay={100} className="sdp-body-right">
							{(intro?.body ?? []).slice(1).map((p, i) => <p key={i}>{p}</p>)}
							{checklistItems.length > 0 && (
								<ul className="sdp-checklist">
									{checklistItems.map((item) => (
										<li key={item.title}>
											<span className="sdp-check" aria-hidden="true">
												<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8.5 6.5 12.5 13.5 4" /></svg>
											</span>
											{item.title}
										</li>
									))}
								</ul>
							)}
						</Reveal>
					</div>
				</div>
			</section>

			{/* ── 06 Dual images side-by-side ── */}
			<section className="sdp-dual-images">
				<div className="container">
					<div className="sdp-dual-grid">
						<Reveal direction="left">
							<div className="sdp-dual-thumb">
								<img src={assets.pair[0]} alt="" width="700" height="520" loading="lazy" />
							</div>
						</Reveal>
						<Reveal direction="right" delay={120}>
							<div className="sdp-dual-thumb">
								<img src={assets.pair[1]} alt="" width="700" height="520" loading="lazy" />
							</div>
						</Reveal>
					</div>
				</div>
			</section>

			{/* ── 07 Numbered process/module cards ── */}
			{processSteps.length > 0 && (
				<section className="section sdp-process-section">
					<div className="container">
						<Reveal className="sdp-process-heading">
							<h2>{modules?.title ?? "How it works"}</h2>
						</Reveal>
						<div className="sdp-process-grid">
							{processSteps.map((item, i) => (
								<Reveal key={item.title} delay={i * 80} className="sdp-process-card">
									<span className="sdp-process-number">{String(i + 1).padStart(2, "0")}</span>
									<h3>{item.title}</h3>
									<p>{item.body}</p>
								</Reveal>
							))}
						</div>
					</div>
				</section>
			)}

			{/* ── 08 Who it's for / audience ── */}
			{audience && (audience.items?.length ?? 0) > 0 && (
				<section className="section sdp-result-section">
					<div className="container">
						<div className="sdp-result-grid">
							<Reveal direction="left" className="sdp-result-left">
								<h2>{audience.title ?? "Who this is for"}</h2>
							</Reveal>
							<Reveal direction="right" delay={100} className="sdp-result-right">
								{(audience.items ?? []).slice(0, 2).map((item) => (
									<div key={item.title} className="sdp-result-item">
										<h3>{item.title}</h3>
										<p>{item.body}</p>
									</div>
								))}
							</Reveal>
						</div>
					</div>
				</section>
			)}

			{/* ── 09 Prev / Next nav ── */}
			<nav className="sdp-nav" aria-label="Solution navigation">
				<div className="container sdp-nav-inner">
					{prevSlug ? (
						<Link to={`/${prevSlug}/`} className="sdp-nav-item sdp-nav-prev">
							<span className="sdp-nav-arrow" aria-hidden="true">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m14 5-7 7 7 7" /></svg>
							</span>
							<span className="sdp-nav-meta"><span className="sdp-nav-label">Previous</span><span className="sdp-nav-name">{prevLabel}</span></span>
						</Link>
					) : <span />}
					<Link to="/solutions/" className="sdp-nav-grid" aria-label="All solutions">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
					</Link>
					{nextSlug ? (
						<Link to={`/${nextSlug}/`} className="sdp-nav-item sdp-nav-next">
							<span className="sdp-nav-meta"><span className="sdp-nav-label">Next</span><span className="sdp-nav-name">{nextLabel}</span></span>
							<span className="sdp-nav-arrow" aria-hidden="true">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 5 7 7-7 7" /></svg>
							</span>
						</Link>
					) : <span />}
				</div>
			</nav>
		</div>
	);
}



