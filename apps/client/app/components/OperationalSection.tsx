import { AnimatedCounter } from "./AnimatedCounter";
import { ArrowIcon } from "./ArrowIcon";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { BlockConfig } from "@einao/content";
import { ActionLink, Reveal } from "./primitives";

function SectionTitle({ text }: { text: string }) {
	const ref = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		const preference = matchMedia("(prefers-reduced-motion: reduce)");
		const element = ref.current;
		if (!element || preference.matches || !("IntersectionObserver" in window)) return;
		const chars = Array.from(element.querySelectorAll<HTMLElement>(".op-char"));
		const animations = chars.map((char, i) => {
			const animation = char.animate([
				{ opacity: 0, transform: "rotateX(-80deg)" },
				{ opacity: 1, transform: "rotateX(0deg)" },
			], { duration: innerWidth <= 768 ? 300 : 600, delay: Math.abs(i - (chars.length - 1) / 2) * 25, easing: "cubic-bezier(.215,.61,.355,1)", fill: "both" });
			animation.pause();
			return animation;
		});
		const observer = new IntersectionObserver(entries => {
			if (entries.some(entry => entry.isIntersecting)) {
				animations.forEach(animation => animation.play());
				observer.disconnect();
			}
		}, { rootMargin: "0px 0px -15% 0px", threshold: 0 });
		observer.observe(element);
		const stop = () => { if (preference.matches) { observer.disconnect(); animations.forEach(animation => animation.cancel()); } };
		preference.addEventListener("change", stop);
		return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); preference.removeEventListener("change", stop); };
	}, [text]);
	let wordIndex = 0;
	return <h2 ref={ref} id="operational-title"><span className="sr-only">{text}</span><span aria-hidden="true">{text.split(/(\s+)/).map((word, i) => /^\s+$/.test(word) ? word : <span key={i} className={`op-word${wordIndex++ < 4 ? " op-serif" : ""}`}>{Array.from(word).map((char, j) => <span className="op-char" key={j}>{char}</span>)}</span>)}</span></h2>;
}

function LineIcon({ eye = false }: { eye?: boolean }) {
	return <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{eye ? <><path d="M4 20s6-10 16-10 16 10 16 10-6 10-16 10S4 20 4 20Z" /><circle cx="20" cy="20" r="5" /><path d="M5 10V5h5m20 0h5v5M5 30v5h5m20 0h5v-5" /></> : <><circle cx="19" cy="21" r="15" /><circle cx="19" cy="21" r="10" /><circle cx="19" cy="21" r="5" /><path d="m19 21 15-16m-1-3v7h7" /></>}</svg>;
}

export function OperationalSection({ config }: { config?: BlockConfig }) {
	return <section className="section operational-section" id="about" aria-labelledby="operational-title" data-home-section="operational-reality">
		<div className="container operational-grid">
			<div className="operational-left">
				<Reveal direction="left" className="image-composition"><div className="operational-image"><img src="/assets/images/Team Navigates Pending Approvals.png" alt="Connected operational workflows" width="1200" height="900" loading="lazy" /></div><img className="accent-image" src="/assets/images/Nigerian IT Consultants Reviewing a Laptop.png" alt="" width="240" height="240" loading="lazy" /></Reveal>

			</div>
			<Reveal direction="right" className="operational-right">
				<Reveal className="operational-eyebrow"><span aria-hidden="true"></span> The operational reality</Reveal>
				<SectionTitle text={config?.title ?? "When operations become complicated, the whole organisation feels it."} />
				<div className="operational-values">
					<Reveal><LineIcon /><h3>Operational friction</h3><p>{config?.body?.[0]}</p></Reveal>
					<Reveal><LineIcon eye /><h3>Business impact</h3><p>Service delivery, productivity, accountability and the ability to grow.</p></Reveal>
				</div>
				<ul className="operational-challenges">{config?.items?.map(item => <li key={item.title}>{item.title}</li>)}</ul>
				<Reveal direction="zoom" className="operational-card">
					<div className="operational-stat"><span className="operational-pill">Since</span><strong><AnimatedCounter value={2011} /></strong><p>Practical technology delivery</p></div>
					<div className="operational-card-copy"><img className="stat-accent-image" src="/assets/images/Hands sketching a business workflow.png" alt="" width="120" height="100" loading="lazy" /><p>{config?.body?.[1]}</p>{config?.cta && <ActionLink link={config.cta} />}</div>
				</Reveal>
				<div className="operational-bottom">
					<Reveal className="operational-approach"><Link to="#index3-process"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M30 81C5 67 10 33 29 15M70 81c25-14 20-48 1-66M25 70l-12-2m9-9-12-5m12-7-10-9m14-3-8-11m57 46 12-2m-9-9 12-5m-12-7 10-9m-14-3 8-11" /><path d="m50 28 17 9v21L50 68l-17-10V37l17-9Zm0 0v40M33 37l17 10 17-10" /></svg><p><strong>Understand first.</strong><br />Explore our approach <span aria-hidden="true"><ArrowIcon /></span></p></Link></Reveal>
					<Reveal className="operational-small-image"><img src="/assets/images/Hands sketching a business workflow.png" alt="Connected systems and information" width="900" height="620" loading="lazy" /></Reveal>
				</div>
			</Reveal>
		</div>
	</section>;
}

