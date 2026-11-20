import { useState, useEffect, useRef, useId, type CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import styles from "./Header.module.css";

type NavItem = {
    label: string;
    href: string;
    description?: string;
    icon?: React.ReactNode;
};

type NavGroup = {
    label: string;
    href: string;
    items: NavItem[];
};

/* ── Icons ─────────────────────────────────────────────────── */
const IconTerminal = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
);
const IconWorkflow = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" />
        <path d="M6 9v3a3 3 0 003 3h6a3 3 0 003-3V9" />
    </svg>
);
const IconLayers = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
);
const IconServer = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
);
const IconShield = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IconZap = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const IconBuilding = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const IconBriefcase = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
);
const IconCheckCircle = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const IconStar = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const IconMapPin = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const IconUsers = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const IconBarChart = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);
const IconInfo = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

/* ── Nav data ───────────────────────────────────────────────── */
const NAV_LEFT: NavGroup[] = [
    {
        label: "Capabilities",
        href: "/capabilities/",
        items: [
            {
                label: "IT Consulting",
                href: "/capabilities/it-consulting/",
                description: "Decisions grounded in operational reality",
                icon: <IconTerminal />,
            },
            {
                label: "Process Automation",
                href: "/capabilities/business-process-automation/",
                description: "Reduce manual effort, improve how work moves",
                icon: <IconWorkflow />,
            },
            {
                label: "Enterprise Solutions",
                href: "/capabilities/enterprise-solutions/",
                description: "Build systems around defined requirements",
                icon: <IconLayers />,
            },
        ],
    },
    {
        label: "Solutions",
        href: "/solutions/",
        items: [
            {
                label: "Custom Enterprise Systems",
                href: "/solutions/custom-enterprise-systems/",
                description: "Tailored software for your operations",
                icon: <IconServer />,
            },
            {
                label: "IP Pro",
                href: "/solutions/ip-pro/",
                description: "Intellectual property workflow management",
                icon: <IconShield />,
            },
            {
                label: "Fylonn",
                href: "/solutions/fylonn/",
                description: "Document and filing system for organisations",
                icon: <IconZap />,
            },
        ],
    },
    {
        label: "Industries",
        href: "/industries/",
        items: [
            {
                label: "Government",
                href: "/industries/government/",
                description: "Digital services for public institutions",
                icon: <IconBuilding />,
            },
            {
                label: "Business",
                href: "/industries/business/",
                description: "Tools that fit how businesses actually run",
                icon: <IconBriefcase />,
            },
            {
                label: "Regulatory Services",
                href: "/industries/regulatory-services/",
                description: "Compliance and verification systems",
                icon: <IconCheckCircle />,
            },
        ],
    },
];

const NAV_RIGHT: NavGroup[] = [
    {
        label: "Company",
        href: "/company/",
        items: [
            {
                label: "About Einao",
                href: "/about/",
                description: "Our history, vision and journey",
                icon: <IconInfo />,
            },
            {
                label: "Our Work",
                href: "/work/",
                description: "Projects and outcomes we've delivered",
                icon: <IconStar />,
            },
            {
                label: "Insights",
                href: "/insights/",
                description: "Thinking on technology and operations",
                icon: <IconBarChart />,
            },
            {
                label: "Contact Us",
                href: "/contact/",
                description: "Talk to us about your requirement",
                icon: <IconUsers />,
            },
        ],
    },
];

/* ── Dropdown ───────────────────────────────────────────────── */
function Dropdown({ label, href, items, open, onOpen, onClose }: {
    label: string; href: string; items: NavItem[];
    open: boolean; onOpen: () => void; onClose: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const panelId = useId();
    const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
    const scheduleOpen = () => {
        clearTimer();
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) timer.current = setTimeout(onOpen, 80);
    };
    const scheduleClose = () => { clearTimer(); timer.current = setTimeout(onClose, 140); };

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
        const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
        document.addEventListener("mousedown", handler);
        document.addEventListener("keydown", escape);
        return () => { clearTimer(); document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", escape); };
    });

    const cols = items.length <= 3 ? 1 : 2;

    return (
        <div
            ref={ref}
            className={`${styles.navItem} ${open ? styles.navItemOpen : ""}`}
            onMouseEnter={scheduleOpen}
            onMouseLeave={scheduleClose}
            onFocus={() => onOpen()}
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) scheduleClose(); }}
            onKeyDown={event => { if (event.key === "Escape") { onClose(); ref.current?.querySelector("button")?.focus(); } }}
        >
            <button className={styles.navTrigger} aria-expanded={open} aria-controls={panelId} onClick={() => open ? onClose() : onOpen()}>
                {label}
                <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div
                id={panelId}
                className={styles.dropdown}
                style={{ "--dd-cols": cols } as CSSProperties}
                data-open={open}
                inert={!open}
                aria-hidden={!open}
                onMouseEnter={clearTimer}
                onMouseLeave={scheduleClose}
            >
                {items.map((item, index) => (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={styles.dropdownItem}
                        style={{ "--item-index": index + 1 } as CSSProperties}
                        onClick={onClose}
                    >
                        {item.icon && (
                            <span className={styles.dropdownIcon}>{item.icon}</span>
                        )}
                        <span className={styles.dropdownText}>
                            <span className={styles.dropdownLabel}>{item.label}</span>
                            {item.description && (
                                <span className={styles.dropdownDesc}>{item.description}</span>
                            )}
                        </span>
                    </Link>
                ))}
                <div className={styles.dropdownFooter}>
                    <Link to={href} className={styles.viewAll} onClick={onClose}>
                        View all {label.toLowerCase()} <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ── Header ─────────────────────────────────────────────────── */
