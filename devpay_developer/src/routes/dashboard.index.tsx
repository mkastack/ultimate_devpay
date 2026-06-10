import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/Header";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { EarningsChart } from "@/components/dashboard/EarningsChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContractsRow } from "@/components/dashboard/ContractsRow";
import { JobsForYou } from "@/components/dashboard/JobsForYou";
import { BottomRow } from "@/components/dashboard/BottomRow";
import { SubscriptionOffer } from "@/components/dashboard/SubscriptionOffer";
import { developer } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({
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
      <DashboardHeader title="Overview" subtitle={subtitle} />
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