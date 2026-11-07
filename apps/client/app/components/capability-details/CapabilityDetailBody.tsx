import { useId, useLayoutEffect, useRef, useState } from "react";
import { capabilityDetailDefaults, type PageBlock } from "@einao/content";
import { gsap } from "~/lib/motion";
import styles from "./CapabilityDetailBody.module.css";

function Paragraphs({ text }: { text: string }) {
    return <>{text.split(/\n\n+/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</>;
}

export function CapabilityDetailBody({ blocks }: { blocks: PageBlock[] }) {
    const root = useRef<HTMLDivElement>(null);
    const id = useId();
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [openQuestion, setOpenQuestion] = useState<number | null>(0);
    const defaults = capabilityDetailDefaults[blocks[0]?.page_slug ?? ""];
    const visible = blocks.filter(block => block.visible);
    const hero = visible.find(block => block.block_type === "hero")?.config;
    const editorials = visible.filter(block => block.block_type === "editorial");
    const scope = editorials.find(block => !/question/i.test(block.config.title) && block.config.eyebrow !== "capability-delivery")?.config;
    const faq = editorials.find(block => /question/i.test(block.config.title))?.config;
    const processBlock = blocks.find(block => block.block_type === "approach");
    const process = processBlock ? (processBlock.visible ? processBlock.config : undefined) : defaults?.process;
    const visualBlock = blocks.find(block => block.config.eyebrow === "capability-delivery");
    const visual = visualBlock ? (visualBlock.visible ? visualBlock.config : undefined) : defaults?.visual;
    const steps = process?.items ?? [];

    useLayoutEffect(() => {
        const element = root.current;
        const rail = element?.querySelector<HTMLElement>("[data-process-numbers]");
        const cards = Array.from(element?.querySelectorAll<HTMLElement>("[data-process-step]") ?? []);
        if (!rail || !cards.length) return;
        const align = () => {
            const points = cards.map(card => card.offsetTop + card.offsetHeight / 2 - 24);
            rail.style.top = `${points[0]}px`;
            rail.style.height = `${points[points.length - 1] - points[0] + 48}px`;
            Array.from(rail.children).forEach((child, i) => {
                const marker = child as HTMLElement;
                marker.style.position = "absolute";
                marker.style.top = `${points[i] - points[0]}px`;
            });
        };
        const observer = new ResizeObserver(align);
        cards.forEach(card => observer.observe(card));
        align();
        return () => observer.disconnect();
    }, [steps]);

    useLayoutEffect(() => {
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            root.current?.querySelectorAll<HTMLElement>("[data-detail-parallax]").forEach(image => {
                // Reference data-speed=.8: move the image more slowly than its frame.
                gsap.fromTo(image, { yPercent: -10 }, {
                    yPercent: 10, ease: "none", scrollTrigger: {
                        trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: true,
                    }
                });
            });
        }, root);
        return () => media.revert();
    }, []);

    return <div ref={root} className={styles.details} data-capability-details>
        <section className={styles.overview} aria-labelledby={`${id}-overview`}>
            <div className={styles.container}>
                <div className={styles.intro}>
                    <div className={styles.introCopy}>
                        <h2 id={`${id}-overview`}>{scope?.title ?? hero?.title}</h2>
                        {(scope?.body?.length ? scope.body : hero?.body)?.map((text, i) => <Paragraphs text={text} key={i} />)}
                    </div>
                    <ul className={styles.checklist} aria-label="Areas we support">
                        {scope?.items?.map(item => <li key={item.title}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>{item.title}</li>)}
                    </ul>
                </div>
                <div className={styles.banner}><img data-detail-parallax src={scope?.image || defaults?.banner} alt={scope?.imageAlt || ""} width="1656" height="700" loading="lazy" /></div>
                {steps.length > 0 && <div className={styles.process}>
                    <div className={styles.numbers} data-process-numbers aria-hidden="true">{steps.map((_, i) => <span key={i}>{String(i + 1).padStart(2, "0")}</span>)}</div>
                    <div className={styles.row}>
                        <div className={styles.half}>
                            <p className={styles.countCaption}>{process?.body?.[0] || "Our practical approach from understanding to delivery"}</p>
                            <div className={styles.processImage}><img src={process?.image || defaults?.processImage} alt={process?.imageAlt || ""} width="600" height="540" loading="lazy" /></div>
                        </div>
                        <div className={styles.half}>
                            <h2 className={styles.processTitle}>{process?.title}</h2>
                            {steps.map((step, i) => <div key={step.title} data-process-step tabIndex={0} className={`${styles.step} ${activeStep === i ? styles.active : ""}`} onMouseEnter={() => setActiveStep(i)} onFocus={() => setActiveStep(i)}>
                                <h3>{step.title}</h3><Paragraphs text={step.body} />
                            </div>)}
                        </div>
                    </div>
                </div>}
            </div>
        </section>
        {visual?.items?.length ? <section className={styles.visuals} aria-labelledby={`${id}-delivery`}>
            <div className={styles.container}>
                <h2 className={styles.visualTitle} id={`${id}-delivery`}>{visual.title}</h2>
                <div className={styles.row}>{visual.items.map((item, i) => <div className={styles.half} key={item.title}>
                    <div className={styles.visualCopy}><h3>{item.title}</h3><Paragraphs text={item.body} /></div>
                    <div className={styles.visualImage}><img data-detail-parallax src={item.image || (i ? defaults?.processImage : defaults?.banner)} alt="" width="816" height="600" loading="lazy" /></div>
                </div>)}</div>
            </div>
        </section> : null}
        {faq?.items?.length ? <section className={styles.faq} aria-labelledby={`${id}-faq`}>
            <div className={styles.container}>
                <div className={styles.faqHeading}><p>Read common questions</p><h2 id={`${id}-faq`}>Quick answers before<br />the work begins.</h2></div>
                <div className={styles.faqRow}>
                    <div className={styles.faqImage}><img src={faq.image || defaults?.faqImage} alt={faq.imageAlt || ""} width="660" height="750" loading="lazy" /></div>
                    <div className={styles.accordion}>{faq.items.map((item, i) => <div className={styles.question} key={item.title}>
                        <h3><button type="button" id={`${id}-question-${i}`} aria-expanded={openQuestion === i} aria-controls={`${id}-answer-${i}`} onClick={() => setOpenQuestion(openQuestion === i ? null : i)}>{item.title}<span aria-hidden="true">{openQuestion === i ? "×" : "+"}</span></button></h3>
                        <div className={`${styles.answer} ${openQuestion === i ? styles.open : ""}`} id={`${id}-answer-${i}`} role="region" aria-labelledby={`${id}-question-${i}`} aria-hidden={openQuestion !== i} inert={openQuestion !== i}><div><Paragraphs text={item.body} /></div></div>
                    </div>)}</div>
                </div>
            </div>
        </section> : null}
    </div>;
}