export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const location = useLocation();
    const toggleRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!mobileOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const dismiss = (event: KeyboardEvent) => {
            if (event.key === "Escape") { setMobileOpen(false); toggleRef.current?.focus(); }
        };
        const desktop = window.matchMedia("(min-width: 931px)");
        const resized = () => { if (desktop.matches) setMobileOpen(false); };
        desktop.addEventListener("change", resized);
        document.addEventListener("keydown", dismiss);
        return () => {
            document.body.style.overflow = previousOverflow;
            desktop.removeEventListener("change", resized);
            document.removeEventListener("keydown", dismiss);
        };
    }, [mobileOpen]);

    useEffect(() => {
        setActiveDropdown(null);
        const darkHero = location.pathname.startsWith("/capabilities") || location.pathname.startsWith("/solutions");
        requestAnimationFrame(() => setScrolled(darkHero ? false : window.scrollY > 20));
    }, [location.pathname]);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler, { passive: true });
        handler();
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <header
            className={`${styles.header} ${mobileOpen ? styles.menuOpen : scrolled || activeDropdown ? styles.scrolled : styles.transparent}`}
            data-scrolled={scrolled}
            onKeyDown={event => {
                if (!mobileOpen || event.key !== "Tab") return;
                const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a, button, summary"))
                    .filter(el => el.getClientRects().length > 0);
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }}
        >
            <div className={styles.inner}>
                <Link to="/" className={styles.logo} aria-label="Einao Solutions — home">
                    <img
                        src={(scrolled || activeDropdown) && !mobileOpen
                            ? "/assets/logos/Einao-Solutions-Logo-05.png"
                            : "/assets/images/einao-solutions-all-white.png"
                        }
                        alt="Einao Solutions"
                        width="140"
                        height="44"
                    />
                </Link>

                <nav className={styles.navLeft} aria-label="Main navigation">
                    {NAV_LEFT.map(group => (
                        <Dropdown key={group.label} label={group.label} href={group.href} items={group.items}
                            open={activeDropdown === group.label}
                            onOpen={() => setActiveDropdown(group.label)}
                            onClose={() => setActiveDropdown(v => v === group.label ? null : v)} />
                    ))}
                </nav>

                <nav className={styles.navRight} aria-label="Secondary navigation">
                    {NAV_RIGHT.map(group => (
                        <Dropdown key={group.label} label={group.label} href={group.href} items={group.items}
                            open={activeDropdown === group.label}
                            onOpen={() => setActiveDropdown(group.label)}
                            onClose={() => setActiveDropdown(v => v === group.label ? null : v)} />
                    ))}
                    <Link to="/contact/" className={styles.cta}>Start a conversation</Link>
                </nav>

                <button
                    ref={toggleRef}
                    className={styles.mobileToggle}
                    aria-controls="mobile-navigation"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen(v => !v)}
                >
                    <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ""}`} />
                    <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ""}`} />
                    <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ""}`} />
                </button>
            </div>

            {mobileOpen && (
                <nav id="mobile-navigation" className={styles.mobileDrawer} aria-label="Mobile navigation">
                    {[...NAV_LEFT, ...NAV_RIGHT].map(group => (
                        <details key={group.label} className={styles.mobileGroup}>
                            <summary className={styles.mobileGroupLabel}>{group.label}</summary>
                            {group.items.map(item => (
                                <Link key={item.href} to={item.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                                    {item.icon && <span className={styles.mobileLinkIcon}>{item.icon}</span>}
                                    {item.label}
                                </Link>
                            ))}
                        </details>
                    ))}
                    <Link to="/contact/" className={styles.mobileCta} onClick={() => setMobileOpen(false)}>
                        Start a conversation
                    </Link>
                </nav>
            )}
        </header>
    );
}
