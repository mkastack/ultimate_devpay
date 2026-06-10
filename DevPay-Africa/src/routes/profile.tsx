import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, X, Upload } from "lucide-react";
import { fileToDataUri } from "@/lib/file-to-data-uri";
import {
  isCloudinaryConfigured,
  isCloudinaryDeliveryUrl,
  profilePhotoPublicId,
} from "@/lib/cloudinary-client";
import { uploadProfilePhotoFn } from "@/lib/upload-actions";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useRequireAuth } from "@/integrations/supabase/use-require-auth";
import { useAuth } from "@/integrations/supabase/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — DevPay Africa" }] }),
  component: ProfilePage,
});

type DevProfile = {
  user_id: string;
  bio?: string | null;
  title?: string | null;
  hourly_rate?: number | null;
  country?: string | null;
  years_experience?: number | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  skills?: string[] | null;
};

type ClientProfile = {
  user_id: string;
  company_name?: string | null;
  company_website?: string | null;
  industry?: string | null;
  company_size?: string | null;
  about?: string | null;
};

function ProfilePage() {
  const { ready } = useRequireAuth();
  const { session, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // shared
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // developer
  const [dev, setDev] = useState<DevProfile>({ user_id: "" });
  const [skillInput, setSkillInput] = useState("");

  // client
  const [client, setClient] = useState<ClientProfile>({ user_id: "" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!session?.user) {
        if (mounted) setLoading(false);
        return;
      }

      // If profile is missing, try to refresh it (may be created on first sign-in)
      if (!profile) {
        try {
          await refreshProfile();
        } catch (err) {
          // ignore and continue to show UI allowing manual save
        }
        if (mounted) setLoading(false);
        return;
      }

      setFullName(profile.full_name ?? "");
      setAvatarUrl(profile.avatar_url ?? "");

      try {
        if (profile.role === "developer") {
          const { data, error } = await supabase.from("developer_profiles").select("*").eq("user_id", session.user.id).maybeSingle();
          if (!error && mounted) setDev((data as DevProfile) ?? { user_id: session.user.id, skills: [] });
        } else if (profile.role === "client") {
          const { data, error } = await supabase.from("client_profiles").select("*").eq("user_id", session.user.id).maybeSingle();
          if (!error && mounted) setClient((data as ClientProfile) ?? { user_id: session.user.id });
        }
      } catch (err) {
        // ignore DB fetch errors and allow user to save
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [session?.user, profile]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    setDev((d) => ({ ...d, skills: Array.from(new Set([...(d.skills ?? []), s])) }));
    setSkillInput("");
  };
  const removeSkill = (s: string) => setDev((d) => ({ ...d, skills: (d.skills ?? []).filter((x) => x !== s) }));

  const onAvatarFile = async (file: File | undefined) => {
    if (!file || !session?.user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUri = await fileToDataUri(file);
      const { url } = await uploadProfilePhotoFn({
        data: { dataUri, userId: session.user.id },
      });
      setAvatarUrl(url);
      toast.success("Photo uploaded — save your profile to keep it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const save = async () => {
    if (!session?.user || !profile) return;
    setSaving(true);
    const { error: pErr } = await supabase.from("profiles").update({
      full_name: fullName, avatar_url: avatarUrl || null,
    }).eq("id", session.user.id);
    if (pErr) { toast.error(pErr.message); setSaving(false); return; }

    if (profile.role === "developer") {
      const payload: DevProfile = {
        user_id: session.user.id,
        bio: dev.bio ?? null,
        title: dev.title ?? null,
        hourly_rate: dev.hourly_rate ? Number(dev.hourly_rate) : null,
        country: dev.country ?? null,
        years_experience: dev.years_experience ? Number(dev.years_experience) : null,
        github_url: dev.github_url ?? null,
        portfolio_url: dev.portfolio_url ?? null,
        skills: dev.skills ?? [],
      };
      const { error } = await supabase.from("developer_profiles").upsert(payload, { onConflict: "user_id" });
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else if (profile.role === "client") {
      const payload: ClientProfile = {
        user_id: session.user.id,
        company_name: client.company_name ?? null,
        company_website: client.company_website ?? null,
        industry: client.industry ?? null,
        company_size: client.company_size ?? null,
        about: client.about ?? null,
      };
      const { error } = await supabase.from("client_profiles").upsert(payload, { onConflict: "user_id" });
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    await refreshProfile();
    setSaving(false);
    toast.success("Profile saved");
  };

  if (!ready || loading) {
    return <div className="min-h-screen"><SiteHeader /><div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></div>;
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold">Your profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Signed in as {profile?.role}</p>
          </div>
          <Button onClick={save} disabled={saving} className="bg-[image:var(--gradient-primary)] text-primary-foreground">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : <><Save className="h-4 w-4 mr-2" />Save</>}
          </Button>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Full name</Label><Input className="mt-1.5" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className="sm:col-span-2">
              <Label>Profile photo</Label>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                {avatarUrl && isCloudinaryConfigured() && isCloudinaryDeliveryUrl(avatarUrl) && session?.user ? (
                  <OptimizedImage
                    publicId={profilePhotoPublicId(session.user.id)}
                    width={56}
                    height={56}
                    alt={fullName || "Profile photo"}
                    className="h-14 w-14 rounded-full object-cover border border-border"
                  />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover border border-border"
                  />
                ) : null}
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingAvatar}
                    onChange={(e) => {
                      void onAvatarFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <Button type="button" variant="outline" disabled={uploadingAvatar} asChild>
                    <span>
                      {uploadingAvatar ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading…</>
                      ) : (
                        <><Upload className="h-4 w-4 mr-2" />Upload photo</>
                      )}
                    </span>
                  </Button>
                </label>
                <Input
                  className="flex-1 min-w-[12rem]"
                  placeholder="Or paste image URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{profile?.email}</div>
        </div>

        {profile?.role === "developer" && (
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 mt-4">
            <h2 className="font-display text-lg font-semibold">Developer profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Headline</Label><Input className="mt-1.5" placeholder="Senior Full-Stack Engineer" value={dev.title ?? ""} onChange={(e) => setDev({ ...dev, title: e.target.value })} /></div>
              <div><Label>Country</Label><Input className="mt-1.5" placeholder="Ghana" value={dev.country ?? ""} onChange={(e) => setDev({ ...dev, country: e.target.value })} /></div>
              <div><Label>Hourly rate (USD)</Label><Input type="number" min="0" className="mt-1.5" placeholder="65" value={dev.hourly_rate ?? ""} onChange={(e) => setDev({ ...dev, hourly_rate: e.target.value === "" ? null : Number(e.target.value) })} /></div>
              <div><Label>Years experience</Label><Input type="number" min="0" className="mt-1.5" placeholder="6" value={dev.years_experience ?? ""} onChange={(e) => setDev({ ...dev, years_experience: e.target.value === "" ? null : Number(e.target.value) })} /></div>
              <div><Label>GitHub URL</Label><Input className="mt-1.5" placeholder="https://github.com/you" value={dev.github_url ?? ""} onChange={(e) => setDev({ ...dev, github_url: e.target.value })} /></div>
              <div><Label>Portfolio URL</Label><Input className="mt-1.5" placeholder="https://yourportfolio.com" value={dev.portfolio_url ?? ""} onChange={(e) => setDev({ ...dev, portfolio_url: e.target.value })} /></div>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea rows={5} className="mt-1.5" placeholder="Tell clients about your experience, niche, what you love to build…" value={dev.bio ?? ""} onChange={(e) => setDev({ ...dev, bio: e.target.value })} />
            </div>
            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mt-1.5">
                <Input placeholder="React" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} />
                <Button type="button" variant="outline" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {(dev.skills ?? []).map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-foreground"><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {(dev.skills ?? []).length === 0 && <span className="text-xs text-muted-foreground">No skills yet — add a few so clients can find you.</span>}
              </div>
            </div>
          </div>
        )}

        {profile?.role === "client" && (
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4 mt-4">
            <h2 className="font-display text-lg font-semibold">Company</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Company name</Label><Input className="mt-1.5" value={client.company_name ?? ""} onChange={(e) => setClient({ ...client, company_name: e.target.value })} /></div>
              <div><Label>Website</Label><Input className="mt-1.5" placeholder="https://acme.com" value={client.company_website ?? ""} onChange={(e) => setClient({ ...client, company_website: e.target.value })} /></div>
              <div><Label>Industry</Label><Input className="mt-1.5" placeholder="Fintech" value={client.industry ?? ""} onChange={(e) => setClient({ ...client, industry: e.target.value })} /></div>
              <div><Label>Company size</Label><Input className="mt-1.5" placeholder="11–50" value={client.company_size ?? ""} onChange={(e) => setClient({ ...client, company_size: e.target.value })} /></div>
            </div>
            <div>
              <Label>About</Label>
              <Textarea rows={5} className="mt-1.5" placeholder="What you do, your mission, what kind of help you usually need…" value={client.about ?? ""} onChange={(e) => setClient({ ...client, about: e.target.value })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
