import { useEffect, useState } from "react";

const KEY = "devpay.logo-url";
const EVT = "devpay:logo-changed";

export function getStoredLogo(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function setStoredLogo(url: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (url) localStorage.setItem(KEY, url);
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent(EVT, { detail: url }));
  } catch {}
}

export function useLogoUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    setUrl(getStoredLogo());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setUrl(typeof detail === "string" ? detail : getStoredLogo());
    };
    const storage = (e: StorageEvent) => { if (e.key === KEY) setUrl(e.newValue); };
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return url;
}
