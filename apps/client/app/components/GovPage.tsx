/**
 * GovPage - dedicated layout for the Government & Public Institutions industry page.
 *
 * Sections:
 *  1. Hero          - dark (--ink), two-column: animated title + stat panel right
 *  2. Work/Proof    - light (--paper), rebuilt IPO proof block with browser-frame mockup
 *  3. What we help  - light (--paper), four hover-reveal process cards
 *  4. How we work   - dark (--surface), three-step horizontal strip
 *  5. CTA / Footer  - handled by the shared Shell footer
 *
 * All colours use tokens only. No hardcoded hex values.
 */

import { EditorialImage } from "./EditorialImage";
import { ProcessCard } from "./ProcessCard";
import { ActionLink, Reveal } from "./primitives";
import { PageHero } from "./page-blocks";
import type { BlockConfig } from "@einao/content";

/*  Types  */
interface GovPageProps {
    hero: BlockConfig;
    proof: BlockConfig;
}

/*  Sub-components  */

/**
 * StatPanel - fills the right column of the hero with 2-3 key figures.
 * Keeps the hero heading readable without a competing image at the same
 * visual weight.
 */
function StatPanel() {
    const stats = [
        /* PLACEHOLDER - replace with final copy when approved */
        { value: "2013", label: "Supporting institutional digital services" },
        { value: "01", label: "Federal Ministry client on record" },
        { value: "Live", label: "Public-facing portal in active use" },
    ];
    return (
        <div className="gov-hero-stats" aria-label="Key facts">
            {stats.map((s) => (
                <div key={s.label} className="gov-hero-stat">
                    {/* Large serif numeral - consistent with about-page counters */}
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                </div>
            ))}
        </div>
    );
}

/**
 * IpoProofBlock - the rebuilt IPO Nigeria proof section on the light background.
 *
 * Left column is widened (7fr vs 5fr) so the heading breaks naturally at ~2 lines.
 * Right column shows a browser-frame mockup placeholder + fact chips.
 */
