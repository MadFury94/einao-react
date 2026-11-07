import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import type { BlockConfig } from "@einao/content";
import { gsap, ScrollTrigger } from "~/lib/motion";
import styles from "./CapabilitiesList.module.css";

const images = [
    "/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
    "/assets/images/Hands mapping a streamlined workflow.png",
    "/assets/images/Graphite monitor with enterprise dashboard.png",
];

export function CapabilitiesList({ config }: { config: BlockConfig }) {
    const root = useRef<HTMLElement>(null);
    const stack = useRef<HTMLDivElement>(null);
    const items = config.items ?? [];
    useLayoutEffect(() => {
        const media = gsap.matchMedia();
        media.add("(min-width: 1199px) and (prefers-reduced-motion: no-preference)", () => {
            const wrap = stack.current!;
            const panels = Array.from(wrap.querySelectorAll<HTMLElement>("[data-capability-panel]"));
            gsap.set(panels, { scale: 1, autoAlpha: 1 });
            const pins: ScrollTrigger[] = [];
            panels.forEach((panel, index) => {
                const last = index === panels.length - 1;
                const tween = gsap.to(panel, {
                    scale: last ? 1 : .8, opacity: last ? 1 : .6, ease: "none",
                    scrollTrigger: {
                        trigger: panel, start: "top 14%", end: "bottom 90%", endTrigger: wrap,
                        scrub: true, pin: true, pinSpacing: false, pinType: "transform",
                        invalidateOnRefresh: true,
                    },
                });
                if (tween.scrollTrigger) pins.push(tween.scrollTrigger);
            });
            const updateVisibility = () => {
                const scroll = window.scrollY;
                let current = 0;
                pins.forEach((pin, index) => { if (scroll >= pin.start) current = index; });
                panels.forEach((panel, index) => { panel.style.visibility = index < current ? "hidden" : "visible"; });
            };
            ScrollTrigger.create({ start: 0, end: "max", onUpdate: updateVisibility, onRefresh: updateVisibility });
            updateVisibility();
            // Orixo uses a two-second expo scroll smoother. Scope that inertia to
            // this showcase so the surrounding page keeps its existing scrolling.
            const position = { y: window.scrollY };
            let destination = position.y;
            let motion: gsap.core.Tween | undefined;
            const stop = () => { motion?.kill(); motion = undefined; destination = window.scrollY; };
            const wheel = (event: WheelEvent) => {
                if (event.ctrlKey || event.defaultPrevented || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
                const bounds = root.current!.getBoundingClientRect();
                if (bounds.top > innerHeight * .14 || bounds.bottom < innerHeight) { stop(); return; }
                const target = event.target as HTMLElement;
                if (target.closest("input, textarea, select, [role=dialog], [data-no-smooth]")) return;
                event.preventDefault();
                const delta = event.deltaY * (event.deltaMode === 1 ? 28 : event.deltaMode === 2 ? innerHeight : 1);
                if (!motion?.isActive()) destination = window.scrollY;
                destination = Math.max(0, Math.min(ScrollTrigger.maxScroll(window), destination + delta));
                position.y = window.scrollY;
                motion?.kill();
                motion = gsap.to(position, { y: destination, duration: 2, ease: "expo", onUpdate: () => window.scrollTo({ top: position.y, behavior: "instant" }) });
            };
            window.addEventListener("wheel", wheel, { passive: false });
            window.addEventListener("pointerdown", stop);
            window.addEventListener("keydown", stop);
            return () => {
                stop();
                window.removeEventListener("wheel", wheel);
                window.removeEventListener("pointerdown", stop);
                window.removeEventListener("keydown", stop);
            };
        }, root);
        return () => media.revert();
    }, [items]);
    if (!items.length) return null;
    return <section ref={root} className={styles.section} aria-label={config.title}>
        <div className={styles.container}><div ref={stack} className={styles.stack}>
        {items.map((item, index) => {
            const image = item.image || images[index % images.length];
            const topics = item.label?.split(/[,|\n]/).map(value => value.trim()).filter(Boolean);
            return <article key={`${item.link?.href}-${index}`} className={styles.panel} data-capability-panel>
                <div className={styles.row}><div className={styles.column}><div className={styles.content}>
                    <p className={styles.number}>{String(index + 1).padStart(3, "0")}. / capability</p>
                    <h2 className={styles.title}>{item.link ? <Link to={item.link.href}>{item.title}</Link> : item.title}</h2>
                    <div className={styles.topics}>{[0, 1].map(column => <ul key={column}>{(topics?.length ? topics : ["Understand", "Design", "Improve", "Deliver"]).filter((_, i) => i % 2 === column).map(topic => <li key={topic}>+ {topic}</li>)}</ul>)}</div>
                    <p className={styles.description}>{item.body}</p>
                    <ul className={styles.links}>
                        {item.link && <li><Link to={item.link.href}>{item.link.label || "Explore"}</Link></li>}
                        <li><Link to="/contact/">Discuss a requirement</Link></li>
                    </ul>
                </div></div>
                <div className={styles.column}><div className={styles.image}>
                    <img src={image} alt="" width="648" height="626" loading="lazy" />
                    <img src={image} alt="" width="648" height="626" loading="lazy" aria-hidden="true" />
                </div></div></div>
            </article>;
        })}
        </div></div>
    </section>;
}
