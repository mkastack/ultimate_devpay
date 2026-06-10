import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Cpu, Database, Wifi, Zap, Bell, CheckCircle2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, Pill, StatusDot, SectionHeader } from "@/components/admin/ui";
import { LIVE_EVENTS } from "@/lib/admin-mock";

export const Route = createFileRoute("/admin/realtime")({
  component: RealtimePage,
});

const SYSTEMS = [
  { name: "API Gateway", icon: Wifi, status: "operational", latency: 142, throughput: "12.4k req/s" },
  { name: "PostgreSQL Primary", icon: Database, status: "operational", latency: 8, throughput: "847 q/s" },
  { name: "Redis Cache", icon: Zap, status: "operational", latency: 1, throughput: "24.1k op/s" },
  { name: "Payment Processor", icon: Activity, status: "degraded", latency: 1820, throughput: "47 tx/min" },
  { name: "AI Inference (Gemini)", icon: Cpu, status: "operational", latency: 412, throughput: "312 req/min" },
  { name: "Realtime Socket", icon: Wifi, status: "operational", latency: 22, throughput: "3,421 conn" },
];

const QUEUES = [
  { name: "withdrawals.process", depth: 47, processing: 3, failed: 0, color: "#F59E0B" },
  { name: "notifications.email", depth: 218, processing: 12, failed: 4, color: "#3B82F6" },
  { name: "notifications.sms", depth: 84, processing: 8, failed: 1, color: "#3B82F6" },
  { name: "ai.matching", depth: 12, processing: 2, failed: 0, color: "#00C6A7" },
  { name: "webhooks.outbound", depth: 6, processing: 1, failed: 0, color: "#10B981" },
  { name: "audit.write", depth: 0, processing: 0, failed: 0, color: "#10B981" },
];

const ALERTS_INIT = [
  { id: "al1", severity: "warning" as const, title: "Payment processor latency above 1.5s", source: "Paystack API", time: "2m ago" },
  { id: "al2", severity: "info" as const, title: "AI token usage at 62% of daily quota", source: "Gemini", time: "14m ago" },
  { id: "al3", severity: "critical" as const, title: "3 failed withdrawal callbacks (MTN MoMo)", source: "Payments", time: "21m ago" },
];

