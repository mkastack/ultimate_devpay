import { Construction } from "lucide-react";
import { DashboardHeader } from "./Header";

export function PlaceholderPage({ title, blurb }: { title: string; blurb: string }) {
  return (
    <>
      <DashboardHeader title={title} subtitle="Coming next — wire to Lovable Cloud" />
      <div
        className="grid place-items-center rounded-2xl p-16 text-center"
        style={{ background: "var(--surface)", border: "1px dashed var(--color-border)" }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full" style={{ background: "rgba(0,198,167,0.10)" }}>
          <Construction className="h-6 w-6 text-[color:var(--cyan-brand)]" />
        </div>
        <h2 className="mt-4 font-display text-[20px] font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-md text-[14px] text-[color:var(--text-secondary)]">{blurb}</p>
      </div>
    </>
  );
}