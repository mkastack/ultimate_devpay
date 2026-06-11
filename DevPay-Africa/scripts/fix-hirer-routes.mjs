import fs from "fs";
import path from "path";

const routesDir = path.join(process.cwd(), "src/routes");
const files = [
  "client.index.tsx",
  "client.jobs.tsx",
  "client.post-job.tsx",
  "client.proposals.tsx",
  "client.settings.tsx",
  "client.developers.tsx",
  "client.contracts.tsx",
  "client.payments.tsx",
  "client.messages.tsx",
];

const routeMap = [
  [/\bcreateFileRoute\("\/settings"\)/g, 'createFileRoute("/client/settings")'],
  [/\bcreateFileRoute\("\/proposals"\)/g, 'createFileRoute("/client/proposals")'],
  [/\bcreateFileRoute\("\/post-job"\)/g, 'createFileRoute("/client/post-job")'],
  [/\bcreateFileRoute\("\/payments"\)/g, 'createFileRoute("/client/payments")'],
  [/\bcreateFileRoute\("\/messages"\)/g, 'createFileRoute("/client/messages")'],
  [/\bcreateFileRoute\("\/jobs"\)/g, 'createFileRoute("/client/jobs")'],
  [/\bcreateFileRoute\("\/developers"\)/g, 'createFileRoute("/client/developers")'],
  [/\bcreateFileRoute\("\/contracts"\)/g, 'createFileRoute("/client/contracts")'],
  [/\bcreateFileRoute\("\/"\)/g, 'createFileRoute("/client/")'],
  [/to: "\/settings"/g, 'to: "/client/settings"'],
  [/to: "\/proposals"/g, 'to: "/client/proposals"'],
  [/to: "\/post-job"/g, 'to: "/client/post-job"'],
  [/to: "\/payments"/g, 'to: "/client/payments"'],
  [/to: "\/messages"/g, 'to: "/client/messages"'],
  [/to: "\/jobs"/g, 'to: "/client/jobs"'],
  [/to: "\/developers"/g, 'to: "/client/developers"'],
  [/to: "\/contracts"/g, 'to: "/client/contracts"'],
  [/to: "\/"/g, 'to: "/client"'],
  [/to="\/settings"/g, 'to="/client/settings"'],
  [/to="\/proposals"/g, 'to="/client/proposals"'],
  [/to="\/post-job"/g, 'to="/client/post-job"'],
  [/to="\/payments"/g, 'to="/client/payments"'],
  [/to="\/messages"/g, 'to="/client/messages"'],
  [/to="\/jobs"/g, 'to="/client/jobs"'],
  [/to="\/developers"/g, 'to="/client/developers"'],
  [/to="\/contracts"/g, 'to="/client/contracts"'],
  [/href="\/settings"/g, 'href="/client/settings"'],
  [/href="\/proposals"/g, 'href="/client/proposals"'],
  [/href="\/post-job"/g, 'href="/client/post-job"'],
  [/href="\/contracts"/g, 'href="/client/contracts"'],
  [/navigate\(\{ to: "\/contracts"/g, 'navigate({ to: "/client/contracts"'],
  [/@\/lib\/mock-data/g, "@/lib/hirer-mock-data"],
  [/@\/lib\/format/g, "@/lib/hirer-format"],
  [/@\/lib\/logo/g, "@/lib/hirer-logo"],
  [/@\/components\/client\//g, "@/components/hirer-dashboard/"],
];

for (const file of files) {
  const fp = path.join(routesDir, file);
  if (!fs.existsSync(fp)) continue;
  let content = fs.readFileSync(fp, "utf8");
  for (const [from, to] of routeMap) content = content.replace(from, to);
  content = content.replace(
    /import \{ DashboardLayout \} from "@\/components\/hirer-dashboard\/DashboardLayout";\n?/g,
    ""
  );
  content = content.replace(/<DashboardLayout>\s*/g, "");
  content = content.replace(/\s*<\/DashboardLayout>/g, "");
  if (/return \(\s*\n\s*<TopBar/.test(content) && !/return \(\s*\n\s*<>/.test(content)) {
    content = content.replace(/return \(\s*\n(\s*)<TopBar/, "return (\n$1<>\n$1<TopBar");
    content = content.replace(/\n(\s*)\);\n(\s*)\}/g, (m, indent, fnIndent) => {
      if (m.includes("</>")) return m;
      return `\n${indent}</>\n${indent});\n${fnIndent}}`;
    });
  }
  fs.writeFileSync(fp, content);
  console.log("fixed", file);
}
