import { data, Form, useActionData, useLoaderData } from "react-router";
import { getContentStore } from "~/lib/content.server";
import { pageMeta } from "~/lib/metadata";
import { Hero } from "~/components/page-blocks";
import type { Route } from "./+types/contact";
export async function loader({ request }: Route.LoaderArgs) {
	const store = getContentStore();
	const site = await store.getSiteConfig();
	const requestedType = new URL(request.url).searchParams.get("enquiry") ?? "";
	return {
		page: (await store.getPage("contact"))!,
		site,
		enquiry: site.enquiryTypes.includes(requestedType)
			? requestedType
			: "Other",
	};
}
// Delivery is deliberately not simulated. The next backend phase will replace this action.
export async function action() {
	return data(
		{
			error:
				"Online enquiries are not available yet. No information has been sent or saved.",
		},
		{ status: 503 },
	);
}
export const meta: Route.MetaFunction = ({ data }) => pageMeta(data?.page);
export default function Contact() {
	const { page, site, enquiry } = useLoaderData<typeof loader>();
	const result = useActionData<typeof action>();
	return (
		<>
			<Hero config={{ ...page.blocks[0].config, cta: undefined }} />
			<section className="section contact-section">
				<div className="container two-col">
					<div>
						<p className="eyebrow">Your next step</p>
						<h2>Start with the requirement.</h2>
						<p>{site.address}</p>
						<p className="form-notice" role="status">
							Online enquiries will be available soon. This form is a preview;
							it does not send or save information.
						</p>
					</div>
					<Form method="post" className="enquiry-form">
						<fieldset disabled>
							<legend className="sr-only">Enquiry form preview</legend>
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
							<button className="arrow-button" type="submit">
								Send Enquiry<span aria-hidden="true">↗</span>
							</button>
						</fieldset>
						{result?.error && <p role="alert">{result.error}</p>}
					</Form>
				</div>
			</section>
		</>
	);
}
