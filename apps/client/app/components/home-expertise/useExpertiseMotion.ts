import { useEffect, type RefObject } from "react";
import { gsap } from "~/lib/motion";

/** Scoped versions of the reference's reveal, split-heading and image effects. */
export function useExpertiseMotion(root: RefObject<HTMLElement | null>) {
 useEffect(() => {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
   const element = root.current!;
   element.querySelectorAll<HTMLElement>("[data-reveal]").forEach(target => {
    gsap.from(target, { yPercent: 100, opacity: 0, duration: 1, delay: Number(target.dataset.reveal), ease: "power1.out", scrollTrigger: { trigger: target, start: "top bottom", once: true } });
   });
   const heading = element.querySelector("h2");
   const characters = element.querySelectorAll("[data-heading-char]");
   if (element.dataset.homeSection === "why-choose-us") {
    gsap.from(characters, { opacity: 0, rotationX: -80, transformOrigin: "center center -10px", duration: innerWidth <= 768 ? .3 : .6, ease: "power2.out", stagger: { each: .025, from: "center" }, scrollTrigger: { trigger: heading, start: "top 85%", once: true } });
   } else {
    gsap.fromTo(characters, { clipPath: "inset(0 100% 0 0)", x: -20, opacity: 0 }, { clipPath: "inset(0% 0% -15% 0%)", x: 0, opacity: 1, duration: .8, ease: "power4.out", stagger: .03, scrollTrigger: { trigger: heading, start: "top 90%", once: true } });
   }
   const photo = element.querySelector("[data-parallax]");
   if (photo) gsap.fromTo(photo, { yPercent: -10, scale: 1.25 }, { yPercent: 10, scale: 1.25, ease: "none", scrollTrigger: { trigger: photo.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  }, root);
  media.add("(prefers-reduced-motion: no-preference) and (min-width: 1200px)", () => {
   gsap.from(root.current!.querySelectorAll("[data-label-char]"), { opacity: 0, x: 7, duration: .7, stagger: .2, scrollTrigger: { trigger: root.current!.querySelector("[data-eyebrow]"), start: "top 90%", end: "top 60%", scrub: 1 } });
  }, root);
  return () => media.revert();
 }, [root]);
}
