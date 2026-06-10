import { useState } from "react";
import { initials as initialsOf } from "@/lib/format";

type Props = {
  src?: string | null;
  name: string;
  size?: number;
  rounded?: "full" | "lg";
  className?: string;
  alt?: string;
};

/**
 * Avatar component that renders an uploaded image or falls back to initials.
 * - Square (1:1) sizing — no layout shift.
 * - `object-cover` so non-square uploads crop cleanly instead of stretching.
 * - Onerror handler falls back to initials so broken URLs never leave a void.
 */
export function Avatar({ src, name, size = 40, rounded = "full", className = "", alt }: Props) {
  const [failed, setFailed] = useState(false);
  const radius = rounded === "full" ? 9999 : Math.round(size * 0.22);
  const showImage = !!src && !failed;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border-2 font-display font-bold ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        borderColor: "var(--gold)",
        background: "rgba(245,166,35,0.10)",
        color: "var(--gold)",
        fontSize: Math.max(10, Math.round(size * 0.32)),
        lineHeight: 1,
      }}
      aria-label={showImage ? undefined : `${name} initials`}
    >
      {showImage ? (
        <img
          src={src!}
          alt={alt ?? `${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          style={{ display: "block" }}
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </div>
  );
}
