import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import styles from "./HomeNews.module.css";

import type { Insight } from "~/lib/insights.server";
export function HomeNews({ posts, unavailable = false }: { posts: Insight[]; unavailable?: boolean }) {
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
    }, [posts]);

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
        <section className={styles.section} aria-labelledby="news-heading">
            <div className={styles.inner}>
                {/* Left column */}
                <div className={styles.left}>
                    <span className={styles.pill}>News &amp; Insights</span>
                    <h2 id="news-heading" className={styles.heading}>
                        News & Announcements
                    </h2>
                    <p className={styles.subtitle}>
                        The latest updates, perspectives,<br />
                        and announcements from<br />
                        Einao Solutions.
                    </p>
                    <Link to="/insights/" className={styles.allLink}>
                        View all insights
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Right: scrollable cards */}
                <div className={styles.carousel}>
                <div className={styles.navigation} role="group" aria-label="News card navigation">
                    <button type="button" className={styles.navButton} aria-label="Previous card" aria-controls="news-cards" disabled={!canGoBack} onClick={() => scrollCards(-1)}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M19 12H5m7-7-7 7 7 7" />
                        </svg>
                    </button>
                    <button type="button" className={styles.navButton} aria-label="Next card" aria-controls="news-cards" disabled={!canGoForward} onClick={() => scrollCards(1)}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12h14m-7-7 7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <div id="news-cards" ref={trackRef} className={styles.track}>
                    {posts.length === 0 && <p role="status">{unavailable ? "Insights are temporarily unavailable. Please try again later." : "No insights have been published yet."}</p>}
                    {posts.map(post => (
                        <article key={post.id} className={styles.card}>
                            <Link to={`/insights/${post.slug}/`} className={styles.cardImageLink} tabIndex={-1} aria-hidden="true">
                                <img
                                    className={styles.cardImage}
                                    src={post.featured_image_url || "/assets/seo/einao-social-card.jpg"}
                                    alt=""
                                    width="600"
                                    height="450"
                                    loading="lazy"
                                />
                            </Link>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>
                                    <Link to={`/insights/${post.slug}/`}>{post.title}</Link>
                                </h3>
                                <Link to={`/insights/${post.slug}/`} className={styles.readMore}>
                                    Read full post
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
                </div>
            </div>
        </section>
    );
}
