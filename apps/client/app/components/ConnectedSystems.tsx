import { useEffect, useRef } from "react";

const statement = "Einao connects operational understanding with technology delivery. We help organisations improve workflows, connect systems, and implement digital solutions designed around the work that needs to get done.";
const logos = [
	{ label: "Google Analytics", file: "google-analytics.svg" },
	{ label: "Trello", file: "trello.svg" },
	{ label: "Dropbox", file: "dropbox.svg" },
	{ label: "ClickUp", file: "clickup.svg" },
	{ label: "Shopify", file: "shopify.svg" },
	{ label: "Slack", file: "slack.svg" },
	{ label: "Notion", file: "notion.svg" },
	{ label: "Asana", file: "asana-logo.svg" },
];

export function ConnectedSystems() {
	const title = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		const el = title.current;
		if (!el) return;
		const preference = matchMedia("(prefers-reduced-motion: reduce)");
		const words = Array.from(el.querySelectorAll<HTMLElement>(".connected-word"));
		let frame = 0;
		const update = () => {
			frame = 0;
			const rect = el.getBoundingClientRect();
			const progress = Math.max(0, Math.min(1, (innerHeight * .88 - rect.top) / (innerHeight * .48)));
			words.forEach((word, index) => {
				const amount = preference.matches ? 1 : Math.max(0, Math.min(1, progress * (words.length + 4) - index));
				word.style.opacity = String(.3 + amount * .7);
			});
		};
		const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
		update();
		window.addEventListener("scroll", queue, { passive: true });
		window.addEventListener("resize", queue);
		preference.addEventListener("change", queue);
		return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", queue); window.removeEventListener("resize", queue); preference.removeEventListener("change", queue); };
	}, []);
	return <section className="connected-systems" aria-labelledby="connected-title">
		<div className="connected-heading">
			<p className="connected-eyebrow"><span aria-hidden="true">✦</span> Connected systems. Clearer workflows.</p>
			<h2 ref={title} id="connected-title"><span className="sr-only">{statement}</span><span aria-hidden="true">{statement.split(" ").map((word, i) => <span key={i}><span className={`connected-word${i < 5 ? " connected-serif" : ""}`}>{word}</span>{" "}</span>)}</span></h2>
		</div>
		<div className="connected-rows" tabIndex={0} role="group" aria-label="Technology logos; hover or focus to pause animation">
			{[0, 1].map(row => <div className={`connected-row connected-row-${row}`} key={row}><div className="connected-track">{[0, 1].map(copy => <div className="connected-group" key={copy} aria-hidden={row === 1 || copy === 1 ? true : undefined}>{[...logos.slice(row * 3), ...logos.slice(0, row * 3)].map(item => <div className="connected-tile" key={item.label}><img src={`/assets/logos/${item.file}`} alt={item.label} width="64" height="64" loading="lazy" /></div>)}</div>)}</div></div>)}
		</div>
	</section>;
}
