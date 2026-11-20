import { Link } from "react-router";
import styles from "./Capabilities.module.css";
import { ReferenceHero } from "../reference-hero/ReferenceHero";

// Inline SVG icons for each capability card
const ItConsultingIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="18" width="46" height="32" rx="4" fill="currentColor" opacity="0.18" />
        <rect x="14" y="22" width="38" height="24" rx="2" fill="currentColor" opacity="0.32" />
        <rect x="18" y="26" width="30" height="4" rx="2" fill="currentColor" opacity="0.7" />
        <rect x="18" y="34" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="18" y="40" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
        <rect x="26" y="50" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="22" y="53" width="22" height="4" rx="2" fill="currentColor" opacity="0.25" />
        <circle cx="58" cy="52" r="12" fill="currentColor" opacity="0.15" />
        <circle cx="58" cy="52" r="7" fill="currentColor" opacity="0.3" />
        <line x1="63" y1="57" x2="69" y2="63" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
);

const ProcessAutomationIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="8" y="28" width="18" height="12" rx="3" fill="currentColor" opacity="0.3" />
        <rect x="31" y="18" width="18" height="12" rx="3" fill="currentColor" opacity="0.5" />
        <rect x="31" y="40" width="18" height="12" rx="3" fill="currentColor" opacity="0.5" />
        <rect x="54" y="28" width="18" height="12" rx="3" fill="currentColor" opacity="0.3" />
        <line x1="26" y1="34" x2="31" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="26" y1="34" x2="31" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="49" y1="24" x2="54" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <line x1="49" y1="46" x2="54" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <circle cx="40" cy="58" r="6" fill="currentColor" opacity="0.2" />
        <path d="M37 58 L39.5 60.5 L44 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
);

const EnterpriseSolutionsIcon = () => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="10" y="30" width="22" height="28" rx="3" fill="currentColor" opacity="0.2" />
        <rect x="29" y="20" width="22" height="38" rx="3" fill="currentColor" opacity="0.35" />
        <rect x="48" y="26" width="22" height="32" rx="3" fill="currentColor" opacity="0.2" />
        <rect x="14" y="38" width="6" height="4" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="14" y="45" width="6" height="4" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="33" y="28" width="6" height="4" rx="1" fill="currentColor" opacity="0.7" />
        <rect x="33" y="35" width="6" height="4" rx="1" fill="currentColor" opacity="0.7" />
        <rect x="33" y="42" width="6" height="4" rx="1" fill="currentColor" opacity="0.7" />
        <rect x="52" y="34" width="6" height="4" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="52" y="41" width="6" height="4" rx="1" fill="currentColor" opacity="0.6" />
        <line x1="10" y1="58" x2="70" y2="58" stroke="currentColor" strokeWidth="2" opacity="0.3" />
    </svg>
);

export const capabilityItems = [
    { slug: "it-consulting", label: "IT Consulting", summary: "Make the right decisions before implementation begins.", description: "Technology decisions grounded in operational reality." },
    { slug: "business-process-automation", label: "Business Process Automation", summary: "Reduce avoidable manual work and improve how work moves.", description: "Reduce manual effort and improve how work moves." },
    { slug: "enterprise-solutions", label: "Enterprise Solutions & Digital Development", summary: "Implement the systems your organisation actually needs.", description: "Build digital systems around defined requirements." }
];

const faqs = [
    ["Can your solutions be customized for my business?", "Yes. Einao designs practical solutions around the needs of individuals, SMEs, enterprises, and public organisations."],
    ["How reliable are Einao services?", "Our solutions are designed around clear requirements, maintainable systems, and the operational conditions in which they must work."],
    ["How do I integrate Einao solutions with my systems?", "We assess the existing systems and information flows, then recommend integration, configuration, automation, or custom development where appropriate."],
    ["Do you provide customer or technical support?", "Yes. Support arrangements can be included in the agreed engagement to help keep systems useful and operational."],
    ["Can individuals as well as businesses use your solutions?", "Our work is tailored to the organisation, service, process, and users involved. We support public institutions, businesses, and service organisations."],
    ["Where are Einao solutions available?", "Einao works with organisations in Nigeria and across relevant African operating contexts, subject to the agreed scope and delivery arrangements."],
    ["How do I get started with Einao?", "Contact us to discuss the operational challenge, technology requirement, or process you want to improve."],
    ["How secure are Einao products and services?", "Security, access, information handling, and implementation controls are considered as part of the defined solution and delivery requirements."]
];

