import { ArrowIcon } from "./ArrowIcon";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import type { SiteConfig, NavChild, NavFeatured } from "@einao/content";
import { ActionLink } from "./primitives";

// ── Constants ────────────────────────────────────────────────────────────────
const MEGA_THRESHOLD = 2;
const HOVER_OPEN_DELAY = 80;
const HOVER_CLOSE_DELAY = 140;

// ── Nav enrichment ───────────────────────────────────────────────────────────
const navEnrich: Record<string, Partial<NavChild>> = {
	"/capabilities/it-consulting/": { icon: "compass", description: "Technology decisions grounded in operational reality." },
	"/capabilities/business-process-automation/": { icon: "workflow", description: "Reduce manual effort and improve how work moves." },
	"/capabilities/enterprise-solutions/": { icon: "layout", description: "Build digital systems around defined requirements." },
	"/solutions/payx/": { icon: "credit-card", description: "Structured digital payment operations.", badge: "Coming soon" },
	"/solutions/fylonn/": { icon: "layers", description: "Application and process management platform." },
	"/solutions/ip-pro/": { icon: "shield-check", description: "Intellectual property application management." },
	"/solutions/custom-enterprise-systems/": { icon: "boxes", description: "Tailored digital systems for complex requirements." },
	"/industries/government/": { icon: "landmark", description: "Digital systems for public institutions." },
	"/industries/business/": { icon: "building", description: "Technology that helps businesses scale operations." },
	"/industries/regulatory-services/": { icon: "clipboard", description: "Clearer processes for structured service delivery." },
};

// ── Featured aside data ──────────────────────────────────────────────────────
const navFeatured: Record<string, NavFeatured> = {
	"/capabilities/": {
		eyebrow: "HOW WE WORK",
		title: "Consult. Automate. Build.",
		body: "We understand the requirement first — then define and deliver the right technology response.",
		href: "/capabilities/",
		linkLabel: "Explore capabilities",
	},
	"/solutions/": {
		eyebrow: "CASE STUDY",
		title: "IPO Nigeria Portal",
		body: "Consulting. Portal development. Continued support since 2013.",
		href: "/work/ipo-nigeria-portal/",
		linkLabel: "Read the case study",
	},
};

// ── Inline icon paths ────────────────────────────────────────────────────────
const iconPaths: Record<string, string> = {
	compass: `<path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>`,
	workflow: `<rect x="3" y="3" width="7" height="5" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><path d="M6.5 8v3M17.5 8v3"/><rect x="3" y="16" width="7" height="5" rx="1"/><path d="M6.5 11a5 5 0 0 0 5 5h.5"/><path d="M17.5 11v10"/>`,
	layout: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>`,
	"credit-card": `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>`,
	layers: `<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>`,
	"shield-check": `<path d="M12 2 3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2z"/><path d="m9 12 2 2 4-4"/>`,
	boxes: `<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>`,
	landmark: `<line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>`,
	building: `<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01"/>`,
	clipboard: `<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>`,
};

function InlineIcon({ name }: { name?: string }) {
	if (!name || !iconPaths[name]) return null;
	return (
		<svg
			width="20" height="20" viewBox="0 0 24 24"
			fill="none" stroke="currentColor"
			strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
			aria-hidden="true"
			dangerouslySetInnerHTML={{ __html: iconPaths[name] }}
		/>
	);
}

function ChevronIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M2 4l4 4 4-4" />
		</svg>
	);
}

