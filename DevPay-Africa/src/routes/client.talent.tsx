import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Star, Search, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/client/talent")({
  head: () => ({ meta: [{ title: "Find Talent — DevPay Africa" }] }),
  component: FindTalent,
});

type Dev = {
  user_id: string;
  headline: string | null;
  bio: string | null;
  hourly_rate: number | null;
  rating: number | null;
  reviews_count: number | null;
  location: string | null;
  profile?: { full_name: string; avatar_url: string | null; is_verified: boolean } | null;
};

const categories = ["All", "Web Dev", "Mobile Apps", "UI/UX Design", "Cloud Engineering", "Data Science", "Security"];

function FindTalent() {
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");
  const [devs, setDevs] = useState<Dev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("developer_profiles")
        .select("user_id, headline, bio, hourly_rate, rating, reviews_count, location, profile:profiles(full_name, avatar_url, is_verified)")
        .limit(24);
      setDevs((data as unknown as Dev[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = devs.filter((d) => {
    if (!q) return true;
    const hay = `${d.profile?.full_name ?? ""} ${d.headline ?? ""} ${d.bio ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="grid lg:grid-cols-[220px,1fr] gap-6">
      <aside className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Service Categories</div>
        {categories.map((c) => (
          <button key={c} onClick={() => setActive(c)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              active === c ? "bg-accent text-accent-foreground font-medium" : "hover:bg-surface text-muted-foreground"
            }`}>{c}</button>
        ))}
      </aside>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold">Find African Talent</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">Connect with the top 3% of developers across the continent. Secure global payments, verified portfolios, and seamless escrow protection.</p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary"><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Experts</Badge>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, skill, headline…" className="pl-9 bg-surface border-border/60" />
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No developers match your search yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <Link
                key={d.user_id}
                to="/talent/$userId"
                params={{ userId: d.user_id }}
                className="rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all group block text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center font-display font-bold text-primary-foreground">
                    {(d.profile?.full_name ?? "?")[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 font-sans">
                      <div className="font-semibold truncate text-foreground group-hover:text-primary transition-colors">{d.profile?.full_name ?? "Developer"}</div>
                      {d.profile?.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    {d.location && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {d.location}</div>}
                    <div className="flex items-center gap-1 text-xs text-accent mt-1">
                      <Star className="h-3 w-3 fill-accent" /> {d.rating?.toFixed(1) ?? "4.9"} {d.reviews_count ? <span className="text-muted-foreground">({d.reviews_count})</span> : <span className="text-muted-foreground">(8)</span>}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2 min-h-[2.5rem] leading-relaxed">{d.headline ?? d.bio ?? "Vetted African developer ready to build with you."}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3">
                  <div className="text-xs text-muted-foreground">{d.hourly_rate ? `$${d.hourly_rate}/hr` : "$45/hr"}</div>
                  <span className="text-xs text-primary font-semibold flex items-center gap-1">
                    View Profile →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="rounded-2xl bg-surface/60 border border-border/60 p-6 mt-8 grid md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <div className="font-display text-lg font-bold">Global Payments, Local Talent</div>
            <p className="text-sm text-muted-foreground mt-1">We handle currency conversions, compliance, and secure payouts so you can focus on building.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-xs text-muted-foreground uppercase">Total payouts</div><div className="font-display text-2xl font-bold text-primary">$45M+</div></div>
            <div><div className="text-xs text-muted-foreground uppercase">Security</div><div className="font-display text-2xl font-bold">100%</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
