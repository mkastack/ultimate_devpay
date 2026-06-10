// Rich mock data for DevPay Africa admin dashboard.
// All values are deterministic so the dashboard looks alive without a backend.

export type Role = "developer" | "client" | "admin";
export type UserStatus = "active" | "suspended" | "pending" | "unverified";

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  country: string;
  flag: string;
  joined: string;
  status: UserStatus;
  earningsOrSpent: number;
  lastActive: string;
  avatarColor: string;
  verified: boolean;
}

export interface PlatformEvent {
  id: string;
  type:
    | "signup"
    | "job_posted"
    | "proposal"
    | "contract_started"
    | "payment_released"
    | "withdrawal"
    | "dispute"
    | "review";
  title: string;
  detail: string;
  amount?: number;
  amountColor?: string;
  time: string;
}

const countries = [
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Rwanda", flag: "🇷🇼" },
  { name: "Uganda", flag: "🇺🇬" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Tanzania", flag: "🇹🇿" },
];

const firstNames = [
  "Kwesi", "Amara", "Chioma", "Tunde", "Aisha", "Kofi", "Zola", "Nia",
  "Ade", "Yara", "Sefu", "Imani", "Jabari", "Lerato", "Sade", "Obi",
  "Fatima", "Kwabena", "Mensah", "Akua", "Themba", "Nala", "Kgosi",
  "Idris", "Onyeka", "Zuri", "Kamau", "Asha",
];
const lastNames = [
  "Asante", "Okafor", "Mwangi", "Diallo", "Ndlovu", "Boateng", "Achebe",
  "Nkrumah", "Mbeki", "Owusu", "Kone", "Adeyemi", "Mensah", "Osei",
  "Eze", "Tutu", "Bello", "Sankara",
];

const avatarColors = [
  "#1E3A8A", "#00C6A7", "#F5A623", "#3B82F6", "#10B981", "#FF4D6A",
  "#3B82F6", "#F59E0B",
];

const seededRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export function makeUsers(count: number, seed = 7): AdminUser[] {
  const rand = seededRand(seed);
  const users: AdminUser[] = [];
  for (let i = 0; i < count; i++) {
    const country = countries[Math.floor(rand() * countries.length)];
    const first = firstNames[Math.floor(rand() * firstNames.length)];
    const last = lastNames[Math.floor(rand() * lastNames.length)];
    const role: Role = rand() > 0.74 ? "client" : "developer";
    const statusRoll = rand();
    const status: UserStatus =
      statusRoll > 0.92 ? "suspended"
      : statusRoll > 0.86 ? "pending"
      : statusRoll > 0.80 ? "unverified"
      : "active";
    const daysAgo = Math.floor(rand() * 380);
    const joined = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const lastActiveHrs = Math.floor(rand() * 720);
    users.push({
      id: `usr_${(seed * 1000 + i).toString(36).padStart(8, "0")}`,
      name: `${first} ${last}`,
      username: `${first.toLowerCase()}.${last.toLowerCase()}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${role === "client" ? "company" : "mail"}.com`,
      role,
      country: country.name,
      flag: country.flag,
      joined,
      status,
      earningsOrSpent: Math.floor(rand() * 95000) + 500,
      lastActive: `${lastActiveHrs}h ago`,
      avatarColor: avatarColors[Math.floor(rand() * avatarColors.length)],
      verified: status === "active",
    });
  }
  return users;
}

export const PLATFORM_METRICS = {
  revenue: { value: "GHS 847,250", usd: "≈ USD 54,661", trend: "+34%" },
  volume: { value: "GHS 12.1M", usd: "≈ USD 780K", trend: "+28%" },
  users: { value: "5,247", sub: "3,891 devs · 1,356 clients", trend: "+127" },
  contracts: { value: "342", sub: "GHS 2.4M in escrow 🔒", trend: "+23" },
  withdrawals: { value: "47", sub: "GHS 124,500 awaiting", trend: "Oldest: 2h ago" },
  disputes: { value: "12", sub: "4 high priority · 8 normal", trend: "2 opened today" },
};

export function makeRevenueSeries(days = 30) {
  const rand = seededRand(42);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - i - 1) * 86400000);
    const volume = 280000 + Math.floor(rand() * 220000);
    const revenue = Math.floor(volume * (0.06 + rand() * 0.02));
    return {
      date: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
      revenue,
      volume,
      txns: 80 + Math.floor(rand() * 120),
    };
  });
}

