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
		enquiry: site.enquiryTypes.includes(requestedType) ? requestedType : "",
	};
}

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
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
	const details = [
		["Name", values.name], ["Email", values.email], ["Organisation", values.organisation],
		["Role / department", values.role], ["Phone", values.phone], ["Enquiry", values.enquiry],
		["Expected timeframe", values.timeframe], ["Preferred contact", values.contactMethod],
	].filter(([, v]) => v) as string[][];
	const html = `<h2>New Einao website enquiry</h2><dl>${details.map(([l, v]) => `<dt><strong>${escapeHtml(l)}</strong></dt><dd>${escapeHtml(v)}</dd>`).join("")}</dl><h3>Challenge or requirement</h3><p>${escapeHtml(values.message).replace(/\n/g, "<br />")}</p>`;
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
		body: JSON.stringify({ from, to: [to], reply_to: values.email, subject: `${values.enquiry || "Website enquiry"} - ${values.organisation}`, html, text: `New Einao website enquiry\n\n${details.map(([l, v]) => `${l}: ${v}`).join("\n")}\n\nChallenge or requirement:\n${values.message}` }),
	});
	if (!response.ok)
		return data({ error: "We could not submit your enquiry. Please try again or email hello@einaosolutions.com." }, { status: 502 });
	return data({ success: "Thank you. Your enquiry has been received. Our team will review it and follow up using the details you provided." });
}

export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page, data?.siteUrl);

export default function Contact() {
	const { page, site, enquiry } = useLoaderData<typeof loader>();
	const result = useActionData<typeof action>();
	const successMessage = result && "success" in result ? result.success : undefined;
	const errorMessage = result && "error" in result ? result.error : undefined;

	return (
		<div className="contact-page">

			{/* ── 01 Hero ── */}
			<PageHero
				eyebrow="01 / Contact Einao"
				title={page.blocks[0].config.title ?? "Tell us what your organisation needs to do better."}
				accent={page.blocks[0].config.accent}
				pageLabel="Contact"
				metaLines={["Technology, operations, and delivery"]}
				hideCtas
			/>

			{/* ── 02 Contact info cards (mirrors Orixo contact-section) ── */}
			<section className="section contact-info-section">
				<div className="container">
					<div className="contact-info-grid">

						<div className="contact-info-card">
							<div className="contact-info-card-image">
								<img
									src="/assets/images/about hero/Einao Profiles in emerald light.png"
									alt="Einao Abuja office"
									width="600"
									height="400"
									loading="lazy"
								/>
							</div>
							<div className="contact-info-card-body">
								<h3>Abuja, Nigeria</h3>
								<span className="contact-info-label">Address</span>
								<p>{site.address}</p>
								<span className="contact-info-label">Email</span>
								<p><a href="mailto:hello@einaosolutions.com">hello@einaosolutions.com</a></p>
								<a href="#contact-form" className="contact-info-cta">
									Send an enquiry <span aria-hidden="true"><ArrowIcon /></span>
								</a>
							</div>
						</div>

						<div className="contact-info-card">
							<div className="contact-info-card-image">
								<img
									src="/assets/images/Collaborative technology team in Abuja office.png"
									alt="Einao consulting team collaborating"
									width="600"
									height="400"
									loading="lazy"
								/>
							</div>
							<div className="contact-info-card-body">
								<h3>What we help with</h3>
								<ul className="contact-services-list">
									<li>IT Consulting</li>
									<li>Business Process Automation</li>
									<li>Enterprise Solutions</li>
									<li>Custom Digital Development</li>
								</ul>
							</div>
						</div>

						<div className="contact-info-card">
							<div className="contact-info-card-image">
								<img
									src="/assets/images/Nigerian IT Consultants Reviewing a Laptop.png"
									alt="Einao team meeting with a client"
									width="600"
									height="400"
									loading="lazy"
								/>
							</div>
							<div className="contact-info-card-body">
								<h3>How it works</h3>
								<p>Tell us what is happening. We use the conversation to understand the requirement and identify an appropriate next step — whether that is a brief call, a scoping session, or a written response.</p>
							</div>
						</div>

					</div>
				</div>
			</section>

			{/* ── 03 Map + Form (mirrors Orixo contact-map-section) ── */}
			<section className="section contact-map-section" id="contact-form">
				<div className="container">
					<div className="contact-map-wrapper">

						<div className="contact-map">
							<iframe
								title="Einao Solutions office — Wuse Zone 4, Abuja, Nigeria"
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.082!2d7.489296!3d9.057957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0bbb5a30e699%3A0x2c82c8de8d6a26a4!2sWuse%20Zone%204%2C%20Abuja%2C%20Federal%20Capital%20Territory%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1700000000000"
								width="600"
								height="450"
								style={{ border: 0 }}
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							/>
						</div>

						<div className="contact-form-box">
							<h2>Send an enquiry</h2>
							<Form method="post" className="enquiry-form">
								<fieldset>
									<legend className="sr-only">Start a conversation with Einao</legend>
									{/* Honeypot anti-spam field */}
									<div className="sr-only" aria-hidden="true">
										<label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
									</div>
									<div className="form-row">
										<label>
											Full name <span>(required)</span>
											<input name="name" autoComplete="name" required />
										</label>
										<label>
											Work email <span>(required)</span>
											<input name="email" type="email" autoComplete="email" required />
										</label>
									</div>
									<div className="form-row">
										<label>
											Organisation <span>(required)</span>
											<input name="organisation" autoComplete="organization" required />
										</label>
										<label>
											Phone number
											<input name="phone" type="tel" autoComplete="tel" />
										</label>
									</div>
									<div className="form-row">
										<label>
											Role or department
											<input name="role" autoComplete="organization-title" />
										</label>
										<label>
											What do you need help with?
											<select name="enquiry" defaultValue={enquiry} key={enquiry}>
												<option value="" disabled>Select an area</option>
												{site.enquiryTypes.map((type) => (
													<option key={type}>{type}</option>
												))}
											</select>
										</label>
									</div>
									<label>
										Briefly describe the challenge or requirement <span>(required)</span>
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
										The information you submit will be used to respond to your enquiry and handled in accordance with Einao's{" "}
										<a href="/privacy-notice/">Privacy Notice</a>.
									</p>
									<button className="arrow-button" type="submit">
										Send Enquiry<span aria-hidden="true"><ArrowIcon /></span>
									</button>
								</fieldset>
								{successMessage && (
									<p className="form-success" role="status">{successMessage}</p>
								)}
								{errorMessage && (
									<p className="form-error" role="alert">{errorMessage}</p>
								)}
							</Form>
						</div>

					</div>
				</div>
			</section>

		</div>
	);
}