function IpoProofBlock({ config }: { config: BlockConfig }) {
    /* Three key facts displayed as number + label inside the card */
    const facts = [
        /* PLACEHOLDER - replace with real figures */
        { value: "Since\u00a02013", label: "Active client relationship" },
        { value: "3+", label: "Application streams supported" },
        { value: "Live", label: "Public-facing portal" },
    ];

    /* Service-area tags - explicitly listed so they can differ per page */
    const tags = ["Trademarks", "Patents", "Industrial designs"];

    return (
        <section className="section gov-proof" aria-labelledby="gov-proof-heading">
            <div className="container gov-proof-grid">

                {/*  Left: heading, copy, CTA  */}
                <Reveal className="gov-proof-text">
                    {config.eyebrow && (
                        <p className="eyebrow">{config.eyebrow}</p>
                    )}
                    {/* id referenced by aria-labelledby on the section */}
                    <h2 id="gov-proof-heading">{config.title}</h2>

                    {/* Body copy - 16px min via CSS token */}
                    {config.body?.map((p) => (
                        <p key={p} className="gov-proof-body">{p}</p>
                    ))}

                    {config.cta && (
                        <div className="gov-proof-cta">
                            <ActionLink link={config.cta} />
                        </div>
                    )}
                </Reveal>

                {/*  Right: IPO card with browser-frame treatment  */}
                <Reveal className="gov-proof-card">
                    {/* Small-label + serif client name - matches existing proof-panel pattern */}
                    <p className="gov-proof-card-label">{config.items?.[0]?.label}</p>

                    {/* Serif accent for client name - reuses .proof-name token */}
                    <p className="gov-proof-card-name">{config.items?.[0]?.title}</p>

                    {/* Browser-frame mockup - swap src once the real screenshot is ready */}
                    <div className="gov-browser-frame" aria-hidden="true">
                        <div className="gov-browser-chrome">
                            {/* decorative traffic-light dots */}
                            <span /><span /><span />
                        </div>
                        <div className="gov-browser-screen">
                            <img
                                src="/assets/images/Graphite monitor with enterprise dashboard.png"
                                alt=""
                                /* alt="" because the frame is decorative; the real info is
                                   in the surrounding copy and heading */
                                width="800"
                                height="500"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                    </div>

                    {/* Fact chips - numbers + labels */}
                    <div className="gov-proof-facts">
                        {facts.map((f) => (
                            <div key={f.label} className="gov-proof-fact">
                                <strong>{f.value}</strong>
                                <span>{f.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Tag chips - 14px min, readable size */}
                    <div className="gov-proof-tags" role="list" aria-label="Service areas covered">
                        {tags.map((t) => (
                            <span key={t} className="gov-proof-tag" role="listitem">{t}</span>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/**
 * WhatWeHelp - four hover-reveal cards showing institutional service areas.
 *
 * Rules (same as ProcessCard):
 *  - No layout shift - paragraph always in DOM, toggled via opacity/visibility.
 *  - prefers-reduced-motion: cards show text always (CSS handles it).
 *  - Mobile: text always visible (no hover dependency).
 */
function WhatWeHelp() {
    const cards = [
        {
            number: "01",
            title: "Applications and approvals",
            /* PLACEHOLDER - replace with final copy */
            description:
                "Digital intake, workflow routing, and status tracking for structured application and approval processes.",
            image: "/assets/images/process/understand.png",
        },
        {
            number: "02",
            title: "Records and information",
            /* PLACEHOLDER - replace with final copy */
            description:
                "Organised records management, search, retrieval, and information access for institutional teams and the public.",
            image: "/assets/images/process/design.png",
        },
        {
            number: "03",
            title: "Payments and transactions",
            /* PLACEHOLDER - replace with final copy */
            description:
                "Integrated payment flows for fees, levies, and transactions within a regulated service environment.",
            image: "/assets/images/process/solve.png",
        },
        {
            number: "04",
            title: "Public-facing services",
            /* PLACEHOLDER - replace with final copy */
            description:
                "Portals and interfaces that give applicants and stakeholders clear, reliable access to institutional services.",
            image: "/assets/images/process/deliver.png",
        },
    ];

    return (
        <section className="section gov-services" aria-labelledby="gov-services-heading">
            <div className="container">
                <Reveal className="gov-services-heading">
                    <p className="eyebrow">02 / What we help with</p>
                    <h2 id="gov-services-heading">
                        Processes that need to work reliably, at scale.
                    </h2>
                </Reveal>

                {/* Reuse the process-card grid + ProcessCard component so hover behaviour
				    is identical to the About page - no new interaction logic needed. */}
                <div className="gov-services-grid">
                    {cards.map((card) => (
                        <Reveal key={card.title}>
                            <ProcessCard
                                number={card.number}
                                title={card.title}
                                description={card.description}
                                image={card.image}
                            />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/**
 * HowWeWork - three-step horizontal strip on the dark --surface background.
 * Numbers are large serifs; text stays readable on dark via --paper token.
 */
function HowWeWork() {
    const steps = [
        {
            number: "01",
            title: "Define requirements",
            /* PLACEHOLDER - replace with final copy */
            body: "We work with institutional teams to map the operational process before writing a line of code.",
        },
        {
            number: "02",
            title: "Build or support delivery",
            /* PLACEHOLDER - replace with final copy */
            body: "Whether building a new portal or supporting an existing one, we follow the operational context.",
        },
        {
            number: "03",
            title: "Maintain and improve",
            /* PLACEHOLDER - replace with final copy */
            body: "Institutional systems need ongoing support. We provide maintenance, technical operation, and upgrades.",
        },
    ];

    return (
        <section className="section gov-how" aria-labelledby="gov-how-heading">
            <div className="container">
                <Reveal className="gov-how-heading">
                    <p className="eyebrow">03 / How we work with institutions</p>
                    <h2 id="gov-how-heading">
                        From the first requirement to continued support.
                    </h2>
                </Reveal>

                <div className="gov-how-steps">
                    {steps.map((step, i) => (
                        <Reveal key={step.title} className="gov-how-step">
                            {/* Large serif number - consistent with about-page step pattern */}
                            <p className="gov-how-num" aria-hidden="true">{step.number}</p>
                            {/* Thin top rule - visual connector between steps */}
                            <div className="gov-how-rule" aria-hidden="true" />
                            <h3 className="gov-how-title">{step.title}</h3>
                            <p className="gov-how-body">{step.body}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/*  Page root  */

export function GovPage({ hero: heroConfig, proof }: GovPageProps) {
    return (
        <div className="gov-page">

            {/*  01 Hero - dark background 
			    Two columns: animated title + CTA left, stat panel right.
			    AnimatedTitle is NOT used here because we're inside a custom
			    component - we output the heading directly using the page title.
			    The hero section uses the shared .page-hero dark background.
			 */}
            <PageHero
                eyebrow={heroConfig.eyebrow ?? "01 / Government & public institutions"}
                title={heroConfig.title ?? "Technology for public institutions"}
                accent={heroConfig.accent}
                pageLabel="Government"
                metaLines={heroConfig.body?.slice(0, 2) ?? []}
            >
                {heroConfig.cta && <div className="page-hero-shared-cta"><ActionLink link={heroConfig.cta} /></div>}
            </PageHero>

            {/*  02 IPO Proof - light background  */}
            <IpoProofBlock config={proof} />

            {/*  03 What we help with - light background  */}
            <WhatWeHelp />

            {/*  04 How we work - dark background  */}
            <HowWeWork />

        </div>
    );
}
