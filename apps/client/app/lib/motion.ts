import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Tune these values without changing the interaction components. */
export const motionConstants = {
	imageShrinkPinVh: 120,
	imageShrinkTargetWidth: "48vw",
	imageTextEnterX: 60,
	imageTextEnterY: 40,
	risingCardsPinVh: 72,
	risingCardOffsetPx: 160,
	risingCardStagger: 0.14,
	heroWordDriftVw: 8,
} as const;

export { gsap, ScrollTrigger };