export const details = {
    "it-consulting": { label: "IT Consulting", title: "Make technology decisions with the problem clearly defined.", intro: "Technology projects become difficult to deliver when requirements are unclear or tools are selected before the organisation knows what it needs. Einao helps teams establish a clearer view of the operational problem and the technology response it calls for.", cta: "Discuss a consulting requirement", image: "/assets/images/Thoughtful IT consultant mapping the right solution.png", imageAlt: "Nigerian tech professionals at work", sectionTitle: "What we help clarify", items: [["Business and process analysis", "Understand current activities, stakeholders, information needs, dependencies, and friction."], ["Requirements definition", "Translate stakeholder needs into clear requirements, workflows, user roles, data needs, and constraints."], ["Process mapping", "Make hand-offs, approvals, decision points, exceptions, and dependencies visible."], ["Technology assessment", "Assess whether redesign, automation, integration, configuration, or custom development is appropriate."], ["Solution planning", "Define scope, components, dependencies, priorities, and practical implementation considerations."]], steps: ["Understand", "Analyse", "Define", "Plan"] },
    "business-process-automation": { label: "Business Process Automation", title: "Make the workflow work better.", intro: "Einao helps organisations identify unnecessary steps, reduce repetitive work, structure approvals, and improve the flow of information across processes.", cta: "Discuss a process", image: "/assets/images/VR operator advancing process automation.png", imageAlt: "Business process automation workflow", sectionTitle: "What can be improved", items: [["Process optimisation", "Identify duplicated effort, avoidable hand-offs, and unclear responsibilities."], ["Workflow automation", "Structure recurring activities, task assignments, notifications, and process stages."], ["Digital approvals and escalations", "Define routes for review, approval, rejection, and escalation."], ["System integration", "Connect applications and services where technically feasible."], ["Reporting and visibility", "Make process activity easier to review and reduce routine reporting effort."]], steps: ["Assess", "Redesign", "Automate", "Improve"] },
    "enterprise-solutions": { label: "Enterprise Solutions & Digital Development", title: "Build the digital systems your organisation actually needs.", intro: "When standard tools do not fit an organisation's workflows, information structures, service model, or integration needs, Einao designs and implements systems around the defined requirement.", cta: "Discuss a digital solution", image: "/assets/images/Connected teams, streamlined operations.png", imageAlt: "Enterprise solutions dashboard", sectionTitle: "What we deliver", items: [["Enterprise applications and workflow systems", "Support structured processes such as assessment, approval, case handling, and status tracking."], ["Digital portals and service platforms", "Provide digital access points for requests, information, documents, and service progress."], ["Custom software and business applications", "Design software around operational requirements existing tools do not adequately support."], ["Document and information workflows", "Organise how information is submitted, reviewed, retrieved, and moved."], ["System integration", "Connect applications, services, and data flows where technically feasible."], ["Implementation and improvement", "Support deployment, maintenance, and subsequent improvement where included."]], steps: ["Define", "Design", "Deliver", "Improve"] }
} as const;

export function ReferenceFaq() { return <section className={styles.faq}><div className={styles.faqContainer}><header className={styles.faqHeader}><span className={styles.faqTag}>Frequently asked questions</span><h2 className={styles.faqTitle}>Your Questions, Answered</h2><p className={styles.faqDescription}>Find clear answers about how Einao works and where our capabilities can help.</p></header><div className={styles.faqList}>{faqs.map(([question, answer], i) => <details className={styles.faqCard} id={`faq-${i}`} name="capabilities-faq" open={i === 0} key={question}><summary>{question}</summary><div className={styles.faqAnswer}><p>{answer}</p></div></details>)}</div></div></section>; }

export function CapabilitiesOverview() {
    const icons = [<ItConsultingIcon />, <ProcessAutomationIcon />, <EnterpriseSolutionsIcon />];
    return <main className={styles.page}><ReferenceHero label="Capabilities" title="The right technology starts with the right understanding." intro="Einao works across the path from operational diagnosis to digital implementation. We help organisations define the problem, improve the process, and deliver the systems required to support better ways of working." /><section className={styles.intro}><div className={styles.sectionInner}><h2>Explore our capabilities</h2><p>Choose the capability that best matches the operational challenge you are trying to solve.</p></div></section><section className={styles.cardSection}><div className={styles.cards}>{capabilityItems.map((item, i) => <article className={`${styles.card} ${styles[`card${i}`]}`} key={item.slug}><div className={`${styles.cardVisual} ${styles[`cardVisual${i}`]}`}>{icons[i]}</div><div className={styles.cardBody}><h3><Link className={styles.cardTitleLink} to={`/capabilities/${item.slug}/`}>{item.label}</Link></h3><p>{item.summary}</p><p>{item.description}</p><Link className={styles.cardCta} to="/contact/">Talk to a Consultant <span aria-hidden="true">-&gt;</span></Link></div></article>)}</div></section><ReferenceFaq /></main>
}

export function CapabilityDetail({ slug }: { slug: string }) { const detail = details[slug as keyof typeof details] ?? details["it-consulting"]; return <main className={styles.page}><ReferenceHero label={`Capabilities / ${detail.label}`} title={detail.title} intro={detail.intro} cta={detail.cta} image={detail.image} imageAlt={detail.imageAlt} /><section className={styles.detailSection}><div className={styles.sectionInner}><h2>{detail.sectionTitle}</h2><div className={styles.detailGrid}>{detail.items.map(([title, body]) => <article className={styles.detailCard} key={title}><h3>{title}</h3><p>{body}</p></article>)}</div><div className={styles.steps}>{detail.steps.map((step, index) => <div className={styles.step} key={step}><strong>{String(index + 1).padStart(2, "0")} / {step}</strong><p>Practical, clear, and aligned to the agreed outcome.</p></div>)}</div><Link className={styles.back} to="/capabilities/">Back to all capabilities</Link></div></section><ReferenceFaq /></main> }




