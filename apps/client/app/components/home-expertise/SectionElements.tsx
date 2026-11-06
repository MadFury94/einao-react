import { Link } from "react-router";
import { ArrowIcon } from "../ArrowIcon";
import styles from "./HomeExpertise.module.css";

export function SectionLabel({ children }: { children: string }) {
 return <p className={styles.eyebrow} data-eyebrow><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="var(--lime)" /><path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" /></svg><span className="sr-only">{children}</span><span aria-hidden="true">{Array.from(children).map((char, i) => <span key={i} data-label-char>{char === " " ? "\u00a0" : char}</span>)}</span></p>;
}
export function SectionHeading({ id, lines }: { id: string; lines: string[] }) {
 return <h2 className={styles.title} id={id}><span className="sr-only">{lines.join(" ")}</span><span aria-hidden="true">{lines.map((line, i) => <span key={i} className={i === 0 ? styles.serif : undefined}>{i > 0 && <> <br className={styles.headingBreak} /></>}{line.split(/(\s+)/).map((word, j) => /^\s+$/.test(word) ? word : <span className={styles.word} key={j}>{Array.from(word).map((char, k) => <span data-heading-char key={k}>{char}</span>)}</span>)}</span>)}</span></h2>;
}
export function ContactButton() {
 return <Link className={styles.button} to="/contact/"><span className={styles.arrowLeft}><ArrowIcon /></span><span className={styles.buttonLabel}>Get in touch</span><span className={styles.arrowRight}><ArrowIcon /></span></Link>;
}
