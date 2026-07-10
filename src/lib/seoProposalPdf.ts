import { jsPDF } from "jspdf";
import { SEO_PACKAGES, type SeoPackageSlug } from "@/data/seoPackages";

export type ProposalInputs = {
  budget: number;
  competition: "low" | "medium" | "high";
  targetUrls: number;
  cityPopulation: number;
  slug: SeoPackageSlug;
  clientName?: string;
  clientEmail?: string;
  targetUrl?: string;
  keywords?: string;
};

// Brand tokens — kept close to the dark tactical / neon-green identity.
const NEON = [174, 255, 0] as const;
const INK = [24, 26, 22] as const;
const MUTED = [110, 116, 108] as const;

const fmt = (n: number) => n.toLocaleString("en-US");

function competitionLabel(c: ProposalInputs["competition"]) {
  return c === "low" ? "Low" : c === "medium" ? "Medium" : "High";
}

export function generateSeoProposalPdf(input: ProposalInputs): jsPDF {
  const pkg = SEO_PACKAGES.find((p) => p.slug === input.slug);
  if (!pkg) throw new Error("Unknown package");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;

  const setInk = () => doc.setTextColor(INK[0], INK[1], INK[2]);
  const setMuted = () => doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);

  const ensureRoom = (needed: number) => {
    if (y + needed > H - 60) {
      addFooter();
      doc.addPage();
      y = M;
    }
  };

  const addFooter = () => {
    doc.setFontSize(8);
    setMuted();
    doc.text("Industry Army Marketing · industryarmymarketing.com · colin@industryarmymarketing.com", M, H - 30);
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      W - M,
      H - 30,
      { align: "right" },
    );
  };

  // ---- Header band ----
  doc.setFillColor(INK[0], INK[1], INK[2]);
  doc.rect(0, 0, W, 110, "F");
  doc.setFillColor(NEON[0], NEON[1], NEON[2]);
  doc.rect(0, 110, W, 3, "F");

  doc.setTextColor(NEON[0], NEON[1], NEON[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INDUSTRY ARMY MARKETING · SEO PROPOSAL", M, 44);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text(`${pkg.name}.`, M, 82);
  doc.setTextColor(NEON[0], NEON[1], NEON[2]);
  doc.text(` $${pkg.price}`, M + doc.getTextWidth(`${pkg.name}.`) + 8, 82);

  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(pkg.tagline.toUpperCase(), M, 100);

  y = 150;

  // ---- Prepared for ----
  setInk();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PREPARED FOR", M, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const prep: [string, string][] = [
    ["Client", input.clientName || "—"],
    ["Email", input.clientEmail || "—"],
    ["Target URL", input.targetUrl || "—"],
    ["Keywords", input.keywords || "—"],
    ["Date", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
  ];
  prep.forEach(([k, v]) => {
    setMuted();
    doc.text(k, M, y);
    setInk();
    const lines = doc.splitTextToSize(v, W - M - 130);
    doc.text(lines, M + 90, y);
    y += 14 * Math.max(1, lines.length);
  });
  y += 10;

  // ---- Estimator inputs ----
  ensureRoom(120);
  setInk();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("YOUR INPUTS", M, y);
  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.line(M, y, W - M, y);
  y += 14;

  const inputs: [string, string][] = [
    ["Budget", `$${fmt(input.budget)} USD`],
    ["Competition level", competitionLabel(input.competition)],
    ["Target URLs", String(input.targetUrls)],
    ["City population", fmt(input.cityPopulation)],
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  inputs.forEach(([k, v]) => {
    setMuted();
    doc.text(k, M, y);
    setInk();
    doc.text(v, M + 200, y);
    y += 16;
  });
  y += 8;

  // ---- Recommendation summary ----
  ensureRoom(140);
  doc.setFillColor(246, 250, 232);
  doc.rect(M, y, W - M * 2, 110, "F");
  doc.setDrawColor(NEON[0], NEON[1], NEON[2]);
  doc.setLineWidth(1);
  doc.rect(M, y, W - M * 2, 110);
  doc.setLineWidth(0.5);

  setInk();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("RECOMMENDED PACKAGE", M + 16, y + 22);
  doc.setFontSize(22);
  doc.text(`${pkg.name} — ${pkg.tagline}`, M + 16, y + 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const sumLines = doc.splitTextToSize(pkg.summary, W - M * 2 - 32);
  doc.text(sumLines, M + 16, y + 68);

  // Stat chips
  const chipY = y + 88;
  const chips: [string, string][] = [
    ["Price", `$${pkg.price}`],
    ["Placements", String(pkg.deliverables)],
    ["Delivery", `${pkg.timelineDays} days`],
    ["Revisions", String(pkg.revisions)],
  ];
  let cx = M + 16;
  doc.setFontSize(9);
  chips.forEach(([k, v]) => {
    const label = `${k}: `;
    setMuted();
    doc.text(label, cx, chipY);
    const lw = doc.getTextWidth(label);
    setInk();
    doc.setFont("helvetica", "bold");
    doc.text(v, cx + lw, chipY);
    doc.setFont("helvetica", "normal");
    cx += lw + doc.getTextWidth(v) + 22;
  });
  y += 130;

  // ---- Deliverables ----
  ensureRoom(100);
  setInk();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Deliverables", M, y);
  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.line(M, y, W - M, y);
  y += 16;

  const sections: { title: string; items: string[] }[] = [
    { title: "Link Building", items: pkg.linkBuilding },
    { title: "IAM Network Placements", items: pkg.iam },
    { title: "Tier 2 Drip", items: pkg.tier2 },
  ];

  sections.forEach((sec) => {
    ensureRoom(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setInk();
    doc.text(sec.title, M, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    sec.items.forEach((item) => {
      ensureRoom(16);
      doc.setTextColor(NEON[0] * 0.6, NEON[1] * 0.6, NEON[2] * 0.6);
      doc.text("•", M + 8, y);
      setInk();
      const lines = doc.splitTextToSize(item, W - M * 2 - 20);
      doc.text(lines, M + 20, y);
      y += 14 * lines.length;
    });
    y += 6;
  });

  // ---- Timeline ----
  ensureRoom(120);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setInk();
  doc.text(`${pkg.timelineDays}-Day Timeline`, M, y);
  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.line(M, y, W - M, y);
  y += 16;

  pkg.timeline.forEach((t) => {
    ensureRoom(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(NEON[0] * 0.5, NEON[1] * 0.5, NEON[2] * 0.5);
    doc.text(t.day.toUpperCase(), M, y);
    setInk();
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(t.step, W - M * 2 - 90);
    doc.text(lines, M + 90, y);
    y += 14 * Math.max(1, lines.length) + 4;
  });

  // ---- What's included / trust ----
  ensureRoom(160);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setInk();
  doc.text("What's Included", M, y);
  y += 8;
  doc.setDrawColor(230, 230, 230);
  doc.line(M, y, W - M, y);
  y += 14;

  const trust = [
    ["Domain exclusivity", "No IAM domain placed for a competing client in your niche during the same cycle."],
    [`${pkg.revisions} free revisions`, "Anchor text, target URL, and content tone adjustments before publishing."],
    ["500+ word original articles", "No spun content. E-E-A-T compliant. Written for each placement's domain and audience."],
    ["90-day link guarantee", "Any link that drops within 90 days is replaced free with an equivalent DA placement."],
    ["Full link report", "Every live URL, anchor text, DA, and placement domain — CSV + PDF. White-label available."],
  ];
  trust.forEach(([t, d]) => {
    ensureRoom(28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setInk();
    doc.text(t, M, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    setMuted();
    const lines = doc.splitTextToSize(d, W - M * 2);
    doc.text(lines, M, y);
    y += 12 * lines.length + 4;
  });

  // ---- Pricing summary + CTA ----
  ensureRoom(120);
  y += 6;
  doc.setFillColor(INK[0], INK[1], INK[2]);
  doc.rect(M, y, W - M * 2, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL — ONE-TIME", M + 20, y + 26);
  doc.setFontSize(32);
  doc.setTextColor(NEON[0], NEON[1], NEON[2]);
  doc.text(`$${pkg.price}`, M + 20, y + 60);
  doc.setTextColor(200, 200, 200);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${pkg.deliverables} placements · ${pkg.timelineDays}-day delivery · ${pkg.revisions} revisions`,
    M + 20,
    y + 78,
  );
  doc.setTextColor(NEON[0], NEON[1], NEON[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Reply to lock in →", W - M - 20, y + 60, { align: "right" });
  doc.setTextColor(220, 220, 220);
  doc.setFont("helvetica", "normal");
  doc.text("colin@industryarmymarketing.com", W - M - 20, y + 78, { align: "right" });
  y += 110;

  // Footer on last page
  addFooter();

  return doc;
}

export function downloadSeoProposalPdf(input: ProposalInputs): string {
  const doc = generateSeoProposalPdf(input);
  const pkg = SEO_PACKAGES.find((p) => p.slug === input.slug)!;
  const filename = `IAM-SEO-Proposal-${pkg.name}.pdf`;
  doc.save(filename);
  return filename;
}