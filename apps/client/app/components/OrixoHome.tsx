import { useEffect, useMemo } from "react";
import type { Page } from "@einao/content";
import referenceHtml from "./orixo-home.html?raw";

const stylesheets = [
	"/orixo-home-assets/css/bootstrap.min.css",
	"/orixo-home-assets/css/all.min.css",
	"/orixo-home-assets/css/animate.css",
	"/orixo-home-assets/css/magnific-popup.css",
	"/orixo-home-assets/css/meanmenu.css",
	"/orixo-home-assets/css/swiper-bundle.min.css",
	"/orixo-home-assets/css/nice-select.css",
	"/orixo-home-assets/css/main.css",
	"/orixo-home-assets/css/white.css",
];
const scripts = [
	"/orixo-home-assets/js/jquery-3.7.1.min.js",
	"/orixo-home-assets/js/bootstrap.bundle.min.js",
	"/orixo-home-assets/js/swiper-bundle.min.js",
	"/orixo-home-assets/js/jquery.magnific-popup.min.js",
	"/orixo-home-assets/js/jquery.meanmenu.min.js",
	"/orixo-home-assets/js/jquery.nice-select.min.js",
	"/orixo-home-assets/js/jquery.waypoints.js",
	"/orixo-home-assets/js/jquery.counterup.min.js",
	"/orixo-home-assets/js/parallaxie.js",
	"/orixo-home-assets/js/wow.min.js",
	"/orixo-home-assets/js/main.js",
];

function contentHtml(page: Page) {
	const hero = page.blocks.find((block) => block.block_type === "hero")?.config;
	const process = page.blocks.find((block) => block.block_type === "process")?.config;
	const services = page.blocks.find((block) => block.block_type === "services")?.config;
	const title = hero?.title ?? "We build the systems that keep organisations moving.";
	const body = hero?.body?.[0] ?? "Einao helps organisations understand operations, improve workflows, and deliver the systems required to work better.";
	const processTitle = process?.title ?? "We understand first, then build what the organisation needs.";
	const servicesTitle = services?.title ?? "Technology capabilities built around your operations.";
	let html = referenceHtml;
	html = html.replace(/<h1 class="hero-title split-title">[\s\S]*?<\/h1>/, `<h1 class="hero-title split-title"><span>${title.split(" ").slice(0, 2).join(" ")}</span> ${title.split(" ").slice(2).join(" ")}</h1>`);
	html = html.replace(/We are a results-driven IT consulting team helping businesses unlock efficiency, scale operations, and improve customer experience\.[\s\S]*?full-cycle development/,
		body);
	html = html.replace("Helping Organizations </span> Through Our Technology Solutions", `${processTitle}`);
	html = html.replace("Our Creative Services</span> That Deliver", `${servicesTitle}`);
	html = html.replace("A Streamlined Process,</span> <br> Built For Clarity, Creativity, <br> And Results", processTitle);
	html = html.replace("Our Creative Work Examples.", "Our work examples.");
	html = html.replace("Trusted Solutions </span>For Your <br> AI Digital Services", "Digital solutions </span>for real operational requirements.");
	html = html.replace("Delivering Innovative </span> IT Solutions That Empower In Businesses To", "Technology that works </span>around the realities of your organisation.");
	html = html.replace("Testimonials From Clientâ€™s", "What organisations need from technology");
	html = html.replace("Starts With The Right People", "Better systems begin with better questions");
	html = html.replace("Highlights From News", "News & insights");
	html = html.replaceAll("Orixo", "Einao").replaceAll("ORIXO", "EINAO");
	html = html.replaceAll("hello@orixo.com", "hello@einaosolutions.com");
	return html;
}

export function OrixoHome({ page }: { page: Page }) {
	const html = useMemo(() => contentHtml(page), [page]);
	useEffect(() => {
		document.body.classList.add("bg-white", "orixo-home-body");
		const links = stylesheets.map((href) => {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = href;
			document.head.appendChild(link);
			return link;
		});
		const scriptTags = scripts.map((src) => {
			const script = document.createElement("script");
			script.src = src;
			script.async = false;
			document.body.appendChild(script);
			return script;
		});
		return () => {
			links.forEach((link) => link.remove());
			scriptTags.forEach((script) => script.remove());
			document.body.classList.remove("bg-white", "orixo-home-body");
		};
	}, []);
	return <div className="orixo-home-reference" dangerouslySetInnerHTML={{ __html: html }} />;
}
