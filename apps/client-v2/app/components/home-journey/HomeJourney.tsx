import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import styles from "./HomeJourney.module.css";

const MILESTONES = [
    {
        years: "2011–2013",
        label: "Foundation Years",
        title: "Established & First Delivery",
        body: "Einao Solutions was founded in 2011. By 2013 we had delivered our first institutional portal — IPO Nigeria — and established ongoing technical support.",
        image: "/assets/images/Collaborative technology team in Abuja office.png",
    },
    {
        years: "2014–2017",
        label: "Building Infrastructure",
        title: "Enterprise Systems",
        body: "We expanded into enterprise system design and delivery, working with government agencies and regulatory bodies on complex operational requirements.",
        image: "/assets/images/Bridging paper records and digital systems.png",
    },
    {
        years: "2018–2021",
        label: "Process Automation",
        title: "Automating Operations",
        body: "Business process automation became a core service as organisations sought to reduce manual effort and connect disparate workflows through technology.",
        image: "/assets/images/Einao staff working on automation with client.jpg",
    },
    {
        years: "2022–2025",
        label: "Digital Expansion",
        title: "Products & Platforms",
        body: "We began developing proprietary platforms — IP Pro, Fylonn, and PayX — alongside continued delivery of bespoke enterprise systems.",
        image: "/assets/images/Graphite monitor with enterprise dashboard.png",
    },
    {
        years: "2025–",
        label: "What's Next",
        title: "Scale & Partnerships",
        body: "Expanding our institutional partnerships and product portfolio across Nigeria and the broader West African market.",
        image: "/assets/images/Calm Green Network in Negative Space (1).png",
    },
];

export function HomeJourney() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [flippedYear, setFlippedYear] = useState<string | null>(null);
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
        <section className={styles.section} aria-labelledby="journey-heading">
            {/* Header row */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.pill}>Our Journey</span>
                    <h2 id="journey-heading" className={styles.heading}>
                        Two decades of growth &amp; innovation.
                    </h2>
                    <p className={styles.subtitle}>
                        From our first institutional portal in 2013 to building
                        platforms that serve organisations across Nigeria.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <Link to="/about/" className={styles.headerBtn}>
                        Our Story
                    </Link>
                </div>
            </div>

            <div className={styles.navigation} role="group" aria-label="Our Journey card navigation">
                <button type="button" className={styles.navButton} aria-label="Previous card" aria-controls="journey-cards" disabled={!canGoBack} onClick={() => scrollCards(-1)}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 12H5m7-7-7 7 7 7" />
                    </svg>
                </button>
                <button type="button" className={styles.navButton} aria-label="Next card" aria-controls="journey-cards" disabled={!canGoForward} onClick={() => scrollCards(1)}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Scrollable cards */}
            <div id="journey-cards" ref={trackRef} className={styles.track}>
                {MILESTONES.map(item => (
                    <article key={item.years} className={styles.card}>
                        <button
                            type="button"
                            className={styles.flip}
                            data-flipped={flippedYear === item.years}
                            aria-pressed={flippedYear === item.years}
                            aria-label={`Details for ${item.label}: ${item.years}. ${item.title}. ${item.body}`}
                            onClick={() => setFlippedYear(current => current === item.years ? null : item.years)}
                            onKeyDown={event => {
                                if (event.key === "Escape") {
                                    setFlippedYear(null);
                                    event.currentTarget.blur();
                                }
                            }}
                        >
                            <span className={styles.cardFront} aria-hidden="true">
                                <img
                                    className={styles.cardImage}
                                    src={item.image}
                                    alt=""
                                    width="290"
                                    height="324"
                                    loading="lazy"
                                />
                            </span>
                            <span className={styles.cardBack} aria-hidden="true">
                                <span className={styles.backLayout}>
                                    <span className={styles.backTop}>
                                        <span className={styles.cardYear}>{item.years}</span>
                                    </span>
                                    <span className={styles.backContent}>
                                        <span className={styles.cardTitle}>{item.title}</span>
                                        <span className={styles.cardBody}>{item.body}</span>
                                    </span>
                                </span>
                            </span>
                        </button>
                        <h3 className={styles.cardLabel}>{item.label}</h3>
                    </article>
                ))}
            </div>
        </section>
    );
}
