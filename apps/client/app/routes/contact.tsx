import { ArrowIcon } from "../components/ArrowIcon";
import { data, Form, useActionData, useLoaderData } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { pageMeta } from "~/lib/metadata";
import { PageHero } from "~/components/page-blocks";
import type { Route } from "./+types/contact";
export async function loader({ request, context }: Route.LoaderArgs) {
	const env = context.cloudflare.env as unknown as { CONTENT_API_URL?: string };
	const store = getContentStore(env.CONTENT_API_URL, request.url);
	const site = await store.getSiteConfig();
	const requestedType = new URL(request.url).searchParams.get("enquiry") ?? "";
	return {
		page: (await store.getPage("contact"))!,
		siteUrl: new URL(request.url).origin,
		site,
		enquiry: site.enquiryTypes.includes(requestedType)
			? requestedType
			: "",
	};
}
function escapeHtml(value: string) {
	return value.replace(/[&<>\"']/g, (character) => ({
		"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
	}[character] ?? character));
}

export async function action({ request, context }: Route.ActionArgs) {
	const form = await request.formData();
	if (String(form.get("website") ?? "").trim())
		return data({ success: "Thank you. Your enquiry has been received." });
	const values = {
		name: String(form.get("name") ?? "").trim(),
		email: String(form.get("email") ?? "").trim(),
		organisation: String(form.get("organisation") ?? "").trim(),
		role: String(form.get("role") ?? "").trim(),
		phone: String(form.get("phone") ?? "").trim(),
		enquiry: String(form.get("enquiry") ?? "").trim(),
		message: String(form.get("message") ?? "").trim(),
		timeframe: String(form.get("timeframe") ?? "").trim(),
		contactMethod: String(form.get("contactMethod") ?? "").trim(),
	};
	const errors: Record<string, string> = {};
	if (!values.name) errors.name = "Please enter your full name.";
	if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Enter a valid work email.";
	if (!values.organisation) errors.organisation = "Please enter your organisation.";
	if (!values.message) errors.message = "Please describe the challenge or requirement.";
	if (Object.keys(errors).length) return data({ error: Object.values(errors)[0], errors }, { status: 400 });
	const env = context.cloudflare.env as unknown as { RESEND_API_KEY?: string; CONTACT_TO_EMAIL?: string; RESEND_FROM_EMAIL?: string };
	if (!env.RESEND_API_KEY)
		return data({ error: "The enquiry service is not configured yet. Please email hello@einaosolutions.com." }, { status: 503 });
	const to = env.CONTACT_TO_EMAIL ?? "hello@einaosolutions.com";
	const from = env.RESEND_FROM_EMAIL ?? "Einao Website <hello@einaosolutions.com>";
	const details = [["Name", values.name], ["Email", values.email], ["Organisation", values.organisation], ["Role / department", values.role], ["Phone", values.phone], ["Enquiry", values.enquiry], ["Expected timeframe", values.timeframe], ["Preferred contact", values.contactMethod]].filter(([, value]) => value) as string[][];
	const html = `<h2>New Einao website enquiry</h2><dl>${details.map(([label, value]) => `<dt><strong>${escapeHtml(label)}</strong></dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl><h3>Challenge or requirement</h3><p>${escapeHtml(values.message).replace(/\n/g, "<br />")}</p>`;
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
		body: JSON.stringify({ from, to: [to], reply_to: values.email, subject: `${values.enquiry || "Website enquiry"} - ${values.organisation}`, html, text: `New Einao website enquiry\n\n${details.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nChallenge or requirement:\n${values.message}` }),
	});
	if (!response.ok) return data({ error: "We could not submit your enquiry. Please try again or email hello@einaosolutions.com." }, { status: 502 });
	return data({ success: "Thank you. Your enquiry has been received. Our team will review it and follow up using the details you provided." });
}
export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page, data?.siteUrl);
export default function Contact() {
	const { page, site, enquiry } = useLoaderData<typeof loader>();
	const result = useActionData<typeof action>();
	const successMessage = result && "success" in result ? result.success : undefined;
	const errorMessage = result && "error" in result ? result.error : undefined;
	return (
		<>
			<PageHero
				eyebrow="01 / Contact Einao"
				title={page.blocks[0].config.title ?? "Start with the requirement."}
				accent={page.blocks[0].config.accent}
				pageLabel="Contact"
				metaLines={["Technology, operations, and delivery"]}
			/>
			<section className="section contact-section">
				<div className="container two-col">
					<div>
						<p className="eyebrow">Your next step</p>
						<h2>Start with the requirement.</h2>
						<p>{site.address}</p>
						<p><a href="mailto:hello@einaosolutions.com">hello@einaosolutions.com</a></p>
						<p className="form-notice" role="status">
							Tell us what is happening and we will use the details to understand the requirement and identify an appropriate next step.
						</p>
					</div>
					<Form method="post" className="enquiry-form">
						<fieldset>
							<legend className="sr-only">Start a conversation</legend>
							<div className="sr-only" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
							<div className="form-row">
								<label>
									Full name <span>(required)</span>
									<input name="name" autoComplete="name" required />
								</label>
								<label>
									Work email <span>(required)</span>
									<input
										name="email"
										type="email"
										autoComplete="email"
										required
									/>
								</label>
							</div>
							<label>
								Organisation <span>(required)</span>
								<input
									name="organisation"
									autoComplete="organization"
									required
								/>
							</label>
							<div className="form-row">
								<label>
									Role or department
									<input name="role" autoComplete="organization-title" />
								</label>
								<label>
									Phone number
									<input name="phone" type="tel" autoComplete="tel" />
								</label>
							</div>
							<label>
								What do you need help with?
								<select name="enquiry" defaultValue={enquiry} key={enquiry}>
									<option value="" disabled>Select an area of help</option>
									{site.enquiryTypes.map((type) => (
										<option key={type}>{type}</option>
									))}
								</select>
							</label>
							<label>
								Briefly describe the challenge or requirement{" "}
								<span>(required)</span>
								<textarea name="message" rows={5} required />
							</label>
							<div className="form-row">
								<label>
									Expected timeframe
									<input name="timeframe" />
								</label>
								<label>
									Preferred contact method
									<select name="contactMethod">
										<option>Email</option>
										<option>Phone</option>
									</select>
								</label>
							</div>
							<p className="form-notice">
                                The information you submit will be used to respond to your enquiry and handled in accordance with Einao’s{" "}
                                <a href="/privacy-notice/">Privacy Notice</a>.
                            </p>
                            <button className="arrow-button" type="submit">
								Send Enquiry<span aria-hidden="true"><ArrowIcon /></span>
							</button>
						</fieldset>
						{successMessage && <p className="form-success" role="status">{successMessage}</p>}
						{errorMessage && <p role="alert">{errorMessage}</p>}
					</Form>
				</div>
			</section>
		</>
	);
}

