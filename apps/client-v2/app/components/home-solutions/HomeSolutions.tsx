import type { Catalog } from "~/lib/catalog";
import { Link, useRouteLoaderData } from "react-router";
import type { loader as mainLoader } from "~/layouts/main";
import styles from "./HomeSolutions.module.css";

const CARDS = [
    {
        category: "Capabilities",
        title: "IT consulting, process automation, and enterprise solutions.",
        href: "/capabilities/",
        // Capabilities isometric illustration
        illustration: "/assets/images/Isometric workflow monitor with approval tiles.png",
        illustrationAlt: "Isometric workflow monitor with approval tiles",
    },
    {
        category: "Solutions",
        title: "IP Pro, Fylonn, PayX, and custom enterprise systems.",
        href: "/solutions/",
        // TODO: drop in Solutions isometric illustration path here
        illustration: "/assets/images/Isometric solutions windows and server cubes.png",
        illustrationAlt: "Solutions illustration",
    },
    {
        category: "Industries",
        title: "Government, business, and regulatory organisations.",
        href: "/industries/",
        // TODO: drop in Industries isometric illustration path here
        illustration: "/assets/images/Civic, corporate, and secure solutions.png",
        illustrationAlt: "Industries illustration",
    },
];

export function HomeSolutions({ catalog }: { catalog: Catalog }) {
    const mainData = useRouteLoaderData<typeof mainLoader>("layouts/main");
    const config = mainData?.home?.blocks?.find(block => block.block_type === "explore")?.config;
    const configuredCards = Array.isArray(config?.items)
        ? config.items.filter(item => typeof item === "object" && item !== null).map(item => {
            const value = item as Record<string, unknown>;
            return {
                category: String(value.category ?? ""),
                title: String(value.title ?? ""),
                href: String(value.href ?? (typeof value.link === "object" && value.link !== null ? (value.link as Record<string, unknown>).href ?? "#" : "#")),
                illustration: String(value.image ?? ""),
                illustrationAlt: String(value.imageAlt ?? ""),
            };
        }).filter(card => card.category && card.title && card.href)
        : [];
    const fallbackCards = CARDS.map(card => {
        const key = card.category === 'Capabilities' ? 'capabilities' : card.category === 'Solutions' ? 'solutions' : null;
        return key ? { ...card, title: catalog[key]?.entries.map(item => item.title).join(', ') || `Explore our ${key}.` } : card;
    });
    const cards = configuredCards.length ? configuredCards : fallbackCards;
    const heading = typeof config?.title === "string" && config.title.trim() ? config.title : "Delivering technology outcomes across sectors.";
    return (
        <section className={styles.section} aria-labelledby="solutions-heading">
            <div className={styles.inner}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.pill}>Explore Einao</span>
                    <h2 id="solutions-heading" className={styles.heading}>
                        {heading}
                    </h2>
                </div>

                {/* Cards grid */}
                <div className={styles.grid}>
                    {cards.map(card => (
                        <Link key={card.href} to={card.href} className={styles.card}>
                            {/* Label row */}
                            <div className={styles.cardLabel}>
                                <span className={styles.labelDash} aria-hidden="true" />
                                <span className={styles.cardCategory}>{card.category}</span>
                            </div>

                            {/* Title */}
                            <p className={styles.cardTitle}>{card.title}</p>

                            {/* Illustration */}
                            <div className={styles.illustrationWrap}>
                                {card.illustration ? (
                                    <img
                                        src={card.illustration}
                                        alt={card.illustrationAlt}
                                        className={styles.illustration}
                                        loading="lazy"
                                    />
                                ) : (
                                    /* Placeholder until illustration is provided */
                                    <div className={styles.illustrationPlaceholder} aria-hidden="true" />
                                )}
                            </div>

                            {/* Arrow button */}
                            <span className={styles.arrow} aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
