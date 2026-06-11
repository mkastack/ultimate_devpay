import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { DevDashboardHeader } from "@/components/dev-dashboard/Header";
import { WelcomeBanner } from "@/components/dev-dashboard/WelcomeBanner";
import { MetricCards } from "@/components/dev-dashboard/MetricCards";
import { EarningsChart } from "@/components/dev-dashboard/EarningsChart";
import { RecentActivity } from "@/components/dev-dashboard/RecentActivity";
import { ContractsRow } from "@/components/dev-dashboard/ContractsRow";
import { JobsForYou } from "@/components/dev-dashboard/JobsForYou";
import { BottomRow } from "@/components/dev-dashboard/BottomRow";
import { SubscriptionOffer } from "@/components/dev-dashboard/SubscriptionOffer";
import { developer } from "@/lib/dev-mock-data";

export const Route = createFileRoute("/developer/")({
  head: () => ({
    meta: [
      { title: "Overview — DevPay Africa" },
      { name: "description", content: "Your earnings, contracts, proposals and job matches." },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const subtitle = `${format(new Date(), "EEEE, d MMMM yyyy")} · ${developer.city}, ${developer.country} 🇬🇭`;
  return (
    <>
      <DevDashboardHeader title="Overview" subtitle={subtitle} />
      <WelcomeBanner />
      <MetricCards />
      <div className="mb-7 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <EarningsChart />
        <RecentActivity />
      </div>
      <ContractsRow />
      <JobsForYou />
      <SubscriptionOffer />
      <BottomRow />
    </>
  );
}