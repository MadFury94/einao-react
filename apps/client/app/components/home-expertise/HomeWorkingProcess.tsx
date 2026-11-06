import { useRef, useState } from "react";
import type { BlockConfig } from "@einao/content";
import { SectionHeading, SectionLabel } from "./SectionElements";
import { useExpertiseMotion } from "./useExpertiseMotion";
import styles from "./HomeExpertise.module.css";

const steps = [
 { title: "Understand", body: "Clarify the problem, people, workflows, and goals." },
 { title: "Define", body: "Agree requirements, priorities, and solution scope." },
 { title: "Design", body: "Shape processes and systems around real operations." },
 { title: "Build", body: "Develop and integrate the digital tools you need." },
 { title: "Implement & support", body: "Put systems into use, then maintain and improve." },
];

export function HomeWorkingProcess({ config }: { config?: BlockConfig }) {
 const root = useRef<HTMLElement>(null);
 const [active, setActive] = useState(0);
 useExpertiseMotion(root);
 const words = (config?.title ?? "Understand the operation before choosing the technology.").trim().split(/\s+/);
 return <><section ref={root} className={`${styles.section} ${styles.process}`} id="index3-process" data-home-section="approach" aria-labelledby="home-process-title">
  <div className={styles.container}>
   <div className={styles.processHeader}>
    <div><SectionLabel>Our working process</SectionLabel><SectionHeading id="home-process-title" lines={[words.slice(0, 3).join(" "), words.slice(3, 6).join(" "), words.slice(6).join(" ")].filter(Boolean)} /></div>
    <p className={styles.processIntro} data-reveal=".3">We move from understanding your operations to practical implementation, with a clear purpose behind every technology decision.</p>
   </div>
   <ol className={styles.steps}>
    {steps.map((step, i) => <li key={step.title} className={`${styles.step} ${active === i ? styles.active : ""}`} data-reveal={String(i * .2)} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
     <div className={styles.icon}><img src={`/assets/images/home-expertise/icon${i + 1}.svg`} alt="" width="48" height="48" /></div>
     <h3>{step.title}</h3><p>{step.body}</p>
    </li>)}
   </ol>
  </div>
 </section><div className={styles.sectionLine} aria-hidden="true"><img src="/assets/images/home-expertise/sec-line.png" alt="" width="1920" height="21" loading="lazy" /></div></>;
}
