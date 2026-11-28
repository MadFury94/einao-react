import { Link } from "react-router";
import styles from "./HomePlatform.module.css";

import type { Collection } from '~/lib/catalog';
const ART = [
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className={styles.illustration}>
        <rect x="30" y="20" width="140" height="100" rx="8" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <rect x="44" y="34" width="112" height="72" rx="4" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="44" y1="50" x2="156" y2="50" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="52" y="58" width="48" height="6" rx="2" fill="rgba(255,255,255,0.1)" />
        <rect x="52" y="68" width="72" height="6" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="52" y="78" width="60" height="6" rx="2" fill="rgba(255,255,255,0.06)" />
        <circle cx="148" cy="40" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <path d="M144 40l2.5 2.5L152 37" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className={styles.illustration}>
        <rect x="20" y="15" width="90" height="65" rx="6" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <rect x="30" y="25" width="70" height="45" rx="3" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="30" y1="38" x2="100" y2="38" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="36" y="44" width="30" height="5" rx="1.5" fill="rgba(255,255,255,0.1)" />
        <rect x="36" y="52" width="45" height="5" rx="1.5" fill="rgba(255,255,255,0.07)" />
        <rect x="90" y="60" width="90" height="65" rx="6" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <rect x="100" y="70" width="70" height="45" rx="3" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="100" y1="83" x2="170" y2="83" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="106" y="89" width="30" height="5" rx="1.5" fill="rgba(255,255,255,0.1)" />
        <rect x="106" y="97" width="45" height="5" rx="1.5" fill="rgba(255,255,255,0.07)" />
        <path d="M100 92 L90 92" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>];
export function HomePlatform({ collection }: { collection: Collection | null }) {
    const cards = (collection?.entries ?? []).filter(item => item.link).slice(0, 2).map((item, index) => ({ ...item, eyebrow: item.label || 'Einao', href: item.link!.href, illustration: item.image ? <img className={styles.illustration} src={item.image} alt="" loading="lazy" /> : ART[index % ART.length] }));
    return (
        <section className={styles.section} aria-labelledby="platform-heading">
            <div className={styles.inner}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.pill}>Einao Products</span>
                    <h2 id="platform-heading" className={styles.heading}>
                        Purpose-built platforms for<br /> institutional operations.
                    </h2>
                </div>

                {/* Two cards */}
                <div className={styles.grid}>
                    {cards.length === 0 && <p role="status">{collection ? "No solutions have been published yet." : "Solutions are temporarily unavailable."}</p>}
                    {cards.map(card => (
                        <Link key={card.href} to={card.href} className={styles.card}>
                            {/* Illustration top-right */}
                            <div className={styles.illustrationWrap} aria-hidden="true">
                                {card.illustration}
                            </div>

                            {/* Content bottom */}
                            <div className={styles.cardContent}>
                                <span className={styles.cardEyebrow}>{card.eyebrow}</span>
                                {card.badge && <span className={styles.cardBadge}>{card.badge}</span>}
                                <h3 className={styles.cardTitle}>{card.title}</h3>
                                <div className={styles.cardBottom}>
                                    <span className={styles.arrow} aria-hidden="true">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className={styles.actions}>
                    <Link to="/solutions/" className={styles.allLink}>
                        See all products
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
