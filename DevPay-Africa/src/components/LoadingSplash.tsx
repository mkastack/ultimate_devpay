import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import logoImg from "@/assets/devpay-logo.png";

/**
 * Full-screen splash with radial pulse + soft chime.
 * Triggers on first mount and on every route pathname change.
 */
export function LoadingSplash() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [visible, setVisible] = useState(true);
  const firstRender = useRef(true);

  // Play a soft cyan-teal chime via WebAudio (no asset needed).
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const notes = [523.25, 783.99]; // C5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = now + i * 0.08;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.6);
      });
      setTimeout(() => ctx.close().catch(() => {}), 900);
    } catch {
      /* user-gesture or permission issue — silent fail */
    }
  };

  useEffect(() => {
    setVisible(true);
    if (!firstRender.current) playChime();
    firstRender.current = false;
    const t = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(t);
  }, [path]);

  // Try to play once on first user interaction so subsequent route chimes are unblocked.
  useEffect(() => {
    const unlock = () => {
      playChime();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-200"
      aria-hidden
    >
      <div className="relative h-40 w-40 flex items-center justify-center">
        {/* Radial pulse rings */}
        <span className="absolute inset-0 rounded-full border border-primary/40 animate-ping" />
        <span
          className="absolute inset-4 rounded-full border border-primary/30 animate-ping"
          style={{ animationDelay: "180ms" }}
        />
        <span
          className="absolute inset-8 rounded-full border border-accent/30 animate-ping"
          style={{ animationDelay: "360ms" }}
        />
        <span className="absolute inset-6 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.14_180/0.3),transparent_70%)] blur-xl" />
        <img
          src={logoImg}
          alt="DevPay Africa"
          className="relative h-20 w-20 object-contain animate-in zoom-in-50 duration-500"
        />
      </div>
    </div>
  );
}
