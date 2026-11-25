import type { Route } from "./+types/contact";
import { ContactPage } from "~/components/contact/Contact";
import { seoMeta } from "~/lib/seo";

export function meta(_: Route.MetaArgs) {
  return seoMeta({
    title: "Contact Einao Solutions | Discuss Your Technology Requirements",
    description: "Talk to Einao about technology consulting, process automation, enterprise systems, and digital transformation requirements.",
    path: "/contact/",
  });
}

export async function action({ request, context }: Route.ActionArgs) {
  const form = await request.formData();
  if (String(form.get("website") ?? "").trim()) return { success: "Thank you. Your enquiry has been received." };
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const organisation = String(form.get("organisation") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please enter your name.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid work email.";
  if (!message) errors.message = "Please describe how we can help.";
  if (Object.keys(errors).length) return Response.json({ error: Object.values(errors)[0], errors }, { status: 400 });

  const env = context.cloudflare.env as unknown as { CONTENT_API_URL?: string; CONTENT_API?: { fetch: typeof fetch } };
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname);
  const base = (local ? "http://localhost:8787" : env.CONTENT_API_URL)?.replace(/\/$/, "");
  if (!base) return Response.json({ error: "The enquiry service is unavailable. Please email hello@einaosolutions.com." }, { status: 503 });

  const apiFetch = !local && env.CONTENT_API ? env.CONTENT_API.fetch.bind(env.CONTENT_API) : globalThis.fetch;
  try {
    const response = await apiFetch(base + "/api/v1/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name, email,
        subject: organisation ? "Website enquiry - " + organisation : "Website enquiry",
        message: organisation ? "Organisation: " + organisation + "\n\n" + message : message,
      }),
    });
    if (!response.ok) return Response.json({ error: "We could not submit your enquiry. Please try again or email hello@einaosolutions.com." }, { status: 502 });
    return { success: "Thank you. Your message has been sent. We will be in touch soon." };
  } catch {
    return Response.json({ error: "The enquiry service is unavailable. Please email hello@einaosolutions.com." }, { status: 503 });
  }
}

export default function ContactRoute() {
  return <ContactPage />;
}

