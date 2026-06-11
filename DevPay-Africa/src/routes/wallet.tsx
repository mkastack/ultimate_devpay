import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/integrations/supabase/use-require-auth";
import { useAuth } from "@/integrations/supabase/auth-context";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — DevPay Africa" }] }),
  component: WalletRedirect,
});

function WalletRedirect() {
  const { ready } = useRequireAuth();
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready || !profile) return;
    navigate({
      to: profile.role === "developer" ? "/developer/wallet" : "/client/payments",
      replace: true,
    });
  }, [ready, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
