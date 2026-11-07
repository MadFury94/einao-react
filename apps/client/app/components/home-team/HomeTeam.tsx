import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "~/lib/motion";
import { defaultLeadershipProfile, type LeadershipProfile } from "@einao/content";
import styles from "./HomeTeam.module.css";

export function HomeTeam({ leader }: { leader: LeadershipProfile }) {
    const root = useRef<HTMLElement>(null);

    useEffect(() => {
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            const el = root.current!;
            gsap.from(el.querySelector("[data-head]"), {
                opacity: 0, y: 40, duration: 0.8, ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 80%", once: true },
            });
            gsap.from(el.querySelector("[data-image]"), {
                opacity: 0, x: -60, duration: 1, ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 78%", once: true },
            });
            gsap.from(el.querySelector("[data-list]"), {
                opacity: 0, x: 60, duration: 1, ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 78%", once: true },
            });
        }, root);
        return () => media.revert();
    }, []);

    return (
        <section ref={root} className={styles.section} aria-labelledby="leader-title">
            <div className={styles.container}>
                <div className={styles.grid}>

                    {/* Left: portrait image */}
                    <div className={styles.imageCol} data-image>
                        <div className={styles.imageWrap}>
                            <img
                                src={leader.image || defaultLeadershipProfile.image}
                                alt={leader.imageAlt || leader.name}
                                width="446"
                                height="714"
                                className={styles.portrait}
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Right: eyebrow + heading + person row */}
                    <div className={styles.contentCol} data-list>
                        <div data-head>
                            <p className={styles.eyebrow}>
                                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                    <circle cx="8" cy="8" r="8" fill="var(--lime)" />
                                    <path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" />
                                </svg>
                                Our leader
                            </p>
                            <h2 id="leader-title" className={styles.title}>
                                <em className={styles.serif}>Starts with</em>{" "}the right person
                            </h2>
                        </div>

                        {/* Team list — one entry for now, expandable */}
                        <ul className={styles.list} aria-label="Leadership">
                            <li className={`${styles.item} ${styles.itemActive}`}>
                                <div className={styles.itemMain}>
                                    <div className={styles.itemInfo}>
                                        <h3 className={styles.itemName}>
                                            <Link to="/about/">{leader.name}</Link>
                                        </h3>
                                        <span className={styles.itemRole}>{leader.credentials}</span>
                                    </div>
                                    <span className={styles.rolePill}>{leader.role}</span>
                                    <div className={styles.socials} aria-label="Social links">
                                        <a href="https://www.linkedin.com/in/collins-nkwoji/" className={styles.socialLink} target="_blank" rel="noreferrer" aria-label="Collins Nkwoji on LinkedIn">
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                                                <path d="M5.2 8.3H1.7V22h3.5V8.3ZM3.45 2A2.05 2.05 0 1 0 3.4 6.1 2.05 2.05 0 0 0 3.45 2ZM22.3 14.15c0-4.12-2.2-6.04-5.13-6.04-2.36 0-3.42 1.3-4.01 2.22V8.3H9.66V22h3.5v-6.78c0-1.79.34-3.52 2.56-3.52 2.19 0 2.22 2.05 2.22 3.65V22h3.5l.86-7.85Z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </li>
                        </ul>

                        {/* Bio if available */}
                        {leader.bio && (
                            <p className={styles.bio}>{leader.bio}</p>
                        )}

                        <Link className={styles.cta} to="/about/">
                            <span className={styles.ctaArrowLeft}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m4 8 8 0M8 4l4 4-4 4" /></svg>
                            </span>
                            <span className={styles.ctaLabel}>Meet our founder</span>
                            <span className={styles.ctaArrowRight}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m4 8 8 0M8 4l4 4-4 4" /></svg>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
