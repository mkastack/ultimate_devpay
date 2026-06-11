export const GHS_PER_USD = 15.5;

export const fmtGHS = (n: number) =>
  `GHS ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const fmtUSD = (n: number) =>
  `USD ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const usdToGhs = (usd: number) => usd * GHS_PER_USD;
export const ghsToUsd = (ghs: number) => ghs / GHS_PER_USD;

export const initials = (name: string) =>
  name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
