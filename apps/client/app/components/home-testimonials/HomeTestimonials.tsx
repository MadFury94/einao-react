import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "~/lib/motion";
import styles from "./HomeTestimonials.module.css";

const DATA = [
    {
        quote: "Einao brought a clear understanding of our operational requirements and delivered a portal that continues to support our institutional processes reliably. Their ongoing technical support has been consistent over many years.",
        author: "Commercial Law Department",
        role: "Federal Ministry of Industry, Trade & Investment",
        avatar: "/assets/about-reference/team-1.jpg",
    },
    {
        quote: "The team took time to understand how our workflows operated before proposing any solution. The result was a system that reflected our actual processes rather than a generic tool we had to adapt to.",
        author: "IT Director",
        role: "Government Institution",
        avatar: "/assets/about-reference/team-2.jpg",
    },
    {
        quote: "What stood out was their willingness to define requirements properly before development began. That clarity reduced cost and the system has needed far fewer changes after launch.",
        author: "Operations Manager",
        role: "Regulatory Organisation",
        avatar: "/assets/about-reference/team-3.jpg",
    },
];

// Duplicate for infinite loop: [...DATA, ...DATA, ...DATA]
const CARDS = [...DATA, ...DATA, ...DATA];
const N = DATA.length;
// Start in the middle copy so we can scroll in both directions
const START = N;

export function HomeTestimonials() {
    const root = useRef<HTMLElement>(null);
    const track = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(START); // index in CARDS
    const busy = useRef(false);
    const activeIndex = useRef(START);
    const paused = useRef(false);
    const cardW = useRef(0);
    const gapW = useRef(0);

    // Keep the current card centred when the viewport changes size.
    useEffect(() => {
        const element = track.current;
        if (!element) return;
        const measure = () => {
            const slide = element.querySelector<HTMLElement>("[data-slide]");
            if (!slide) return;
            cardW.current = slide.offsetWidth;
            gapW.current = parseFloat(getComputedStyle(element).columnGap) || 0;
            gsap.killTweensOf(element);
            busy.current = false;
            gsap.set(element, {
                x: -(activeIndex.current * (cardW.current + gapW.current))
                    + (element.parentElement!.offsetWidth - cardW.current) / 2,
            });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element.parentElement!);
        return () => { observer.disconnect(); gsap.killTweensOf(element); };
    }, []);

    const slideTo = useCallback((targetIdx: number) => {
        if (busy.current || !track.current) return;
        busy.current = true;

        const cw = track.current.parentElement!.offsetWidth;
        const sw = cardW.current;
        const gap = gapW.current;
        const offset = -(targetIdx * (sw + gap)) + (cw - sw) / 2;

        gsap.to(track.current, {
            x: offset,
            duration: 0.7,
            ease: "power3.inOut",
            onComplete: () => {
                // Jump to middle copy if at edges (seamless loop)
                let jumped = targetIdx;
                if (targetIdx < N) jumped = targetIdx + N;
                if (targetIdx >= N * 2) jumped = targetIdx - N;
                if (jumped !== targetIdx) {
                    const jumpOffset = -(jumped * (sw + gap)) + (cw - sw) / 2;
                    gsap.set(track.current, { x: jumpOffset });
                    activeIndex.current = jumped;
                    setActive(jumped);
                } else {
                    setActive(targetIdx);
                }
                busy.current = false;
            },
        });
        activeIndex.current = targetIdx;
        setActive(targetIdx);
    }, []);

    const next = useCallback(() => slideTo(active + 1), [active, slideTo]);
    const prev = useCallback(() => slideTo(active - 1), [active, slideTo]);

    // Autoplay
    useEffect(() => {
        const t = setInterval(() => {
            if (!paused.current) next();
        }, 4500);
        return () => clearInterval(t);
    }, [next]);

    // Scroll reveal
    useEffect(() => {
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from(root.current!.querySelector("[data-head]"), {
                opacity: 0, y: 40, duration: 0.8, ease: "power2.out",
                scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
            });
        }, root);
        return () => media.revert();
    }, []);

    return (
        <section
            ref={root}
            className={styles.section}
            aria-labelledby="t-title"
            onMouseEnter={() => { paused.current = true; }}
            onMouseLeave={() => { paused.current = false; }}
        >
            <div className={styles.container}>
                <div data-head>
                    <p className={styles.eyebrow}>
                        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                            <circle cx="8" cy="8" r="8" fill="var(--lime)" />
                            <path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" />
                        </svg>
                        Customer reviews
                    </p>
                    <h2 id="t-title" className={styles.title}>
                        <em className={styles.serif}>Testimonials</em>{" "}From Clients
                    </h2>
                </div>
            </div>

            {/* Viewport */}
            <div className={styles.viewport}>
                {/* Infinite track */}
                <div ref={track} className={styles.track}>
                    {CARDS.map((t, i) => {
                        const isActive = i === active;
                        return (
                            <div
                                key={i}
                                data-slide
                                className={`${styles.card} ${isActive ? styles.cardActive : styles.cardSide}`}
                                aria-hidden={!isActive}
                            >
                                {/* Arrow inside left side card */}
                                {i === active - 1 && (
                                    <button type="button" className={styles.arrowBtn} onClick={prev} aria-label="Previous">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 5-7 7 7 7" /></svg>
                                    </button>
                                )}
                                <div className={styles.quoteChar}>"</div>
                                <p className={styles.quoteText}>{t.quote}</p>
                                <div className={`${styles.author} ${isActive ? styles.authorCentre : ""}`}>
                                    <img src={t.avatar} alt="" width="75" height="75" className={styles.avatar} />
                                    <div>
                                        <strong>{t.author}</strong>
                                        <span>{t.role}</span>
                                    </div>
                                </div>
                                {/* Arrow inside right side card */}
                                {i === active + 1 && (
                                    <button type="button" className={styles.arrowBtn} onClick={next} aria-label="Next">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 7 7-7 7" /></svg>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className={styles.mobileControls}>
                <button type="button" className={styles.arrowBtn} onClick={prev} aria-label="Previous testimonial">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
                </button>
                <span>{(active % N) + 1} / {N}</span>
                <button type="button" className={styles.arrowBtn} onClick={next} aria-label="Next testimonial">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
                </button>
            </div>
        </section>
    );
}
