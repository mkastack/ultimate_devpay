import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Smartphone, Plus, Trash2, Pencil, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";

export const Route = createFileRoute("/developer/payment-methods")({
  head: () => ({ meta: [{ title: "Payment Methods — DevPay Africa" }] }),
  component: PaymentMethodsPage,
});

type Kind = "card" | "paystack";
type Method = {
  id: string;
  kind: Kind;
  label: string;
  // card
  brand?: "Visa" | "Mastercard" | "Verve";
  last4?: string;
  exp?: string; // MM/YY
  holder?: string;
  // paystack / momo
  provider?: "MTN" | "Vodafone" | "AirtelTigo";
  phone?: string;
  email?: string;
  isDefault?: boolean;
};

const initial: Method[] = [
  { id: "m1", kind: "card", label: "Personal Visa", brand: "Visa", last4: "4242", exp: "08/27", holder: "Kwame Mensah", isDefault: true },
  { id: "m2", kind: "paystack", label: "MoMo Payouts", provider: "MTN", phone: "+233 24 555 0119", email: "kwame@devpay.africa" },
];

function brandColor(brand?: string) {
  if (brand === "Visa") return "#1a1f71";
  if (brand === "Mastercard") return "#eb001b";
  return "#00aeef";
}

function detectBrand(num: string): Method["brand"] {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (n.startsWith("506") || n.startsWith("650")) return "Verve";
  return "Visa";
}

