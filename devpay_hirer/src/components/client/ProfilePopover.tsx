import { Link } from "@tanstack/react-router";
import { ExternalLink, LogOut, UserCog } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { client } from "@/lib/mock-data";
import { Avatar } from "./Avatar";
import { useLogoUrl } from "@/lib/logo";

export function ProfileAvatarButton({ size = 40 }: { size?: number }) {
  const logoUrl = useLogoUrl();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Profile menu"
          className="rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <Avatar src={logoUrl} name={client.company_name} size={size} rounded="full" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-72 border-0 p-0"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="border-b p-4" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <Avatar src={logoUrl} name={client.company_name} size={48} rounded="lg" />

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">
                {client.company_name}
              </div>
              <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                {client.email}
              </div>
              {client.is_verified && (
                <div
                  className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: "rgba(16,185,129,0.15)", color: "var(--success)" }}
                >
                  Verified ✓
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col p-2">
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-[var(--card-hover)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <UserCog className="h-4 w-4" style={{ color: "var(--gold)" }} />
            View Profile
          </Link>
          <a
            href="https://devpayafrica.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-[var(--card-hover)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <ExternalLink className="h-4 w-4" style={{ color: "var(--gold)" }} />
            Visit main site
          </a>
          <button
            onClick={() => {
              // wire to real auth when Lovable Cloud is enabled
              window.location.href = "/";
            }}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--card-hover)]"
            style={{ color: "var(--destructive)" }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
