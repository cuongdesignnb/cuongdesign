import { promises as fs } from "node:fs";
import path from "node:path";

type Severity = "critical" | "warning" | "info";
type Finding = {
  severity: Severity;
  route: string;
  check: string;
  message: string;
};

type RouteResult = {
  url: string;
  status: number;
  title: string;
  description: string;
  canonical: string;
  h1Count: number;
  noindex: boolean;
  jsonLdCount: number;
};

const baseUrl = (process.env.SEO_AUDIT_URL || "http://localhost:13000").replace(/\/$/, "");
const findings: Finding[] = [];
const routes: RouteResult[] = [];

function add(severity: Severity, route: string, check: string, message: string) {
  findings.push({ severity, route, check, message });
}

function decode(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function attribute(html: string, tagPattern: RegExp, name: string) {
  const tag = html.match(tagPattern)?.[0] || "";
  return decode(tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"))?.[1] || "");
}

function collectIds(value: unknown, ids: string[] = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectIds(item, ids));
  } else if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const [key, item] of Object.entries(object)) {
      if (key === "@id" && typeof item === "string" && object["@type"]) ids.push(item);
      collectIds(item, ids);
    }
  }
  return ids;
}

async function get(url: string) {
  return fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
}

async function auditRoute(url: string, sitemapPaths: Set<string>) {
  const response = await get(url);
  const route = new URL(url).pathname;
  if (response.status !== 200) {
    add("critical", route, "http-status", `Expected 200, received ${response.status}.`);
    return;
  }

  const html = await response.text();
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "");
  const description = attribute(html, /<meta[^>]+name=["']description["'][^>]*>/i, "content");
  const canonical = attribute(html, /<link[^>]+rel=["']canonical["'][^>]*>/i, "href");
  const robots = attribute(html, /<meta[^>]+name=["']robots["'][^>]*>/i, "content");
  const noindex = /noindex/i.test(robots);
  const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
  const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  if (!title) add("critical", route, "title", "Missing title.");
  if (!description) add("critical", route, "description", "Missing meta description.");
  if (!canonical) add("critical", route, "canonical", "Missing canonical.");
  if (canonical.includes("?")) add("critical", route, "canonical-query", "Canonical contains a query.");
  if (
    !noindex &&
    canonical &&
    new URL(canonical).pathname.replace(/\/$/, "") !== route.replace(/\/$/, "")
  ) {
    add("warning", route, "self-canonical", `Canonical is ${canonical}.`);
  }
  if (h1Count !== 1) add("warning", route, "h1", `Expected one H1, found ${h1Count}.`);
  if (!noindex && !sitemapPaths.has(route.replace(/\/$/, "") || "/")) {
    add("warning", route, "sitemap", "Indexable route is not present in sitemap.");
  }
  if (noindex && sitemapPaths.has(route.replace(/\/$/, "") || "/")) {
    add("critical", route, "sitemap-noindex", "Noindex route is present in sitemap.");
  }

  const ids: string[] = [];
  for (const block of jsonLdBlocks) {
    try {
      collectIds(JSON.parse(decode(block[1])), ids);
    } catch {
      add("critical", route, "json-ld", "JSON-LD cannot be parsed.");
    }
  }
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) {
    add("warning", route, "schema-id", `Duplicate @id: ${[...new Set(duplicates)].join(", ")}`);
  }

  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  if (images.some((tag) => !/\balt=["'][^"']*["']/i.test(tag))) {
    add("warning", route, "image-alt", "One or more images are missing alt attributes.");
  }

  routes.push({
    url,
    status: response.status,
    title,
    description,
    canonical,
    h1Count,
    noindex,
    jsonLdCount: jsonLdBlocks.length,
  });
}

async function findHardcodedDomains(directory: string) {
  const files: string[] = [];
  async function walk(current: string) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(target);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(target);
    }
  }
  await walk(directory);
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    if (/https:\/\/(?:www\.)?cuongdesign\.(?:com|net)/i.test(source)) {
      add("critical", path.relative(process.cwd(), file), "hardcoded-domain", "Use the SEO URL helper.");
    }
  }
}

async function main() {
  const sitemapResponse = await get(`${baseUrl}/sitemap.xml`);
  if (sitemapResponse.status !== 200) {
    throw new Error(`Sitemap returned ${sitemapResponse.status}.`);
  }
  const sitemapXml = await sitemapResponse.text();
  const sitemapPaths = new Set(
    [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
      const pathname = new URL(decode(match[1])).pathname.replace(/\/$/, "");
      return pathname || "/";
    }),
  );
  const required = [
    "/",
    "/gioi-thieu",
    "/dich-vu",
    "/quy-trinh",
    "/ky-nang",
    "/du-an",
    "/san-pham",
    "/bai-viet",
    "/danh-gia",
    "/lien-he",
  ].map((route) => `${baseUrl}${route === "/" ? "" : route}`);

  const auditUrls = [
    ...new Set([
      ...required,
      ...[...sitemapPaths].map((route) => `${baseUrl}${route === "/" ? "" : route}`),
    ]),
  ];
  for (const url of auditUrls) {
    await auditRoute(url, sitemapPaths);
  }
  await findHardcodedDomains(path.join(process.cwd(), "src", "app"));

  const counts = {
    critical: findings.filter((item) => item.severity === "critical").length,
    warning: findings.filter((item) => item.severity === "warning").length,
    info: findings.filter((item) => item.severity === "info").length,
  };
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    counts,
    routes,
    findings,
  };
  const markdown = [
    "# SEO Audit",
    "",
    `- Generated: ${report.generatedAt}`,
    `- Base URL: ${baseUrl}`,
    `- Routes checked: ${routes.length}`,
    `- Critical: ${counts.critical}`,
    `- Warnings: ${counts.warning}`,
    "",
    "## Findings",
    "",
    ...(findings.length
      ? findings.map((item) => `- **${item.severity.toUpperCase()}** \`${item.route}\` ${item.check}: ${item.message}`)
      : ["No findings."]),
    "",
  ].join("\n");

  const reportDir = path.join(process.cwd(), "reports");
  await fs.mkdir(reportDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(reportDir, "seo-audit.json"), `${JSON.stringify(report, null, 2)}\n`),
    fs.writeFile(path.join(reportDir, "seo-audit.md"), markdown),
  ]);
  console.log(`SEO audit: ${routes.length} routes, ${counts.critical} critical, ${counts.warning} warnings.`);
  if (counts.critical) process.exitCode = 1;
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`SEO audit failed: ${message}`);
  process.exitCode = 1;
});