export const LIVE_EVENTS: PlatformEvent[] = [
  { id: "e1", type: "withdrawal", title: "Withdrawal requested", detail: "Kwesi Asante → MTN MoMo 024***12", amount: 4250, amountColor: "#F59E0B", time: "12s ago" },
  { id: "e2", type: "payment_released", title: "Escrow released", detail: "Milestone 2 of 'Mobile banking app' contract", amount: 18500, amountColor: "#10B981", time: "47s ago" },
  { id: "e3", type: "dispute", title: "Dispute opened", detail: "Client claims deliverable not received — DSP-2847", amount: 7800, amountColor: "#FF4D6A", time: "1m ago" },
  { id: "e4", type: "signup", title: "New developer registered", detail: "Amara Okafor · Lagos, Nigeria 🇳🇬", time: "2m ago" },
  { id: "e5", type: "proposal", title: "Proposal submitted", detail: "Senior React Engineer position · 12th proposal", time: "3m ago" },
  { id: "e6", type: "contract_started", title: "Contract started", detail: "'E-commerce platform rebuild' · GHS 42,000", amount: 42000, amountColor: "#3B82F6", time: "5m ago" },
  { id: "e7", type: "job_posted", title: "Job posted", detail: "Flutterwave integration for fintech startup", time: "7m ago" },
  { id: "e8", type: "review", title: "5-star review", detail: "Chioma Eze rated developer Kofi Boateng", time: "8m ago" },
  { id: "e9", type: "withdrawal", title: "Withdrawal approved", detail: "Auto-processed · GHS 320 → MoMo", amount: 320, amountColor: "#10B981", time: "10m ago" },
  { id: "e10", type: "payment_released", title: "Final payment", detail: "Contract C-1948 completed", amount: 8400, amountColor: "#10B981", time: "12m ago" },
];

export interface DisputeRecord {
  id: string;
  contract: string;
  amount: number;
  client: { name: string; company: string; claim: string };
  developer: { name: string; rating: number; claim: string };
  status: "open" | "review" | "resolved_client" | "resolved_dev" | "closed";
  highValue: boolean;
  openedHrs: number;
  milestone: string;
}

export const DISPUTES: DisputeRecord[] = [
  {
    id: "DSP-2847",
    contract: "Mobile banking app — Phase 2",
    amount: 7800,
    client: { name: "Aisha Bello", company: "Sankofa Capital", claim: "Final deliverables never received despite multiple requests" },
    developer: { name: "Kofi Mensah", rating: 4.9, claim: "Code shipped & demo recorded; client unresponsive for review" },
    status: "open",
    highValue: true,
    openedHrs: 6,
    milestone: "Milestone 3 of 4",
  },
  {
    id: "DSP-2846",
    contract: "E-commerce Shopify customization",
    amount: 3200,
    client: { name: "Tunde Adeyemi", company: "MarketKart", claim: "Scope creep — features added weren't approved" },
    developer: { name: "Nia Achebe", rating: 4.7, claim: "All features were in original SOW; have signed approval" },
    status: "review",
    highValue: false,
    openedHrs: 18,
    milestone: "Milestone 2 of 3",
  },
  {
    id: "DSP-2845",
    contract: "Logo + brand identity package",
    amount: 850,
    client: { name: "Zola Ndlovu", company: "ZN Boutique", claim: "Quality not as advertised — wants partial refund" },
    developer: { name: "Imani Kone", rating: 4.5, claim: "5 revisions delivered, all per brief. Refund unjustified." },
    status: "open",
    highValue: false,
    openedHrs: 2,
    milestone: "Final delivery",
  },
];

export interface WithdrawalRecord {
  id: string;
  user: AdminUser;
  method: "MTN MoMo" | "Bank Transfer" | "Vodafone Cash" | "Airtel Money";
  amount: number;
  account: string;
  requestedHrs: number;
  status: "pending" | "processing" | "completed" | "failed";
}

