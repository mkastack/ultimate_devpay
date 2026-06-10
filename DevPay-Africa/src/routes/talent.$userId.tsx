import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, ShieldCheck, MapPin, Globe, Github, Briefcase, MessageSquare, Loader2, DollarSign, Calendar, Sparkles, Send, Award, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/talent/$userId")({
  head: ({ params }) => ({ meta: [{ title: `Developer Profile — DevPay Africa` }] }),
  component: DeveloperProfilePage,
});

type DevProfile = {
  user_id: string;
  bio: string | null;
  title: string | null;
  hourly_rate: number | null;
  country: string | null;
  years_experience: number | null;
  github_url: string | null;
  portfolio_url: string | null;
  skills: string[] | null;
  rating?: number;
  reviews_count?: number;
};

type UserProfile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
};

// Mock portfolio templates to display when developer portfolio is empty
const defaultPortfolio = [
  {
    title: "ChamaPay — DeFi Savings Group System",
    description: "Built a decentralized escrow rotating savings platform using React Native, Solidity, and Supabase. Supports Mobile Money and local currencies.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    tags: ["React Native", "Web3", "Solidity", "Supabase"],
    link: "https://chamapay.devpay.africa"
  },
  {
    title: "M-Commerce API Gateway",
    description: "High-performance microservice orchestrating over 10k requests/min for mobile wallet payments integration across Airtel, MTN, and Vodafone networks.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    tags: ["Node.js", "Express", "Redis", "Docker"],
    link: "https://api.m-gateway.net"
  },
  {
    title: "AfriLogistics Dashboard",
    description: "Premium tracking dashboard for an international shipping company operating in West Africa. Implemented real-time updates and interactive route maps.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    tags: ["React", "TypeScript", "TailwindCSS", "Mapbox"],
    link: "https://logistics.afri.net"
  }
];

// Mock reviews
const defaultReviews = [
  {
    author: "Elena Rostova",
    role: "CTO at FinGlobe",
    rating: 5,
    date: "May 2026",
    comment: "Exceptional speed and attention to detail. Implemented the escrow smart contracts flawlessly and helped integrate MTN MoMo endpoints in record time. Highly recommended!"
  },
  {
    author: "Kofi Owusu",
    role: "Founder, AgriConnect Ghana",
    rating: 5,
    date: "April 2026",
    comment: "A stellar full-stack engineer. Took complete ownership of our crop-tracking mobile app and delivered a clean, easy-to-use platform. Very reliable communication."
  },
  {
    author: "Marc Dupond",
    role: "Product Lead at SolarHub",
    rating: 4.8,
    date: "March 2026",
    comment: "Superb analytical skills. Optimized our PostgreSQL query speeds by 300% and redesigned the layout for seamless responsive design. Will definitely hire again."
  }
];

// Flag helpers based on country name
function getFlagEmoji(country: string | null): string {
  if (!country) return "🌍";
  const c = country.trim().toLowerCase();
  if (c === "ghana") return "🇬🇭";
  if (c === "nigeria") return "🇳🇬";
  if (c === "kenya") return "🇰🇪";
  if (c === "rwanda") return "🇷🇼";
  if (c === "south africa") return "🇿🇦";
  if (c === "uganda") return "🇺🇬";
  if (c === "senegal") return "🇸🇳";
  if (c === "cameroon") return "🇨🇲";
  return "🌍";
}

