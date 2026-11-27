import { useAdminShortcuts } from './AdminContext';
import styles from './AdminBar.module.css';

export function AdminBar() {
  const { isAdmin, shortcutsEnabled, toggleShortcuts, dashboardUrl } = useAdminShortcuts();
  if (!isAdmin) return null;
  return <aside className={styles.bar} aria-label="Administration">
    <span className={styles.identity}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z" /></svg><span>Admin view</span></span>
    <div className={styles.actions}>
      <button className={styles.toggle} type="button" role="switch" aria-checked={shortcutsEnabled} onClick={toggleShortcuts}>
        <span><span className={styles.desktop}>Show section shortcuts</span><span className={styles.mobile}>Section shortcuts</span></span>
        <span className={styles.track} aria-hidden="true"><span /></span>
      </button>
      <a className={styles.dashboard} href={dashboardUrl}>Dashboard <span aria-hidden="true">&#8599;</span></a>
    </div>
  </aside>;
}