export function makeWithdrawals(count: number, users: AdminUser[]): WithdrawalRecord[] {
  const rand = seededRand(13);
  const methods: WithdrawalRecord["method"][] = ["MTN MoMo", "Bank Transfer", "Vodafone Cash", "Airtel Money"];
  return Array.from({ length: count }, (_, i) => {
    const user = users[Math.floor(rand() * users.length)];
    return {
      id: `wd_${(i + 1).toString().padStart(5, "0")}`,
      user,
      method: methods[Math.floor(rand() * methods.length)],
      amount: Math.floor(rand() * 12000) + 250,
      account: `024 *** *** ${Math.floor(rand() * 89 + 10)}`,
      requestedHrs: Math.floor(rand() * 72),
      status: rand() > 0.18 ? "pending" : (rand() > 0.5 ? "processing" : "failed"),
    };
  });
}

export interface JobRecord {
  id: string;
  title: string;
  client: string;
  category: string;
  budget: number;
  proposals: number;
  status: "open" | "filled" | "cancelled" | "expired";
  posted: string;
  featured: boolean;
}

export function makeJobs(count = 24): JobRecord[] {
  const rand = seededRand(31);
  const titles = [
    "Senior React Engineer for fintech platform",
    "Flutter mobile developer (banking)",
    "Brand identity for African coffee startup",
    "Shopify expert — Plus migration",
    "Backend NestJS architect, 3-month contract",
    "AI/ML engineer for matching algorithm",
    "DevOps engineer — Kubernetes & AWS",
    "WordPress to Webflow rebuild",
    "iOS swift developer — health app",
    "Smart contract audit for DeFi protocol",
    "UI/UX redesign of SaaS dashboard",
    "Data engineer — Snowflake pipeline",
  ];
  const cats = ["Web Development", "Mobile", "Design", "DevOps", "Data", "AI/ML", "Blockchain"];
  const statuses: JobRecord["status"][] = ["open", "filled", "open", "open", "expired", "cancelled"];
  return Array.from({ length: count }, (_, i) => ({
    id: `job_${(i + 1000).toString().padStart(5, "0")}`,
    title: titles[i % titles.length],
    client: `${firstNames[Math.floor(rand() * firstNames.length)]} ${lastNames[Math.floor(rand() * lastNames.length)]}`,
    category: cats[Math.floor(rand() * cats.length)],
    budget: Math.floor(rand() * 80000) + 2000,
    proposals: Math.floor(rand() * 47),
    status: statuses[Math.floor(rand() * statuses.length)],
    posted: `${Math.floor(rand() * 30)}d ago`,
    featured: rand() > 0.78,
  }));
}

export interface TransactionRecord {
  id: string;
  type: "commission" | "escrow_hold" | "escrow_release" | "withdrawal" | "subscription" | "featured";
  from: string;
  to: string;
  amount: number;
  fee: number;
  status: "success" | "pending" | "failed";
  date: string;
}

export function makeTransactions(count = 40): TransactionRecord[] {
  const rand = seededRand(91);
  const types: TransactionRecord["type"][] = ["commission", "escrow_hold", "escrow_release", "withdrawal", "subscription", "featured"];
  return Array.from({ length: count }, (_, i) => {
    const amount = Math.floor(rand() * 25000) + 50;
    return {
      id: `txn_${(i + 50000).toString(36)}`,
      type: types[Math.floor(rand() * types.length)],
      from: `${firstNames[Math.floor(rand() * firstNames.length)]} ${lastNames[Math.floor(rand() * lastNames.length)]}`,
      to: `${firstNames[Math.floor(rand() * firstNames.length)]} ${lastNames[Math.floor(rand() * lastNames.length)]}`,
      amount,
      fee: Math.floor(amount * 0.07),
      status: rand() > 0.08 ? "success" : (rand() > 0.5 ? "pending" : "failed"),
      date: new Date(Date.now() - i * 3600000 * (rand() * 5 + 1)).toLocaleString(),
    };
  });
}

export const ALL_USERS = makeUsers(48);
export const ALL_WITHDRAWALS = makeWithdrawals(47, ALL_USERS);
export const ALL_JOBS = makeJobs(24);
export const ALL_TRANSACTIONS = makeTransactions(40);
export const REVENUE_30D = makeRevenueSeries(30);

export function formatGHS(n: number) {
  return `GHS ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
