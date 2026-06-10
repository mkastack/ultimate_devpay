import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";
type Ctx = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  theme: Theme;
  toggleTheme: () => void;
};

const AdminPrefsContext = createContext<Ctx | null>(null);

export function AdminPrefsProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  // Light is the primary theme; dark is secondary.
  const [theme, setTheme] = useState<Theme>("light");

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const c = localStorage.getItem("admin:collapsed");
      const t = localStorage.getItem("admin:theme") as Theme | null;
      if (c === "1") setCollapsed(true);
      if (t === "light" || t === "dark") setTheme(t);
    } catch {}
  }, []);

  // Apply theme to root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-admin-theme", theme);
    try {
      localStorage.setItem("admin:theme", theme);
    } catch {}
    return () => {
      root.removeAttribute("data-admin-theme");
    };
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("admin:collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  return (
    <AdminPrefsContext.Provider
      value={{
        collapsed,
        toggleCollapsed: () => setCollapsed((v) => !v),
        theme,
        toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </AdminPrefsContext.Provider>
  );
}

export function useAdminPrefs() {
  const ctx = useContext(AdminPrefsContext);
  if (!ctx) throw new Error("useAdminPrefs must be used within AdminPrefsProvider");
  return ctx;
}