function RealtimePage() {
  const [pulse, setPulse] = useState(0);
  const [feed, setFeed] = useState(LIVE_EVENTS);

  useEffect(() => {
    const id = setInterval(() => {
      setPulse((p) => p + 1);
      setFeed((f) => [{ ...f[f.length - 1], id: `e_${Date.now()}`, time: "just now" }, ...f.slice(0, 11)]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <AdminHeader title="Real-time Monitor" subtitle="Live platform telemetry · WebSocket stream" />
      <div className="mb-5 flex justify-end">
        <div className="flex items-center gap-2 rounded-full border border-[#10B981] bg-[rgba(16,185,129,0.10)] px-3 py-1.5">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[#10B981]" />
          <span className="font-mono text-[12px] font-bold text-[#10B981]">LIVE · {pulse} ticks</span>
        </div>
      </div>


      {/* System health grid */}
      <div className="mb-6 grid grid-cols-3 gap-3.5">
        {SYSTEMS.map((s) => {
          const Icon = s.icon;
          const color = s.status === "operational" ? "#10B981" : s.status === "degraded" ? "#F59E0B" : "#FF4D6A";
          return (
            <Card key={s.name} hover padding="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${color}22` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div>
                    <div className="font-sans text-[13px] font-semibold text-white">{s.name}</div>
                    <div className="flex items-center gap-1 font-sans text-[11px]" style={{ color }}>
                      <StatusDot color={color} />{s.status}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-[#1C2040] pt-3">
                <div>
                  <div className="font-sans text-[10px] uppercase tracking-wider text-[#3D4466]">Latency</div>
                  <div className="font-mono text-[15px] font-bold" style={{ color: s.latency > 1000 ? "#F59E0B" : "#FFFFFF" }}>{s.latency}ms</div>
                </div>
                <div>
                  <div className="font-sans text-[10px] uppercase tracking-wider text-[#3D4466]">Throughput</div>
                  <div className="font-mono text-[15px] font-bold text-white">{s.throughput}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Queues + alerts */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        <Card className="col-span-3" padding="p-6">
          <SectionHeader title="Background Queues" subtitle="Worker queue depths · processing live" right={<Pill color="purple">{QUEUES.length} workers</Pill>} />
          <div className="space-y-3">
            {QUEUES.map((q) => {
              const total = q.depth + q.processing + q.failed;
              const bar = total === 0 ? 0 : Math.min(100, (q.depth / Math.max(total, 200)) * 100);
              return (
                <div key={q.name} className="rounded-xl border border-[#1C2040] bg-[#12152A] p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[12px] font-semibold text-white">{q.name}</div>
                      <div className="font-sans text-[11px] text-[#3D4466]">
                        <span className="text-[#3B82F6]">{q.depth}</span> pending ·
                        <span className="ml-1 text-[#3B82F6]">{q.processing}</span> processing ·
                        <span className={`ml-1 ${q.failed > 0 ? "text-[#FF4D6A]" : "text-[#3D4466]"}`}>{q.failed}</span> failed
                      </div>
                    </div>
                    <Pill color={q.failed > 0 ? "red" : q.depth > 100 ? "amber" : "green"}>
                      {q.failed > 0 ? "Attention" : q.depth > 100 ? "Backlog" : "Healthy"}
                    </Pill>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#0D0F1A]">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bar}%`, background: q.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="col-span-2" padding="p-6">
          <SectionHeader title="Alert Triggers" subtitle="Auto-fired by monitoring rules" right={<Pill color="red">{ALERTS_INIT.length} active</Pill>} />
          <div className="space-y-2.5">
            {ALERTS_INIT.map((a) => {
              const color = a.severity === "critical" ? "#FF4D6A" : a.severity === "warning" ? "#F59E0B" : "#3B82F6";
              return (
                <div key={a.id} className="rounded-xl border-l-2 bg-[#12152A] p-3" style={{ borderColor: color }}>
                  <div className="flex items-start gap-2.5">
                    {a.severity === "info" ? <Bell className="mt-0.5 h-4 w-4" style={{ color }} /> : <AlertTriangle className="mt-0.5 h-4 w-4" style={{ color }} />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase" style={{ color }}>{a.severity}</span>
                        <span className="font-sans text-[10px] text-[#3D4466]">{a.time}</span>
                      </div>
                      <div className="mt-0.5 font-sans text-[12px] font-semibold text-white">{a.title}</div>
                      <div className="font-sans text-[11px] text-[#3D4466]">Source: {a.source}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <button className="flex items-center gap-1 rounded-md border border-[#10B981] bg-[rgba(16,185,129,0.10)] px-2 py-1 font-sans text-[10px] font-semibold text-[#10B981] hover:bg-[rgba(16,185,129,0.20)]">
                      <CheckCircle2 className="h-3 w-3" /> Acknowledge
                    </button>
                    <button className="rounded-md border border-[#3D4466] bg-[#0D0F1A] px-2 py-1 font-sans text-[10px] font-semibold text-[#8890B5] hover:text-white">
                      Snooze 1h
                    </button>
                  </div>
                </div>
              );
            })}
            <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#1E3A8A] py-2 font-sans text-[12px] font-semibold text-[#3B82F6] hover:bg-[rgba(30,58,138,0.10)]">
              Configure alert rules →
            </button>
          </div>
        </Card>
      </div>

      {/* Live stream */}
      <Card padding="p-6">
        <SectionHeader
          title="Live Event Stream"
          subtitle="Real-time activity across the entire platform"
          right={
            <div className="flex items-center gap-1.5">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[#10B981]" />
              <span className="font-mono text-[11px] font-bold text-[#10B981]">STREAMING</span>
            </div>
          }
        />
        <div className="max-h-[360px] space-y-1 overflow-y-auto">
          {feed.map((e) => (
            <div key={e.id} className="flex items-center gap-3 border-b border-white/[0.03] py-2.5 last:border-0">
              <span className="font-mono text-[10px] text-[#3D4466]">{e.time}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#3B82F6]">[{e.type}]</span>
              <span className="flex-1 truncate font-sans text-[12px] text-white">{e.title}</span>
              <span className="truncate font-sans text-[11px] text-[#8890B5]">{e.detail}</span>
              {e.amount && (
                <span className="font-mono text-[12px]" style={{ color: e.amountColor }}>
                  GHS {e.amount.toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
