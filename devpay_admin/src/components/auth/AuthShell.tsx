import { ReactNode } from "react";
import logoAsset from "@/assets/devpay-logo.png.asset.json";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#0A1330] text-white relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #1E3A8A 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #14B8A6 0%, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-stretch justify-center px-5 py-10 md:flex-row md:items-center md:gap-10 md:px-8">
        {/* Brand pane (desktop) */}
        <div className="hidden md:flex flex-1 flex-col justify-between rounded-3xl border border-[#1E2D5C] bg-gradient-to-br from-[#0F1A3D] to-[#0A1330] p-10">
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="DevPay Africa" className="h-12 w-12" />
            <div>
              <div className="font-display text-2xl font-bold tracking-tight">DevPay Africa</div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#8890B5]">Admin Control Center</div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-display text-3xl font-bold leading-tight">
              The mission control for Africa's developer economy.
            </h2>
            <p className="text-sm text-[#8890B5] leading-relaxed">
              Approve contracts, release escrow, resolve disputes, and keep payouts flowing — all from one
              secure command center built for platform operators.
            </p>
            <ul className="space-y-3 text-sm text-[#B6BFE0]">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#14B8A6]" />
                Real-time activity & escrow oversight
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#14B8A6]" />
                Bulk moderation across reviews & proposals
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#14B8A6]" />
                Granular audit trails for every action
              </li>
            </ul>
          </div>

          <div className="text-xs text-[#5C6485]">© {new Date().getFullYear()} DevPay Africa · Internal use only</div>
        </div>

        {/* Form pane */}
        <div className="flex-1">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-[#1E2D5C] bg-[#0F1A3D]/95 p-7 shadow-2xl backdrop-blur md:p-9">
            <div className="flex items-center gap-3 md:hidden mb-6">
              <img src={logoAsset.url} alt="DevPay Africa" className="h-10 w-10" />
              <div>
                <div className="font-display text-lg font-bold">DevPay Africa</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#8890B5]">Admin</div>
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-[#8890B5]">{subtitle}</p>

            <div className="mt-6">{children}</div>

            <div className="mt-6 border-t border-[#1E2D5C] pt-5 text-center text-sm text-[#8890B5]">
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8890B5]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-lg border border-[#1E2D5C] bg-[#0A1330] px-3.5 py-2.5 text-sm text-white placeholder:text-[#3D4466] outline-none transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/30"
      />
    </label>
  );
}

export function AuthSubmit({ children, loading }: { children: ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full rounded-lg bg-gradient-to-r from-[#14B8A6] to-[#0D9488] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#14B8A6]/20 transition hover:from-[#0D9488] hover:to-[#0F766E] disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function SocialAuth({ mode }: { mode: "signin" | "signup" }) {
  const verb = mode === "signin" ? "Sign in" : "Sign up";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => alert("Google OAuth will be wired up when Lovable Cloud auth is enabled.")}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#0A1330] px-3 py-2.5 text-xs font-semibold text-white transition hover:border-[#14B8A6] hover:bg-[#0F1A3D]"
        >
          <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 35.9 44 30.4 44 24c0-1.2-.1-2.3-.4-3.5z" />
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => alert("GitHub OAuth will be wired up when Lovable Cloud auth is enabled.")}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#1E2D5C] bg-[#0A1330] px-3 py-2.5 text-xs font-semibold text-white transition hover:border-[#14B8A6] hover:bg-[#0F1A3D]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden>
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.13v3.16c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
          </svg>
          GitHub
        </button>
      </div>
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#5C6485]">
        <span className="h-px flex-1 bg-[#1E2D5C]" />
        Or {verb.toLowerCase()} with email
        <span className="h-px flex-1 bg-[#1E2D5C]" />
      </div>
    </div>
  );
}

