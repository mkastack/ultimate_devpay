import * as React from "react";

type Ctx = { collapsed: boolean; setCollapsed: (v: boolean) => void; toggle: () => void };
const SidebarCtx = React.createContext<Ctx | null>(null);

export function SidebarUIProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = React.useState(false);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem("devpay.sidebar.collapsed");
      if (v === "1") setCollapsedState(true);
    } catch {}
  }, []);

  const setCollapsed = React.useCallback((v: boolean) => {
    setCollapsedState(v);
    try { localStorage.setItem("devpay.sidebar.collapsed", v ? "1" : "0"); } catch {}
  }, []);

  const toggle = React.useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

  return (
    <SidebarCtx.Provider value={{ collapsed, setCollapsed, toggle }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export function useSidebarUI() {
  const ctx = React.useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebarUI must be used inside SidebarUIProvider");
  return ctx;
}