import { Link } from "react-router";
import styles from "./Footer.module.css";

const NAV_COLUMNS = [
    {
        heading: "Capabilities",
        links: [
            { label: "IT Consulting", href: "/capabilities/it-consulting/" },
            { label: "Business Process Automation", href: "/capabilities/business-process-automation/" },
            { label: "Enterprise Solutions", href: "/capabilities/enterprise-solutions/" },
        ],
    },
    {
        heading: "Solutions",
        links: [
            { label: "Custom Enterprise Systems", href: "/solutions/custom-enterprise-systems/" },
            { label: "IP Pro", href: "/solutions/ip-pro/" },
            { label: "Fylonn", href: "/solutions/fylonn/" },
            { label: "PayX", href: "/solutions/payx/" },
        ],
    },
    {
        heading: "Industries",
        links: [
            { label: "Government", href: "/industries/government/" },
            { label: "Business", href: "/industries/business/" },
            { label: "Regulatory Services", href: "/industries/regulatory-services/" },
        ],
    },
    {
        heading: "Company",
        links: [
            { label: "About Einao", href: "/about/" },
            { label: "Our Work", href: "/work/" },
            { label: "Insights", href: "/insights/" },
            { label: "Contact Us", href: "/contact/" },
        ],
    },
];

const SOCIALS = [
    {
        label: "LinkedIn",
        href: "https://linkedin.com/company/einao",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        label: "Twitter / X",
        href: "https://twitter.com/einaosolutions",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
        ),
    },
    {
        label: "Instagram",
        href: "https://instagram.com/einaosolutions",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
];

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            {/* Main footer body */}
            <div className={styles.body}>
                <div className={styles.inner}>
                    {/* Left: brand column */}
                    <div className={styles.brand}>
                        <Link to="/" aria-label="Einao Solutions — home" className={styles.brandLogo}>
                            <img src="/assets/logos/Einao-Solutions-Logo-05.png" alt="Einao Solutions" width="140" height="44" />
                        </Link>
                        <div className={styles.socials}>
                            {SOCIALS.map(s => (
                                <a key={s.label} href={s.href} className={styles.socialLink} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                        <p className={styles.regulatory}>
                            Einao Solutions Ltd<br />
                            Registered in Nigeria
                        </p>
                    </div>

                    {/* Right: nav columns */}
                    <nav className={styles.columns} aria-label="Footer navigation">
                        {NAV_COLUMNS.map(col => (
                            <div key={col.heading} className={styles.column}>
                                <h3 className={styles.columnHeading}>{col.heading}</h3>
                                <ul className={styles.columnList}>
                                    {col.links.map(link => (
                                        <li key={link.href}>
                                            <Link to={link.href} className={styles.columnLink}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Bottom bar */}
            <div className={styles.bottom}>
                <div className={styles.bottomInner}>
                    <p className={styles.copyright}>Copyright 2011 – {year} Einao Solutions</p>
                    <div className={styles.legal}>
                        <Link to="/privacy/" className={styles.legalLink}>Privacy Policy</Link>
                        <span className={styles.legalDivider} aria-hidden="true">|</span>
                        <Link to="/terms/" className={styles.legalLink}>Terms of Use</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
