export const client = {
  company_name: "Sandalwood Ventures",
  email: "ops@sandalwood.io",
  is_verified: true,
  plan: "pro",
  total_spent_ghs: 48750,
  jobs_posted: 12,
  hires_made: 7,
  open_jobs_count: 3,
  active_contracts_count: 4,
  new_proposals_count: 8,
  unread_messages: 3,
  unread_notifications: 5,
  this_month: { spent_ghs: 8420, projects: 3, developers: 2 },
};

export type Contract = {
  id: string;
  job_title: string;
  developer: { name: string; title: string; avatar?: string; rating: number };
  status: "active" | "review" | "disputed" | "completed";
  milestone_current: number;
  milestone_total: number;
  milestone_label: string;
  escrow_amount: number;
  escrow_status: "holding" | "released";
  contract_amount: number;
  paid_amount: number;
  awaiting_approval?: boolean;
};

export const contracts: Contract[] = [
  {
    id: "c1",
    job_title: "React Dashboard for Fintech Analytics",
    developer: { name: "Kwame Mensah", title: "Senior React Developer", rating: 4.9 },
    status: "active",
    milestone_current: 2,
    milestone_total: 4,
    milestone_label: "API integration & charts",
    escrow_amount: 4500,
    escrow_status: "holding",
    contract_amount: 9000,
    paid_amount: 2250,
    awaiting_approval: true,
  },
  {
    id: "c2",
    job_title: "Mobile App for Logistics Tracking",
    developer: { name: "Adaeze Okafor", title: "React Native Engineer", rating: 5.0 },
    status: "active",
    milestone_current: 1,
    milestone_total: 3,
    milestone_label: "Auth & onboarding flows",
    escrow_amount: 3000,
    escrow_status: "holding",
    contract_amount: 6000,
    paid_amount: 0,
  },
  {
    id: "c3",
    job_title: "AI Chatbot for Customer Support",
    developer: { name: "Tunde Bakare", title: "AI/LLM Engineer", rating: 4.8 },
    status: "review",
    milestone_current: 3,
    milestone_total: 3,
    milestone_label: "Final review & handover",
    escrow_amount: 2400,
    escrow_status: "holding",
    contract_amount: 7200,
    paid_amount: 4800,
  },
];

export const proposalsByJob = [
  {
    job_id: "j1",
    job_title: "Senior Frontend Engineer for SaaS",
    proposals: [
      {
        id: "p1",
        dev: { name: "Ama Boateng", rating: 4.9, jobs: 38, avatar: undefined as string | undefined },
        ai_match: 94,
        preview: "I've shipped 5 production SaaS dashboards using React + TanStack Query. I can hit your timeline and prioritize accessibility.",
        ai_generated: true,
        bid: 4200,
        days: 21,
        hours_ago: 2,
      },
      {
        id: "p2",
        dev: { name: "Joseph Nkrumah", rating: 4.7, jobs: 22, avatar: undefined },
        ai_match: 86,
        preview: "Available immediately. Strong TypeScript + Tailwind background. Happy to do a paid trial milestone first.",
        ai_generated: false,
        bid: 3800,
        days: 18,
        hours_ago: 5,
      },
    ],
  },
  {
    job_id: "j2",
    job_title: "Flutter Engineer for Banking App",
    proposals: [
      {
        id: "p3",
        dev: { name: "Chiamaka Eze", rating: 4.95, jobs: 47, avatar: undefined },
        ai_match: 91,
        preview: "12 fintech apps shipped. PCI familiarity. Can start Monday and deliver MVP in 5 weeks.",
        ai_generated: true,
        bid: 6500,
        days: 35,
        hours_ago: 9,
      },
    ],
  },
];

