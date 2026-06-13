import { recommendedDevelopers } from "@/lib/hirer-mock-data";

export type HirerDeveloper = {
  id: string;
  name: string;
  title: string;
  location: string;
  rating: number;
  rate: number;
  jobs: number;
  skills: string[];
  available: boolean;
  top?: boolean;
  bio: string;
  years: number;
  matchKeywords: string[];
};

const bios: Record<string, string> = {
  d1: "Full-stack engineer with 6+ years building SaaS dashboards for African fintech. React, Node, and escrow integrations.",
  d2: "Flutter specialist shipping banking and MoMo apps across West Africa. Strong on security and offline-first UX.",
  d3: "LLM engineer building support bots and automation pipelines for startups. Python, LangChain, and vector search.",
  d4: "Senior React developer focused on analytics, design systems, and performance for high-traffic dashboards.",
  d5: "React Native engineer with logistics and delivery apps in production across Ghana and Nigeria.",
  d6: "Product designer turning complex workflows into clean interfaces. Figma, design systems, and Webflow handoff.",
  d7: "Backend engineer building APIs with Django and Postgres for retail and payments platforms.",
  d8: "DevOps engineer managing AWS, Docker, and CI/CD for growing engineering teams.",
};

const extra: HirerDeveloper[] = [
  {
    id: "d7",
    name: "Yaw Owusu",
    title: "Backend Python",
    location: "Kumasi, Ghana",
    rating: 4.7,
    rate: 130,
    jobs: 26,
    skills: ["Python", "Django"],
    available: true,
    bio: bios.d7,
    years: 5,
    matchKeywords: ["python", "django", "api", "backend", "postgres"],
  },
  {
    id: "d8",
    name: "Mariam Diallo",
    title: "DevOps Engineer",
    location: "Bamako, Mali",
    rating: 4.8,
    rate: 145,
    jobs: 19,
    skills: ["AWS", "Docker"],
    available: false,
    bio: bios.d8,
    years: 4,
    matchKeywords: ["devops", "aws", "docker", "cloud", "ci/cd"],
  },
];

export const hirerDeveloperCatalog: HirerDeveloper[] = [
  ...recommendedDevelopers.map((d) => ({
    id: d.id,
    name: d.name,
    title: d.title,
    location: d.location.replace(/ 🇬🇭| 🇳🇬| 🇸🇳/g, ""),
    rating: d.rating,
    rate: d.rate,
    jobs: 38,
    skills: d.skills,
    available: d.available,
    top: d.top,
    bio: bios[d.id] ?? `${d.title} available for escrow-protected contracts on DevPay Africa.`,
    years: d.top ? 6 : 4,
    matchKeywords: [...d.skills, d.title, d.name.split(" ")[0]].map((s) => s.toLowerCase()),
  })),
  ...extra,
];

export function getHirerDeveloper(id: string) {
  return hirerDeveloperCatalog.find((d) => d.id === id);
}

export function getHirerDeveloperByName(name: string) {
  return hirerDeveloperCatalog.find((d) => d.name === name);
}

export function rankDevelopersByQuery(query: string): Array<HirerDeveloper & { score: number }> {
  const q = query.toLowerCase().trim();
  if (!q) return hirerDeveloperCatalog.filter((d) => d.available).map((d) => ({ ...d, score: 70 }));

  const tokens = q.split(/\s+/).filter(Boolean);
  return hirerDeveloperCatalog
    .map((d) => {
      const haystack = `${d.name} ${d.title} ${d.skills.join(" ")} ${d.bio} ${d.matchKeywords.join(" ")}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (haystack.includes(t)) score += 18;
      }
      if (d.available) score += 8;
      if (d.top) score += 5;
      score += Math.round(d.rating * 2);
      return { ...d, score: Math.min(99, score) };
    })
    .filter((d) => d.score > 20)
    .sort((a, b) => b.score - a.score);
}