export function Header({ site }: { site: SiteConfig }) {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [panelOpen, setPanelOpen] = useState(false);
	const [openPanel, setOpenPanel] = useState<string | null>(null);
	const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
	const [scrolled, setScrolled] = useState(false);

	const header = useRef<HTMLElement>(null);
	const toggle = useRef<HTMLButtonElement>(null);
	const sidebarToggle = useRef<HTMLButtonElement>(null);
	const drawerClose = useRef<HTMLButtonElement>(null);
	const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const location = useLocation();

	const isHeroPage =
		location.pathname === "/" ||
		location.pathname.startsWith("/about") ||
		location.pathname.startsWith("/capabilities") ||
		location.pathname.startsWith("/solutions") ||
		location.pathname.startsWith("/work") ||
		location.pathname.startsWith("/insights") ||
		location.pathname.startsWith("/industries") ||
		location.pathname.startsWith("/contact");

	const headerState = isHeroPage && !scrolled && openPanel === null && !drawerOpen
		? "transparent"
		: "solid";

	useEffect(() => {
		const update = () => setScrolled(window.scrollY >= 8);
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, []);

	useEffect(() => {
		const el = header.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			el.style.setProperty("--header-h", `${entry.contentRect.height}px`);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		setDrawerOpen(false);
		setPanelOpen(false);
		setOpenPanel(null);
		setOpenMobileGroup(null);
	}, [location.pathname]);

	function cancelTimers() {
		if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
		if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
	}

	function scheduleOpen(href: string) {
		cancelTimers();
		openTimer.current = setTimeout(() => {
			setOpenPanel(href);
		}, HOVER_OPEN_DELAY);
	}

	function scheduleClose() {
		cancelTimers();
		closeTimer.current = setTimeout(() => setOpenPanel(null), HOVER_CLOSE_DELAY);
	}

	function closePanel() {
		cancelTimers();
		setOpenPanel(null);
	}

	useEffect(() => {
		const closeOnClick = (e: MouseEvent) => {
			const t = e.target;
			if (!(t instanceof Element)) return;
			if (!t.closest(".menu-toggle") && !t.closest(".primary-nav")) setDrawerOpen(false);
			if (!t.closest(".sidebar-toggle") && !t.closest(".einao-offcanvas")) setPanelOpen(false);
		};
		const closeOnEscape = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			if (panelOpen) { e.preventDefault(); setPanelOpen(false); sidebarToggle.current?.focus(); return; }
			if (openPanel) { e.preventDefault(); closePanel(); return; }
			if (drawerOpen) { e.preventDefault(); setDrawerOpen(false); toggle.current?.focus(); }
		};
		document.addEventListener("click", closeOnClick);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("click", closeOnClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [drawerOpen, panelOpen, openPanel]);

	useEffect(() => { if (panelOpen) drawerClose.current?.focus(); }, [panelOpen]);

	return (
		<header
			ref={header}
			className={["site-header", panelOpen ? "drawer-open" : ""].filter(Boolean).join(" ")}
			data-header={headerState}
		>
			<div className="container header-inner">
				<Link className="brand" to="/" aria-label="Einao Solutions home">
					<img
						src={headerState === "transparent" ? "/assets/images/einao-solutions-all-white.png" : site.logo}
						alt="Einao"
						width="160" height="52"
					/>
				</Link>

				<button
					ref={toggle}
					className={`menu-toggle ${drawerOpen ? "is-open" : ""}`}
					aria-expanded={drawerOpen}
					aria-controls="primary-navigation"
					onClick={() => setDrawerOpen(v => !v)}
				>
					<span className="menu-toggle-bars" aria-hidden="true"><span /><span /><span /></span>
					<span className="sr-only">{drawerOpen ? "Close menu" : "Open menu"}</span>
				</button>

				<nav
					id="primary-navigation"
					className={drawerOpen ? "primary-nav is-open" : "primary-nav"}
					aria-label="Primary navigation"
				>
					{site.navigation.map((item) => {
						const children = item.children ?? [];
						const isMega = children.length >= MEGA_THRESHOLD;
						const isOpen = openPanel === item.href;
						const groupId = item.href.replace(/\//g, "").toLowerCase();
						const panelId = `mega-${groupId}`;
						const featured = navFeatured[item.href];
						const enriched: NavChild[] = children.map(c => ({ ...c, ...navEnrich[c.href] }));

						if (!isMega) {
							return (
								<Link
									key={item.href}
									to={item.href}
									prefetch="intent"
									aria-current={location.pathname === item.href ? "page" : undefined}
								>
									{item.label}
								</Link>
							);
						}

						return (
							<div
								key={item.href}
								className="nav-group"
								data-group={groupId}
								onMouseEnter={() => scheduleOpen(item.href)}
								onMouseLeave={scheduleClose}
							>
								{/* Desktop: label link + chevron button */}
								<Link to={item.href} className="nav-label" prefetch="intent">
									{item.label}
								</Link>
								<button
									type="button"
									className="nav-chevron-btn"
									aria-expanded={isOpen}
									aria-controls={panelId}
									onClick={() => setOpenPanel(v => v === item.href ? null : item.href)}
								>
									<span className="sr-only">Open {item.label} menu</span>
									<ChevronIcon />
								</button>

								{/* Invisible hover bridge */}
								<div className="mega-bridge" aria-hidden="true" />

								{/* Mega panel */}
								<div
									id={panelId}
									className={`mega-panel${isOpen ? " is-open" : ""}`}
									role="region"
									aria-label={`${item.label} navigation`}
									onMouseEnter={cancelTimers}
									onMouseLeave={scheduleClose}
									{...(isOpen ? {} : { inert: true as unknown as boolean })}
								>
									<div className={`mega-body${featured ? " has-featured" : ""}`}>
										<div className="mega-items">
											{enriched.map((child) => (
												<Link
													key={child.href}
													to={child.href}
													className="mega-item"
													prefetch="intent"
													onClick={closePanel}
												>
													<span className="mega-item-icon">
														<InlineIcon name={child.icon} />
													</span>
													<span className="mega-item-text">
														<span className="mega-item-title">
															{child.label}
															{child.badge && <span className="mega-item-badge">{child.badge}</span>}
														</span>
														{child.description && (
															<span className="mega-item-desc">{child.description}</span>
														)}
													</span>
													<span className="mega-item-arrow" aria-hidden="true">
														<ArrowIcon />
													</span>
												</Link>
											))}
											<div className="mega-footer">
												<Link to={item.href} className="mega-view-all" prefetch="intent" onClick={closePanel}>
													View all {item.label.toLowerCase()}
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
												</Link>
											</div>
										</div>
										{featured && (
											<aside className="mega-featured">
												<p className="mega-featured-eyebrow">{featured.eyebrow}</p>
												<h3 className="mega-featured-title">{featured.title}</h3>
												<p className="mega-featured-body">{featured.body}</p>
												{featured.image && (
													<img src={featured.image} alt="" width="240" height="150" loading="lazy" className="mega-featured-image" />
												)}
												<Link to={featured.href} className="mega-featured-link" prefetch="intent">
													{featured.linkLabel} →
												</Link>
											</aside>
										)}
									</div>
								</div>

								{/* Mobile accordion — hidden on desktop via CSS */}
								<div className="drawer-group">
									<button
										type="button"
										className="drawer-group-trigger"
										aria-expanded={openMobileGroup === item.href}
										aria-controls={`drawer-${groupId}`}
										onClick={() => setOpenMobileGroup(v => v === item.href ? null : item.href)}
									>
										<span>{item.label}</span>
										<ChevronIcon />
									</button>
									<div
										id={`drawer-${groupId}`}
										className="drawer-group-body"
										style={{ gridTemplateRows: openMobileGroup === item.href ? "1fr" : "0fr" }}
									>
										<div className="drawer-group-inner">
											{enriched.map((child) => (
												<Link
													key={child.href}
													to={child.href}
													className="drawer-item"
													onClick={() => setDrawerOpen(false)}
												>
													<span className="drawer-item-title">{child.label}</span>
													{child.description && <span className="drawer-item-desc">{child.description}</span>}
													{child.badge && <span className="mega-item-badge">{child.badge}</span>}
												</Link>
											))}
										</div>
									</div>
								</div>
							</div>
						);
					})}
					<div className="mobile-contact">
						<ActionLink link={{ label: "Start a Conversation", href: "/contact/" }} />
					</div>
				</nav>

				<div className="header-contact">
					<ActionLink link={{ label: "Start a Conversation", href: "/contact/" }} />
				</div>
				<button
					type="button"
					ref={sidebarToggle}
					className="sidebar-toggle"
					aria-expanded={panelOpen}
					aria-controls="einao-offcanvas"
					aria-label={panelOpen ? "Close sidebar" : "Open sidebar"}
					onClick={() => setPanelOpen(v => !v)}
				>
					<span className="menu-toggle-bars" aria-hidden="true"><span /><span /><span /></span>
				</button>
			</div>

			<div
				className={`einao-offcanvas-overlay ${panelOpen ? "is-open" : ""}`}
				onClick={() => { setPanelOpen(false); setDrawerOpen(false); }}
			/>
			<aside
				id="einao-offcanvas"
				className={`einao-offcanvas ${panelOpen ? "is-open" : ""}`}
				aria-hidden={!panelOpen}
				hidden={!panelOpen}
				inert={!panelOpen}
			>
				<div className="einao-offcanvas-top">
					<Link className="brand" to="/" onClick={() => setPanelOpen(false)}>
						<img src="/assets/images/einao-solutions-all-white.png" alt="Einao Solutions" width="160" height="52" />
					</Link>
					<button type="button" ref={drawerClose} className="einao-offcanvas-close" onClick={() => { setPanelOpen(false); sidebarToggle.current?.focus(); }} aria-label="Close menu">
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
							<line x1="2" y1="2" x2="16" y2="16" /><line x1="16" y1="2" x2="2" y2="16" />
						</svg>
					</button>
				</div>
				<span className="einao-offcanvas-kicker">Happy you're here</span>
				<Link className="einao-offcanvas-action" to="/contact/" onClick={() => setPanelOpen(false)}>Start a conversation <span><ArrowIcon /></span></Link>
				<div className="einao-offcanvas-gallery" aria-hidden="true">
					<img src="/assets/images/Team Navigates Pending Approvals.png" alt="" />
					<img src="/assets/images/Hands mapping a streamlined workflow.png" alt="" />
					<img src="/assets/images/Graphite monitor with enterprise dashboard.png" alt="" />
					<img src="/assets/images/Woman in black against lime-green backdrop.png" alt="" />
				</div>
				<div className="einao-offcanvas-contact">
					<span>Contact info</span>
					<a href="mailto:hello@einaosolutions.com">hello@einaosolutions.com</a>
					<Link to="/contact/" onClick={() => setPanelOpen(false)}>Let's discuss your requirement</Link>
					<p>{site.address}</p>
				</div>
				<div className="einao-offcanvas-social">
					<span>Follow Einao</span>
					<div className="einao-social-links">
						<a href="https://www.linkedin.com" rel="noreferrer" aria-label="Einao on LinkedIn">
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.3H1.7V22h3.5V8.3ZM3.45 2A2.05 2.05 0 1 0 3.4 6.1 2.05 2.05 0 0 0 3.45 2ZM22.3 14.15c0-4.12-2.2-6.04-5.13-6.04-2.36 0-3.42 1.3-4.01 2.22V8.3H9.66V22h3.5v-6.78c0-1.79.34-3.52 2.56-3.52 2.19 0 2.22 2.05 2.22 3.65V22h3.5l.86-7.85Z" /></svg>
						</a>
						<a href="https://x.com" rel="noreferrer" aria-label="Einao on X">
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.9-6.4L6.46 22H3.35l7.24-8.28L3 2h6.4l4.43 5.86L18.9 2Zm-1.1 17.8h1.73L8.46 4.08H6.6L17.8 19.8Z" /></svg>
						</a>
						<a href="mailto:hello@einaosolutions.com" aria-label="Email Einao">
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18A2.5 2.5 0 0 1 23.5 8v8A2.5 2.5 0 0 1 21 18.5H3A2.5 2.5 0 0 1 .5 16V8A2.5 2.5 0 0 1 3 5.5Zm0 2a.5.5 0 0 0-.32.12L12 14.86l9.32-7.24a.5.5 0 0 0-.32-.12H3Zm18.5 2.64-8.89 6.9a1 1 0 0 1-1.22 0L2.5 10.14V16a.5.5 0 0 0 .5.5h18a.5.5 0 0 0 .5-.5v-5.86Z" /></svg>
						</a>
					</div>
				</div>
			</aside>
		</header>
	);
}
