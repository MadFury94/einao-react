import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import type { FooterContent, SiteConfig } from "@einao/content";
import { gsap, ScrollTrigger } from "~/lib/motion";
import { ArrowIcon } from "../ArrowIcon";
import styles from "./SiteFooter.module.css";

export function SiteFooter({ site, year, content }: { site: SiteConfig; year: number; content: FooterContent }) {
    const root = useRef<HTMLElement>(null);
    const legal = site.footer.find(group => group.title.toLowerCase() === "legal");
    const groups = site.footer.filter(group => group !== legal);
    useLayoutEffect(() => {
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            const footer = root.current!;
            gsap.from(footer.querySelectorAll("[data-footer-word]"), {
                opacity: 0, y: 20, duration: .6, stagger: .035, ease: "power2.out",
                scrollTrigger: { trigger: footer.querySelector("h2"), start: "top 90%", once: true },
            });
            footer.querySelectorAll<HTMLElement>("[data-footer-reveal]").forEach(target => {
                gsap.from(target, { opacity: 0, y: 35, duration: 1, delay: Number(target.dataset.footerReveal), ease: "power1.out", scrollTrigger: { trigger: target, start: "top bottom", once: true } });
            });
        }, root);
        let alive = true;
        document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
        return () => { alive = false; media.revert(); };
    }, [site, content]);
    const words = (text: string) => text.split(/\s+/).map((word, i) => <span key={i}><span className={styles.word} data-footer-word>{word}</span>{" "}</span>);
    return <footer ref={root} className={styles.footer} data-site-footer>
        <div className={styles.panel}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.left}>
                        <h2 className={styles.heading}><span className={styles.serif}>{words(content.headingAccent)}</span>{words(content.heading)}</h2>
                        <Link className={styles.insightsLink} to={content.action.href} data-footer-reveal=".3"><span>{content.action.label}</span><span className={styles.actionIcon}><ArrowIcon /></span></Link>
                        <div className={styles.contact} data-footer-reveal=".5">
                            <div className={styles.contactLinks}>
                                {content.phone && <span>Call: <a href={`tel:${content.phone.replace(/[^+\d]/g, "")}`}>{content.phone}</a></span>}
                                <span>Mail: <a href={`mailto:${content.email}`}>{content.email}</a></span>
                            </div>
                            <address>{site.address}</address>
                            {!!site.locations?.length && <p>{site.locations.join(" / ")}</p>}
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.brandRow}>
                            <Link to="/" aria-label={`${site.name} home`} data-footer-reveal=".3"><img className={styles.logo} src={site.logo} alt={site.name} width="180" height="58" loading="lazy" /></Link>
                            <p data-footer-reveal=".5">{site.tagline}</p>
                        </div>
                        <div className={styles.navigation}>
                            {groups.map((group, i) => <nav key={group.title} aria-label={`Footer ${group.title}`} data-footer-reveal={String(.2 + i * .1)}>
                                <h3>{group.title}</h3><ul>{group.links.map(link => <li key={link.href}><Link to={link.href}>{link.label}</Link></li>)}</ul>
                            </nav>)}
                        </div>
                        {!!content.socialLinks.length && <nav className={styles.social} aria-label="Social media">{content.socialLinks.map(link => <a key={link.href} href={link.href} aria-label={link.label}>{link.label}</a>)}</nav>}
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p>© {year} <strong>{content.copyrightName}.</strong> {content.copyrightNotice}</p>
                    {legal && <nav aria-label="Footer legal"><ul>{legal.links.map(link => <li key={link.href}><Link to={link.href}>{link.label}</Link></li>)}</ul></nav>}
                </div>
            </div>
        </div>
    </footer>;
}
