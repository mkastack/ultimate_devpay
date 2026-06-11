import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type Profile, type UserRole } from "./client";
import { formatAuthError } from "./auth-errors";
import { useAuthStore } from "@/lib/stores/auth-store";

const OAUTH_ROLE_KEY = "devpay_oauth_role";

type SignUpResult = { needsConfirmation: boolean; email: string };

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; fullName: string; role: UserRole }) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const profileLoadRef = useRef(0);

  const upsertRoleExtension = async (userId: string, role: UserRole) => {
    if (role === "developer") {
      await supabase.from("developer_profiles").upsert(
        { user_id: userId },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    } else if (role === "client") {
      await supabase.from("client_profiles").upsert(
        { user_id: userId },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    }
  };

  const syncProfileRole = async (
    userId: string,
    role: UserRole,
    fullName?: string
  ): Promise<Profile | null> => {
    const patch: { role: UserRole; full_name?: string } = { role };
    if (fullName) patch.full_name = fullName;

    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[Auth] Role sync failed:", formatAuthError(error));
      return null;
    }

    await upsertRoleExtension(userId, role);
    return (data as Profile) ?? null;
  };

  const ensureUserProfile = async (
    userId: string,
    details: { email: string; fullName: string; role: UserRole; username: string }
  ) => {
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existing) {
      const row = existing as Profile;
      if (row.role !== details.role) {
        const synced = await syncProfileRole(userId, details.role, details.fullName);
        return synced ?? row;
      }
      return row;
    }

    const { data: created, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        role: details.role,
        full_name: details.fullName,
        username: details.username,
        email: details.email,
      })
      .select()
      .maybeSingle();

    if (profileError && !profileError.message.includes("duplicate")) {
      throw profileError;
    }

    const profileRow = (created as Profile) ?? null;
    if (profileRow) {
      await upsertRoleExtension(userId, details.role);
    }

    return profileRow;
  };

  const loadProfile = async (userId: string) => {
    const loadId = ++profileLoadRef.current;

    let { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

    const { data: u } = await supabase.auth.getUser();
    const meta = (u.user?.user_metadata ?? {}) as {
      full_name?: string;
      role?: UserRole;
      username?: string;
    };
    const localRole =
      typeof window !== "undefined"
        ? (localStorage.getItem(OAUTH_ROLE_KEY) as UserRole | null)
        : null;
    const intendedRole = (meta.role as UserRole) ?? localRole ?? null;
    const fullName = meta.full_name ?? (u.user?.email?.split("@")[0] ?? "New User");
    const username =
      meta.username ??
      (u.user?.email?.split("@")[0] ?? `user_${userId.slice(0, 6)}`);

    if (data && intendedRole && (data as Profile).role !== intendedRole) {
      const synced = await syncProfileRole(userId, intendedRole, fullName);
      if (synced) data = synced;
    }

    if (!data) {
      const role = intendedRole ?? "developer";
      try {
        data = await ensureUserProfile(userId, {
          email: u.user?.email ?? "",
          fullName,
          role,
          username,
        });
      } catch (err) {
        console.error("[Auth] Profile setup failed:", formatAuthError(err));
      }
    }

    if (typeof window !== "undefined" && localRole) {
      localStorage.removeItem(OAUTH_ROLE_KEY);
    }

    if (loadId !== profileLoadRef.current) return;

    const profileData = (data as Profile) ?? null;
    setProfile(profileData);
    if (profileData) {
      useAuthStore.getState().setUser(profileData);
    } else {
      useAuthStore.getState().logout();
    }
  };

  useEffect(() => {
    let mounted = true;

    const finishLoading = () => {
      if (mounted) setLoading(false);
    };

    const handleSession = async (s: Session | null) => {
      setSession(s);
      if (s?.user) {
        await loadProfile(s.user.id);
      } else {
        setProfile(null);
        useAuthStore.getState().logout();
      }
      finishLoading();
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "INITIAL_SESSION") {
        void handleSession(s);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        void handleSession(s);
        return;
      }
      if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
        useAuthStore.getState().logout();
        finishLoading();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp: AuthCtx["signUp"] = async ({ email, password, fullName, role }) => {
    const username = email.split("@")[0] + "_" + Math.random().toString(36).slice(2, 6);
    const redirectTo = `${window.location.origin}/login`;

    if (typeof window !== "undefined") {
      localStorage.setItem(OAUTH_ROLE_KEY, role);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: fullName, role, username },
      },
    });
    if (error) throw error;

    const userId = data.user?.id;
    const needsConfirmation = !data.session;

    if (userId && data.session) {
      const profileRow = await ensureUserProfile(userId, { email, fullName, role, username });
      if (profileRow) {
        setProfile(profileRow);
        useAuthStore.getState().setUser(profileRow);
      }
    }

    return { needsConfirmation, email };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    useAuthStore.getState().logout();
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, profile, loading, signIn, signUp, signOut, resendConfirmation, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      session: null,
      user: null,
      profile: null,
      loading: true,
      signIn: async () => {},
      signUp: async () => ({ needsConfirmation: true, email: "" }),
      signOut: async () => {},
      resendConfirmation: async () => {},
      refreshProfile: async () => {},
    } as AuthCtx;
  }
  return ctx;
}
