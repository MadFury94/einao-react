import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { BlockConfig } from "@einao/content";
import { useHeroEntrance } from "./useHeroEntrance";
import styles from "./HomeHero.module.css";

const heroVideo = "https://res.cloudinary.com/o9pk8cnf/video/upload/v1793927867/8275959-hd_1280_720_60fps.mp4";

const pills = [
	{ label: "IT consulting", href: "/capabilities/it-consulting/" },
	{ label: "Process automation", href: "/capabilities/business-process-automation/" },
	{ label: "Enterprise solutions", href: "/capabilities/enterprise-solutions/" },
	{ label: "Custom development", href: "/solutions/custom-enterprise-systems/" },
];

export function HomeHero({ config }: { config: BlockConfig }) {
	const root = useRef<HTMLElement>(null);
	useHeroEntrance(root);
	const video = useRef<HTMLVideoElement>(null);
	const userPaused = useRef(false);
	const [videoFailed, setVideoFailed] = useState(false);

	useEffect(() => {
		const media = video.current;
		if (!media) return;
		const preference = matchMedia("(prefers-reduced-motion: reduce)");
		let visible = true;
		const update = () => {
			if (preference.matches || userPaused.current || !visible || document.hidden) media.pause();
			else void media.play().catch(() => { });
		};
		const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
		observer.observe(root.current!);
		preference.addEventListener("change", update);
		document.addEventListener("visibilitychange", update);
		update();
		return () => { observer.disconnect(); preference.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); media.pause(); };
	}, []);


	const body = config.body?.[0] ?? "Einao helps organisations improve how they operate through technology consulting, business process automation, enterprise solutions, and custom digital development.";

	return (
		<section ref={root} className={styles.section} aria-labelledby="home-hero-title" data-home-section="hero">
			<div className={styles.panel}>
				{/* Background */}
				<img className={styles.background} src={config.image || "/assets/images/placeholder-hero-poster.webp"} alt="" width="1860" height="850" fetchPriority="high" />
				<video ref={video} className={`${styles.background} ${styles.video}`} src={heroVideo} poster={config.image || "/assets/images/placeholder-hero-poster.webp"} muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} hidden={videoFailed} onError={() => setVideoFailed(true)} />

				{/* Content */}
				<div className={styles.content}>
					{/* Pills */}
					<ul className={styles.pills} aria-label="Our capabilities">
						{pills.map(pill => (
							<li key={pill.href}><Link to={pill.href}>{pill.label}</Link></li>
						))}
					</ul>

					{/* Headline */}
					<h1 id="home-hero-title" className={styles.title}>
						We build the systems<br />
						that keep organisations<br />
						<span className={styles.accentWord}>moving forward.</span>
					</h1>

					{/* Subtitle */}
					<p className={styles.subtitle}>{body}</p>

					{/* CTAs */}
					<div className={styles.actions}>
						<Link className={styles.primaryBtn} to="/contact/">
							<span className={`${styles.btnArrow} ${styles.btnArrowLeft}`} aria-hidden="true">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m4 8 8 0M8 4l4 4-4 4" /></svg>
							</span>
							<span className={styles.btnLabel}>Start a conversation</span>
							<span className={`${styles.btnArrow} ${styles.btnArrowRight}`} aria-hidden="true">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m4 8 8 0M8 4l4 4-4 4" /></svg>
							</span>
						</Link>
						<Link className={styles.secondaryBtn} to="/capabilities/">
							Learn more
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
						</Link>
					</div>

					{/* Trust badge */}
					<div className={styles.trustRow}>
						<div className={styles.trust}>
							<span className={styles.trustIcon} aria-hidden="true">
								<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7L12 2Z" />
									<path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</span>
							<div className={styles.trustDivider} aria-hidden="true" />
							<div>
								<strong className={styles.trustTitle}>Trusted since 2011</strong>
								<span className={styles.trustSub}>Practical technology delivery</span>
							</div>
						</div>
						<figure className={styles.clientTrust}>
							<img src="/assets/images/happy%20client.png" alt="Client portraits" />
							<figcaption>Trusted by our clients</figcaption>
						</figure>
					</div>
				</div>
			</div>
		</section>
	);
}
