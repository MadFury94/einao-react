import { Link } from "react-router";
import styles from "../capabilities/Capabilities.module.css";
import { ReferenceFaq } from "../capabilities/Capabilities";
import { ReferenceHero } from "../reference-hero/ReferenceHero";

const solutions=[
 {slug:"custom-enterprise-systems",label:"Custom Enterprise Systems",summary:"Digital systems shaped around complex organisational requirements.",description:"Build a practical system around the way your teams work.",image:"/assets/images/Graphite monitor with enterprise dashboard.png"},
 {slug:"ip-pro",label:"IP Pro",summary:"Structured intellectual property application management.",description:"Support clearer intake, review, tracking, and information workflows.",image:"/assets/images/Hands sketching a business workflow.png"},
 {slug:"fylonn",label:"Fylonn",summary:"Application and process management for structured operations.",description:"Connect requests, processing, decisions, and visibility in one workflow.",image:"/assets/images/Einao staff working on automation with client.jpg"},
 {slug:"payx",label:"PayX",summary:"Digital payment operations for organisations that need clarity.",description:"Discuss the right payment workflow and operational fit for your organisation.",image:"/assets/images/Collaborative technology team in Abuja office.png"}
];
export function SolutionsOverview(){return <main className={styles.page}><ReferenceHero label="Solutions" title="Practical technology for the way your organisation works." intro="Explore Einao solutions designed around operational requirements, from custom enterprise systems and workflow platforms to payment and information management." cta="Talk to a Consultant"/><section className={styles.intro}><div className={styles.sectionInner}><h2>Explore our solutions</h2><p>Each solution starts with the requirement, process, and people it needs to support.</p></div></section><section className={styles.cardSection}><div className={styles.cards}>{solutions.map(item=><article className={styles.card} key={item.slug}><div className={styles.cardVisual}><img src={item.image} alt="" loading="lazy" /></div><div className={styles.cardBody}><h3><Link className={styles.cardTitleLink} to={`/solutions/${item.slug}/`}>{item.label}</Link></h3><p>{item.summary}</p><p>{item.description}</p><Link className={styles.cardCta} to="/contact/">Talk to a Consultant <span aria-hidden="true">-&gt;</span></Link></div></article>)}</div></section><ReferenceFaq/></main>}


