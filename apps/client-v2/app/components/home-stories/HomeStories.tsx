import { Link } from "react-router";
import styles from "./HomeStories.module.css";

const STORIES = [
    {
        title: "IPO Nigeria — Portal delivery and support",
        label: "Government",
        image: "/assets/images/home-portfolio/digital-platform.png",
        href: "/work/ipo-nigeria-portal/",
    },
    {
        title: "Enterprise consulting and process improvement",
        label: "Enterprise",
        image: "/assets/images/home-portfolio/consulting.png",
        href: "/work/",
    },
    {
        title: "Ongoing technical support and system optimisation",
        label: "Support",
        image: "/assets/images/home-portfolio/technical-support.jpg",
        href: "/work/",
    },
];

export function HomeStories() {
    return (
        <section className={styles.section} aria-labelledby="stories-heading">
            <div className={styles.inner}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.pill}>Case Studies</span>
                    <h2 id="stories-heading" className={styles.heading}>
                        Our work delivering real outcomes<br />
                        for institutions across Nigeria.
                    </h2>
                </div>

                {/* Grid */}
                <div className={styles.grid}>
                    {STORIES.map(story => (
                        <Link key={story.href + story.title} to={story.href} className={styles.card}>
                            <img
                                className={styles.cardImage}
                                src={story.image}
                                alt=""
                                width="600"
                                height="400"
                                loading="lazy"
                            />
                            <div className={styles.cardOverlay} aria-hidden="true" />
                            <div className={styles.cardContent}>
                                <span className={styles.cardLabel}>{story.label}</span>
                                <p className={styles.cardTitle}>{story.title}</p>
                            </div>
                            {/* Arrow instead of play — it's a case study not a video */}
                            <span className={styles.cardArrow} aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
