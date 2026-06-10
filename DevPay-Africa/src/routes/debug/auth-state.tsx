import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/integrations/supabase/auth-context";
import { useAuthStore } from "@/lib/stores/auth-store";

export const Route = createFileRoute("/debug/auth-state")({
  head: () => ({ meta: [{ title: "Debug Auth State — DevPay Africa" }] }),
  component: DebugAuthState,
});

function DebugAuthState() {
  const auth = useAuth();
  const store = useAuthStore();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug: Auth State</h1>
        
        <div className="space-y-4">
          <section className="p-4 rounded-lg border border-border bg-card">
            <h2 className="text-lg font-semibold mb-2">AuthContext</h2>
            <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-96">
              {JSON.stringify({
                loading: auth.loading,
                session: auth.session ? { user_id: auth.session.user?.id, email: auth.session.user?.email } : null,
                profile: auth.profile,
              }, null, 2)}
            </pre>
          </section>

          <section className="p-4 rounded-lg border border-border bg-card">
            <h2 className="text-lg font-semibold mb-2">Zustand AuthStore</h2>
            <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-96">
              {JSON.stringify({
                isAuthenticated: store.isAuthenticated,
                isLoading: store.isLoading,
                user: store.user,
              }, null, 2)}
            </pre>
          </section>

          <section className="p-4 rounded-lg border border-border bg-card">
            <h2 className="text-lg font-semibold mb-2">LocalStorage</h2>
            <pre className="text-xs bg-background p-3 rounded overflow-auto max-h-96">
              {JSON.stringify({
                devpay_oauth_role: localStorage.getItem("devpay_oauth_role"),
                devpay_dev_role: localStorage.getItem("devpay_dev_role"),
              }, null, 2)}
            </pre>
          </section>

          <div className="text-sm text-muted-foreground mt-6 p-4 border border-border/60 rounded-lg bg-surface/30">
            <p>
              <strong>Expected behavior:</strong> If you're logged in, you should see:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>A session with your user ID and email</li>
              <li>A profile with your role ("developer" or "client")</li>
              <li><code>isAuthenticated: true</code> in the auth store</li>
            </ul>
            <p className="mt-3">
              <strong>If profile role is wrong:</strong> Check the database to verify your profile's role column, or re-sign-up with the correct role selected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
