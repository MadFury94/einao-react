import { Link } from "react-router";
import styles from "./HomeSolutions.module.css";

const CARDS = [
    {
        category: "Capabilities",
        categoryColor: "#e67e22",
        title: "IT consulting, process automation, and enterprise solutions.",
        href: "/capabilities/",
        icon: (
            <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={styles.icon}>
                <rect x="20" y="30" width="80" height="55" rx="6" fill="#c8ddf5" stroke="#5ba4cf" strokeWidth="2" />
                <rect x="30" y="40" width="60" height="35" rx="3" fill="#eaf1fb" />
                <rect x="34" y="44" width="10" height="8" rx="1" fill="#5ba4cf" />
                <rect x="34" y="56" width="20" height="3" rx="1" fill="#c8ddf5" />
                <rect x="34" y="62" width="14" height="3" rx="1" fill="#c8ddf5" />
                <line x1="60" y1="85" x2="60" y2="96" stroke="#5ba4cf" strokeWidth="2" />
                <rect x="40" y="96" width="40" height="4" rx="2" fill="#5ba4cf" />
            </svg>
        ),
    },
    {
        category: "Solutions",
        categoryColor: "#27ae60",
        title: "IP Pro, Fylonn, PayX, and custom enterprise systems.",
        href: "/solutions/",
        icon: (
            <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={styles.icon}>
                <rect x="25" y="50" width="30" height="40" rx="4" fill="#c8ddf5" stroke="#5ba4cf" strokeWidth="2" />
                <rect x="65" y="35" width="30" height="55" rx="4" fill="#a8d62a" stroke="#8bb822" strokeWidth="2" />
                <rect x="45" y="65" width="20" height="25" rx="4" fill="#eaf1fb" stroke="#5ba4cf" strokeWidth="2" />
                <line x1="20" y1="90" x2="100" y2="90" stroke="#5ba4cf" strokeWidth="2" />
            </svg>
        ),
    },
    {
        category: "Industries",
        categoryColor: "#2980b9",
        title: "Government, business, and regulatory organisations.",
        href: "/industries/",
        icon: (
            <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={styles.icon}>
                <polygon points="60,20 100,45 100,85 60,100 20,85 20,45" fill="#c8ddf5" stroke="#5ba4cf" strokeWidth="2" />
                <polygon points="60,32 88,50 88,78 60,88 32,78 32,50" fill="#eaf1fb" stroke="#5ba4cf" strokeWidth="1.5" />
                <circle cx="60" cy="60" r="12" fill="#a8d62a" />
                <path d="M55 60l3.5 3.5L66 56" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

export function HomeSolutions() {
    return (
        <section className={styles.section} aria-labelledby="solutions-heading">
            <div className={styles.inner}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.pill}>Einao Solutions</span>
                    <h2 id="solutions-heading" className={styles.heading}>
                        Delivering technology outcomes <br /> across sectors.
                    </h2>
                </div>

                {/* Cards grid */}
                <div className={styles.grid}>
                    {CARDS.map(card => (
                        <Link key={card.href} to={card.href} className={styles.card}>
                            <div className={styles.cardTop}>
                                <span
                                    className={styles.cardCategory}
                                    style={{ color: card.categoryColor }}
                                >
                                    {card.category}
                                </span>
                                <p className={styles.cardTitle}>{card.title}</p>
                            </div>
                            <div className={styles.cardBottom}>
                                <div className={styles.iconWrap}>
                                    {card.icon}
                                </div>
                                <span className={styles.arrow} aria-hidden="true">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
