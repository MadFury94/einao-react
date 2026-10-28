import { useEffect, useRef } from "react";
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
				<span className="text-link-arrow" aria-hidden="true">↗</span>
			</Link>
		);
	}
	return (
		<Link className="arrow-button" to={link.href}>
			{/* Left arrow — slides in on hover */}
			<span className="ab-arrow ab-arrow-left" aria-hidden="true">↗</span>
			{/* Label */}
			<span className="ab-label">{link.label}</span>
			{/* Right arrow — always visible, slides out on hover */}
			<span className="ab-arrow ab-arrow-right" aria-hidden="true">↗</span>
		</Link>
	);
}
export function Reveal({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (!el || preference.matches || !("IntersectionObserver" in window))
			return;
		let animation: Animation | undefined;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					animation = el.animate(
						[
							{
								opacity: 0,
								transform: "translateY(40px)",
								filter: "blur(4px)",
							},
							{
								opacity: 1,
								transform: "translateY(0)",
								filter: "blur(0)",
							},
						],
						{ duration: 900, easing: "cubic-bezier(.22,1,.36,1)" },
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
	}, []);
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
