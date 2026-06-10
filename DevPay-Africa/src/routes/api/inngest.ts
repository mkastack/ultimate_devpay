import { createFileRoute } from "@tanstack/react-router";

// Temporary placeholder route to avoid dev-server import errors when
// @tanstack/start/api isn't available in node_modules. This stub prevents
// SSR crashes; restore the proper Inngest handler once the correct
// TanStack Start API package is installed.

export const Route = createFileRoute('/api/inngest')({
  component: () => null,
});
