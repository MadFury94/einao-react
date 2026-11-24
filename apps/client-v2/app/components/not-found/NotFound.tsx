import { Link } from "react-router";
import styles from "./NotFound.module.css";

export function NotFoundPage() {
  return <main className={styles.page}>
    <section className={styles.panel}>
      <div className={styles.number} aria-hidden="true">404</div>
      <span className={styles.tag}>Page not found</span>
      <h1>There’s nothing here yet.</h1>
      <p>The page you’re looking for may have moved, or the address may be incomplete. Let’s get you back to something useful.</p>
      <div className={styles.actions}><Link className={styles.primary} to="/">Go to the homepage <span aria-hidden="true">-&gt;</span></Link><Link className={styles.secondary} to="/capabilities/">Explore capabilities</Link></div>
    </section>
  </main>;
}
