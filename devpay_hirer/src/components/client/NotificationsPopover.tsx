import { Bell, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { client, notifications as mockNotifications, type AppNotification } from "@/lib/mock-data";
import { useState } from "react";

export function NotificationsPopover({ size = 40 }: { size?: number }) {
  const [items, setItems] = useState<AppNotification[]>(mockNotifications);
  const unread = items.filter((n: AppNotification) => !n.read).length;

  const markAll = () =>
    setItems((prev: AppNotification[]) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) =>
    setItems((prev: AppNotification[]) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative flex items-center justify-center rounded-full border bg-card transition-colors hover:border-[var(--gold)]"
          style={{
            width: size,
            height: size,
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[10px] font-bold shadow-md ring-2"
              style={{
                background: "var(--gold)",
                color: "var(--background)",
                // @ts-expect-error css var
                "--tw-ring-color": "var(--background)",
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,360px)] p-0"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <div className="text-sm font-semibold text-foreground">Notifications</div>
            <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {unread} unread
            </div>
          </div>
          {unread > 0 && (
            <button
              onClick={markAll}
              className="text-[12px] font-medium"
              style={{ color: "var(--gold)" }}
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div
              className="px-4 py-10 text-center text-[13px]"
              style={{ color: "var(--text-muted)" }}
            >
              You're all caught up.
            </div>
          ) : (
            items.map((n: AppNotification) => (
              <button
                key={n.id}
                onClick={() => markOne(n.id)}
                className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-[var(--card-hover)]"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                  style={{
                    background: n.read ? "transparent" : "var(--gold)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-foreground">{n.title}</div>
                  <div
                    className="mt-0.5 text-[12px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {n.body}
                  </div>
                  <div
                    className="mt-1 text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {n.time}
                  </div>
                </div>
                {!n.read && <Check className="mt-1 h-3.5 w-3.5" style={{ color: "var(--gold)" }} />}
              </button>
            ))
          )}
        </div>
        <div
          className="border-t px-4 py-2 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <button className="text-[12px] font-medium" style={{ color: "var(--gold)" }}>
            View all activity
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function getUnreadCount() {
  return client.unread_notifications;
}
