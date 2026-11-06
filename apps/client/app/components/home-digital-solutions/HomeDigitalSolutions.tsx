import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { gsap } from "~/lib/motion";
import styles from "./HomeDigitalSolutions.module.css";

const features = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M14 2C7.373 2 2 7.373 2 14s5.373 12 12 12 12-5.373 12-12S20.627 2 14 2Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 14l3.5 3.5L19 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: "Operational understanding first",
        body: "We assess how work actually moves through your organisation before deciding on a technology response. The right solution starts with a clear picture of the requirement.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <rect x="16" y="3" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <rect x="3" y="16" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M20.5 16v9M16 20.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        ),
        title: "Practical digital systems",
        body: "From workflow automation to enterprise portals and integrations, we build systems shaped around the way your organisation works — not the other way around.",
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M4 20V10l10-6 10 6v10l-10 6-10-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M14 26V14M4 10l10 4 10-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
        ),
        title: "Support beyond launch",
        body: "Technology creates lasting value when it is maintained and improved over time. We provide ongoing technical support, optimisation, and upgrades where included in the engagement.",
    },
];

export function HomeDigitalSolutions() {
    const root = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            const el = root.current!;
            gsap.from(el.querySelectorAll("[data-ds-reveal]"), {
                opacity: 0, y: 50, duration: 0.8, stagger: 0.15, ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 80%", once: true },
            });
            gsap.from(el.querySelector("[data-ds-image]"), {
                opacity: 0, x: 60, duration: 1, ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 75%", once: true },
            });
        }, root);
        return () => media.revert();
    }, []);

    return (
        <section ref={root} className={styles.section} aria-labelledby="ds-title">
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Left: content */}
                    <div className={styles.content}>
                        <p className={styles.eyebrow} data-ds-reveal>
                            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                <circle cx="8" cy="8" r="8" fill="var(--lime)" />
                                <path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" />
                            </svg>
                            Technology that delivers
                        </p>
                        <h2 id="ds-title" className={styles.title} data-ds-reveal>
                            <em className={styles.serif}>Digital solutions</em>{" "}
                            for real operational needs.
                        </h2>
                        <ul className={styles.featureList} aria-label="Our approach">
                            {features.map((feature, i) => (
                                <li
                                    key={feature.title}
                                    className={`${styles.feature} ${activeIndex === i ? styles.active : ""}`}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    data-ds-reveal
                                >
                                    <div className={styles.featureIcon}>{feature.icon}</div>
                                    <div className={styles.featureBody}>
                                        <h3>{feature.title}</h3>
                                        <p>{feature.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div data-ds-reveal>
                            <Link className={styles.button} to="/capabilities/">
                                <span className={styles.arrowLeft}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m4 8 8 0M8 4l4 4-4 4" /></svg>
                                </span>
                                <span className={styles.buttonLabel}>Explore our capabilities</span>
                                <span className={styles.arrowRight}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m4 8 8 0M8 4l4 4-4 4" /></svg>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Right: image */}
                    <div className={styles.imageWrap} data-ds-image>
                        <img
                            className={styles.mainImage}
                            src="/assets/images/Nigerian IT Consultants Reviewing a Laptop.png"
                            alt="Einao team working with clients on technology solutions"
                            width="640"
                            height="580"
                            loading="lazy"
                        />
                        <div className={styles.accentCard}>
                            <strong>Since 2013</strong>
                            <span>Institutional digital services</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
