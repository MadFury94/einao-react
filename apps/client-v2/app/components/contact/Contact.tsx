import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ReferenceHero } from "../reference-hero/ReferenceHero";
import styles from "./Contact.module.css";

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return <main className={styles.page}>
    <ReferenceHero label="Contact Einao" title="Let’s talk about what needs to work better." intro="Tell us what your organisation is trying to improve. We’ll help you clarify the requirement, understand the options, and decide on a practical next step." cta="Start a conversation" image="/assets/images/Collaborative technology team in Abuja office.png" imageAlt="Einao team discussing a technology project" />
    <section className={styles.contactSection}>
      <div className={styles.contactInner}>
        <div className={styles.details}>
          <span className={styles.tag}>Start with the context</span>
          <h2>Bring us the problem behind the request.</h2>
          <p>Whether you need advice on a technology decision, a clearer process, or a system built around your organisation, the first conversation starts with understanding how the work happens today.</p>
          <div className={styles.detailList}>
            <div><span className={styles.detailLabel}>Email</span><a href="mailto:hello@einaosolutions.com">hello@einaosolutions.com</a></div>
            <div><span className={styles.detailLabel}>Location</span><p>Abuja, Nigeria</p></div>
            <div><span className={styles.detailLabel}>What we discuss</span><p>Technology consulting, process automation, enterprise systems, and digital transformation.</p></div>
          </div>
        </div>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formHeader}><span className={styles.tag}>Talk to a consultant</span><h2>Tell us a little about your requirement.</h2></div>
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Work email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Organisation<input name="organisation" autoComplete="organization" /></label>
          <label>How can we help?<textarea name="message" rows={5} required /></label>
          {sent && <p className={styles.success} role="status">Thank you. Your message is ready for the Einao team.</p>}
          <button type="submit">Send message <span aria-hidden="true">-&gt;</span></button>
        </form>
      </div>
    </section>
    <section className={styles.next}><div><span className={styles.tag}>Not sure where to start?</span><h2>Explore our capabilities first.</h2><Link className={styles.link} to="/capabilities/">View capabilities <span aria-hidden="true">-&gt;</span></Link></div></section>
  </main>;
}
