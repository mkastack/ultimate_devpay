/** Curated listings shown on /jobs when the database has no open roles yet. */
export type PublicJobListing = {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  duration: string;
  status: string;
  created_at: string;
  client_id: string;
  clientName: string;
  clientVerified: boolean;
  location: string;
  category: string;
  experienceLevel: "Entry" | "Intermediate" | "Expert";
  skills: string[];
  proposalsCount: number;
  featured?: boolean;
};

export const showcaseJobs: PublicJobListing[] = [
  {
    id: "showcase-1",
    title: "Real-time merchant analytics dashboard",
    description:
      "Build a responsive analytics suite for West African payment partners — live charts, CSV exports, role-based access, and MoMo settlement views.",
    budget_min: 800,
    budget_max: 1500,
    currency: "USD",
    duration: "2 weeks",
    status: "open",
    created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    client_id: "demo",
    clientName: "Hubtel",
    clientVerified: true,
    location: "Accra · Remote",
    category: "Fintech",
    experienceLevel: "Intermediate",
    skills: ["React", "TypeScript", "Supabase"],
    proposalsCount: 8,
    featured: true,
  },
  {
    id: "showcase-2",
    title: "React Native onboarding with MoMo verification",
    description:
      "Design and ship a polished mobile onboarding flow with KYC hooks, OTP verification, and push notification opt-in for a Series A startup.",
    budget_min: 1200,
    budget_max: 2200,
    currency: "USD",
    duration: "3 weeks",
    status: "open",
    created_at: new Date(Date.now() - 5 * 3600_000).toISOString(),
    client_id: "demo",
    clientName: "Bloom Africa",
    clientVerified: true,
    location: "Lagos · Remote",
    category: "Mobile Apps",
    experienceLevel: "Expert",
    skills: ["React Native", "Expo", "TypeScript"],
    proposalsCount: 12,
  },
  {
    id: "showcase-3",
    title: "Design system & Storybook for fintech web app",
    description:
      "Create a scalable component library, design tokens, and Storybook documentation for a fast-growing payments platform.",
    budget_min: 1500,
    budget_max: 3000,
    currency: "USD",
    duration: "1 month",
    status: "open",
    created_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
    client_id: "demo",
    clientName: "Zeepay",
    clientVerified: true,
    location: "Remote",
    category: "UI/UX Design",
    experienceLevel: "Expert",
    skills: ["TypeScript", "Tailwind", "Figma"],
    proposalsCount: 5,
  },
  {
    id: "showcase-4",
    title: "POS system for supermarket chain",
    description:
      "Offline-first checkout, multi-branch inventory sync, and daily sales reports for retail staff across Ghana.",
    budget_min: 2200,
    budget_max: 4000,
    currency: "USD",
    duration: "5 weeks",
    status: "open",
    created_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    client_id: "demo",
    clientName: "Spintex Mart",
    clientVerified: false,
    location: "Kumasi · Hybrid",
    category: "Web Dev",
    experienceLevel: "Expert",
    skills: ["React", "Node.js", "PostgreSQL"],
    proposalsCount: 14,
    featured: true,
  },
  {
    id: "showcase-5",
    title: "Edge function for transaction reconciliation",
    description:
      "Automated ledger matching with partner settlement files, anomaly alerts, and audit-friendly logs.",
    budget_min: 400,
    budget_max: 800,
    currency: "USD",
    duration: "1 week",
    status: "open",
    created_at: new Date(Date.now() - 6 * 3600_000).toISOString(),
    client_id: "demo",
    clientName: "MoMo Pay",
    clientVerified: true,
    location: "Remote",
    category: "Cloud Engineering",
    experienceLevel: "Intermediate",
    skills: ["TypeScript", "Cloudflare", "PostgreSQL"],
    proposalsCount: 4,
  },
  {
    id: "showcase-6",
    title: "Patient queue dashboard for clinic operations",
    description:
      "Waiting-room display, SMS reminders, and admin scheduling tools for an outpatient clinic in Accra.",
    budget_min: 900,
    budget_max: 1600,
    currency: "USD",
    duration: "3 weeks",
    status: "open",
    created_at: new Date(Date.now() - 48 * 3600_000).toISOString(),
    client_id: "demo",
    clientName: "Korle Hospital",
    clientVerified: true,
    location: "Accra · On-site",
    category: "Web Dev",
    experienceLevel: "Entry",
    skills: ["React", "Tailwind", "Firebase"],
    proposalsCount: 7,
  },
];
