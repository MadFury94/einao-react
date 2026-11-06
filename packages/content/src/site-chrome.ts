import type { BlockConfig, Link } from "./types.ts";

/** Shared across every public page. Edit CTA/footer copy here, not in page components. */
export const closingCta: BlockConfig = {
    eyebrow: "Let's start a conversation",
    title: "Let’s talk now.",
    image: "/assets/images/home-expertise/consultants.png",
    cta: { label: "Start a Conversation", href: "/contact/" },
};

export type FooterContent = {
    headingAccent: string;
    heading: string;
    action: Link;
    email: string;
    phone?: string;
    socialLinks: Link[];
    copyrightName: string;
    copyrightNotice: string;
};

export const footerContent: FooterContent = {
    headingAccent: "Practical perspectives",
    heading: "on technology, operations, and digital change.",
    action: { label: "Explore our insights", href: "/insights/" },
    email: "hello@einaosolutions.com",
    socialLinks: [],
    copyrightName: "Einao Solutions Limited",
    copyrightNotice: "All rights reserved.",
};
// Logo, tagline, address and navigation continue to come from the shared SiteConfig.
