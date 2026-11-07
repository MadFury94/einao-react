/**
 * GovPage — Government & Public Institutions industry page.
 * Layout mirrors Orixo service-details.html structure.
 */

import { Link } from "react-router";
import { ActionLink, Reveal } from "./primitives";
import { PageHero } from "./page-blocks";
import { ArrowIcon } from "./ArrowIcon";
import type { BlockConfig } from "@einao/content";

interface GovPageProps {
    hero: BlockConfig;
    proof: BlockConfig;
}

// ── 01 Intro strip ────────────────────────────────────────────────────────
function IntroStrip() {
    const checks = [
        "Applications and approvals",
        "Records and information management",
        "Payments and transactions",
        "Public-facing digital services",
    ];
    return (
        <section className="section gov-intro">
            <div className="container gov-intro-grid">
                <Reveal direction="left" className="gov-intro-left">
                    <h2>Digital systems shaped around institutional work.</h2>
                    <ul className="gov-checklist">
                        {checks.map((item) => (
                            <li key={item}>
                                <span className="gov-check" aria-hidden="true">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2.5 8.5 6.5 12.5 13.5 4" />
                                    </svg>
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </Reveal>
                <Reveal direction="right" delay={100} className="gov-intro-right">
                    <p>Public institutions manage applications, approvals, records, payments, and services involving multiple stakeholders and defined processes. Einao's work in institutional digital systems includes the IPO Nigeria portal engagement — building the portal and continuing to support its technical operation, maintenance, and upgrades.</p>
                    <p>We start from the operational reality of the institution before deciding on a technical approach — understanding the workflows, information flows, users, and constraints before writing a line of code.</p>
                    <ActionLink link={{ label: "Discuss an institutional requirement", href: "/contact/" }} />
                </Reveal>
            </div>
        </section>
    );
}

// ── 02 Feature image ──────────────────────────────────────────────────────
function FeatureImage() {
    return (
        <section className="gov-feature-image">
            <div className="container">
                <Reveal>
                    <div className="gov-feature-thumb">
                        <img src="/assets/images/Collaborative technology team in Abuja office.png" alt="" width="1400" height="700" loading="lazy" />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

// ── 03 How we work — numbered steps + image ───────────────────────────────
function HowWeWork() {
    const steps = [
        { number: "01", title: "Define requirements", body: "We work with institutional teams to map the operational process before deciding on a technical approach." },
        { number: "02", title: "Build or support delivery", body: "Whether building a new portal or supporting an existing one, we follow the operational context at every step." },
        { number: "03", title: "Maintain and improve", body: "Institutional systems need ongoing support. We provide maintenance, technical operation, and upgrades." },
    ];
    return (
        <section className="section gov-how-section">
            <div className="container">
                <div className="gov-how-grid">
                    <Reveal direction="left" className="gov-how-left">
                        <div className="gov-how-count">
                            <span>0</span><span className="gov-how-count-num">3</span>
                        </div>
                        <p className="gov-how-subtitle">Our proven engagement model</p>
                        <div className="gov-how-image">
                            <img src="/assets/images/Einao staff working on automation with client.jpg" alt="" width="600" height="480" loading="lazy" />
                        </div>
                    </Reveal>
                    <Reveal direction="right" delay={80} className="gov-how-right">
                        <h2>From the first requirement to continued support.</h2>
                        {steps.map((step) => (
                            <div key={step.title} className="gov-how-step">
                                <h3><span className="gov-how-num">{step.number}</span>{step.title}</h3>
                                <p>{step.body}</p>
                            </div>
                        ))}
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

// ── 04 Visual pair ────────────────────────────────────────────────────────
function VisualPair() {
    return (
        <section className="section gov-visual-section">
            <div className="container">
                <Reveal className="gov-visual-heading">
                    <h2>Institutional systems that serve the public.</h2>
                </Reveal>
                <div className="gov-visual-grid">
                    <Reveal direction="left" className="gov-visual-item">
                        <p>The IPO Nigeria portal supports application processes relating to trademarks, patents, and industrial designs. Einao built the portal and continues to support it through maintenance, technical support, optimisation, and upgrades as requirements evolve.</p>
                        <div className="gov-visual-thumb">
                            <img src="/assets/images/Team Navigates Pending Approvals.png" alt="" width="680" height="460" loading="lazy" />
                        </div>
                    </Reveal>
                    <Reveal direction="right" delay={100} className="gov-visual-item">
                        <p>A digital platform is not finished operationally when it launches. Systems need continued technical attention as requirements evolve, users interact with the service, and improvements become necessary.</p>
                        <div className="gov-visual-thumb">
                            <img src="/assets/images/Graphite monitor with enterprise dashboard.png" alt="" width="680" height="460" loading="lazy" />
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

// ── 05 Solutions showcase ─────────────────────────────────────────────────
const govProjects = [
    { title: "IP PRO", label: "Intellectual property management", image: "/assets/images/about hero/Focused duo Einao studying a tablet.png", link: { label: "Explore IP PRO", href: "/solutions/ip-pro/" } },
    { title: "Fylonn", label: "Application & process management", image: "/assets/images/about hero/Einao Profiles in emerald light.png", link: { label: "Explore Fylonn", href: "/solutions/fylonn/" } },
];

function SolutionsShowcase() {
    const year = new Date().getFullYear();
    const left = govProjects.filter((_, i) => i % 2 === 0);
    const right = govProjects.filter((_, i) => i % 2 === 1);
    return (
        <section className="section gov-showcase-section">
            <div className="container">
                <Reveal className="gov-showcase-heading">
                    <p className="eyebrow">Solutions</p>
                    <h2>Relevant products for institutional work.</h2>
                </Reveal>
            </div>
            <div className="container solutions-grid-container">
                <div className="solutions-grid">
                    <div className="solutions-col">
                        {left.map((item) => (
                            <Reveal key={item.title} direction="left" className="solutions-card">
                                <div className="solutions-card-thumb">
                                    <img src={item.image} alt="" width="900" height="620" loading="lazy" />
                                    <img src={item.image} alt="" width="900" height="620" loading="lazy" aria-hidden="true" />
                                    <Link to={item.link.href} className="solutions-card-arrow" aria-label={`Explore ${item.title}`}><ArrowIcon /></Link>
                                    <div className="solutions-card-content">
                                        <div className="solutions-card-info">
                                            <h2 className="solutions-card-title"><Link to={item.link.href}>{item.title}</Link></h2>
                                            <div className="solutions-card-tags"><span>{item.label}</span></div>
                                        </div>
                                        <span className="solutions-card-year">[ {year} ]</span>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                    <div className="solutions-col solutions-col-offset">
                        {right.map((item) => (
                            <Reveal key={item.title} direction="right" delay={150} className="solutions-card">
                                <div className="solutions-card-thumb">
                                    <img src={item.image} alt="" width="900" height="620" loading="lazy" />
                                    <img src={item.image} alt="" width="900" height="620" loading="lazy" aria-hidden="true" />
                                    <Link to={item.link.href} className="solutions-card-arrow" aria-label={`Explore ${item.title}`}><ArrowIcon /></Link>
                                    <div className="solutions-card-content">
                                        <div className="solutions-card-info">
                                            <h2 className="solutions-card-title"><Link to={item.link.href}>{item.title}</Link></h2>
                                            <div className="solutions-card-tags"><span>{item.label}</span></div>
                                        </div>
                                        <span className="solutions-card-year">[ {year} ]</span>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ── Page root ─────────────────────────────────────────────────────────────
export function GovPage({ hero: heroConfig }: GovPageProps) {
    return (
        <div className="gov-page">
            <PageHero
                eyebrow="Industry / Government & Public Institutions"
                title={heroConfig.title ?? "Technology for public institutions"}
                accent={heroConfig.accent}
                pageLabel="Government"
                metaLines={heroConfig.body?.slice(0, 1) ?? []}
                bgImage="/assets/images/about hero/Einao Profiles in emerald light.png"
                secondaryLink={{ label: "All industries", href: "/industries/" }}
            />
            <IntroStrip />
            <FeatureImage />
            <HowWeWork />
            <VisualPair />
            <SolutionsShowcase />
            <section className="section solutions-cta-strip">
                <div className="container">
                    <Reveal className="solutions-cta-inner">
                        <div>
                            <p className="eyebrow">Work with us</p>
                            <h2>Discuss a digital requirement for your institution.</h2>
                        </div>
                        <ActionLink link={{ label: "Start a conversation", href: "/contact/" }} />
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