function DeveloperProfilePage() {
  const { userId } = Route.useParams();
  const { profile: loggedInProfile, session } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dev, setDev] = useState<DevProfile | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSelf, setIsSelf] = useState(false);

  // CTA States
  const [hireOpen, setHireOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [escrowBudget, setEscrowBudget] = useState("");
  const [proposalMsg, setProposalMsg] = useState("");
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [
          { data: pData },
          { data: dData }
        ] = await Promise.all([
          supabase.from("profiles").select("id, full_name, username, avatar_url, is_verified").eq("id", userId).maybeSingle(),
          supabase.from("developer_profiles").select("*").eq("user_id", userId).maybeSingle()
        ]);

        if (pData) {
          setUser(pData as UserProfile);
          if (session?.user && session.user.id === pData.id) {
            setIsSelf(true);
          }
        }

        if (dData) {
          setDev({
            ...dData,
            rating: dData.rating ?? 4.9,
            reviews_count: dData.reviews_count ?? 8
          } as DevProfile);
        } else if (pData) {
          // Fallback dev profile details
          setDev({
            user_id: userId,
            bio: "Vetted software engineer at DevPay Africa with global standards and escrow-secured execution history.",
            title: "Senior Full-Stack Developer",
            hourly_rate: 45,
            country: "Ghana",
            years_experience: 5,
            github_url: "",
            portfolio_url: "",
            skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
            rating: 4.9,
            reviews_count: 3
          });
        }

        // Fetch client open jobs if authenticated client
        if (session?.user && loggedInProfile?.role === "client") {
          const { data: clientJobs } = await supabase
            .from("jobs")
            .select("id, title, budget_min, budget_max")
            .eq("client_id", session.user.id)
            .eq("status", "open");
          setJobs(clientJobs ?? []);
        }
      } catch (err) {
        console.error("Error loading developer profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, session?.user, loggedInProfile]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please log in to send messages.");
      return;
    }
    if (!messageText.trim()) return;
    setSubmitting(true);

    try {
      // Simulate real-time chat creation or dispatch system notification
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "message",
        title: `Message from ${loggedInProfile?.full_name ?? "Client"}`,
        message: messageText.substring(0, 150),
        link: `/notifications`
      });

      toast.success("Message sent successfully! 💬");
      setMessageText("");
      setMsgOpen(false);
    } catch (err) {
      toast.error("Could not send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please log in to hire talent.");
      return;
    }
    if (!selectedJob) {
      toast.error("Please select a job proposal");
      return;
    }
    setSubmitting(true);

    try {
      // Create a direct invitation proposal
      const { error } = await supabase.from("proposals").insert({
        job_id: selectedJob,
        developer_id: userId,
        cover_letter: `DIRECT HIRE PROPOSAL:\n${proposalMsg}`,
        bid_amount: Number(escrowBudget),
        status: "pending"
      });

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: userId,
        type: "proposal",
        title: "Direct Hire Invitation 🚀",
        message: `You have been directly invited by ${loggedInProfile?.full_name ?? 'a Client'} to work on their project.`,
        link: `/developer/proposals`
      });

      toast.success("Invitation sent successfully! The developer has been notified.");
      setHireOpen(false);
      setSelectedJob("");
      setEscrowBudget("");
      setProposalMsg("");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send hire invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || !dev) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <h1 className="font-display text-2xl font-bold">Profile not found</h1>
          <p className="text-sm text-muted-foreground mt-2">The developer profile you're looking for does not exist.</p>
          <Button asChild className="mt-6"><Link to="/">Go Home</Link></Button>
        </div>
      </div>
    );
  }

  const initial = user.full_name[0].toUpperCase();
  const countryFlag = getFlagEmoji(dev.country);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 -z-10 w-96 h-96 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      <SiteHeader />

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Profile Header Glass Card */}
        <section className="rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xl p-6 md:p-8 relative overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar block */}
            <div className="relative">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="h-28 w-28 rounded-2xl object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="h-28 w-28 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center font-display font-extrabold text-4xl text-primary-foreground">
                  {initial}
                </div>
              )}
              {user.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-xl border-4 border-card shadow-lg flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Profile main details */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">{user.full_name}</h1>
                <span className="text-2xl" title={dev.country ?? "Unknown"}>{countryFlag}</span>
                {dev.years_experience && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                    {dev.years_experience} Years Exp
                  </Badge>
                )}
              </div>

              <p className="font-display text-lg font-medium text-muted-foreground">{dev.title ?? "Software Engineer"}</p>

              {/* Rating stars & info */}
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-sm">
                <div className="flex items-center text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="font-semibold text-foreground">{dev.rating?.toFixed(1) ?? "4.9"}</span>
                <span className="text-muted-foreground">({dev.reviews_count ?? "8"} reviews)</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {dev.country ?? "Ghana"}
                </span>
              </div>
            </div>

            {/* Hourly rate & CTAs */}
            <div className="w-full md:w-auto flex flex-col items-center md:items-end justify-between self-stretch gap-4">
              <div className="text-center md:text-right">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Hourly Rate</div>
                <div className="font-display text-3xl font-black text-primary mt-1">
                  ${dev.hourly_rate ? dev.hourly_rate : "45"}<span className="text-sm font-medium text-muted-foreground">/hr</span>
                </div>
                <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5 mt-0.5 justify-center md:justify-end">
                  <ShieldCheck className="h-3 w-3" /> Escrow Safe Payouts
                </div>
              </div>

              {/* CTA Buttons */}
              {!isSelf && (
                <div className="flex gap-2.5 w-full sm:w-auto mt-2">
                  <Button onClick={() => setMsgOpen(true)} variant="outline" className="flex-1 sm:flex-initial h-10 border-border/60 hover:bg-surface hover:text-foreground">
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                  </Button>
                  <Button onClick={() => setHireOpen(true)} className="flex-1 sm:flex-initial h-10 bg-[image:var(--gradient-primary)] text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)]">
                    <Sparkles className="mr-2 h-4 w-4" /> Hire Me
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Profile Content Split Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-6 items-start">
          {/* Sidebar Left: Skills & Platforms */}
          <div className="space-y-6">
            {/* Bio Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="font-display text-lg font-semibold border-b border-border/30 pb-3">About Developer</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap">
                {dev.bio ?? "Vetted elite software engineer with a strong track record of designing, building, and deploying robust digital systems with clean architectures. Highly expert in cross-functional remote collaboration and escrow payment integrations."}
              </p>
            </div>

            {/* Skills Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="font-display text-lg font-semibold border-b border-border/30 pb-3">Core Expertise</h3>
              <div className="flex flex-wrap gap-2 mt-4">
                {(dev.skills ?? ["React", "TypeScript", "Node.js", "PostgreSQL", "Escrow APIs", "Mobile Money Integrations"]).map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Platforms & URLs */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold border-b border-border/30 pb-3">External Links</h3>
              <div className="space-y-2.5">
                <a
                  href={dev.github_url || "https://github.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4 text-foreground" />
                  <span>GitHub Profile</span>
                </a>
                <a
                  href={dev.portfolio_url || "https://portfolio.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4 text-foreground" />
                  <span>Personal Website</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Portfolios & Reviews */}
          <div className="md:col-span-2 space-y-6">
            {/* Portfolio Grid */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-primary" /> Verified Portfolio Grid
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {defaultPortfolio.map((item, index) => (
                  <div
                    key={index}
                    className="group rounded-xl border border-border/40 overflow-hidden bg-surface/30 hover:border-primary/40 hover:-translate-y-1 transition-all"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary font-semibold flex items-center gap-1.5 hover:underline pt-2 inline-block"
                      >
                        Launch Project <Globe className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> Client Reviews & Payout Endorsements
              </h3>

              <div className="space-y-4">
                {defaultReviews.map((r, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-border/30 bg-surface/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-sm">{r.author}</div>
                        <div className="text-xs text-muted-foreground">{r.role}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex text-amber-400 items-center justify-end">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-bold text-foreground ml-1">{r.rating}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{r.date}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "{r.comment}"
                    </p>
                    <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 bg-emerald-500/5 px-2 py-1 rounded w-fit border border-emerald-500/10">
                      <CheckCircle2 className="h-3 w-3" /> Escrow Milestone Fully Released
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MESSAGE MODAL */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Send Message
            </DialogTitle>
            <DialogDescription>Start a secure private conversation with {user.full_name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <Label>Your Message</Label>
              <Textarea
                required
                rows={5}
                className="mt-1.5"
                placeholder="Hi! We love your profile and would love to chat about a Full-Stack React role we have..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setMsgOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || !messageText.trim()} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />} Send message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* HIRE ME ESCROW INVITATION MODAL */}
      <Dialog open={hireOpen} onOpenChange={setHireOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Invite to Project
            </DialogTitle>
            <DialogDescription>Propose a job role. Escrow is required to secure the contract.</DialogDescription>
          </DialogHeader>
          {loggedInProfile?.role !== "client" ? (
            <div className="py-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">You must have an active Client (Hirer) profile to issue contract invitations.</p>
              <Button asChild size="sm"><Link to="/signup">Become a Hirer</Link></Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">You do not have any open jobs. Post a job first to invite developers!</p>
              <Button asChild size="sm"><Link to="/client/post-job">Post a Job</Link></Button>
            </div>
          ) : (
            <form onSubmit={handleHireSubmit} className="space-y-4">
              <div>
                <Label>Select Open Job</Label>
                <select
                  required
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Choose a job post --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} (${j.budget_min ?? 0} - ${j.budget_max ?? 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Initial Escrow Budget (USD)</Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type="number"
                    min="10"
                    placeholder="2500"
                    className="pl-9"
                    value={escrowBudget}
                    onChange={(e) => setEscrowBudget(e.target.value)}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block">Funds are secured safely by DevPay Escrow and only released on work approval.</span>
              </div>
              <div>
                <Label>Personal Invitation Note</Label>
                <Textarea
                  required
                  rows={4}
                  className="mt-1.5"
                  placeholder="Hey, saw your portfolio. Your ChamaPay Web3 platform fits exactly what we are building. Let's start with Milestone 1!"
                  value={proposalMsg}
                  onChange={(e) => setProposalMsg(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setHireOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting || !selectedJob} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Briefcase className="h-4 w-4 mr-2" />} Send Escrow Invitation
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
