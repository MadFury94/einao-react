import { useRef } from "react";
import { Link } from "react-router";
import { ContactButton, SectionHeading, SectionLabel } from "./SectionElements";
import { useExpertiseMotion } from "./useExpertiseMotion";
import styles from "./HomeExpertise.module.css";

export function HomeWhyChooseUs() {
    const root = useRef<HTMLElement>(null);
    useExpertiseMotion(root);
    return <section ref={root} className={`${styles.section} ${styles.why}`} data-home-section="why-choose-us" aria-labelledby="home-why-title">
        <div className={styles.container}><div className={styles.whyGrid}>
            <div className={styles.left}>
                <div className={styles.mainImage} data-reveal=".3"><img data-parallax src="/assets/images/process/our-process.jpg" alt="Team collaborating around a laptop" width="651" height="488" loading="lazy" /></div>
                <div className={styles.proofPanel} data-reveal=".5">
                    <div className={styles.proofCopy}><p>We connect operational understanding with practical delivery, from improving workflows to building and supporting the systems your organisation needs.</p><ContactButton /></div>
                </div>
            </div>
            <div className={styles.right}>
                <SectionLabel>Why choose us</SectionLabel>
                <SectionHeading id="home-why-title" lines={["Understanding your", "operations. Delivering", "the right technology."]} />
                <div className={styles.values}>
                    <div className={styles.value} data-reveal=".3"><img src="/assets/images/home-expertise/feature-icon-1.svg" alt="" width="33" height="33" /><h3>Our mission</h3><p>Digital solutions that simplify operations, improve processes, and help organisations work more effectively.</p></div>
                </div>
                <div className={styles.bottomGrid}>
                    <Link className={styles.experience} to="/work/ipo-nigeria-portal/" data-reveal=".3"><img src="/assets/images/home-expertise/award.png" alt="" width="105" height="92" /><p><b>IPO Nigeria</b><br />Delivery and support<br />since 2013.</p></Link>
                    <div className={styles.smallImage} data-reveal=".5"><img src="/assets/images/home-expertise/workflow.png" alt="Mapping a business workflow" width="470" height="206" loading="lazy" /></div>
                </div>
            </div>
        </div></div>
    </section>;
}
