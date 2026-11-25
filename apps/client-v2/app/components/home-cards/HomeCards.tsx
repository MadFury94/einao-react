import { Link } from "react-router";
import styles from "./HomeCards.module.css";
import type { Collection } from '~/lib/catalog';

export function HomeCards({ collection }: { collection: Collection | null }) {
    const cards = (collection?.entries ?? []).filter(item => item.link).map(item => ({
        category: item.title,
        title: item.body,
        image: item.image || '/assets/seo/einao-social-card.jpg',
        href: item.link!.href,
    }));

    return (
        <section className={styles.section} aria-labelledby="cards-heading">
            <div className={styles.inner}>
                {/* Left: heading + description + CTA */}
                <div className={styles.left}>
                    <span className={styles.pill}>Discover Einao</span>
                    <h2 id="cards-heading" className={styles.heading}>
                        Practical expertise.<br />Better operations.
                    </h2>
                    <p className={styles.subtitle}>
                        Technology advice, streamlined processes, and systems built around your organisation.
                    </p>
                    <Link to="/capabilities/" className={styles.cta}>
                        Explore our capabilities
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M7 17 17 7M7 7h10v10" />
                        </svg>
                    </Link>
                </div>

                {/* Right: 3 photo cards */}
                <div className={styles.track}>
                    {cards.length === 0 && (
                        <p>{collection ? "No capabilities have been published yet." : "Capabilities are temporarily unavailable."}</p>
                    )}
                    {cards.map(card => (
                        <Link key={card.href} to={card.href} className={styles.card} aria-label={card.title ?? undefined}>
                            <img
                                className={styles.cardImage}
                                src={card.image}
                                alt=""
                                loading="lazy"
                            />
                            <div className={styles.cardOverlay} aria-hidden="true" />
                            <div className={styles.cardContent}>
                                <span className={styles.cardCategory}>{card.category}</span>
                                <p className={styles.cardTitle}>{card.title}</p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.cardExplore}>Explore</span>
                                    <span className={styles.cardArrow} aria-hidden="true">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M7 17 17 7M7 7h10v10" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
