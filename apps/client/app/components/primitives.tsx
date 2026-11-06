import { ArrowIcon } from "./ArrowIcon";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Link as ContentLink } from "@einao/content";

export function ActionLink({
	link,
	plain = false,
}: {
	link: ContentLink;
	plain?: boolean;
}) {
	if (plain) {
		return (
			<Link className="text-link" to={link.href}>
				{link.label}
				<span className="text-link-arrow" aria-hidden="true"><ArrowIcon /></span>
			</Link>
		);
	}
	return (
		<Link className="arrow-button" to={link.href}>
			{/* Left arrow - slides in on hover */}
			<span className="ab-arrow ab-arrow-left" aria-hidden="true"><ArrowIcon /></span>
			{/* Label */}
			<span className="ab-label">{link.label}</span>
			{/* Right arrow - always visible, slides out on hover */}
			<span className="ab-arrow ab-arrow-right" aria-hidden="true"><ArrowIcon /></span>
		</Link>
	);
}
export function Reveal({
	children,
	className = "",
	delay = 0,
	direction = "up",
}: {
	children: React.ReactNode;
	className?: string;
	/** Stagger delay in milliseconds */
	delay?: number;
	/** Animation direction: "up" | "left" | "right" | "zoom" */
	direction?: "up" | "left" | "right" | "zoom";
}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (!el || preference.matches || !("IntersectionObserver" in window))
			return;
		let animation: Animation | undefined;

		const fromTransform =
			direction === "left" ? "translateX(-50px)"
				: direction === "right" ? "translateX(50px)"
					: direction === "zoom" ? "scale(0.85)"
						: "translateY(40px)";

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					animation = el.animate(
						[
							{ opacity: 0, transform: fromTransform, filter: "blur(4px)" },
							{ opacity: 1, transform: direction === "zoom" ? "scale(1)" : "translate(0)", filter: "blur(0)" },
						],
						{ duration: 800, delay, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
					);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 },
		);
		const stop = () => {
			if (preference.matches) {
				observer.disconnect();
				animation?.cancel();
			}
		};
		preference.addEventListener("change", stop);
		observer.observe(el);
		return () => {
			observer.disconnect();
			animation?.cancel();
			preference.removeEventListener("change", stop);
		};
	}, [delay, direction]);
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
export function AnimatedTitle({
	text,
	accent,
}: {
	text: string;
	accent?: string;
}) {
	const ref = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const animations = Array.from(
			ref.current?.querySelectorAll(".title-char") ?? [],
		).map((el, i) =>
			el.animate(
				[
					{
						opacity: 0,
						transform: "translateX(.3em)",
						clipPath: "inset(0 100% 0 0)",
					},
					{
						opacity: 1,
						transform: "translateX(0)",
						clipPath: "inset(0 0 -15% 0)",
					},
				],
				{
					duration: 800,
					delay: Math.min(i * 30, 1200),
					easing: "cubic-bezier(.22,1,.36,1)",
					fill: "backwards",
				},
			),
		);
		return () => animations.forEach((a) => a.cancel());
	}, [text]);
	return (
		<h1 ref={ref} className={accent ? "has-accent" : ""}>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true">
				{text.split(/(\s+)/).map((word, i) =>
					/^\s+$/.test(word) ? (
						word
					) : (
						<span
							className={`title-word${accent && word.replace(/[^\w]/g, "") === accent
								? " title-accent"
								: ""
								}`}
							key={i}
						>
							{Array.from(word).map((char, j) => (
								<span className="title-char" key={j}>
									{char}
								</span>
							))}
						</span>
					),
				)}
			</span>
		</h1>
	);
}

export function Typewriter({ phrases, className = "" }: { phrases: string[]; className?: string }) {
	const [phraseIndex, setPhraseIndex] = useState(0);
	const [text, setText] = useState(phrases[0] ?? "");
	const deleting = useRef(false);
	// Separate pause state so the effect re-runs after the hold delay
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (phrases.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const phrase = phrases[phraseIndex] ?? "";

		// Fully typed — hold for 1800ms then start deleting
		if (!deleting.current && text === phrase) {
			const timer = window.setTimeout(() => {
				deleting.current = true;
				setPaused(false);
			}, 1800);
			setPaused(true);
			return () => window.clearTimeout(timer);
		}

		// Fully deleted — advance to next phrase
		if (deleting.current && text.length === 0) {
			deleting.current = false;
			setPhraseIndex((current) => (current + 1) % phrases.length);
			return;
		}

		// Type or delete one character
		const delay = deleting.current ? 34 : 58;
		const timer = window.setTimeout(() => {
			setText(deleting.current ? text.slice(0, -1) : phrase.slice(0, text.length + 1));
		}, delay);
		return () => window.clearTimeout(timer);
	}, [phraseIndex, phrases, text, paused]);

	return <span className={`typewriter ${className}`}>{text}<span className="typewriter-cursor" aria-hidden="true">|</span></span>;
}

