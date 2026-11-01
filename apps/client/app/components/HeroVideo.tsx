import { useEffect, useRef } from "react";

/** No src in SSR output: Save-Data and reduced motion never download video. */
export function HeroVideo({ poster, src }: { poster: string; src: string }) {
	const ref = useRef<HTMLVideoElement>(null);
	useEffect(() => {
		const video = ref.current;
		if (!video || !("IntersectionObserver" in window)) return;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)");
		const connection = (
			navigator as Navigator & {
				connection?: EventTarget & { saveData?: boolean };
			}
		).connection;
		let visible = false;
		const sync = () => {
			const eligible = !reduced.matches && !connection?.saveData;
			if (!eligible || !visible || document.hidden)
				video.pause();
			if (!eligible && video.hasAttribute("src")) {
				video.removeAttribute("src");
				video.load();
			}
			if (eligible && visible && !document.hidden) {
				if (!video.hasAttribute("src")) video.src = src;
				video.play().catch(() => undefined);
			}
		};
		const observer = new IntersectionObserver((entries) => {
			visible = entries[0].isIntersecting;
			sync();
		});
		observer.observe(video);
		reduced.addEventListener("change", sync);
		connection?.addEventListener("change", sync);
		document.addEventListener("visibilitychange", sync);
		sync();
		return () => {
			observer.disconnect();
			reduced.removeEventListener("change", sync);
			connection?.removeEventListener("change", sync);
			document.removeEventListener("visibilitychange", sync);
			video.pause();
			video.removeAttribute("src");
			video.load();
		};
	}, [src]);
	return (
		<>
			<video
				className="hero-video"
				ref={ref}
				poster={poster}
				muted
				loop
				playsInline
				preload="none"
				aria-hidden="true"
			/>
		</>
	);
}
