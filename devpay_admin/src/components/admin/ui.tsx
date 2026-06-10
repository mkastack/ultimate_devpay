import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = "p-5",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#1C2040] bg-[#0D0F1A] ${padding} ${
        hover ? "transition-all duration-150 hover:-translate-y-[2px] hover:border-[rgba(30,58,138,0.30)] hover:shadow-[0_8px_32px_rgba(30,58,138,0.25)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Pill({
  color = "purple",
  children,
}: {
  color?: "purple" | "cyan" | "gold" | "green" | "red" | "amber" | "blue" | "gray";
  children: ReactNode;
}) {
  const map: Record<string, string> = {
    purple: "bg-[rgba(30,58,138,0.18)] text-[#3B82F6]",
    cyan: "bg-[rgba(0,198,167,0.15)] text-[#00C6A7]",
    gold: "bg-[rgba(245,166,35,0.15)] text-[#F5A623]",
    green: "bg-[rgba(16,185,129,0.15)] text-[#10B981]",
    red: "bg-[rgba(255,77,106,0.15)] text-[#FF4D6A]",
    amber: "bg-[rgba(245,158,11,0.15)] text-[#F59E0B]",
    blue: "bg-[rgba(59,130,246,0.15)] text-[#3B82F6]",
    gray: "bg-[#12152A] text-[#8890B5]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-[3px] font-sans text-[11px] font-semibold ${map[color]}`}>
      {children}
    </span>
  );
}

export function StatusDot({ color }: { color: string }) {
  return <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />;
}

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-sans text-[15px] font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 font-sans text-[12px] text-[#3D4466]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Avatar({
  name,
  color = "#1E3A8A",
  size = 36,
  ring,
}: {
  name: string;
  color?: string;
  size?: number;
  ring?: string;
}) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-display font-bold text-white"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.38,
        border: ring ? `2px solid ${ring}` : undefined,
      }}
    >
      {initials}
    </div>
  );
}

export function PlaceholderPage({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle?: string;
  description?: string;
}) {
  return (
    <div>
      <div className="mb-7 flex h-[60px] items-center justify-between border-b border-[#1C2040]">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 font-sans text-[12px] text-[#3D4466]">{subtitle}</p>}
        </div>
      </div>
      <Card padding="p-12" className="text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[rgba(30,58,138,0.15)] font-display text-2xl">⚙️</div>
        <h2 className="font-display text-[18px] font-bold text-white">{title} workspace</h2>
        <p className="mx-auto mt-2 max-w-md font-sans text-[13px] text-[#8890B5]">
          {description ?? "This module is fully provisioned. Live data wiring lands when Lovable Cloud is enabled."}
        </p>
      </Card>
    </div>
  );
}
