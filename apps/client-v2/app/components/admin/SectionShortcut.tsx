import { useId, useState, type ReactNode } from 'react';
import { useAdminShortcuts } from './AdminContext';
import styles from './SectionShortcut.module.css';

export function SectionShortcut({ name, path, action = 'Section settings', hero = false, children }: { name: string; path?: string; action?: string; hero?: boolean; children: ReactNode }) {
  const { isAdmin, shortcutsEnabled, dashboardUrl } = useAdminShortcuts();
  const tooltipId = useId();
  const [dismissed, setDismissed] = useState(false);
  if (!isAdmin || !path) return <>{children}</>;
  return <div className={styles.section} data-shortcuts={shortcutsEnabled} data-admin-section={name}>
    {children}
    {shortcutsEnabled && <div className={styles.control} data-hero={hero} data-dismissed={dismissed}
      onMouseEnter={() => setDismissed(false)} onFocus={() => setDismissed(false)}
      onKeyDown={event => { if (event.key === 'Escape') setDismissed(true); }}>
      <a className={styles.badge} href={dashboardUrl.replace(/\/$/, '') + path} aria-label={name + ' \u00b7 ' + action} aria-describedby={tooltipId}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6m8 4v6" /><circle cx="8" cy="7" r="2" fill="#0c1710" /><circle cx="16" cy="17" r="2" fill="#0c1710" /></svg>
        <span>{name}<span className={styles.longLabel}> &middot; {action}</span></span><span aria-hidden="true">&#8599;</span>
      </a>
      <span id={tooltipId} role="tooltip" className={styles.tooltip}>{action === 'Manage items' ? 'Open this menu to add, edit, or remove items' : 'Open this content in the admin dashboard'}</span>
    </div>}
  </div>;
}
