// Mock data for DevPay Africa developer dashboard.
// Replace with Lovable Cloud queries in a follow-up pass.

export const USD_TO_GHS = 15.5;

export const fmtGHS = (usd: number) =>
  `GHS ${(usd * USD_TO_GHS).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const fmtGHSDecimal = (usd: number) =>
  `GHS ${(usd * USD_TO_GHS).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtUSD = (usd: number) =>
  `USD ${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const developer = {
  id: "dev_1",
  full_name: "Kwame Mensah",
  username: "kwamebuilds",
  email: "kwame@devpay.africa",
  avatar_url: "",
  title: "Senior Full-Stack Developer",
  city: "Accra",
  country: "Ghana",
  is_verified: true,
  subscription_plan: "pro" as "free" | "pro",
  availability: "available" as "available" | "busy" | "not_available",
  rating: 4.9,
  rating_count: 127,
  jobs_completed: 43,
  response_rate: 98,
  total_earned_usd: 312.9 * 1, // displayed via fmtGHS -> ~GHS 4,850
  ai_skill_score: 87,
  proposals_used: 3,
  proposals_limit: 5,
};

export const counts = {
  pendingProposals: 4,
  activeContracts: 3,
  unreadMessages: 7,
  unreadNotifications: 3,
};

export type ActivityType = "proposal" | "payment" | "contract" | "message";
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timeAgo: string;
}

export const activities: Activity[] = [
  { id: "a1", type: "payment", title: "Payment released", subtitle: "Logistics dashboard · Milestone 2", timeAgo: "2h ago" },
  { id: "a2", type: "message", title: "New message from Ama Boateng", subtitle: "About the React Native build…", timeAgo: "4h ago" },
  { id: "a3", type: "proposal", title: "Proposal submitted", subtitle: "AI-powered POS for Spintex Mart", timeAgo: "Yesterday" },
  { id: "a4", type: "contract", title: "Contract milestone approved", subtitle: "Banking SDK · Milestone 1 of 3", timeAgo: "2d ago" },
  { id: "a5", type: "payment", title: "Escrow funded", subtitle: "MoMo gateway integration", timeAgo: "3d ago" },
];

export const earningsWeek = [
  { label: "Mon", usd: 0 },
  { label: "Tue", usd: 45 },
  { label: "Wed", usd: 80 },
  { label: "Thu", usd: 35 },
  { label: "Fri", usd: 110 },
  { label: "Sat", usd: 22 },
  { label: "Sun", usd: 20 },
];

export const earningsMonth = [
  { label: "W1", usd: 220 },
  { label: "W2", usd: 310 },
  { label: "W3", usd: 180 },
  { label: "W4", usd: 350 },
];

export const earningsYear = [
  { label: "Jan", usd: 800 }, { label: "Feb", usd: 950 }, { label: "Mar", usd: 1100 },
  { label: "Apr", usd: 720 }, { label: "May", usd: 1320 }, { label: "Jun", usd: 1450 },
  { label: "Jul", usd: 1200 }, { label: "Aug", usd: 980 }, { label: "Sep", usd: 1380 },
  { label: "Oct", usd: 1620 }, { label: "Nov", usd: 1510 }, { label: "Dec", usd: 1750 },
];

export interface Contract {
  id: string;
  clientName: string;
  clientVerified: boolean;
  title: string;
  milestoneCurrent: number;
  milestoneTotal: number;
  currentMilestoneLabel: string;
  agreedUsd: number;
  escrowUsd: number;
  status: "active" | "completed" | "disputed" | "paused";
}

export const contracts: Contract[] = [
  {
    id: "c1", clientName: "Ama Boateng", clientVerified: true,
    title: "React Native delivery tracker for Speedaf",
    milestoneCurrent: 2, milestoneTotal: 4, currentMilestoneLabel: "UI Design Complete ✓",
    agreedUsd: 1800, escrowUsd: 450, status: "active",
  },
  {
    id: "c2", clientName: "Yaw Owusu", clientVerified: true,
    title: "Mobile-first POS dashboard with Paystack integration",
    milestoneCurrent: 1, milestoneTotal: 3, currentMilestoneLabel: "Discovery in progress",
    agreedUsd: 950, escrowUsd: 320, status: "active",
  },
  {
    id: "c3", clientName: "Akosua Frimpong", clientVerified: false,
    title: "Marketing site redesign + Sanity CMS",
    milestoneCurrent: 3, milestoneTotal: 3, currentMilestoneLabel: "Final review",
    agreedUsd: 620, escrowUsd: 200, status: "active",
  },
];

export interface JobMatch {
  id: string;
  clientName: string;
  clientVerified: boolean;
  title: string;
  skills: { name: string; match: boolean }[];
  durationLabel: string;
  proposalsCount: number;
  budgetMinUsd: number;
  budgetMaxUsd: number;
  postedLabel: string;
}

export const jobMatches: JobMatch[] = [
  {
    id: "j1", clientName: "Hubtel", clientVerified: true,
    title: "Build a real-time merchant analytics dashboard",
    skills: [
      { name: "React", match: true }, { name: "TypeScript", match: true }, { name: "Supabase", match: false },
    ],
    durationLabel: "2 weeks", proposalsCount: 8,
    budgetMinUsd: 800, budgetMaxUsd: 1500, postedLabel: "2h ago",
  },
  {
    id: "j2", clientName: "Bloom Africa", clientVerified: true,
    title: "React Native onboarding flow with MoMo verification",
    skills: [
      { name: "React Native", match: true }, { name: "Expo", match: true }, { name: "Paystack", match: false },
    ],
    durationLabel: "3 weeks", proposalsCount: 12,
    budgetMinUsd: 1200, budgetMaxUsd: 2200, postedLabel: "5h ago",
  },
  {
    id: "j3", clientName: "Zeepay", clientVerified: true,
    title: "Design system + Storybook for fintech web app",
    skills: [
      { name: "TypeScript", match: true }, { name: "Storybook", match: false }, { name: "Tailwind", match: true },
    ],
    durationLabel: "1 month", proposalsCount: 5,
    budgetMinUsd: 1500, budgetMaxUsd: 3000, postedLabel: "1d ago",
  },
];

export interface Proposal {
  id: string;
  title: string;
  bidUsd: number;
  days: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
}

export const proposals: Proposal[] = [
  { id: "p1", title: "AI-powered POS for Spintex Mart", bidUsd: 950, days: 14, status: "pending" },
  { id: "p2", title: "Migrate legacy PHP API to Node + Postgres", bidUsd: 1400, days: 21, status: "accepted" },
  { id: "p3", title: "Landing page for Accra startup", bidUsd: 320, days: 7, status: "pending" },
];

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timeAgo: string;
  unread: boolean;
  contractActive: boolean;
}

export const conversations: Conversation[] = [
  { id: "m1", name: "Ama Boateng", lastMessage: "Just pushed the API changes — can you test the auth flow?", timeAgo: "12m", unread: true, contractActive: true },
  { id: "m2", name: "Yaw Owusu", lastMessage: "Looks great. Approving milestone 1 today.", timeAgo: "2h", unread: true, contractActive: true },
  { id: "m3", name: "Hubtel Team", lastMessage: "Thanks for the proposal — let's set up a call.", timeAgo: "Yesterday", unread: false, contractActive: false },
];

export function greeting(date: Date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}