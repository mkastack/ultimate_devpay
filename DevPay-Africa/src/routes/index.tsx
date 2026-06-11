import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
  Sparkles, ShieldCheck, Smartphone, Bot, BadgeCheck, MessageSquare,
  Check, X, ArrowRight, Star, Users, Globe, DollarSign, Percent,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevPay Africa — Africa's #1 Tech Freelance Platform" },
      { name: "description", content: "Hire elite African developers or earn globally. Escrow-protected payments, MoMo payouts, AI proposals. Only 7% fee." },
      { property: "og:title", content: "DevPay Africa — African Talent. Global Standards." },
      { property: "og:description", content: "The premium freelance marketplace built for African developers and global clients." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sparkles, title: "AI Matching", desc: "Smart algorithm pairs jobs with the perfect developer in seconds." },
  { icon: ShieldCheck, title: "Escrow Protection", desc: "Funds are held safely until work is approved. Zero payment risk." },
  { icon: Smartphone, title: "MoMo Payouts", desc: "Withdraw to MTN, Vodafone, or AirtelTigo Mobile Money instantly." },
  { icon: Bot, title: "AI Proposals", desc: "Generate winning proposals in 10 seconds with built-in Claude AI." },
  { icon: BadgeCheck, title: "Skill Verification", desc: "Verified badges from real assessments — no fake portfolios." },
  { icon: MessageSquare, title: "Instant Chat", desc: "Real-time messaging, file sharing, and video calls in one place." },
];

const testimonials = [
  { name: "Kwame Mensah", country: "🇬🇭", role: "Full-Stack Dev", quote: "I made $14k in my first 3 months. MoMo withdrawals hit my phone in seconds." },
  { name: "Sarah Okonkwo", country: "🇳🇬", role: "Mobile Engineer", quote: "Finally a platform that actually pays African devs what we're worth." },
  { name: "James Carter", country: "🇺🇸", role: "Startup Founder", quote: "Hired 4 senior devs in a week. Quality matches Silicon Valley at a fraction of the cost." },
  { name: "Amina Hassan", country: "🇰🇪", role: "AI Engineer", quote: "The AI proposal writer alone tripled my win rate. Game changer." },
];

