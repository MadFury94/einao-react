import { useRef, type ReactNode } from "react";
import { Link } from "react-router";
import type { BlockConfig } from "@einao/content";
import { ArrowIcon } from "../ArrowIcon";
import { SectionLabel } from "../home-expertise/SectionElements";
import { useExpertiseMotion } from "../home-expertise/useExpertiseMotion";
import styles from "./HomeOfferings.module.css";

const productImages: Record<string, string> = {
    payx: "/assets/images/Hands mapping a streamlined workflow.png",
    fylonn: "/assets/images/Graphite monitor with enterprise dashboard.png",
    "ip pro": "/assets/images/Nigerian IT Consultants Reviewing a Laptop.png",
};

function OfferingSection({ config, kind, children }: { config: BlockConfig; kind: "solutions" | "audiences"; children: ReactNode }) {
    const root = useRef<HTMLElement>(null);
    useExpertiseMotion(root);
    const words = config.title.trim().split(/\s+/);
    const label = config.eyebrow?.replace(/^\d+\s*\/\s*/, "") || (kind === "solutions" ? "Our solutions" : "Who we work with");
    return <section ref={root} className={`${styles.section} ${kind === "audiences" ? styles.audiences : ""}`} data-home-section={kind} aria-labelledby={`home-${kind}-title`}>
        <div className={`${styles.container} ${kind === "audiences" ? styles.audienceLayout : ""}`}>
            <div className={styles.header}>
                <div>
                    <SectionLabel>{label}</SectionLabel>
                    <h2 className={styles.title} id={`home-${kind}-title`}>
                        <span className="sr-only">{config.title}</span>
                        <span aria-hidden="true">{words.map((word, i) => <span key={i}><span className={`${styles.word} ${i < 2 ? styles.serif : ""}`}>{Array.from(word).map((char, j) => <span data-heading-char key={j}>{char}</span>)}</span>{" "}</span>)}</span>
                    </h2>
                </div>
                {!!config.body?.length && <div className={styles.intro} data-reveal=".2">{config.body.map(text => <p key={text}>{text}</p>)}</div>}
            </div>
            {children}
        </div>
    </section>;
}

export function HomeSolutions({ config }: { config?: BlockConfig }) {
    if (!config?.items?.length) return null;
    return <OfferingSection config={config} kind="solutions">
        <ul className={styles.products}>
            {config.items.map((item, i) => {
                const image = item.image || productImages[item.title.toLowerCase()] || productImages.fylonn;
                const badge = item.badge || (item.title.toLowerCase() === "payx" ? "Coming soon" : undefined);
                return <li className={styles.product} key={item.title} data-reveal={String(.15 + i * .1)}>
                    <Link className={styles.productLink} to={item.link?.href ?? "/solutions/"} aria-label={item.link?.label ?? `Explore ${item.title}`}>
                        <div className={styles.image}>
                            <img src={image} alt="" width="900" height="620" loading="lazy" />
                            <img src={image} alt="" width="900" height="620" loading="lazy" aria-hidden="true" />
                            {badge && <span className={styles.badge}>{badge}</span>}
                        </div>
                        <div className={styles.productMeta}><span>{item.label?.replace(/\s*\/\s*\d+$/, "") ?? "Digital solution"}</span><span aria-hidden="true">[{String(i + 1).padStart(2, "0")}]</span></div>
                        <div className={styles.productHeading}><h3>{item.title}</h3><span className={styles.arrow} aria-hidden="true"><ArrowIcon /></span></div>
                        <p className={styles.productCopy}>{item.body}</p>
                        <span className={styles.explore}>{item.link?.label ?? "Explore solution"}<ArrowIcon /></span>
                    </Link>
                </li>;
            })}
        </ul>
    </OfferingSection>;
}

export function HomeAudiences({ config }: { config?: BlockConfig }) {
    if (!config?.items?.length) return null;
    return <OfferingSection config={config} kind="audiences">
        <ol className={styles.audienceList}>
            {config.items.map((item, i) => <li key={item.title} data-reveal={String(.15 + i * .1)}>
                <Link className={styles.audienceLink} to={item.link?.href ?? "/industries/"}>
                    <span className={styles.number} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <div className={styles.audienceContent}><h3>{item.title}</h3><p>{item.body}</p></div>
                    <span className={styles.arrow} aria-hidden="true"><ArrowIcon /></span>
                </Link>
            </li>)}
        </ol>
    </OfferingSection>;
}
