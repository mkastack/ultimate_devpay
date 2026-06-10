import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe,
  Smartphone,
  Database,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldCheck,
  BadgeCheck,
  Lightbulb,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-context";
import { toast } from "sonner";

import { captureException } from "@/integrations/sentry";
import { sendPaymentConfirmationEmail } from "@/integrations/resend";
import {
  initiateEscrowPayment,
  calculateTotalWithFee,
} from "@/integrations/paystack";
import { verifyPaystackPaymentFn } from "@/integrations/paystack.server";

export const Route = createFileRoute("/client/post-job")({
  head: () => ({ meta: [{ title: "Post a Job — DevPay Africa" }] }),
  component: PostJob,
});

const categories = [
  { id: "web", label: "Web Development", icon: Globe },
  { id: "mobile", label: "Mobile Apps", icon: Smartphone },
  { id: "backend", label: "Backend & Cloud", icon: Database },
];

const suggestedSkills: Record<string, string[]> = {
  web: ["React", "TypeScript", "Tailwind", "Next.js", "Node.js"],
  mobile: ["React Native", "Flutter", "Swift", "Kotlin"],
  backend: ["Node.js", "Python", "PostgreSQL", "AWS", "Docker"],
};

type Milestone = { title: string; amount: string; due: string };

function PostJob() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  const [data, setData] = useState({
    title: "",
    category: "web",
    description: "",
    skillInput: "",
    skills: [] as string[],
    level: "intermediate" as "entry" | "intermediate" | "expert",
    budget: "",
    duration: "",
    milestones: [{ title: "", amount: "", due: "" }] as Milestone[],
  });

  const totalMilestones = data.milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const progress = (step / 4) * 100;

  const experienceLevelOptions = [
    { id: "entry", title: "Entry", desc: "Junior talent or simple tasks.", dbValue: "Entry" },
    {
      id: "intermediate",
      title: "Intermediate",
      desc: "Solid industry experience.",
      dbValue: "Intermediate",
    },
    {
      id: "expert",
      title: "Expert",
      desc: "Critical systems & architectural lead.",
      dbValue: "Expert",
    },
  ] as const;

  const experienceLevelMap = Object.fromEntries(
    experienceLevelOptions.map((item) => [item.id, item.dbValue]),
  ) as Record<"entry" | "intermediate" | "expert", string>;

  const addSkill = (s: string) => {
    const v = s.trim();
    if (!v || data.skills.includes(v)) return;
    setData({ ...data, skills: [...data.skills, v], skillInput: "" });
  };
  const removeSkill = (s: string) =>
    setData({ ...data, skills: data.skills.filter((x) => x !== s) });

  const addMilestone = () =>
    setData({ ...data, milestones: [...data.milestones, { title: "", amount: "", due: "" }] });
  const updateMilestone = (i: number, k: keyof Milestone, v: string) => {
    const next = [...data.milestones];
    next[i] = { ...next[i], [k]: v };
    setData({ ...data, milestones: next });
  };
  const removeMilestone = (i: number) =>
    setData({ ...data, milestones: data.milestones.filter((_, x) => x !== i) });

  const canNext =
    (step === 1 && data.title && data.description && data.category) ||
    (step === 2 && data.skills.length > 0) ||
    (step === 3 && data.milestones.every((m) => m.title && m.amount));

  const submit = async () => {
    if (!session?.user) return;
    setBusy(true);
    try {
      const budgetTotal = Number(data.budget) || totalMilestones;
      const { total: totalWithFee } = calculateTotalWithFee(budgetTotal);

      // Step 1: Initiate Paystack payment for escrow funding
      let paymentReference = "";
      try {
        paymentReference = await initiateEscrowPayment({
          email: session.user.email || "",
          amount: totalWithFee,
          jobId: "temp",
          clientId: session.user.id,
          firstName: profile?.full_name?.split(" ")[0] || "Client",
          lastName: profile?.full_name?.split(" ")[1] || "",
          description: `Escrow funding for job: ${data.title}`,
        });

        // Verify the payment
        const verification = await verifyPaystackPaymentFn({
          data: { reference: paymentReference },
        });
        if (verification.data?.status !== "success") {
          toast.error("Payment verification failed. Please try again.");
          setBusy(false);
          return;
        }

        toast.success("Payment received! Creating job posting...");
      } catch (paymentError) {
        const msg = paymentError instanceof Error ? paymentError.message : "Payment failed";
        toast.error(msg);
        captureException(paymentError instanceof Error ? paymentError : new Error(msg), {
          userId: session.user.id,
          tags: { action: "payment-error" },
        });
        setBusy(false);
        return;
      }

      // Step 2: Create the job posting
      const dbExperienceCandidates = [experienceLevelMap[data.level], data.level].filter(
        (v, index, self) => v && self.indexOf(v) === index,
      );
      const payloadBase = {
        client_id: session.user.id,
        title: data.title,
        description: data.description,
        budget_min: budgetTotal,
        budget_max: budgetTotal,
        budget_type: "fixed",
        duration: data.duration || null,
        status: "open",
      };

      let jobResult: {
        data: { id: string } | null;
        error: { message?: string } | null;
      } = {
        data: null,
        error: null,
      };
      for (const experience_level of dbExperienceCandidates) {
        jobResult = await supabase
          .from("jobs")
          .insert({ ...payloadBase, experience_level })
          .select()
          .single();
        if (!jobResult.error && jobResult.data) break;
      }

      const { data: job, error } = jobResult;
      if (error || !job) {
        captureException(error || new Error("Failed to insert job row"), {
          userId: session.user.id,
        });
        setBusy(false);
        toast.error(error?.message ?? "Failed to post job");
        return;
      }

      const jobId = (job as { id: string }).id;

      // Step 3: Store payment reference in a transaction record (optional but recommended)
      try {
        await supabase.from("transactions").insert({
          user_id: session.user.id,
          type: "deposit",
          amount: totalWithFee,
          status: "completed",
          reference: paymentReference,
          job_id: jobId,
        });
        console.log("Transaction logged:", paymentReference);
      } catch (err: unknown) {
        console.log("Transaction log error (non-critical):", err);
      }

      // Step 4: Insert milestones
      const ms = data.milestones
        .filter((m) => m.title && m.amount)
        .map((m, i) => ({
          job_id: jobId,
          title: m.title,
          amount: Number(m.amount),
          due_date: m.due || null,
          position: i,
          status: "pending",
        }));
      if (ms.length) {
        const { error: msErr } = await supabase.from("milestones").insert(ms);
        if (msErr) {
          captureException(msErr, {
            userId: session.user.id,
            tags: { action: "milestones-insert", jobId },
          });
        }
      }

      // Step 5: Link skills to job
      if (data.skills.length) {
        const { data: existing } = await supabase
          .from("skills")
          .select("id,name")
          .in("name", data.skills);
        const map = new Map(
          (existing ?? []).map((s: { id: string; name: string }) => [s.name, s.id]),
        );
        const rows = data.skills
          .filter((s) => map.has(s))
          .map((s) => ({ job_id: jobId, skill_id: map.get(s) }));
        if (rows.length) {
          const { error: skillErr } = await supabase.from("job_skills").insert(rows);
          if (skillErr) {
            captureException(skillErr, {
              userId: session.user.id,
              tags: { action: "skills-insert", jobId },
            });
          }
        }
      }

      // Step 6: Send payment confirmation email
      if (session.user.email) {
        sendPaymentConfirmationEmail(
          session.user.email,
          profile?.full_name || "Client",
          totalWithFee,
          jobId,
        );
      }

      // Step 7: Dispatch developer matching task in background
      (async () => {
        try {
          const { data: devProfiles } = await supabase
            .from("developer_profiles")
            .select("user_id, skills, title");

          if (devProfiles) {
            const jobSkillsLower = data.skills.map((s) => s.toLowerCase());
            const jobTitleLower = data.title.toLowerCase();

            const matching = devProfiles.filter((dev) => {
              const devSkills = (dev.skills ?? []).map((s: string) => s.toLowerCase());
              const skillMatch = devSkills.some((s: string) => jobSkillsLower.includes(s));
              const devTitle = (dev.title ?? "").toLowerCase();
              const titleKeywords = jobTitleLower.split(" ");
              const titleMatch = titleKeywords.some(
                (word: string) => word.length > 3 && devTitle.includes(word),
              );
              return skillMatch || titleMatch;
            });

            matching.forEach(async (dev) => {
              await supabase.from("notifications").insert({
                user_id: dev.user_id,
                type: "job_match",
                title: "New Job Match Alert! 🚀",
                message: `A new job matching your skill set was posted: "${data.title}". View details and submit a proposal!`,
                link: `/jobs/${jobId}`,
              });
              console.log(`[Background Task] Dispatched developer notification: ${dev.user_id}`);
            });
          }
        } catch (err: unknown) {
          captureException(err, { tags: { subtask: "background-matching", jobId } });
        }
      })();

      setBusy(false);
      toast.success("Job posted & escrow secured! Redirecting to project page...");
      navigate({ to: "/client/projects/$jobId", params: { jobId } });
    } catch (e: unknown) {
      captureException(e, { userId: session.user.id });
      setBusy(false);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  const stepLabels = [
    "Project Essentials",
    "Skills & Expertise",
    "Budget & Milestones",
    "Final Review",
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="font-medium">
          Step {step} of 4: <span className="text-primary">{stepLabels[step - 1]}</span>
        </div>
        <div className="text-muted-foreground">{Math.round(progress)}% Complete</div>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-[image:var(--gradient-primary)] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
          {step === 1 && (
            <>
              <h2 className="font-display text-2xl font-bold">Let&apos;s start with the basics</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Describe your project requirements clearly to attract the most qualified developers
                across Africa.
              </p>
              <div className="mt-6 space-y-5">
                <div>
                  <Label className="flex items-center gap-1.5">
                    Job Title <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  </Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g., Senior Full Stack Engineer for Fintech Dashboard"
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                  />
                  <div className="text-xs text-muted-foreground mt-1.5">
                    Include key technologies and seniority level to improve search visibility.
                  </div>
                </div>
                <div>
                  <Label>Project Category</Label>
                  <div className="grid sm:grid-cols-3 gap-3 mt-1.5">
                    {categories.map((c) => {
                      const Icon = c.icon;
                      const active = data.category === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setData({ ...data, category: c.id })}
                          className={`rounded-xl border p-4 text-sm transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface/40 hover:border-primary/40"}`}
                        >
                          <Icon className="h-5 w-5 mx-auto mb-2" />
                          <div className="font-medium">{c.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Project Description</Label>
                  <Textarea
                    rows={6}
                    className="mt-1.5"
                    placeholder="Describe the scope, technical requirements, and deliverable expectations…"
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-2xl font-bold">What skills are needed?</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Search and select the technical stack for your project. Be specific to attract the
                right talent.
              </p>
              <div className="mt-6">
                <Label>Search Skills</Label>
                <Input
                  className="mt-1.5"
                  placeholder="e.g. React, Python, Solidity… (press Enter)"
                  value={data.skillInput}
                  onChange={(e) => setData({ ...data, skillInput: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(data.skillInput);
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-3 py-1 text-sm"
                    >
                      {s}
                      <button onClick={() => removeSkill(s)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {(suggestedSkills[data.category] ?? []).length > 0 && (
                  <div className="mt-4 text-xs text-muted-foreground">
                    Suggested:
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {suggestedSkills[data.category]
                        .filter((s) => !data.skills.includes(s))
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => addSkill(s)}
                            className="rounded-full border border-border/60 px-2.5 py-1 text-xs hover:border-primary/40 hover:text-primary"
                          >
                            + {s}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8">
                <Label>Required Experience Level</Label>
                <div className="grid sm:grid-cols-3 gap-3 mt-1.5">
                  {experienceLevelOptions.map((l) => {
                    const active = data.level === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setData({ ...data, level: l.id as typeof data.level })}
                        className={`text-left rounded-xl border p-4 transition-all ${active ? "border-primary bg-primary/10" : "border-border bg-surface/40 hover:border-primary/40"}`}
                      >
                        <div className="font-display font-semibold">{l.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{l.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-2xl font-bold">Budget & Milestones</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Define the total scope. Break the work into manageable payments released only when
                milestones are approved.
              </p>

              <div className="mt-6 rounded-xl border border-border/60 bg-surface/40 p-5">
                <Label>Total Project Budget (USD)</Label>
                <Input
                  type="number"
                  min="0"
                  className="mt-1.5 text-lg"
                  placeholder="4500.00"
                  value={data.budget}
                  onChange={(e) => setData({ ...data, budget: e.target.value })}
                />
                <Input
                  className="mt-3"
                  placeholder="Estimated duration (e.g. 4–6 weeks)"
                  value={data.duration}
                  onChange={(e) => setData({ ...data, duration: e.target.value })}
                />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">Milestone Breakdown</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addMilestone}
                    className="text-primary"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Milestone
                  </Button>
                </div>
                <div className="space-y-3">
                  {data.milestones.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border/60 p-4 grid grid-cols-1 md:grid-cols-[1.5fr,1fr,1fr,auto] gap-3 items-end"
                    >
                      <div>
                        <Label className="text-xs">Milestone {i + 1}</Label>
                        <Input
                          className="mt-1"
                          placeholder="UI/UX Design & Prototype"
                          value={m.title}
                          onChange={(e) => updateMilestone(i, "title", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Amount ($)</Label>
                        <Input
                          className="mt-1"
                          type="number"
                          min="0"
                          placeholder="1500"
                          value={m.amount}
                          onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Estimated Date</Label>
                        <Input
                          className="mt-1"
                          type="date"
                          value={m.due}
                          onChange={(e) => updateMilestone(i, "due", e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => removeMilestone(i)}
                        className="h-9 w-9 rounded-md border border-border/60 hover:border-destructive/60 hover:text-destructive flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-display text-2xl font-bold">Final Review</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure everything looks good before funding the escrow.
              </p>
              <div className="mt-6 rounded-xl border border-border/60 p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Project Title
                </div>
                <div className="font-display text-xl font-bold mt-1">{data.title}</div>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Category</div>
                    <div className="capitalize">
                      {categories.find((c) => c.id === data.category)?.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Experience</div>
                    <div>{experienceLevelMap[data.level] ?? data.level}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Duration</div>
                    <div>{data.duration || "Flexible"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Skills</div>
                    <div>{data.skills.join(", ") || "—"}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground uppercase">Description</div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{data.description}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-5 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-display font-semibold">Secure Escrow Protection</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Funds are held in a multi-signature wallet. Payment is released only when you
                    approve each milestone. Mediation team available 24/7.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border/40">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 4 ? (
              <Button
                disabled={!canNext}
                onClick={() => setStep(step + 1)}
                className="bg-[image:var(--gradient-primary)] text-primary-foreground"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                disabled={busy}
                onClick={submit}
                className="bg-[image:var(--gradient-primary)] text-primary-foreground"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing Payment…
                  </>
                ) : (
                  <>
                    Fund & Post Job <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5">
            <div className="flex items-center gap-2 text-accent">
              <Lightbulb className="h-4 w-4" />{" "}
              <div className="font-display font-semibold">Expert Tip</div>
            </div>
            <p className="text-sm mt-2 text-foreground/90">
              Projects with a detailed technical breakdown receive 40% more high-quality proposals
              in the first 24 hours.
            </p>
          </div>
          {step === 4 && (
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="font-display font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Payment Summary
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Budget</span>
                  <span>${(Number(data.budget) || totalMilestones).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Service Fee (7%)</span>
                  <span>${((Number(data.budget) || totalMilestones) * 0.07).toFixed(2)}</span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between font-display font-bold text-base">
                  <span>Total to Fund</span>
                  <span className="text-primary">
                    ${((Number(data.budget) || totalMilestones) * 1.07).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
                💳 Powered by Paystack • Secure card payments accepted globally
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="font-display font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Verified Marketplace
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Top 5% African tech talent. All developers undergo technical vetting before joining.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
