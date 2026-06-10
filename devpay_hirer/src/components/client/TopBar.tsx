import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ProfileAvatarButton } from "./ProfilePopover";
import { NotificationsPopover } from "./NotificationsPopover";
import { SearchPopover } from "./SearchPopover";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-6 flex h-16 items-center justify-between gap-3 border-b border-border md:mb-8">
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[18px] font-bold leading-tight text-foreground md:text-[22px]">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[12px] md:text-[13px]" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {right}
        <div className="hidden md:block">
          <SearchPopover />
        </div>
        <div className="hidden md:block">
          <NotificationsPopover />
        </div>
        <ThemeToggle />
        <Link
          to="/post-job"
          className="hidden h-10 items-center gap-2 rounded-[10px] px-4 font-semibold transition-transform duration-200 hover:scale-[1.02] gold-gradient shadow-gold md:flex"
          style={{ color: "var(--background)", fontSize: 14 }}
        >
          Post a Job
        </Link>
        <div className="hidden md:block">
          <ProfileAvatarButton />
        </div>
      </div>
    </header>
  );
}
