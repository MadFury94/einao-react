import { Form, Link, useActionData } from "react-router";
import { ReferenceHero } from "../reference-hero/ReferenceHero";
import styles from "./Contact.module.css";

type ContactResult = { success?: string; error?: string };

export function ContactPage() {
  const result = useActionData() as ContactResult | undefined;
  return <main className={styles.page}>
    <ReferenceHero label="Contact Einao" title="Let’s talk about what needs to work better." intro="Tell us what your organisation is trying to improve. We’ll help you clarify the requirement, understand the options, and decide on a practical next step." cta="Start a conversation" image="/assets/images/contact hero.png" imageAlt="Einao team discussing a technology project" />
    <section className={styles.contactSection}><div className={styles.contactInner}>
      <div className={styles.details}><span className={styles.tag}>Start with the context</span><h2>Bring us the problem behind the request.</h2><p>Whether you need advice on a technology decision, a clearer process, or a system built around your organisation, the first conversation starts with understanding how the work happens today.</p><div className={styles.detailList}><div><span className={styles.detailLabel}>Email</span><a href="mailto:hello@einaosolutions.com">hello@einaosolutions.com</a></div><div><span className={styles.detailLabel}>Location</span><p>Abuja, Nigeria</p></div><div><span className={styles.detailLabel}>What we discuss</span><p>Technology consulting, process automation, enterprise systems, and digital transformation.</p></div></div></div>
      <Form method="post" className={styles.form}><div className={styles.formHeader}><span className={styles.tag}>Talk to a consultant</span><h2>Tell us a little about your requirement.</h2></div><label>Name<input name="name" required autoComplete="name" /></label><label>Work email<input name="email" type="email" required autoComplete="email" /></label><label>Organisation<input name="organisation" autoComplete="organization" /></label><label>How can we help?<textarea name="message" rows={5} required /></label><input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.honeypot} />{result?.error && <p className={styles.error} role="alert">{result.error}</p>}{result?.success && <p className={styles.success} role="status">{result.success}</p>}<button type="submit">Send message <span aria-hidden="true">-&gt;</span></button></Form>
    </div></section>
    <section className={styles.next}><div><span className={styles.tag}>Not sure where to start?</span><h2>Explore our capabilities first.</h2><Link className={styles.link} to="/capabilities/">View capabilities <span aria-hidden="true">-&gt;</span></Link></div></section>
  </main>;
}
