import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "~/lib/motion";
import type { Insight } from "~/routes/home";
import styles from "./HomeNews.module.css";

function formatDate(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function HomeNews({ posts }: { posts: Insight[] }) {
    const root = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!root.current) return;
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            const el = root.current!;
            const head = el.querySelector("[data-head]");
            const left = el.querySelector("[data-left]");
            const rightItems = el.querySelectorAll("[data-right-item]");
            if (head) gsap.from(head, { opacity: 0, y: 40, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
            if (left) gsap.from(left, { opacity: 0, x: -50, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 75%", once: true } });
            if (rightItems.length) gsap.from(rightItems, { opacity: 0, x: 50, duration: 0.8, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 75%", once: true } });
        }, root);
        return () => media.revert();
    }, [posts.length]);

    const [featured, ...rest] = posts;
    if (!featured) return null;

    return (
        <section ref={root} className={styles.section} aria-labelledby="news-title">
            <div className={styles.container}>

                {/* Header row */}
                <div className={styles.header} data-head>
                    <div className={styles.headerLeft}>
                        <p className={styles.eyebrow}>
                            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                <circle cx="8" cy="8" r="8" fill="var(--lime)" />
                                <path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" />
                            </svg>
                            Our insights
                        </p>
                        <h2 id="news-title" className={styles.title}>
                            <em className={styles.serif}>Better systems</em>{" "}begin with better questions
                        </h2>
                    </div>
                    <div className={styles.headerRight}>
                        <p>Practical perspectives on technology, operations, and digital change.</p>
                        <Link className={styles.exploreLink} to="/insights/">
                            <span className={styles.exploreLinkText}>
                                <span>Explore more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7 7 10 10M17 7v10H7" /></svg></span>
                                <span>Explore more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7 7 10 10M17 7v10H7" /></svg></span>
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Articles grid */}
                <div className={styles.grid}>

                    {/* Left: featured large article */}
                    <div className={styles.featuredCard} data-left>
                        <Link className={styles.featuredImage} to={`/insights/${featured.slug}/`} tabIndex={-1} aria-hidden="true">
                            {featured.featured_image_url
                                ? <><img src={featured.featured_image_url} alt="" loading="lazy" /><img src={featured.featured_image_url} alt="" loading="lazy" aria-hidden="true" /></>
                                : <div className={styles.imgPlaceholder} />}
                        </Link>
                        <div className={styles.featuredContent}>
                            <div className={styles.meta}>
                                {featured.categories[0] && <Link className={styles.categoryPill} to="/insights/">{featured.categories[0].name}</Link>}
                                <span className={styles.date}>{formatDate(featured.published_at)}</span>
                            </div>
                            <h3 className={styles.featuredTitle}>
                                <Link to={`/insights/${featured.slug}/`}>{featured.title}</Link>
                            </h3>
                            <Link className={styles.readMore} to={`/insights/${featured.slug}/`}>
                                Read more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7 7 10 10M17 7v10H7" /></svg>
                            </Link>
                        </div>
                    </div>

                    {/* Right: 2 smaller articles stacked */}
                    <div className={styles.sideList}>
                        {rest.map((post) => (
                            <div key={post.id} className={styles.sideCard} data-right-item>
                                <Link className={styles.sideImage} to={`/insights/${post.slug}/`} tabIndex={-1} aria-hidden="true">
                                    {post.featured_image_url
                                        ? <><img src={post.featured_image_url} alt="" loading="lazy" /><img src={post.featured_image_url} alt="" loading="lazy" aria-hidden="true" /></>
                                        : <div className={styles.imgPlaceholder} />}
                                </Link>
                                <div className={styles.sideContent}>
                                    <div className={styles.meta}>
                                        {post.categories[0] && <Link className={styles.categoryPill} to="/insights/">{post.categories[0].name}</Link>}
                                        <span className={styles.date}>{formatDate(post.published_at)}</span>
                                    </div>
                                    <h3 className={styles.sideTitle}>
                                        <Link to={`/insights/${post.slug}/`}>{post.title}</Link>
                                    </h3>
                                    <Link className={styles.readMore} to={`/insights/${post.slug}/`}>
                                        Read more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7 7 10 10M17 7v10H7" /></svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
