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
            <div className={styles.header}>
                <span className={styles.pill}>Discover Einao</span>
                <h2 id="cards-heading" className={styles.heading}>
                    Explore how Einao delivers<br />
                    practical technology outcomes.
                </h2>
            </div>

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
                            <span className={styles.cardArrow} aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14m-7-7 7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
