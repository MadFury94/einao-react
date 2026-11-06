import { useEffect, type RefObject } from "react";

/** Native equivalent of the reference's character reveal and staggered fadeInUp. */
export function useHeroEntrance(ref: RefObject<HTMLElement | null>) {
	useEffect(() => {
		const root = ref.current;
		const preference = matchMedia("(prefers-reduced-motion: reduce)");
		if (!root || preference.matches) return;
		const animations: Animation[] = [];
		root.querySelectorAll<HTMLElement>("[data-split]").forEach(group => {
			group.querySelectorAll<HTMLElement>("[data-character]").forEach((character, index) => {
				animations.push(character.animate([
					{ opacity: 0, clipPath: "inset(0 100% 0 0)" },
					{ opacity: 1, clipPath: "inset(0 0 -15% 0)" },
				], { duration: 800, delay: index * 30, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }));
			});
		});
		root.querySelectorAll<HTMLElement>("[data-enter]").forEach(element => {
			animations.push(element.animate([
				{ opacity: 0, transform: "translateY(40px)" },
				{ opacity: 1, transform: "translateY(0)" },
			], { duration: 1000, delay: Number(element.dataset.enter), easing: "ease", fill: "backwards" }));
		});
		const stop = () => { if (preference.matches) animations.forEach(animation => animation.cancel()); };
		preference.addEventListener("change", stop);
		return () => { animations.forEach(animation => animation.cancel()); preference.removeEventListener("change", stop); };
	}, [ref]);
}
