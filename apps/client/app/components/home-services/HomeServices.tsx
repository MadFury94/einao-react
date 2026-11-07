import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { BlockConfig } from "@einao/content";
import { gsap } from "~/lib/motion";
import { ArrowIcon } from "../ArrowIcon";
import styles from "./HomeServices.module.css";

const tags = [["Assess", "Plan", "Guide"], ["Map", "Connect", "Improve"], ["Design", "Build", "Support"]];

export function HomeServices({ config }: { config?: BlockConfig }) {
    const items = config?.items ?? [];
    if (!items.length) return null;
    return <ServicesCarousel key={items.length} config={config!} />;
}

function ServicesCarousel({ config }: { config: BlockConfig }) {
    const items = config.items!;
    // Extra copies let the loop remain continuous even with only three capabilities.
    const group = items.length * Math.ceil(5 / items.length);
    const root = useRef<HTMLElement>(null);
    const viewport = useRef<HTMLDivElement>(null);
    const pointer = useRef<number | null>(null);
    const swiped = useRef(false);
    const [position, setPosition] = useState({ index: group, animate: true });
    const [size, setSize] = useState({ step: 0, visible: 4 });
    const [reduced, setReduced] = useState(true);
    const [interacting, setInteracting] = useState(false);
    const [inView, setInView] = useState(false);
    const [active, setActive] = useState<number | null>(null);
    const current = position.index % items.length;
    const move = (delta: number) => setPosition(previous => ({ index: Math.max(0, Math.min(group * 3 - 5, previous.index + delta)), animate: !reduced }));
    const normalize = () => setPosition(previous => previous.index < group || previous.index >= group * 2 ? { index: group + ((previous.index % group) + group) % group, animate: false } : previous);

    useEffect(() => {
        const preference = matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduced(preference.matches);
        update(); preference.addEventListener("change", update);
        const resize = new ResizeObserver(() => {
            const element = viewport.current;
            if (!element) return;
            const visible = innerWidth >= 1199 ? 4 : innerWidth >= 991 ? 3 : innerWidth >= 767 ? 2 : innerWidth >= 575 ? 1.5 : 1.2;
            setSize({ visible, step: (element.clientWidth + 30) / visible });
        });
        resize.observe(viewport.current!);
        const observer = new IntersectionObserver(entries => setInView(entries[0].isIntersecting), { threshold: .15 });
        observer.observe(root.current!);
        return () => { resize.disconnect(); observer.disconnect(); preference.removeEventListener("change", update); };
    }, []);
    useEffect(() => {
        if (reduced) normalize();
    }, [position.index, reduced]);
    useEffect(() => {
        if (position.animate || reduced) return;
        let next = 0;
        const frame = requestAnimationFrame(() => { next = requestAnimationFrame(() => setPosition(previous => ({ ...previous, animate: true }))); });
        return () => { cancelAnimationFrame(frame); cancelAnimationFrame(next); };
    }, [position.animate, reduced]);
    useEffect(() => {
        if (reduced || interacting || !inView || items.length < 2) return;
        // Reference: 2s autoplay delay followed by a 1.3s transition.
        const timer = setTimeout(() => move(1), 3300);
        return () => clearTimeout(timer);
    }, [position.index, reduced, interacting, inView, items.length]);
    useEffect(() => {
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            const element = root.current!;
            gsap.fromTo(element.querySelectorAll("[data-service-char]"), { clipPath: "inset(0 100% 0 0)", x: -20, opacity: 0 }, { clipPath: "inset(0% 0% -15% 0%)", x: 0, opacity: 1, duration: .8, ease: "power4.out", stagger: .03, scrollTrigger: { trigger: element.querySelector("h2"), start: "top 90%", once: true } });
            gsap.from(element.querySelectorAll("[data-service-card]"), { y: 100, opacity: 0, duration: 1, stagger: .2, delay: .2, scrollTrigger: { trigger: viewport.current, start: "top bottom", once: true } });
            gsap.from(element.querySelector(`.${styles.controls}`), { y: 50, opacity: 0, duration: 1, delay: .3, scrollTrigger: { trigger: element.querySelector(`.${styles.controls}`), start: "top bottom", once: true } });
        }, root);
        media.add("(prefers-reduced-motion: no-preference) and (min-width: 1200px)", () => {
            gsap.from(root.current!.querySelectorAll("[data-service-label]"), { x: 7, opacity: 0, duration: .7, stagger: .2, scrollTrigger: { trigger: root.current!.querySelector(`.${styles.eyebrow}`), start: "top 90%", end: "top 60%", scrub: 1 } });
        }, root);
        return () => media.revert();
    }, []);
    const words = config.title.trim().split(/\s+/);
    return <section ref={root} className={styles.section} data-home-section="capabilities" aria-labelledby="home-services-title" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(root.current?.contains(document.activeElement) ?? false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.heading}>
                    <p className={styles.eyebrow}><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="var(--lime)" /><path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" /></svg><span aria-label="Our services">{Array.from("Our services").map((char, i) => <span data-service-label aria-hidden="true" key={i}>{char === " " ? "\u00a0" : char}</span>)}</span></p>
                    <h2 id="home-services-title" className={styles.title}><span className="sr-only">{config.title}</span><span aria-hidden="true">{words.map((word, i) => <span key={i}><span className={`${styles.word} ${i < 2 ? styles.serif : i >= words.length - 2 ? styles.muted : ""}`}>{Array.from(word).map((char, j) => <span data-service-char key={j}>{char}</span>)}</span>{" "}</span>)}</span></h2>
                </div>
                <div className={styles.controls}>
                    <button type="button" className={styles.navigation} aria-label="Previous service" onClick={() => move(-1)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m14 5-7 7 7 7" /></svg></button>
                    <div className={styles.dots}>{items.map((item, i) => <button type="button" key={item.title} aria-label={`Show ${item.title}`} aria-current={current === i ? "true" : undefined} onClick={() => move(i - current)} />)}</div>
                    <button type="button" className={styles.navigation} aria-label="Next service" onClick={() => move(1)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m10 5 7 7-7 7" /></svg></button>
                </div>
            </div>
            <div ref={viewport} className={styles.viewport} role="region" aria-roledescription="carousel" aria-label="Einao services" onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }} onPointerDown={event => { pointer.current = event.clientX; swiped.current = false; }} onPointerUp={event => { if (pointer.current !== null && Math.abs(event.clientX - pointer.current) > 40) { swiped.current = true; move(event.clientX < pointer.current ? 1 : -1); } pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }} onClickCapture={event => { if (swiped.current) { event.preventDefault(); swiped.current = false; } }}>
                <div className={styles.track} style={{ transform: `translate3d(${-position.index * size.step}px,0,0)`, transitionDuration: position.animate && !reduced ? "1300ms" : "0ms" }} onTransitionEnd={event => { if (event.target === event.currentTarget) normalize(); }}>
                    {Array.from({ length: group * 3 }, (_, slot) => {
                        const i = slot % items.length;
                        const item = items[i];
                        const visible = slot >= position.index && slot < position.index + Math.ceil(size.visible);
                        return <div className={styles.slide} key={slot} style={size.step ? { width: size.step - 30 } : undefined} inert={!visible} aria-hidden={!visible || undefined}>
                            <article data-service-card={slot >= group && slot < group + 4 ? "" : undefined} className={`${styles.card} ${active === i ? styles.active : ""}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
                                <img className={styles.shape} src="/assets/images/home-services/service-shape.png" alt="" loading="lazy" />
                                <span className={styles.number}>{String(i + 1).padStart(3, "0")}.</span>
                                <h3><Link to={item.link?.href ?? "/capabilities/"}>{item.title}</Link></h3>
                                <p>{item.body}</p>
                                <div className={styles.footer}><ul>{(tags[i] ?? ["Plan", "Build", "Support"]).map(tag => <li key={tag}>{tag}</li>)}</ul><Link className={styles.arrow} to={item.link?.href ?? "/capabilities/"} aria-label={`Explore ${item.title}`}><ArrowIcon /></Link></div>
                            </article>
                        </div>;
                    })}
                </div>
            </div>
        </div>
    </section>;
}
