import { ArrowIcon } from "./ArrowIcon";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import type { BlockConfig, SiteConfig } from "@einao/content";
import { ActionLink } from "./primitives";

export function Header({ site }: { site: SiteConfig }) {
	const [open, setOpen] = useState(false);
	const [panelOpen, setPanelOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const toggle = useRef<HTMLButtonElement>(null);
	const header = useRef<HTMLElement>(null);
	const sidebarToggle = useRef<HTMLButtonElement>(null);
	const drawerClose = useRef<HTMLButtonElement>(null);
	const location = useLocation();

	// Treat home as hero page (transparent header over full-bleed hero)
	const isHeroPage = location.pathname === "/" || location.pathname === "";

	useEffect(() => {
		setOpen(false);
		setPanelOpen(false);
		header.current
			?.querySelectorAll("details[open]")
			.forEach((el) => el.removeAttribute("open"));
	}, [location.pathname]);

	useEffect(() => {
		const update = () => setScrolled(window.scrollY > 80);
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, []);

	useEffect(() => {
		const closeOnClick = (event: MouseEvent) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const root = header.current;
			root?.querySelectorAll('details[open]').forEach(details => {
				// Leave the clicked summary to its native toggle behaviour.
				if (!details.querySelector('summary')?.contains(target)) details.removeAttribute('open');
			});
			if (!target.closest('.menu-toggle') && !target.closest('summary')) setOpen(false);
			if (!target.closest('.sidebar-toggle') && !target.closest('.einao-offcanvas')) setPanelOpen(false);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			if (panelOpen) {
				event.preventDefault();
				setPanelOpen(false);
				sidebarToggle.current?.focus();
				return;
			}
			const expanded = header.current?.querySelector<HTMLDetailsElement>('details[open]');
			if (expanded) {
				event.preventDefault();
				expanded.removeAttribute('open');
				expanded.querySelector('summary')?.focus();
				return;
			}
			if (open) {
				event.preventDefault();
				setOpen(false);
				toggle.current?.focus();
			}
		};
		document.addEventListener('click', closeOnClick);
		document.addEventListener('keydown', closeOnEscape);
		return () => {
			document.removeEventListener('click', closeOnClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	}, [open, panelOpen]);

	useEffect(() => {
		if (panelOpen) drawerClose.current?.focus();
	}, [panelOpen]);

	const headerClass = [
		"site-header",
		isHeroPage && !scrolled ? "header-transparent" : "",
		scrolled ? "is-scrolled" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<header
			ref={header}
			className={`${headerClass}${panelOpen ? " drawer-open" : ""}`}
		>
			<div className="container header-inner">
				<Link className="brand" to="/" aria-label="Einao Solutions home">
					<img src={site.logo} alt="Einao" width="160" height="52" />
				</Link>
				<button
					ref={toggle}
					className={`menu-toggle ${open ? "is-open" : ""}`}
					aria-expanded={open}
					aria-controls="primary-navigation"
					onClick={() => setOpen(!open)}
				>
					<span className="menu-toggle-bars" aria-hidden="true">
						<span />
						<span />
						<span />
					</span>
					<span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
				</button>
				<nav
					id="primary-navigation"
					className={open ? "primary-nav is-open" : "primary-nav"}
					aria-label="Primary navigation"
				>
					{site.navigation.map((item) =>
						item.children ? (
							<details
								key={item.href}
								className="nav-group"
								onToggle={(event) => {
									if (event.currentTarget.open)
										header.current
											?.querySelectorAll("details[open]")
											.forEach((el) => {
												if (el !== event.currentTarget)
													el.removeAttribute("open");
											});
								}}
							>
								<summary>
									{item.label}{" "}
									<span className="nav-chevron" aria-hidden="true">
										<svg width="10" height="6" viewBox="0 0 10 6" fill="none">
											<path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</span>
								</summary>
								<div className="mega-panel">
									<div className="mega-title">
										<span>{item.label}</span>
										<Link to={item.href}>
											View all {item.label.toLowerCase()}
										</Link>
									</div>
									<div className="mega-links">
										{item.children.map((child) => (
											<Link key={child.href} to={child.href}>
												{child.label}
												<span aria-hidden="true"><ArrowIcon /></span>
											</Link>
										))}
									</div>
								</div>
							</details>
						) : (
							<Link
								key={item.href}
								to={item.href}
								aria-current={
									location.pathname === item.href ? "page" : undefined
								}
							>
								{item.label}
							</Link>
						),
					)}
					<div className="mobile-contact">
						<ActionLink
							link={{ label: "Start a Conversation", href: "/contact/" }}
						/>
					</div>
				</nav>
				<div className="header-contact">
					<ActionLink
						link={{ label: "Start a Conversation", href: "/contact/" }}
					/>
				</div>
				{/* Desktop-only sidebar toggle */}
				<button
					type="button"
					ref={sidebarToggle}
					className="sidebar-toggle"
					aria-expanded={panelOpen}
					aria-controls="einao-offcanvas"
					aria-label={panelOpen ? "Close sidebar" : "Open sidebar"}
					onClick={() => setPanelOpen(!panelOpen)}
				>
					<span className="menu-toggle-bars" aria-hidden="true">
						<span />
						<span />
						<span />
					</span>
				</button>
			</div>
			<div className={`einao-offcanvas-overlay ${panelOpen ? "is-open" : ""}`} onClick={() => { setPanelOpen(false); setOpen(false); }} />
			<aside id="einao-offcanvas" className={`einao-offcanvas ${panelOpen ? "is-open" : ""}`} aria-hidden={!panelOpen} hidden={!panelOpen} inert={!panelOpen}>
				<div className="einao-offcanvas-top"><Link className="brand" to="/" onClick={() => setPanelOpen(false)}><img src="/assets/images/einao-solutions-all-white.png" alt="Einao Solutions" width="160" height="52" /></Link><button type="button" ref={drawerClose} className="einao-offcanvas-close" onClick={() => { setPanelOpen(false); sidebarToggle.current?.focus(); }} aria-label="Close menu"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><line x1="2" y1="2" x2="16" y2="16" /><line x1="16" y1="2" x2="2" y2="16" /></svg></button></div>
				<span className="einao-offcanvas-kicker">Happy youre here</span>
				<Link className="einao-offcanvas-action" to="/contact/" onClick={() => setPanelOpen(false)}>Start a conversation <span><ArrowIcon /></span></Link>
				<div className="einao-offcanvas-gallery" aria-hidden="true"><img src="/assets/images/Team Navigates Pending Approvals.png" alt="" /><img src="/assets/images/Hands mapping a streamlined workflow.png" alt="" /><img src="/assets/images/Graphite monitor with enterprise dashboard.png" alt="" /><img src="/assets/images/Woman in black against lime-green backdrop.png" alt="" /></div>
				<div className="einao-offcanvas-contact"><span>Contact info</span><a href="mailto:hello@einaosolutions.com">hello@einaosolutions.com</a><a href="tel:+2340000000000">Lets discuss your requirement</a><p>{site.address}</p></div>
				<div className="einao-offcanvas-social"><span>Follow Einao</span><div className="einao-social-links"><a href="https://www.linkedin.com" rel="noreferrer" aria-label="Einao on LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.3H1.7V22h3.5V8.3ZM3.45 2A2.05 2.05 0 1 0 3.4 6.1 2.05 2.05 0 0 0 3.45 2ZM22.3 14.15c0-4.12-2.2-6.04-5.13-6.04-2.36 0-3.42 1.3-4.01 2.22V8.3H9.66V22h3.5v-6.78c0-1.79.34-3.52 2.56-3.52 2.19 0 2.22 2.05 2.22 3.65V22h3.5l.86-7.85Z" /></svg></a><a href="https://x.com" rel="noreferrer" aria-label="Einao on X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.9-6.4L6.46 22H3.35l7.24-8.28L3 2h6.4l4.43 5.86L18.9 2Zm-1.1 17.8h1.73L8.46 4.08H6.6L17.8 19.8Z" /></svg></a><a href="mailto:hello@einaosolutions.com" aria-label="Email Einao"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18A2.5 2.5 0 0 1 23.5 8v8A2.5 2.5 0 0 1 21 18.5H3A2.5 2.5 0 0 1 .5 16V8A2.5 2.5 0 0 1 3 5.5Zm0 2a.5.5 0 0 0-.32.12L12 14.86l9.32-7.24a.5.5 0 0 0-.32-.12H3Zm18.5 2.64-8.89 6.9a1 1 0 0 1-1.22 0L2.5 10.14V16a.5.5 0 0 0 .5.5h18a.5.5 0 0 0 .5-.5v-5.86Z" /></svg></a></div></div>
			</aside>
		</header>
	);
}
export function Footer({
	site,
	year,
	closingCta,
}: {
	site: SiteConfig;
	year: number;
	closingCta: BlockConfig;
}) {
	const { pathname } = useLocation();
	return (
		<footer className="site-footer">
			{pathname.replace(/\/$/, "") !== "/contact" && (
				<section
					className="closing-cta container"
					aria-labelledby="closing-title"
				>
					<p className="eyebrow">{closingCta.eyebrow}</p>
					<h2 id="closing-title">{closingCta.title}</h2>
					{closingCta.body?.map((p) => (
						<p key={p}>{p}</p>
					))}
					<ActionLink link={closingCta.cta!} />
				</section>
			)}
			<div className="footer-directory">
				<div className="container footer-grid">
					<div className="footer-intro">
						<Link className="brand" to="/" aria-label="Einao Solutions home">
							<img
								src={site.logo}
								alt="Einao"
								width="180"
								height="58"
								loading="lazy"
							/>
						</Link>
						<p>{site.tagline}</p>
						<p>{site.address}</p>
						{site.locations && <p className="footer-locations">{site.locations.join("  ")}</p>}
					</div>
					<div className="footer-links">
						{site.footer.map((group) => (
							<nav key={group.title} aria-label={`Footer ${group.title}`}>
								<h2>{group.title}</h2>
								{group.links.map((link) => (
									<Link key={link.href} to={link.href}>
										{link.label}
									</Link>
								))}
							</nav>
						))}
					</div>
				</div>
				<div className="container footer-bottom">
					<p> {year} Einao Solutions Limited. All rights reserved.</p>
					<p>Consult. Automate. Build.</p>
				</div>
			</div>
		</footer>
	);
}



