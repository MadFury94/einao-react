import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'einao_admin_shortcuts';
type AdminShortcuts = { isAdmin: boolean; shortcutsEnabled: boolean; toggleShortcuts: () => void; dashboardUrl: string };
const AdminContext = createContext<AdminShortcuts>({
  dashboardUrl: '', isAdmin: false, shortcutsEnabled: false, toggleShortcuts: () => {},
});

export function AdminProvider({ isAdmin, dashboardUrl, children }: { isAdmin: boolean; dashboardUrl: string; children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    if (!isAdmin) return;
    try { setEnabled(localStorage.getItem(STORAGE_KEY) !== 'false'); }
    catch { /* Keep the default when storage is unavailable. */ }
  }, [isAdmin]);

  function toggleShortcuts() {
    if (!isAdmin) return;
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); }
    catch { /* The toggle still works in memory when storage is blocked. */ }
  }

  return <AdminContext.Provider value={{ isAdmin, dashboardUrl, shortcutsEnabled: isAdmin && enabled, toggleShortcuts }}>{children}</AdminContext.Provider>;
}

export function useAdminShortcuts() {
  return useContext(AdminContext);
}
