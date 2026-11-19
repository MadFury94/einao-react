import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import styles from "./Header.module.css";

const NAV_LEFT = [
    {
        label: "Capabilities",
        items: [
            { label: "IT Consulting", href: "/capabilities/it-consulting/" },
            { label: "Business Process Automation", href: "/capabilities/business-process-automation/" },
            { label: "Enterprise Solutions", href: "/capabilities/enterprise-solutions/" },
        ],
    },
    {
        label: "Solutions",
        items: [
            { label: "Custom Enterprise Systems", href: "/solutions/custom-enterprise-systems/" },
            { label: "IP Pro", href: "/solutions/ip-pro/" },
            { label: "Fylonn", href: "/solutions/fylonn/" },
            { label: "PayX", href: "/solutions/payx/" },
        ],
    },
    {
        label: "Industries",
        items: [
            { label: "Government", href: "/industries/government/" },
            { label: "Business", href: "/industries/business/" },
            { label: "Regulatory Services", href: "/industries/regulatory-services/" },
        ],
    },
];

const NAV_RIGHT = [
    {
        label: "Company",
        items: [
            { label: "About Einao", href: "/about/" },
            { label: "Our Work", href: "/work/" },
            { label: "Insights", href: "/insights/" },
            { label: "Contact", href: "/contact/" },
        ],
    },
];

function Dropdown({ label, items }: { label: string; items: { label: string; href: string }[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className={styles.navItem}>
            <button
                className={styles.navTrigger}
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen(v => !v)}
            >
                {label}
                <svg
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                    width="12" height="12" viewBox="0 0 12 12"
                    fill="none" aria-hidden="true"
                >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && (
                <div className={styles.dropdown}>
                    {items.map(item => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={styles.dropdownItem}
                            onClick={() => setOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler, { passive: true });
        handler();
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <header
            className={`${styles.header} ${scrolled ? styles.scrolled : styles.transparent}`}
            data-scrolled={scrolled}
        >
            <div className={styles.inner}>
                {/* Logo — white on transparent, coloured on scrolled */}
                <Link to="/" className={styles.logo} aria-label="Einao Solutions — home">
                    <img
                        src={scrolled
                            ? "/assets/logos/Einao-Solutions-Logo-05.png"
                            : "/assets/images/einao-solutions-all-white.png"
                        }
                        alt="Einao Solutions"
                        width="140"
                        height="44"
                    />
                </Link>

                {/* Left nav */}
                <nav className={styles.navLeft} aria-label="Main navigation">
                    {NAV_LEFT.map(group => (
                        <Dropdown key={group.label} label={group.label} items={group.items} />
                    ))}
                </nav>

                {/* Right nav */}
                <nav className={styles.navRight} aria-label="Secondary navigation">
                    {NAV_RIGHT.map(group => (
                        <Dropdown key={group.label} label={group.label} items={group.items} />
                    ))}
                    <Link to="/contact/" className={styles.cta}>
                        Start a conversation
                    </Link>
                </nav>

                {/* Mobile toggle */}
                <button
                    className={styles.mobileToggle}
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen(v => !v)}
                >
                    <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ""}`} />
                    <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ""}`} />
                    <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ""}`} />
                </button>
            </div>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className={styles.mobileDrawer} aria-label="Mobile navigation">
                    {[...NAV_LEFT, ...NAV_RIGHT].map(group => (
                        <div key={group.label} className={styles.mobileGroup}>
                            <p className={styles.mobileGroupLabel}>{group.label}</p>
                            {group.items.map(item => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={styles.mobileLink}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                    <Link to="/contact/" className={styles.mobileCta} onClick={() => setMobileOpen(false)}>
                        Start a conversation
                    </Link>
                </div>
            )}
        </header>
    );
}