export const recommendedDevelopers = [
  { id: "d1", name: "Ama Boateng", title: "Full-Stack React", location: "Accra, Ghana 🇬🇭", flag: "🇬🇭", rating: 4.9, rate: 150, available: true, top: true, skills: ["React", "Node.js"], recently_active: true },
  { id: "d2", name: "Chiamaka Eze", title: "Flutter & Fintech", location: "Lagos, Nigeria 🇳🇬", flag: "🇳🇬", rating: 4.95, rate: 175, available: true, top: true, skills: ["Flutter", "Firebase"], recently_active: true },
  { id: "d3", name: "Tunde Bakare", title: "AI/LLM Engineer", location: "Lagos, Nigeria 🇳🇬", flag: "🇳🇬", rating: 4.8, rate: 220, available: false, top: false, skills: ["Python", "LangChain"], recently_active: false },
  { id: "d4", name: "Kwame Mensah", title: "Senior React", location: "Accra, Ghana 🇬🇭", flag: "🇬🇭", rating: 4.9, rate: 160, available: true, top: false, skills: ["React", "TypeScript"], recently_active: true },
  { id: "d5", name: "Adaeze Okafor", title: "React Native", location: "Abuja, Nigeria 🇳🇬", flag: "🇳🇬", rating: 5.0, rate: 180, available: true, top: true, skills: ["React Native", "GraphQL"], recently_active: false },
  { id: "d6", name: "Fatou Diop", title: "UI/UX Designer", location: "Dakar, Senegal 🇸🇳", flag: "🇸🇳", rating: 4.85, rate: 120, available: true, top: false, skills: ["Figma", "Webflow"], recently_active: true },
];

export const openJobs = [
  { id: "j1", title: "Senior Frontend Engineer for SaaS", category: "Web Dev", budget: "GHS 3,500–5,000", proposals: 12, posted_days: 2, status: "Open" },
  { id: "j2", title: "Flutter Engineer for Banking App", category: "Mobile", budget: "GHS 5,000–7,500", proposals: 7, posted_days: 5, status: "Open" },
  { id: "j3", title: "DevOps for AWS Migration", category: "DevOps", budget: "GHS 4,000–6,000", proposals: 4, posted_days: 1, status: "Open" },
];

export const conversations = [
  { id: "m1", dev: "Kwame Mensah", job: "React Dashboard", last: "Just pushed the latest milestone for your review.", time: "2m", unread: true, active_contract: true },
  { id: "m2", dev: "Adaeze Okafor", job: "Logistics Mobile App", last: "Quick question about the auth flow spec.", time: "1h", unread: true, active_contract: true },
  { id: "m3", dev: "Chiamaka Eze", job: "Banking App proposal", last: "Thanks! Looking forward to hearing back.", time: "5h", unread: false, active_contract: false },
];

export const spendingByWeek = [
  { week: "W1", amount: 1200 },
  { week: "W2", amount: 2400 },
  { week: "W3", amount: 1800 },
  { week: "W4", amount: 3020 },
];

export const transactions = [
  { id: "t1", date: "May 19, 2026", description: "Milestone 1 · React Dashboard", developer: "Kwame Mensah", amount: -2250, status: "Completed" },
  { id: "t2", date: "May 14, 2026", description: "Escrow funding · Banking App", developer: "Chiamaka Eze", amount: -3000, status: "Completed" },
  { id: "t3", date: "May 10, 2026", description: "Milestone 2 · AI Chatbot", developer: "Tunde Bakare", amount: -2400, status: "Completed" },
  { id: "t4", date: "May 03, 2026", description: "Milestone 3 · AI Chatbot", developer: "Tunde Bakare", amount: -2400, status: "Pending" },
];

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const notifications: AppNotification[] = [
  { id: "n1", title: "New proposal received", body: "Ama Boateng applied to Senior Frontend Engineer.", time: "2m ago", read: false },
  { id: "n2", title: "Milestone awaiting approval", body: "Kwame Mensah submitted Milestone 2 for review.", time: "1h ago", read: false },
  { id: "n3", title: "Escrow funded", body: "GHS 3,000 locked for Banking App contract.", time: "5h ago", read: false },
  { id: "n4", title: "Contract signed", body: "Adaeze Okafor accepted your offer.", time: "yesterday", read: false },
  { id: "n5", title: "New message", body: "Tunde Bakare: Quick question about the spec.", time: "yesterday", read: false },
  { id: "n6", title: "Payout completed", body: "Milestone 1 released to Kwame Mensah.", time: "2 days ago", read: true },
];
