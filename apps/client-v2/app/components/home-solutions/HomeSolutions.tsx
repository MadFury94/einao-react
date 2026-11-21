import { Link } from "react-router";
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

export function HomeSolutions() {
    return (
        <section className={styles.section} aria-labelledby="solutions-heading">
            <div className={styles.inner}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.pill}>Explore Einao</span>
                    <h2 id="solutions-heading" className={styles.heading}>
                        Delivering technology outcomes <br /> across sectors.
                    </h2>
                </div>

                {/* Cards grid */}
                <div className={styles.grid}>
                    {CARDS.map(card => (
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
