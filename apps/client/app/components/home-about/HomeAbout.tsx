import { useEffect, useId, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "~/lib/motion";
import { AnimatedCounter } from "../AnimatedCounter";
import { ArrowIcon } from "../ArrowIcon";
import styles from "./HomeAbout.module.css";

const title = "Helping organisations through practical technology solutions";
const principles = ["Understand before building", "Solve the actual problem", "Design for real operations"];

/** About 3's geometry and motion, scoped to React rather than the template runtime. */
export function HomeAbout() {
 const root = useRef<HTMLElement>(null);
 const circleId = useId();
 useEffect(() => {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
   const element = root.current!;
   element.querySelectorAll<HTMLElement>("[data-about-reveal]").forEach(target => {
    gsap.from(target, { opacity: 0, yPercent: 100, duration: 1, delay: Number(target.dataset.aboutReveal), ease: "power1.out", scrollTrigger: { trigger: target, start: "top bottom", once: true } });
   });
   gsap.from(element.querySelectorAll("[data-about-char]"), { opacity: 0, rotationX: -80, transformOrigin: "center center -10px", duration: innerWidth <= 768 ? .3 : .6, ease: "power2.out", stagger: { each: .025, from: "center" }, scrollTrigger: { trigger: element.querySelector("h2"), start: "top 85%", once: true } });
   gsap.from(element.querySelectorAll("[data-about-label]"), { opacity: 0, x: 7, duration: .7, stagger: .2, scrollTrigger: { trigger: element.querySelector(`.${styles.eyebrow}`), start: "top 90%", end: "top 60%", scrub: 1 } });
   // Local equivalent of the reference image's data-speed=".8" effect.
   gsap.fromTo(element.querySelector(`.${styles.photo}`), { yPercent: -10, scale: 1.25 }, { yPercent: 10, scale: 1.25, ease: "none", scrollTrigger: { trigger: element.querySelector(`.${styles.image}`), start: "top bottom", end: "bottom top", scrub: true } });
  }, root);
  return () => media.revert();
 }, []);
 return <section ref={root} className={styles.section} id="about" data-home-section="about" aria-labelledby="home-about-title">
  <div className={styles.container}><div className={styles.grid}>
   <div data-about-reveal=".3"><div className={styles.image}>
    <img className={styles.photo} src="/assets/images/home-about/einao-team.jpg" alt="Technology specialists collaborating in an office" loading="lazy" />
    <div className={styles.circle}>
     <svg className={styles.circleText} viewBox="0 0 124 124" aria-hidden="true"><defs><path id={circleId} d="M62,62 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs><text><textPath href={`#${circleId}`} textLength="282">EXPLORE EINAO � ABOUT OUR COMPANY � </textPath></text></svg>
     <Link className={styles.circleLink} to="/about/" aria-label="About Einao Solutions"><ArrowIcon /></Link>
    </div>
   </div></div>
   <div className={styles.content}>
    <p className={styles.eyebrow}><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="var(--lime)" /><path d="M8 1.5 10 6l4.5 2-4.5 2L8 14.5 6 10 1.5 8 6 6Z" fill="white" /></svg><span aria-label="About us">{Array.from("About us").map((char, i) => <span key={i} data-about-label aria-hidden="true">{char === " " ? "\u00a0" : char}</span>)}</span></p>
    <h2 id="home-about-title" className={styles.title} aria-label={title}>{title.split(" ").map((word, i) => <span key={word} aria-hidden="true"><span className={`${styles.word} ${i < 2 ? styles.serif : ""}`}>{Array.from(word).map((char, j) => <span key={j} data-about-char>{char}</span>)}</span>{" "}</span>)}</h2>
    <p className={styles.description} data-about-reveal=".3">Einao Solutions helps organisations understand operational challenges and respond with practical technology. Our work connects consulting, process improvement, automation, and digital solution delivery.</p>
    <div className={styles.details}>
     <div data-about-reveal=".3">
      <ul className={styles.list}>{principles.map(item => <li key={item}><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="currentColor" /><path d="m5.8 10 2.7 2.7 5.7-5.7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>{item}</li>)}</ul>
      <Link className={styles.button} to="/about/"><span className={styles.arrowLeft}><ArrowIcon /></span><span className={styles.buttonLabel}>More about Einao</span><span className={styles.arrowRight}><ArrowIcon /></span></Link>
     </div>
     <div className={styles.counter} data-about-reveal=".5"><p>Established since</p><div className={styles.number}><AnimatedCounter value={2011} duration={4000} /></div></div>
    </div>
   </div>
  </div></div>
 </section>;
}
