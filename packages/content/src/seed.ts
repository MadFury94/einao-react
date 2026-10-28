import type {
	BlockConfig,
	BlockType,
	ContentItem,
	Page,
	SiteConfig,
} from "./types.ts";

const contact = (label = "Start a Conversation", type = "") => ({
	label,
	href: `/contact/${type ? `?enquiry=${encodeURIComponent(type)}` : ""}`,
});
export const capabilities: ContentItem[] = [
	{
		title: "IT Consulting",
		body: "Make technology decisions with a clear understanding of the problem. We help assess processes, define requirements, map workflows, and establish the right solution direction before implementation.",
		link: {
			label: "Explore IT Consulting",
			href: "/capabilities/it-consulting/",
		},
	},
	{
		title: "Business Process Automation",
		body: "Make workflows easier to manage. We identify bottlenecks, redesign repetitive activities, structure approvals, connect systems, and improve visibility across operational processes.",
		link: {
			label: "Explore Process Automation",
			href: "/capabilities/business-process-automation/",
		},
	},
	{
		title: "Enterprise Solutions & Digital Development",
		body: "Build systems around the way your organisation works—from enterprise applications and workflow systems to digital portals, integrations, and custom software.",
		link: {
			label: "Explore Enterprise Solutions",
			href: "/capabilities/enterprise-solutions/",
		},
	},
];
export const solutions: ContentItem[] = [
	{
		label: "Digital payments / 01",
		title: "PayX",
		body: "Digital payments with visibility built in. PayX is positioned for organisations seeking a more structured way to collect and manage digital payments and maintain visibility over transaction activity.",
		link: { label: "Request a PayX Demonstration", href: "/solutions/payx/" },
	},
	{
		label: "Digital workflows / 02",
		title: "Fileonn",
		body: "Bring organisational work into a more structured digital flow. Speak with Einao about your workflow requirements and explore whether Fileonn is the right fit.",
		link: { label: "Enquire About Fileonn", href: "/solutions/fileonn/" },
	},
];
export const industries: ContentItem[] = [
	{
		title: "Government & Public Institutions",
		body: "Digital systems for organisations managing complex processes, transactions, information, and public-facing services.",
		link: { label: "Explore the industry", href: "/industries/government/" },
	},
	{
		title: "Businesses & Corporates",
		body: "Technology that helps organisations structure operations, improve workflows, and connect systems as they grow.",
		link: { label: "Explore the industry", href: "/industries/business/" },
	},
	{
		title: "Regulatory & Service Organisations",
		body: "Digital processes designed around defined requirements, review stages, records, and service delivery.",
		link: {
			label: "Explore the industry",
			href: "/industries/regulatory-services/",
		},
	},
];
const capabilityLinks = capabilities.map((i) => ({
	label: i.title,
	href: i.link!.href,
}));
const solutionLinks = solutions.map((i) => ({
	label: i.title,
	href: i.link!.href,
}));
const industryLinks = industries.map((i) => ({
	label: i.title,
	href: i.link!.href,
}));
export const site: SiteConfig = {
	name: "Einao Solutions",
	tagline: "Technology that works around the realities of your organisation.",
	logo: "/assets/logos/Einao-Solutions-Logo-05.png",
	address: "Suite 12, Hilltop Plaza, No. 13, Wuse Zone 4, Abuja, Nigeria.",
	navigation: [
		{ label: "Work", href: "/work/" },
		{
			label: "Capabilities",
			href: "/capabilities/",
			children: capabilityLinks,
		},
		{ label: "Solutions", href: "/solutions/", children: solutionLinks },
		{ label: "Industries", href: "/industries/", children: industryLinks },
		{ label: "Insights", href: "/insights/" },
		{ label: "About", href: "/about/" },
	],
	enquiryTypes: [
		"IT Consulting",
		"Process Automation",
		"Enterprise Solution or Custom Development",
		"PayX",
		"Fileonn",
		"System Integration",
		"Other",
	],
	footer: [
		{
			title: "Explore",
			links: [
				{ label: "Work", href: "/work/" },
				{ label: "Insights", href: "/insights/" },
				{ label: "About", href: "/about/" },
				{ label: "Contact", href: "/contact/" },
			],
		},
		{ title: "Capabilities", links: capabilityLinks },
		{ title: "Solutions", links: solutionLinks },
		{ title: "Industries", links: industryLinks },
	],
};
export const closingCta: BlockConfig = {
	eyebrow: "Let’s start a conversation",
	title: "Have an operation that needs to work better?",
	body: [
		"Tell us what is slowing work down, where systems are disconnected, or what your organisation needs to deliver. We will start by understanding the requirement.",
	],
	cta: contact(),
};
const proof: BlockConfig = {
	eyebrow: "Selected institutional work",
	title: "Digital infrastructure must work beyond the launch.",
	body: [
		"Einao has provided IT consulting support to the Federal Ministry of Industry, Trade and Investment’s Commercial Law Department since 2013. Einao built the IPO Nigeria portal and continues to support its maintenance, technical operation, optimisation, and upgrades.",
		"The portal supports intellectual property application processes, including trademarks, patents, and industrial designs. It is an example of the operational demands involved in supporting a digital service used by applicants and institutional teams.",
	],
	cta: {
		label: "Explore the IPO Nigeria Case Study",
		href: "/work/ipo-nigeria-portal/",
	},
	items: [
		{
			title: "IPO Nigeria",
			label: "Institutional digital service delivery",
			body: "Consulting. Portal development. Continued support.",
		},
	],
};
type Section = [BlockType, BlockConfig];
let nextId = 1;
function page(
	slug: string,
	title: string,
	description: string,
	sections: Section[],
	status: Page["status"] = "published",
): Page {
	return {
		slug,
		title,
		description,
		status,
		blocks: sections.map(([block_type, config], position) => ({
			id: nextId++,
			page_slug: slug,
			block_type,
			position,
			config,
			visible: true,
		})),
	};
}
const hero = (
	eyebrow: string,
	title: string,
	body: string[],
	cta = contact(),
): Section => ["hero", { eyebrow, title, body, cta }];
const editorial = (
	title: string,
	body: string[],
	items?: ContentItem[],
): Section => ["editorial", { title, body, items }];
export const pages: Page[] = [
	page(
		"home",
		"Technology Consulting & Business Process Automation | Einao Solutions",
		"Einao helps organisations improve operations through technology consulting, process automation, enterprise solutions, and custom digital systems.",
		[
			[
				"hero",
				{
					eyebrow: "Technology shaped around your organisation",
					title: "We build the systems that keep organisations moving.",
					accent: "systems",
					body: [
						"Einao helps organisations improve how they operate through technology consulting, business process automation, enterprise solutions, and custom digital development. We turn operational challenges into systems that work.",
					],
					cta: contact(),
					secondaryCta: {
						label: "Explore Our Capabilities",
						href: "/capabilities/",
					},
					image: "/assets/images/placeholder-hero-poster.webp",
					video: "https://res.cloudinary.com/dqwfjxn8g/video/upload/v1793186378/6916389_Motion_Graphics_Motion_Graphic_1280x720_rcoiff.mp4",
					items: [
						{ title: "01 / Understand", body: "" },
						{ title: "02 / Connect", body: "" },
						{ title: "03 / Improve", body: "" },
					],
				},
			],
			[
				"feature",
				{
					eyebrow: "01 / The operational reality",
					title:
						"When operations become complicated, the whole organisation feels it.",
					items: [
						"Slow approvals.",
						"Repetitive data entry.",
						"Disconnected applications.",
						"Unclear process ownership.",
						"Difficult-to-track transactions.",
						"Reports that take too long to prepare.",
					].map((title) => ({ title, body: "" })),
					body: [
						"Work that depends on follow-ups, spreadsheets, or institutional memory.",
						"These are not isolated inconveniences. Over time, they affect service delivery, productivity, accountability, cost control, and an organisation’s ability to grow. Einao helps identify what is causing the friction and determine what needs to change.",
					],
					cta: contact("Talk Through an Operational Challenge"),
				},
			],
			[
				"process",
				{
					eyebrow: "02 / How we think",
					title: "Understand the operation before choosing the technology.",
					body: [
						"Technology is not always the starting point. Sometimes a process needs to be redesigned. Sometimes existing systems need to communicate. Sometimes repetitive work should be automated. And sometimes the organisation needs a new digital system.",
						"We begin by understanding the difference.",
					],
					items: [
						{
							title: "Consult",
							body: "Analyse processes, clarify requirements, understand users and constraints, and establish a practical technology direction.",
						},
						{
							title: "Automate",
							body: "Improve workflows, reduce avoidable manual effort, structure approvals, and make information flow more effectively.",
						},
						{
							title: "Build",
							body: "Implement enterprise solutions, integrations, digital platforms, and custom software around the requirements.",
						},
					],
					cta: { label: "Explore Our Capabilities", href: "/capabilities/" },
				},
			],
			[
				"feature",
				{
					eyebrow: "Built around real operations",
					title: "Better systems begin with understanding.",
					body: [
						"Processes, people and information all need to work together. We start with how your organisation operates, then shape the consulting, automation or digital system around what needs to improve.",
					],
					image: "/assets/images/placeholder-feature.webp",
					imageAlt:
						"Conceptual connected workflow, illustrated with green rings and nodes",
					cta: { label: "Explore Our Capabilities", href: "/capabilities/" },
				},
			],
			[
				"services",
				{
					eyebrow: "03 / Our capabilities",
					title: "Technology capabilities built around your operations.",
					items: capabilities,
				},
			],
			["proof", proof],
			[
				"solutions",
				{
					eyebrow: "04 / Our solutions",
					title: "Digital solutions for real operational requirements.",
					body: [
						"Einao’s solutions address practical needs such as payment visibility, structured workflows, information handling, and digital service delivery.",
					],
					items: solutions,
				},
			],
			[
				"industries",
				{
					eyebrow: "05 / Who we work with",
					title: "Different organisations. Real operational needs.",
					items: industries,
				},
			],
			[
				"cards",
				{
					eyebrow: "Where your change begins",
					title: "A clearer route from challenge to change.",
					items: [
						...capabilities,
						{
							title: "Better questions. Better systems.",
							body: "Explore practical thinking about the operational decisions behind technology.",
							link: { label: "Explore Insights", href: "/insights/" },
						},
					].map((item, i) => ({
						...item,
						image: `/assets/images/placeholder-card-${i + 1}.webp`,
					})),
				},
			],
			[
				"insights",
				{
					eyebrow: "06 / Insights",
					title: "Better systems begin with better questions.",
					body: [
						"Explore practical thinking on technology strategy, workflow automation, enterprise systems, and the operational decisions behind digital transformation.",
					],
					cta: { label: "Explore Insights", href: "/insights/" },
				},
			],
		],
	),
	page(
		"about",
		"About Einao Solutions | Enterprise Technology & Digital Transformation",
		"Learn about Einao Solutions, an established technology company helping organisations improve operations through consulting, automation, and digital systems.",
		[
			hero(
				"About Einao",
				"Technology should work around the organisation—not the other way around.",
				[
					"Einao Solutions Limited helps organisations understand operational challenges and respond with practical technology. Our work connects consulting, process improvement, automation, and digital solution delivery.",
				],
			),
			editorial("Our perspective", [
				"Digital transformation is not simply the act of moving a process online. If the underlying process is unclear, fragmented, or unnecessarily complicated, digitising it can preserve the same problems in a new format.",
				"We look at how work moves through an organisation: how information is captured, where decisions happen, how teams coordinate, which systems are involved, and what makes delivery difficult. That understanding shapes the solution.",
				"Sometimes the right intervention is process redesign. Sometimes it is automation or integration. Sometimes a new system is required. The aim is to make technology serve a defined operational need.",
			]),
			editorial("Our history", [
				"Founded in 2011, Einao Solutions has developed its work around technology consulting and digital solutions for organisational needs. Its engagement with the Federal Ministry of Industry, Trade and Investment’s Commercial Law Department dates to 2013 and includes work on the IPO Nigeria portal, alongside ongoing technical support and system improvement.",
				"Einao Solutions was founded by Collins Nkwoji, MBA, CPA, FCA, FCIT.",
			]),
			[
				"approach",
				{
					title: "How we work",
					items: [
						{
							title: "Understand before building",
							body: "We clarify the problem, users, process, constraints, and intended outcomes before deciding on the technology.",
						},
						{
							title: "Solve the actual problem",
							body: "We distinguish between a process problem, an integration problem, an automation opportunity, and a requirement for a new system.",
						},
						{
							title: "Design for the operating environment",
							body: "Solutions must make sense for the people, workflows, information, and practical conditions in which they will be used.",
						},
					],
				},
			],
		],
	),
	page(
		"capabilities",
		"Technology Consulting, Process Automation & Digital Solutions | Einao",
		"Explore Einao’s IT consulting, business process automation, enterprise solutions, system integration, and custom digital development capabilities.",
		[
			hero(
				"Our capabilities",
				"The right technology starts with the right understanding.",
				[
					"Einao works across the path from operational diagnosis to digital implementation. We help organisations define the problem, improve the process, and deliver the systems required to support better ways of working.",
				],
			),
			[
				"services",
				{ title: "From understanding to implementation.", items: capabilities },
			],
		],
	),
	page(
		"capabilities/it-consulting",
		"IT Consulting & Technology Strategy | Einao Solutions",
		"Define requirements, assess business processes, evaluate technology options, and plan digital initiatives with Einao’s IT consulting services.",
		[
			hero(
				"IT Consulting",
				"Make technology decisions with the problem clearly defined.",
				[
					"Technology projects can become expensive and difficult to deliver when requirements are unclear, workflows are poorly understood, or tools are selected before the organisation knows what it needs. Einao helps teams establish a clearer view of the operational problem and the technology response it calls for.",
				],
				contact("Discuss a Consulting Requirement", "IT Consulting"),
			),
			editorial(
				"What we help clarify",
				[],
				[
					{
						title: "Business and process analysis",
						body: "Understand how work is performed today, who is involved, what information is required, and where delays, duplication, or uncertainty occur.",
					},
					{
						title: "Requirements definition",
						body: "Translate stakeholder needs into a clearer description of the functions, workflows, users, data, and constraints a solution must address.",
					},
					{
						title: "Process mapping",
						body: "Make the current workflow visible, including hand-offs, approvals, decision points, exceptions, and dependencies.",
					},
					{
						title: "Technology and solution assessment",
						body: "Evaluate the problem before selecting an approach, considering whether process redesign, automation, integration, configuration, or custom development is appropriate.",
					},
					{
						title: "Solution architecture and planning",
						body: "Define the major components, relationships, dependencies, and implementation considerations needed to move from requirement to delivery.",
					},
				],
			),
			[
				"approach",
				{
					title: "A practical engagement.",
					items: [
						{
							title: "Understand",
							body: "Establish the business context, users, existing systems, constraints, and desired outcome.",
						},
						{
							title: "Analyse",
							body: "Review processes, requirements, information flows, and the causes of the current difficulty.",
						},
						{
							title: "Define",
							body: "Document the problem, priorities, solution options, and relevant implementation considerations.",
						},
						{
							title: "Plan",
							body: "Set out the proposed scope, dependencies, delivery priorities, and next steps.",
						},
					],
				},
			],
		],
	),
	page(
		"capabilities/business-process-automation",
		"Business Process Automation & Workflow Solutions | Einao Solutions",
		"Improve workflows with process redesign, digital approvals, workflow automation, system integration, and operational reporting tailored to your organisation.",
		[
			hero(
				"Business Process Automation",
				"Make the workflow work better.",
				[
					"As organisations grow, manual processes and informal workarounds become harder to manage. Approvals get delayed, information is entered repeatedly, reports depend on manual compilation, and teams struggle to see the status of work across departments.",
					"Einao helps organisations analyse, redesign, and automate appropriate workflows so work can move through clearer steps, with better information flow and visibility.",
				],
				contact("Identify a Workflow to Improve", "Process Automation"),
			),
			editorial(
				"What can be improved",
				[],
				[
					{
						title: "Process optimisation",
						body: "Identify unnecessary steps, duplicated effort, avoidable hand-offs, and unclear responsibilities before deciding what to automate.",
					},
					{
						title: "Workflow automation",
						body: "Structure recurring activities, task assignments, notifications, and process stages so work follows a defined sequence rather than relying entirely on manual follow-up.",
					},
					{
						title: "Digital approvals and escalations",
						body: "Define routes for review, approval, rejection, and escalation, with status visibility and traceability appropriate to the process.",
					},
					{
						title: "System integration",
						body: "Connect relevant applications and services so information can move between systems with less repeated entry and fewer manual transfers.",
					},
					{
						title: "Automated reporting and visibility",
						body: "Reduce the effort required to compile routine operational information and support more consistent views of process activity.",
					},
				],
			),
			editorial("How we approach automation", [
				"We assess the current process, define the intended outcome, identify what should change, design the workflow, and determine the appropriate combination of automation, integration, and supporting technology. The objective is not to automate every step; it is to improve the operation.",
			]),
		],
	),
	page(
		"capabilities/enterprise-solutions",
		"Enterprise Solutions & Custom Software Development | Einao Solutions",
		"Einao designs enterprise applications, digital portals, workflow systems, integrations, and custom software around organisational requirements.",
		[
			hero(
				"Enterprise Solutions & Digital Development",
				"Build the digital systems your organisation actually needs.",
				[
					"Not every operational requirement can be met by a generic application. Organisations may need systems that reflect specific workflows, service models, information structures, approval rules, user groups, and integration needs. Einao designs and implements digital solutions around those requirements.",
				],
				contact(
					"Discuss a Digital Solution",
					"Enterprise Solution or Custom Development",
				),
			),
			editorial(
				"What we deliver",
				[],
				[
					{
						title: "Enterprise applications and workflow systems",
						body: "Support structured processes such as task assignment, review, assessment, approval, case handling, and status tracking, with capabilities defined by the requirements of the engagement.",
					},
					{
						title: "Digital portals and service platforms",
						body: "Create digital access points through which users can submit requests, provide information, upload documents, make payments where required, and follow the progress of a service.",
					},
					{
						title: "Custom software and business applications",
						body: "Design software around a defined operational requirement when available tools do not adequately support the intended workflow.",
					},
					{
						title: "Document and information workflows",
						body: "Organise the handling, review, retrieval, and movement of documents and information across relevant processes.",
					},
					{
						title: "System integration",
						body: "Connect new and existing applications, services, and data flows where technically feasible and within the agreed scope.",
					},
					{
						title: "Implementation and ongoing improvement",
						body: "Support deployment and subsequent maintenance or improvement where included in the engagement.",
					},
				],
			),
			editorial("Designed around requirements", [
				"Every engagement begins with a clear understanding of users, processes, data, system dependencies, operating conditions, and the outcome the organisation needs. This shapes the scope and informs the design and implementation approach.",
			]),
		],
	),
	page(
		"solutions",
		"Digital Solutions | Einao Solutions",
		"Explore PayX, Fileonn and digital solutions shaped around your organisation’s operational requirements.",
		[
			hero(
				"Our solutions",
				"Digital solutions for real operational requirements.",
				[
					"Einao’s solutions respond to practical organisational needs: managing payments, structuring workflows, coordinating information, and delivering services through digital systems. Explore the solutions below or speak with us about a requirement that needs a tailored approach.",
				],
			),
			["solutions", { title: "Start with the requirement.", items: solutions }],
			editorial("Custom enterprise solutions", [
				"Some requirements need a solution shaped around a specific operating model. Einao works with organisations to define requirements and deliver digital systems, integrations, and workflows appropriate to the scope.",
			]),
		],
	),
	page(
		"solutions/payx",
		"PayX Digital Payment Solution | Einao Solutions",
		"Discuss PayX with Einao to explore a more structured approach to digital payment collection, transaction visibility, and payment reporting.",
		[
			hero(
				"PayX",
				"Bring greater structure and visibility to payment operations.",
				[
					"PayX is a digital payment solution for organisations looking to manage payment activity through a more structured digital process. Speak with the Einao team to establish whether its confirmed capabilities align with your organisation’s payment requirements.",
				],
				contact("Request a PayX Demonstration", "PayX"),
			),
			editorial("Start with your payment requirements.", [
				"Payment processes can involve multiple channels, records, teams, and reconciliation steps. When information is fragmented, it can become difficult to maintain a clear view of transactions and prepare consistent reports.",
				"Tell us how your organisation currently collects payments, where visibility becomes difficult, and what your teams need to manage more effectively. We will use that conversation to determine fit and next steps.",
			]),
		],
	),
	page(
		"solutions/fileonn",
		"Fileonn Digital Workflow Solution | Einao Solutions",
		"Contact Einao to learn about Fileonn and discuss whether its verified capabilities fit your organisation’s workflow requirements.",
		[
			hero(
				"Fileonn",
				"Give important organisational work a clearer digital structure.",
				[
					"Fileonn is part of Einao’s solutions portfolio. Speak with Einao about your organisation’s workflow requirements and explore whether Fileonn is the right fit.",
				],
				contact("Enquire About Fileonn", "Fileonn"),
			),
		],
	),
	page(
		"industries",
		"Technology Solutions for Government, Business & Institutions | Einao",
		"Explore how Einao’s technology consulting, automation, and digital solution capabilities can support government, business, regulatory, and service organisations.",
		[
			hero(
				"Who we work with",
				"Technology shaped around the realities of your organisation.",
				[
					"Different organisations face different operating conditions. The common requirement is technology that responds to real workflows, users, information needs, and service expectations. Einao starts with those realities before defining the right approach.",
				],
			),
			[
				"industries",
				{
					title: "Different organisations. Real operational needs.",
					items: industries,
				},
			],
		],
	),
	page(
		"industries/government",
		"Technology for Government & Public Institutions | Einao",
		"Explore institutional workflows, digital services and Einao’s IPO Nigeria portal experience.",
		[
			hero(
				"Government & Public Institutions",
				"Digital services shaped around institutional work.",
				[
					"Public institutions may manage applications, approvals, records, payments, and services that involve multiple stakeholders and defined processes. Einao’s work in institutional digital systems includes the IPO Nigeria portal engagement. We help define operational requirements and deliver or support digital systems according to the scope of each engagement.",
				],
			),
			["proof", proof],
		],
	),
	page(
		"industries/business",
		"Technology for Businesses & Corporates | Einao",
		"Improve operational structure, workflows and connections between business systems.",
		[
			hero(
				"Businesses & Corporates",
				"Build structure around the way your business works.",
				[
					"As businesses grow, processes can become fragmented across teams, spreadsheets, and disconnected applications. Einao helps organisations assess their operations, improve workflows, connect systems, and define digital solutions that support their business requirements.",
				],
				contact("Discuss a Business Requirement"),
			),
			[
				"services",
				{
					title: "Support the next stage of your operations.",
					items: capabilities.slice(0, 2),
				},
			],
		],
	),
	page(
		"industries/regulatory-services",
		"Technology for Regulatory & Service Organisations | Einao",
		"Define clearer information flows for structured reviews, requests, records and service processes.",
		[
			hero(
				"Regulatory & Service Organisations",
				"Clearer processes for structured service delivery.",
				[
					"Organisations responsible for structured reviews, requests, applications, records, and service processes need clear information flows and dependable digital workflows. Einao can help assess those requirements and determine an appropriate automation, integration, or development approach.",
				],
				contact("Discuss Your Service Process"),
			),
			[
				"services",
				{
					title: "Connect requirements to delivery.",
					items: capabilities.slice(1),
				},
			],
		],
	),
	page(
		"work",
		"Digital Transformation Projects & Case Studies | Einao Solutions",
		"Explore selected work involving institutional digital platforms, technology consulting, process improvement, and enterprise solutions delivered or supported by Einao.",
		[
			hero("Selected work", "The work behind systems people rely on.", [
				"Our case studies explain the context, the operational challenge, Einao’s role, and the work involved.",
			]),
			["proof", proof],
		],
	),
	page(
		"work/ipo-nigeria-portal",
		"IPO Nigeria Portal Case Study | Einao Solutions",
		"Read about Einao’s work building and supporting the IPO Nigeria portal for the Federal Ministry of Industry, Trade and Investment’s Commercial Law Department.",
		[
			hero(
				"Selected institutional work",
				"Supporting the digital processes behind intellectual property services.",
				[
					"Einao’s engagement with the Federal Ministry of Industry, Trade and Investment’s Commercial Law Department dates to 2013. Einao built the IPO Nigeria portal and continues to support its technical operation, maintenance, optimisation, and upgrades.",
				],
				contact("Discuss an Institutional Digital Requirement"),
			),
			editorial("The operational context", [
				"Digital services for intellectual property applications must support structured information submission and processing. The IPO Nigeria portal supports application processes relating to trademarks, patents, and industrial designs.",
			]),
			editorial("Einao’s role", [
				"Einao’s role includes building the portal and continuing to support it through maintenance, technical support, optimisation, and upgrades.",
			]),
			editorial("Why ongoing support matters", [
				"A digital platform is not finished in operational terms simply because it has been launched. Systems need continued technical attention as requirements evolve, users interact with the service, and improvements become necessary. Ongoing support helps maintain the platform and address agreed technical needs.",
			]),
			[
				"services",
				{
					title: "Related capabilities",
					items: [capabilities[0], capabilities[2]],
				},
			],
		],
	),
	page(
		"insights",
		"Insights on Technology, Automation & Operations | Einao Solutions",
		"Practical perspectives on technology strategy, business process automation, enterprise systems, and digital transformation from Einao Solutions.",
		[
			hero("Insights", "Better systems begin with better questions.", [
				"Ideas and practical perspectives on the operational decisions behind technology: how to define requirements, improve workflows, connect systems, and approach digital transformation with clarity.",
			]),
			editorial("A practical perspective.", [
				"Our first articles are being prepared. In the meantime, explore the capabilities behind these conversations or talk to us about a challenge in your organisation.",
			]),
			[
				"services",
				{ title: "Explore the work behind the thinking.", items: capabilities },
			],
		],
	),
	page(
		"contact",
		"Contact Einao Solutions | Discuss Your Technology Requirements",
		"Contact Einao Solutions to discuss IT consulting, business process automation, enterprise systems, integrations, or a custom digital solution.",
		[
			hero(
				"Start a conversation",
				"Tell us what your organisation needs to do better.",
				[
					"Whether you are improving an existing process, planning a digital platform, considering automation, or trying to connect systems, start by telling us what is happening. We will use the conversation to understand the requirement and identify an appropriate next step.",
				],
			),
		],
	),
	page("privacy-notice", "Privacy Notice | Einao Solutions", "", [], "draft"),
	page("terms-of-use", "Terms of Use | Einao Solutions", "", [], "draft"),
];

// Editorial briefs are deliberately separate from published pages.
export const insightBriefs = [
	"Before You Buy Software: Five Questions Every Organisation Should Answer",
	"Digitising a Broken Process Does Not Fix It",
	"Where Manual Work Creates Hidden Operational Costs",
	"When Should an Organisation Integrate Existing Systems Instead of Replacing Them?",
	"What Organisations Should Plan for After a Digital Platform Goes Live",
	"How to Write Better Requirements for an Enterprise Portal",
].map((title, index) => ({
	id: index + 1,
	title,
	post_type: "blog",
	status: "draft" as const,
}));
