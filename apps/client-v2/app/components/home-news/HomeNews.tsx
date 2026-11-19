import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import styles from "./HomeNews.module.css";

const POSTS = [
    {
        title: "When should an organisation integrate existing systems instead of replacing them?",
        image: "/assets/images/Collaborative technology team in Abuja office.png",
        href: "/insights/",
    },
    {
        title: "Where manual work creates hidden operational costs for institutions.",
        image: "/assets/images/Einao staff working on automation with client.jpg",
        href: "/insights/",
    },
    {
        title: "What organisations should plan for after a digital platform goes live.",
        image: "/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
        href: "/insights/",
    },
    {
        title: "Before you buy software: five questions every organisation should answer",
        image: "/assets/images/Graphite monitor with enterprise dashboard.png",
        href: "/insights/",
    },
    {
        title: "Digitising a broken process does not fix it",
        image: "/assets/images/Hands sketching a business workflow.png",
        href: "/insights/",
    },
];

export function HomeNews() {
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
    }, []);

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
                    {POSTS.map(post => (
                        <article key={post.title} className={styles.card}>
                            <Link to={post.href} className={styles.cardImageLink} tabIndex={-1} aria-hidden="true">
                                <img
                                    className={styles.cardImage}
                                    src={post.image}
                                    alt=""
                                    width="600"
                                    height="450"
                                    loading="lazy"
                                />
                            </Link>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>
                                    <Link to={post.href}>{post.title}</Link>
                                </h3>
                                <Link to={post.href} className={styles.readMore}>
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