function formatCard(num: string) {
  return num.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function PaymentMethodsPage() {
  const [methods, setMethods] = useState<Method[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Method | null>(null);
  const [kind, setKind] = useState<Kind>("card");

  function openAdd(k: Kind) {
    setKind(k);
    setEditing(null);
    setOpen(true);
  }
  function openEdit(m: Method) {
    setKind(m.kind);
    setEditing(m);
    setOpen(true);
  }
  function remove(id: string) {
    setMethods((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (!next.some((m) => m.isDefault) && next[0]) next[0].isDefault = true;
      return [...next];
    });
  }
  function makeDefault(id: string) {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }
  function save(m: Method) {
    setMethods((prev) => {
      const exists = prev.some((p) => p.id === m.id);
      let next = exists ? prev.map((p) => (p.id === m.id ? m : p)) : [...prev, m];
      if (m.isDefault) next = next.map((p) => ({ ...p, isDefault: p.id === m.id }));
      if (!next.some((p) => p.isDefault)) next[0].isDefault = true;
      return next;
    });
    setOpen(false);
  }

  return (
    <>
      <DevDashboardHeader title="Payment methods" subtitle="Add, update, or remove the cards and Paystack accounts you use for billing and payouts." />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => openAdd("card")}
          className="flex items-center gap-3 rounded-2xl p-4 text-left transition-colors active:scale-[0.99] hover:bg-[color:var(--surface-hover)]"
          style={{ background: "var(--surface)", border: "1px dashed var(--color-border)" }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgba(0,198,167,0.12)" }}>
            <CreditCard className="h-5 w-5 text-[color:var(--cyan-brand)]" />
          </span>
          <span className="flex-1">
            <span className="block text-[13.5px] font-semibold text-white">Add card</span>
            <span className="block text-[12px] text-[color:var(--text-muted)]">Visa, Mastercard, Verve</span>
          </span>
          <Plus className="h-4 w-4 text-[color:var(--text-muted)]" />
        </button>
        <button
          type="button"
          onClick={() => openAdd("paystack")}
          className="flex items-center gap-3 rounded-2xl p-4 text-left transition-colors active:scale-[0.99] hover:bg-[color:var(--surface-hover)]"
          style={{ background: "var(--surface)", border: "1px dashed var(--color-border)" }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgba(0,198,167,0.12)" }}>
            <Smartphone className="h-5 w-5 text-[color:var(--cyan-brand)]" />
          </span>
          <span className="flex-1">
            <span className="block text-[13.5px] font-semibold text-white">Add Paystack / MoMo</span>
            <span className="block text-[12px] text-[color:var(--text-muted)]">MTN, Vodafone, AirtelTigo</span>
          </span>
          <Plus className="h-4 w-4 text-[color:var(--text-muted)]" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {methods.length === 0 && (
          <div className="col-span-full rounded-2xl p-8 text-center text-[13px] text-[color:var(--text-muted)]" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
            No payment methods yet. Add a card or Paystack account to get started.
          </div>
        )}
        {methods.map((m) => (
          <article
            key={m.id}
            className="relative flex flex-col gap-3 rounded-2xl p-4"
            style={{
              background: "var(--surface)",
              border: m.isDefault ? "1px solid rgba(0,198,167,0.45)" : "1px solid var(--color-border)",
              boxShadow: m.isDefault ? "0 8px 24px -16px rgba(0,198,167,0.55)" : "none",
            }}
          >
            {m.kind === "card" ? (
              <div
                className="relative overflow-hidden rounded-xl p-4 text-white"
                style={{
                  background: `linear-gradient(135deg, ${brandColor(m.brand)} 0%, #111 130%)`,
                  minHeight: 130,
                }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] uppercase tracking-widest opacity-80">{m.brand}</span>
                  <CreditCard className="h-5 w-5 opacity-80" />
                </div>
                <div className="mt-5 font-mono-nums text-[18px] tracking-[0.18em]">•••• •••• •••• {m.last4}</div>
                <div className="mt-3 flex items-end justify-between text-[11px] opacity-90">
                  <div>
                    <div className="opacity-70">Cardholder</div>
                    <div className="text-[12.5px] font-semibold">{m.holder}</div>
                  </div>
                  <div className="text-right">
                    <div className="opacity-70">Exp</div>
                    <div className="font-mono-nums text-[12.5px] font-semibold">{m.exp}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="relative overflow-hidden rounded-xl p-4 text-white"
                style={{
                  background: "linear-gradient(135deg, #0fa958 0%, #062b18 130%)",
                  minHeight: 130,
                }}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] uppercase tracking-widest opacity-80">Paystack · {m.provider}</span>
                  <Smartphone className="h-5 w-5 opacity-80" />
                </div>
                <div className="mt-5 font-mono-nums text-[16px] tracking-wider">{m.phone}</div>
                <div className="mt-3 text-[11px] opacity-90">{m.email}</div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[13.5px] font-semibold text-white">{m.label}</span>
                  {m.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(0,198,167,0.15)", color: "var(--cyan-brand)" }}>
                      <CheckCircle2 className="h-3 w-3" /> DEFAULT
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-[color:var(--text-muted)]">
                  {m.kind === "card" ? `${m.brand} ending in ${m.last4}` : `Mobile Money · ${m.provider}`}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!m.isDefault && (
                  <button
                    type="button"
                    onClick={() => makeDefault(m.id)}
                    className="h-8 rounded-[8px] px-2.5 text-[11.5px] font-medium text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    Set default
                  </button>
                )}
                <button type="button" onClick={() => openEdit(m)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-[8px] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]" style={{ border: "1px solid var(--color-border)" }}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => remove(m.id)} aria-label="Remove" className="grid h-8 w-8 place-items-center rounded-[8px] text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)]" style={{ border: "1px solid var(--color-border)" }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-[12px] text-[color:var(--text-muted)]" style={{ background: "var(--surface)", border: "1px solid var(--color-border)" }}>
        <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--cyan-brand)]" />
        Card details are encrypted and tokenized via Paystack. We never store your full card number.
      </div>

      {open && (
        <MethodSheet
          kind={kind}
          setKind={setKind}
          initial={editing}
          onClose={() => setOpen(false)}
          onSave={save}
        />
      )}
    </>
  );
}

function MethodSheet({
  kind,
  setKind,
  initial,
  onClose,
  onSave,
}: {
  kind: Kind;
  setKind: (k: Kind) => void;
  initial: Method | null;
  onClose: () => void;
  onSave: (m: Method) => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  // card fields
  const [number, setNumber] = useState(initial?.last4 ? `•••• •••• •••• ${initial.last4}` : "");
  const [exp, setExp] = useState(initial?.exp ?? "");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState(initial?.holder ?? "");

  // paystack fields
  const [provider, setProvider] = useState<NonNullable<Method["provider"]>>(initial?.provider ?? "MTN");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!label.trim()) errs.label = "Required";
    if (kind === "card") {
      const digits = number.replace(/\D/g, "");
      if (!initial && (digits.length < 13 || digits.length > 16)) errs.number = "Enter a valid card number";
      if (!/^\d{2}\/\d{2}$/.test(exp)) errs.exp = "MM/YY";
      if (!initial && !/^\d{3,4}$/.test(cvc)) errs.cvc = "3–4 digits";
      if (!holder.trim()) errs.holder = "Required";
    } else {
      if (!/^[+\d\s-]{8,}$/.test(phone)) errs.phone = "Enter a valid phone";
      if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Invalid email";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (kind === "card") {
      const digits = number.replace(/\D/g, "");
      const last4 = initial?.last4 && digits.length < 4 ? initial.last4 : digits.slice(-4);
      onSave({
        id: initial?.id ?? `m_${Date.now()}`,
        kind: "card",
        label: label.trim(),
        brand: initial?.brand ?? detectBrand(digits),
        last4,
        exp,
        holder: holder.trim(),
        isDefault,
      });
    } else {
      onSave({
        id: initial?.id ?? `m_${Date.now()}`,
        kind: "paystack",
        label: label.trim(),
        provider,
        phone: phone.trim(),
        email: email.trim(),
        isDefault,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:m-4"
        style={{ background: "var(--surface)", border: "1px solid var(--color-border)", maxHeight: "92dvh", overflowY: "auto" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[16px] font-semibold text-white">
            {initial ? "Edit method" : kind === "card" ? "Add card" : "Add Paystack account"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-md text-[color:var(--text-muted)] hover:bg-[color:var(--surface-hover)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!initial && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-[10px] p-1" style={{ background: "var(--background)", border: "1px solid var(--color-border)" }}>
            {(["card", "paystack"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className="h-8 rounded-[8px] text-[12.5px] font-semibold transition-colors"
                style={{
                  background: kind === k ? "var(--cyan-brand)" : "transparent",
                  color: kind === k ? "var(--background)" : "var(--text-secondary)",
                }}
              >
                {k === "card" ? "Card" : "Paystack / MoMo"}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <Field label="Nickname" error={errors.label}>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Personal Visa" className={inputCls} />
          </Field>

          {kind === "card" ? (
            <>
              <Field label="Card number" error={errors.number}>
                <input
                  inputMode="numeric"
                  value={number}
                  onChange={(e) => setNumber(formatCard(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className={inputCls}
                  disabled={!!initial}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry (MM/YY)" error={errors.exp}>
                  <input
                    inputMode="numeric"
                    value={exp}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setExp(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                    }}
                    placeholder="08/27"
                    className={inputCls}
                  />
                </Field>
                <Field label="CVC" error={errors.cvc}>
                  <input
                    inputMode="numeric"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    className={inputCls}
                    disabled={!!initial}
                  />
                </Field>
              </div>
              <Field label="Cardholder name" error={errors.holder}>
                <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Full name on card" className={inputCls} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Provider">
                <div className="grid grid-cols-3 gap-1 rounded-[10px] p-1" style={{ background: "var(--background)", border: "1px solid var(--color-border)" }}>
                  {(["MTN", "Vodafone", "AirtelTigo"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className="h-8 rounded-[8px] text-[12px] font-semibold"
                      style={{
                        background: provider === p ? "var(--cyan-brand)" : "transparent",
                        color: provider === p ? "var(--background)" : "var(--text-secondary)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Mobile number" error={errors.phone}>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 555 0000" className={inputCls} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
              </Field>
            </>
          )}

          <label className="flex items-center gap-2 pt-1 text-[12.5px] text-[color:var(--text-secondary)]">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4 accent-[color:var(--cyan-brand)]" />
            Set as default payment method
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="h-10 flex-1 rounded-[10px] text-[13.5px] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)]" style={{ border: "1px solid var(--color-border)" }}>
            Cancel
          </button>
          <button type="submit" className="h-10 flex-1 rounded-[10px] bg-[color:var(--cyan-brand)] text-[13.5px] font-semibold text-[color:var(--background)] hover:shadow-cyan">
            {initial ? "Save changes" : "Add method"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-[10px] bg-[color:var(--background)] px-3 text-[13.5px] text-white outline-none focus:border-[color:var(--cyan-brand)] disabled:opacity-60";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-[color:var(--text-secondary)]">
        <span>{label}</span>
        {error && <span className="text-[11px] font-normal text-[#ef4444]">{error}</span>}
      </div>
      <div style={{ border: `1px solid ${error ? "#ef4444" : "var(--color-border)"}`, borderRadius: 10 }}>
        {children}
      </div>
    </label>
  );
}