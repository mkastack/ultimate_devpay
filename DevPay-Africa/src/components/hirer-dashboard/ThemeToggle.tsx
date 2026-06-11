import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "devpay.theme";

export function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

export function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") root.classList.add("light");
  else root.classList.remove("light");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    const saved = getInitialTheme();
    const current = isLight ? "light" : saved;
    setTheme(current);
    applyTheme(current);
    setMounted(true);
  }, []);

  const setNext = (next: "light" | "dark") => {
    setTheme(next);
    applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch {}
  };

  const toggle = () => setNext(theme === "dark" ? "light" : "dark");

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Enter/Space already trigger native button click. Support arrow keys
    // for explicit directional control, matching the switch role pattern.
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setNext("dark");
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setNext("light");
    }
  };

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      onKeyDown={onKeyDown}
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-[10px] border transition-colors hover:bg-accent focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-[var(--background)]"
      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
    >
      <span className="sr-only">{label}</span>
      {!mounted ? (
        <Sun aria-hidden="true" className="h-[18px] w-[18px] opacity-0" />
      ) : theme === "dark" ? (
        <Sun aria-hidden="true" className="h-[18px] w-[18px]" />
      ) : (
        <Moon aria-hidden="true" className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
