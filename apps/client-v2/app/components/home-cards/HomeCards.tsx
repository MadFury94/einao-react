import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import styles from "./HomeCards.module.css";

import type { Collection } from '~/lib/catalog';
export function HomeCards({ collection }: { collection: Collection | null }) {
    const cards = (collection?.entries ?? []).filter(item => item.link).map(item => ({ category: item.title, title: item.body, image: item.image || '/assets/seo/einao-social-card.jpg', href: item.link!.href }));
    const trackRef = useRef<HTMLDivElement>(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const updateNavigation = () => {
            setCanGoBack(track.scrollLeft > 1);
            setCanGoForward(track.scrollLeft < track.scrollWidth - track.clientWidth - 1);
        };
        updateNavigation();
        track.addEventListener("scroll", updateNavigation, { passive: true });
        const observer = new ResizeObserver(updateNavigation);
        observer.observe(track);
        for (const card of track.children) observer.observe(card);
        return () => {
            track.removeEventListener("scroll", updateNavigation);
            observer.disconnect();
        };
    }, [collection]);

    const scrollCards = (direction: number) => {
        const track = trackRef.current;
        const card = track?.firstElementChild;
        if (!track || !card) return;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        track.scrollBy({
            left: direction * (card.getBoundingClientRect().width + gap),
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
    };
    return (
        <section className={styles.section} aria-labelledby="cards-heading">
            <div className={styles.header}>
                <span className={styles.pill}>Discover Einao</span>
                <h2 id="cards-heading" className={styles.heading}>
                    Explore how Einao delivers<br />
                    practical technology outcomes.
                </h2>
                <div className={styles.navigation} role="group" aria-label="Discover Einao card navigation">
                    <button type="button" className={styles.navButton} aria-label="Previous card" aria-controls="discover-cards" disabled={!canGoBack} onClick={() => scrollCards(-1)}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M19 12H5m7-7-7 7 7 7" />
                        </svg>
                    </button>
                    <button type="button" className={styles.navButton} aria-label="Next card" aria-controls="discover-cards" disabled={!canGoForward} onClick={() => scrollCards(1)}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Scrollable track */}
            <div id="discover-cards" ref={trackRef} className={styles.track} role="list">
                {cards.length === 0 && <p role="status">{collection ? "No capabilities have been published yet." : "Capabilities are temporarily unavailable."}</p>}
                {cards.map(card => (
                    <Link
                        key={card.href}
                        to={card.href}
                        className={styles.card}
                        role="listitem"
                        aria-label={card.title}
                    >
                        <img
                            className={styles.cardImage}
                            src={card.image}
                            alt=""
                            width="400"
                            height="560"
                            loading="lazy"
                        />
                        <div className={styles.cardOverlay} aria-hidden="true" />
                        <div className={styles.cardContent}>
                            <span className={styles.cardCategory}>{card.category}</span>
                            <p className={styles.cardTitle}>{card.title}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