function Landing() {
  const [audience, setAudience] = useState<"client" | "dev">("client");

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="container mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now live in 50+ countries
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] max-w-4xl mx-auto">
            Africa's <span className="text-gradient-brand">#1 Tech</span><br />Freelance Platform
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with elite African developers or build a global career — with escrow protection, MoMo payouts, and AI-powered tools.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)] h-12 px-6">
              <Link to="/signup">Hire a Developer <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 border-border/60 hover:bg-surface">
              <Link to="/signup">Start Earning</Link>
            </Button>
          </div>

          {/* Floating dashboard mockup */}
          <div className="relative mt-16 max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-[image:var(--gradient-primary)] blur-3xl opacity-20 rounded-full" />
            <div className="relative glass-card rounded-2xl p-2 shadow-2xl">
              <div className="rounded-xl bg-surface border border-border/60 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
                  <div className="ml-3 text-xs text-muted-foreground">app.devpay.africa/dashboard</div>
                </div>
                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                  {[
                    { l: "Total Earned", v: "$24,580", c: "text-primary" },
                    { l: "Active Jobs", v: "7", c: "text-accent" },
                    { l: "Proposals", v: "12", c: "text-foreground" },
                    { l: "Rating", v: "4.98 ★", c: "text-accent" },
                  ].map((s) => (
                    <div key={s.l} className="min-w-0 rounded-lg bg-background/40 border border-border/40 p-3 text-left">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                      <div className={`text-lg font-display font-bold mt-1 ${s.c} break-words`}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <div className="rounded-lg bg-background/40 border border-border/40 p-4 text-left">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-semibold">Recent Activity</div>
                      <div className="text-xs text-primary">View all</div>
                    </div>
                    {["Payment of $1,200 received • Stripe SaaS API", "New proposal accepted • Fintech Dashboard", "Milestone approved • Mobile App MVP"].map((a, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 text-xs text-muted-foreground border-t border-border/40 first:border-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-border/40 bg-surface/30">
        <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { i: Users, v: "2,000+", l: "Developers" },
            { i: Globe, v: "50+", l: "Countries" },
            { i: DollarSign, v: "$0", l: "Sign-up Fee" },
            { i: Percent, v: "7%", l: "Platform Fee Only" },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <s.i className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Built different</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Everything you need to <span className="text-gradient-brand">win</span></h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-border/60 bg-card p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold mt-4">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container mx-auto px-4 py-24">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold">How it works</h2>
          <div className="inline-flex items-center mt-6 rounded-full bg-surface border border-border/60 p-1">
            {(["client", "dev"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${audience === a ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {a === "client" ? "I'm hiring" : "I'm earning"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(audience === "client"
            ? [
                { n: "01", t: "Post a job", d: "Describe your project. AI suggests scope and budget." },
                { n: "02", t: "Get matched", d: "Top developers apply within hours. Pick your favorite." },
                { n: "03", t: "Pay on delivery", d: "Funds in escrow. Released only when you approve." },
              ]
            : [
                { n: "01", t: "Build profile", d: "Verify skills and showcase your portfolio in minutes." },
                { n: "02", t: "Send proposals", d: "AI writes winning proposals based on your strengths." },
                { n: "03", t: "Get paid in MoMo", d: "Withdraw earnings to Mobile Money or bank instantly." },
              ]
          ).map((s) => (
            <div key={s.n} className="relative rounded-xl border border-border/60 bg-card p-6">
              <div className="font-display text-5xl font-bold text-gradient-brand">{s.n}</div>
              <div className="font-display text-lg font-semibold mt-3">{s.t}</div>
              <div className="text-sm text-muted-foreground mt-2">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" className="container mx-auto px-4 py-24">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Why DevPay <span className="text-gradient-brand">wins</span></h2>
        </div>
        <div className="overflow-x-auto -mx-4 px-4 rounded-2xl border border-border/60 bg-card max-w-4xl mx-auto">
          {/* Mobile hint: table is horizontally scrollable */}
          <div className="text-xs text-muted-foreground text-right pr-2 pb-2 md:hidden">Swipe to view more →</div>
          <table className="min-w-[680px] md:min-w-full w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-surface">
                <th className="text-left px-6 py-4 font-medium text-muted-foreground">Feature</th>
                <th className="px-6 py-4 font-display text-primary">DevPay</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Fiverr</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Upwork</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Platform fee", "7%", "20%", "10–20%"],
                ["MoMo payouts", true, false, false],
                ["AI proposal writer", true, false, false],
                ["Escrow protection", true, true, true],
                ["Built for African devs", true, false, false],
                ["Sign-up fee", "$0", "$0", "$0"],
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{row[0] as string}</td>
                  {row.slice(1).map((v, j) => (
                    <td key={j} className="px-6 py-4 text-center">
                      {typeof v === "boolean" ? (
                        v ? <Check className={`h-5 w-5 mx-auto ${j === 0 ? "text-primary" : "text-muted-foreground"}`} /> : <X className="h-5 w-5 mx-auto text-muted-foreground/40" />
                      ) : (
                        <span className={j === 0 ? "text-primary font-semibold" : "text-muted-foreground"}>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold">Loved across the continent</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-border/60 bg-card p-6 hover:border-primary/40 transition-all">
              <div className="flex gap-0.5 text-accent mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/40">
                <div className="h-9 w-9 rounded-full bg-[image:var(--gradient-primary)] flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name} <span className="ml-1">{t.country}</span></div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl glass-card p-12 text-center">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <h2 className="font-display text-4xl md:text-5xl font-bold">Ready to <span className="text-gradient-brand">start</span>?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Join 2,000+ developers and clients building the future of African tech.</p>
          <Button asChild size="lg" className="mt-8 bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] h-12 px-8">
            <Link to="/dashboard">Create your free account <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <MobileBottomNav />

      <SiteFooter />
    </div>
  );
}
