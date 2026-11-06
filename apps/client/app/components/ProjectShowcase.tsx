import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import type { BlockConfig } from "@einao/content";
import { gsap, ScrollTrigger } from "~/lib/motion";
import { ArrowIcon } from "./ArrowIcon";
import styles from "./home-portfolio/HomePortfolio.module.css";

const engagement = [
    { title: "IT consulting for institutional operations", image: "consulting.png" },
    { title: "IPO Nigeria portal development", image: "digital-platform.png" },
    { title: "Ongoing technical support & maintenance", image: "technical-support.jpg" },
    { title: "Portal optimisation & upgrades", image: "improvements.png" },
];

export function ProjectShowcase({ proof }: { proof?: BlockConfig }) {
    const root = useRef<HTMLElement>(null);
    const isIpo = proof?.items?.length === 1 && /ipo nigeria/i.test(proof.items[0].title);
    const projects = isIpo ? engagement.map(item => ({ ...item, image: `/assets/images/home-portfolio/${item.image}`, label: "IPO Nigeria", href: proof?.cta?.href ?? "/work/ipo-nigeria-portal/" })) : (proof?.items ?? []).map(item => ({ title: item.title, label: item.year ? `[${item.year}]` : item.label ?? "Selected work", image: item.image ?? "/assets/images/home-portfolio/digital-platform.png", href: item.link?.href ?? proof?.cta?.href ?? "/work/" }));
    const title = isIpo ? "Our work. Real impact." : proof?.title ?? "Our work. Real impact.";
    const words = title.trim().split(/\s+/);
    useLayoutEffect(() => {
        if (!root.current) return;
        const media = gsap.matchMedia();
        media.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
            const section = root.current!;
            const layout = section.querySelector<HTMLElement>(`.${styles.layout}`)!;
            const viewport = section.querySelector<HTMLElement>(`.${styles.projectsViewport}`)!;
            const track = section.querySelector<HTMLElement>(`.${styles.projects}`)!;
            const cards = Array.from(track.children) as HTMLElement[];
            let offsets: number[] = [];
            let travel = 0;
            const intro = section.querySelector<HTMLElement>(`.${styles.intro}`)!;
            // Reparent the fixed stage to body to escape the route animation containing block.
            // Measure on refresh so resizing and font loading cannot shorten the sequence.
            const measure = () => {
                const sectionStyle = getComputedStyle(section);
                const padding = parseFloat(sectionStyle.paddingTop) + parseFloat(sectionStyle.paddingBottom);
                const cardHeight = Math.max(...Array.from(track.children, card => (card as HTMLElement).offsetHeight));
                const stageHeight = Math.min(track.scrollHeight, Math.max(intro.offsetHeight, cardHeight, innerHeight - padding));
                gsap.set(layout, { height: stageHeight });
                gsap.set(viewport, { height: stageHeight, overflow: "clip" });
                offsets = cards.map(card => card.offsetTop - cards[0].offsetTop);
                travel = offsets.at(-1) ?? 0;
                return travel;
            };
            measure();
            const sequence = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => `+=${Math.max(1, measure())}`,
                    pin: section,
                    pinType: "fixed",
                    pinReparent: true,
                    pinSpacing: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                    onRefreshInit: () => { measure(); },
                },
            });
            // Each card stops at the same top edge; later cards slide over it.
            // Only cards animate: the fixed stage and introduction never translate.
            cards.slice(1).forEach((card, index) => {
                const cardIndex = index + 1;
                sequence.fromTo(card, { y: 0 }, {
                    y: () => -offsets[cardIndex],
                    duration: 1,
                    ease: progress => Math.min(1, progress * travel / Math.max(1, offsets[cardIndex])),
                }, 0);
            });
        }, root);
        let resizeTimer: ReturnType<typeof setTimeout>;
        const refreshAfterResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
        };
        window.addEventListener("resize", refreshAfterResize);
        let alive = true;
        document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
        return () => { alive = false; clearTimeout(resizeTimer); window.removeEventListener("resize", refreshAfterResize); media.revert(); };
    }, [title, projects.length]);
    if (!projects.length) return null;
    return <section ref={root} className={styles.section} aria-labelledby="project-showcase-title" data-home-section="institutional-experience">
        <div className={styles.container}><div className={styles.layout}>
            <div className={styles.projectsViewport}><ul className={styles.projects} aria-label={isIpo ? "Four aspects of the IPO Nigeria engagement" : "Selected projects"}>
                {projects.map((item, i) => <li className={styles.card} key={`${item.title}-${i}`}>
                    <Link className={styles.image} to={item.href} tabIndex={-1} aria-hidden="true"><img src={item.image} alt="" width="393" height="323" loading="eager" /><img src={item.image} alt="" width="393" height="323" loading="eager" /></Link>
                    <div className={styles.cardContent}><span className={styles.label}>{item.label}</span><h3><Link to={item.href}>{item.title}</Link></h3><Link className={styles.projectLink} to={item.href} aria-label={`Explore ${item.title}${isIpo ? " - IPO Nigeria case study" : ""}`}><ArrowIcon /></Link></div>
                </li>)}
            </ul></div>
            <div className={styles.introColumn}><div className={styles.intro}>
                <p className={styles.eyebrow}><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="var(--lime)" /><path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" /></svg><span className="sr-only">Portfolio showcase</span><span aria-hidden="true">{Array.from("Portfolio showcase").map((char, i) => <span key={i} data-portfolio-label>{char === " " ? "\u00a0" : char}</span>)}</span></p>
                <h2 id="project-showcase-title" className={styles.title}><span className="sr-only">{title}</span><span aria-hidden="true">{words.map((word, i) => <span key={i}><span className={`${styles.word} ${i < 2 ? styles.serif : ""}`}>{Array.from(word).map((char, j) => <span key={j} data-portfolio-char>{char}</span>)}</span>{" "}</span>)}</span></h2>
                <p className={styles.description} data-portfolio-reveal=".3">{isIpo ? "Portal delivery and support for IPO Nigeria." : proof?.body?.[0]}</p>
                <div data-portfolio-reveal=".5"><Link className={styles.button} to="/work/"><span className={styles.arrowLeft}><ArrowIcon /></span><span className={styles.buttonLabel}>Explore our work</span><span className={styles.arrowRight}><ArrowIcon /></span></Link></div>
            </div></div>
        </div></div>
    </section>;
}
