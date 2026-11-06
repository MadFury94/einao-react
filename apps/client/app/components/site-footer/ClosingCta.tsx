import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import type { BlockConfig } from "@einao/content";
import { gsap } from "~/lib/motion";
import { ArrowIcon } from "../ArrowIcon";
import styles from "./ClosingCta.module.css";

export function ClosingCta({ config }: { config: BlockConfig }) {
    const root = useRef<HTMLElement>(null);
    const label = config.eyebrow ?? "";
    const words = config.title.trim().split(/\s+/);
    useLayoutEffect(() => {
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            const section = root.current!;
            gsap.from(section.querySelectorAll("[data-cta-char]"), {
                opacity: 0, rotationX: -80, transformOrigin: "center center -10px",
                duration: innerWidth <= 768 ? .3 : .6, ease: "power2.out",
                stagger: { each: .025, from: "center" },
                scrollTrigger: { trigger: section.querySelector("h2"), start: "top 85%", once: true },
            });
            gsap.from(section.querySelector("[data-cta-button]"), {
                opacity: 0, yPercent: 100, duration: 1, delay: .3, ease: "power1.out",
                scrollTrigger: { trigger: section.querySelector("[data-cta-button]"), start: "top bottom", once: true },
            });
        }, root);
        media.add("(min-width: 1200px) and (prefers-reduced-motion: no-preference)", () => {
            gsap.from(root.current!.querySelectorAll("[data-cta-label]"), {
                opacity: 0, x: 7, duration: .7, stagger: .2,
                scrollTrigger: { trigger: root.current!.querySelector("p"), start: "top 90%", end: "top 60%", scrub: 1 },
            });
        }, root);
        return () => media.revert();
    }, [config.title, config.eyebrow]);
    const word = (text: string) => <span className={styles.word}>{Array.from(text).map((char, i) => <span data-cta-char key={i}>{char}</span>)}</span>;
    return <section ref={root} className={styles.section} data-site-section="lets-talk" aria-labelledby="site-closing-title">
        <div className={styles.container}>
            <p className={styles.eyebrow}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="var(--lime)" /><path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" /></svg>
                <span className="sr-only">{label}</span><span aria-hidden="true">{Array.from(label).map((char, i) => <span data-cta-label key={i}>{char === " " ? "\u00a0" : char}</span>)}</span>
            </p>
            <h2 id="site-closing-title" className={styles.title}>
                <span className="sr-only">{config.title}</span>
                <span aria-hidden="true">{words.map((text, index) => <span key={index}><span className={index === 0 ? styles.serif : undefined}>{word(text)}</span>{" "}{index === 0 && config.image && <><span className={styles.inlineImage}><img src={config.image} alt="" width="199" height="106" loading="lazy" /></span>{" "}</>}</span>)}</span>
            </h2>
            <div className={styles.buttonWrap} data-cta-button>
                <Link className={styles.button} to={config.cta?.href ?? "/contact/"}>
                    <span className={styles.arrowLeft}><ArrowIcon /></span>
                    <span className={styles.buttonLabel}>{config.cta?.label ?? "Start a Conversation"}</span>
                    <span className={styles.arrowRight}><ArrowIcon /></span>
                </Link>
            </div>
        </div>
    </section>;
}
