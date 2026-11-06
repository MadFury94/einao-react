import { useEffect, useRef, useState } from "react";

/** The final value is available to assistive technology and without JavaScript. */
export function AnimatedCounter({ value, duration = 1400 }: { value: number; duration?: number }) {
	const ref = useRef<HTMLSpanElement>(null);
	const [display, setDisplay] = useState(value);
	useEffect(() => {
		setDisplay(value);
		const element = ref.current;
		const preference = matchMedia("(prefers-reduced-motion: reduce)");
		if (!element || preference.matches || !("IntersectionObserver" in window)) return;
		let frame = 0;
		const observer = new IntersectionObserver(entries => {
			if (!entries.some(entry => entry.isIntersecting)) return;
			observer.disconnect();
			const start = performance.now();
			setDisplay(0);
			const tick = (now: number) => {
				const progress = Math.min((now - start) / Math.max(1, duration), 1);
				setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
				if (progress < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		}, { threshold: 0.2 });
		const stop = () => {
			if (preference.matches) { observer.disconnect(); cancelAnimationFrame(frame); setDisplay(value); }
		};
		observer.observe(element);
		preference.addEventListener("change", stop);
		return () => { observer.disconnect(); cancelAnimationFrame(frame); preference.removeEventListener("change", stop); };
	}, [value, duration]);
	return <span ref={ref} className="animated-counter"><span className="sr-only">{value}</span><span aria-hidden="true">{display}</span></span>;
}
