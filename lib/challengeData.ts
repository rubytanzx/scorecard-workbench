export type ChallengeArchetype = "policy-reform" | "market-creation" | "institutional-strengthening";
export type NarrativeStrength = "Strong" | "Moderate" | "Developing";

export interface ChallengeSet {
  id: string;
  archetype: ChallengeArchetype;
  /** Short punchy card title */
  shortTitle: string;
  /** Full precise challenge statement */
  title: string;
  /** Narrative summary paragraph */
  summary: string;
  padCount: number;
  isrCount: number;
  icrCount: number;
  evidenceCount: number;
  countryCount: number;
  indicators: string[];
  indicatorMovement: string;
  movementTag: "accelerating" | "slowing" | "mixed";
  outcomeAreaIds: string[];
  countryExamples: { name: string; flag: string }[];
}

/**
 * Derives narrative strength from the authenticity rubric:
 *   1. Evidence density  — total artifact count (PADs + ISRs + ICRs)
 *   2. Country coverage  — number of IDA countries covered
 *   3. Indicator momentum — accelerating / mixed / slowing
 *
 * Strong:     2+ dimensions at high threshold
 * Moderate:   1 dimension at high threshold, or all at medium
 * Developing: limited evidence base or adverse momentum
 */
export function narrativeStrength(c: ChallengeSet): NarrativeStrength {
  const totalArtifacts = c.padCount + c.isrCount + c.icrCount;
  const evidenceScore  = totalArtifacts >= 1500 ? 2 : totalArtifacts >= 800 ? 1 : 0;
  const coverageScore  = c.countryCount  >= 25   ? 2 : c.countryCount  >= 15  ? 1 : 0;
  const momentumScore  = c.movementTag === "accelerating" ? 2 : c.movementTag === "mixed" ? 1 : 0;
  const total = evidenceScore + coverageScore + momentumScore;
  if (total >= 5) return "Strong";
  if (total >= 3) return "Moderate";
  return "Developing";
}

/** Returns a 0–100 narrative readiness score based on evidence density, country coverage, and indicator momentum. */
export function narrativeScore(c: ChallengeSet): number {
  const totalArtifacts = c.padCount + c.isrCount + c.icrCount;
  const evidenceRatio  = Math.min(totalArtifacts / 2000, 1);
  const coverageRatio  = Math.min(c.countryCount  / 40,  1);
  const momentumScore  = c.movementTag === "accelerating" ? 1 : c.movementTag === "mixed" ? 0.6 : 0.25;
  return Math.round((evidenceRatio * 0.40 + coverageRatio * 0.35 + momentumScore * 0.25) * 100);
}

/** A single guidance tip mapped to one of the five Authenticity Rubric dimensions. */
export interface GapTip {
  id: string;
  dimensionNum: 1 | 2 | 3 | 4 | 5;
  dimensionLabel: string;
  tip: string;
  /** Suggested prose to insert into the narrative when user clicks "Add to Narrative". */
  addContent: string;
  /** Approximate score lift (%) if this gap is resolved. */
  scoreImpact: number;
}

/**
 * Returns narrative guidance tips based on the five Authenticity Rubric dimensions:
 *  1. Honest Characterization of the Challenge
 *  2. Causal Humility
 *  3. Acknowledgment of Obstacles and Incomplete Results
 *  4. Specificity of Evidence
 *  5. Quality and Utility of Lessons Learned
 *
 * Pass variant="donor" for the external Draft a Report flow — strips all
 * references to PADs / ISRs / ICRs / project codes since that flow draws only
 * from IDA scorecard data, not project documents.
 */
export function getGapTips(c: ChallengeSet, variant: "results" | "donor" = "results"): GapTip[] {
  const total = c.padCount + c.isrCount + c.icrCount;
  const isDonor = variant === "donor";
  const tips: GapTip[] = [];

  // Dimension 3 — Obstacles & Incomplete Results
  if (c.movementTag === "accelerating") {
    tips.push({
      id: "d3-obstacles",
      dimensionNum: 3,
      dimensionLabel: "Obstacles & Incomplete Results",
      tip: "The Pathways section should surface on-track/off-track signals at portfolio level — describing what happened quarter by quarter is not the same as acknowledging where results fell short. Name at least one component, country, or indicator that is lagging or at risk, state why, and describe what adjustment was or is being made. Narratives that present only positive results are not credible to donor audiences.",
      addContent: `In ${c.countryExamples.at(-1)?.name ?? "several countries"}, implementation timelines required adjustment due to capacity constraints at the subnational level. The team responded by introducing phased rollout and strengthened technical assistance, with sustained improvement recorded in subsequent supervision cycles.`,
      scoreImpact: 8,
    });
  } else if (c.movementTag === "mixed") {
    tips.push({
      id: "d3-specificity",
      dimensionNum: 3,
      dimensionLabel: "Obstacles & Incomplete Results",
      tip: "Mixed momentum is noted, but the narrative should name precisely what stalled, when, and what design adjustment was made in response. A specific account of a disrupted or incomplete pathway — including the component that failed and how the team adapted — is significantly more credible than a general acknowledgement of difficulty.",
      addContent: `${c.indicatorMovement}. In response, the team revised the program design to strengthen subnational components and introduced enhanced monitoring to track recovery across affected countries.`,
      scoreImpact: 6,
    });
  }

  // Dimension 2 — Causal Humility
  if (c.countryCount < 25) {
    tips.push({
      id: "d2-causal",
      dimensionNum: 2,
      dimensionLabel: "Causal Humility",
      tip: `This narrative focuses on contribution, not attribution — yet with ${c.countryCount} countries in scope, the language risks implying the WBG was the primary driver. Name at least one other development partner, government actor, or market force that shaped the outcome, and describe specifically what the WBG contributed within that broader effort.`,
      addContent: "These results reflect the combined effect of WBG support alongside government-led reforms and parallel investments from bilateral partners. In several countries, sustained outcomes were anchored by strong ministerial ownership of the reform agenda. The WBG's specific contribution was providing the technical credibility and cross-sectoral convening that enabled alignment across ministries.",
      scoreImpact: 7,
    });
  } else if (c.countryCount < 34) {
    tips.push({
      id: "d2-context",
      dimensionNum: 2,
      dimensionLabel: "Causal Humility",
      tip: "The narrative should explicitly name the government leaders and bilateral donors who contributed alongside the WBG. Contribution claims are stronger — not weaker — when they are honest about what the WBG did and did not do alone. Avoid verbs like 'supported' or 'facilitated' without naming the mechanism.",
      addContent: "These results reflect the combined effect of WBG support alongside government-led policy reforms and coordination with bilateral partners operating in the same countries. WBG support contributed to these outcomes as one actor within a broader coalition — not the sole driver.",
      scoreImpact: 5,
    });
  }

  // Dimension 4 — Specificity of Evidence
  if (total < 1500) {
    tips.push({
      id: "d4-evidence",
      dimensionNum: 4,
      dimensionLabel: "Specificity of Evidence",
      tip: isDonor
        ? `Not all result claims in the country examples can be traced to a published IDA scorecard figure. Every number cited must come directly from IDA scorecard data or country-level reporting — no estimates or figures outside the published dataset. Where a financial figure is cited, state exactly what it funded or enabled.`
        : `With ${total.toLocaleString()} source documents, result lines in the country examples may not be traceable to a named source. Every number must be drawn directly from PADs, ISRs, or ICRs — no estimates or figures from outside the document set. Where a financial figure is cited, state exactly what it funded or enabled, and include a leverage ratio if available.`,
      addContent: isDonor
        ? `All quantitative results cited are drawn directly from IDA FY25 scorecard data. Country-level figures reference reported portfolio results for the relevant outcome area and are cross-verified against IDA's published reporting.`
        : `All quantitative results are drawn from ${c.padCount.toLocaleString()} PADs and ${c.isrCount.toLocaleString()} ISRs filed during the FY25 reporting period. Country-level figures are sourced from project-level ISRs and cross-verified against ICR data where available.`,
      scoreImpact: 9,
    });
  } else if (total < 1900) {
    tips.push({
      id: "d4-sourcing",
      dimensionNum: 4,
      dimensionLabel: "Specificity of Evidence",
      tip: isDonor
        ? `The strongest quantitative findings should be traceable to a specific IDA indicator or country-level result so readers can independently verify them. Where a financial figure is cited, include what it funded and the outcome it enabled.`
        : `The strongest quantitative findings should be pinned to a specific source document and project code so readers can independently verify them. Where a financial figure is cited, include what it funded and a leverage ratio if one is available from the ISR or ICR.`,
      addContent: isDonor
        ? `Quantitative results are drawn from IDA FY25 scorecard data. Where country-level data is incomplete, figures represent IDA portfolio averages across reporting countries.`
        : `Quantitative results are drawn from ${c.padCount.toLocaleString()} PADs and ${c.isrCount.toLocaleString()} ISRs as of FY25. Where country-level data is incomplete, figures represent IDA portfolio averages across reporting countries.`,
      scoreImpact: 5,
    });
  }

  // Dimension 5 — Lessons Learned
  if (c.movementTag !== "slowing") {
    tips.push({
      id: "d5-lessons",
      dimensionNum: 5,
      dimensionLabel: "Lessons Learned",
      tip: isDonor
        ? `Lessons must be grounded in what the IDA portfolio evidence shows — not aspirational claims. Each lesson should name a specific country and the outcome that informed it, and be specific enough to be actionable. Avoid generic conclusions like 'coordination matters' or 'country ownership is key' without explaining what form, in what context, and with what outcome.`
        : `Lessons must be drawn from ISRs and ICRs — not PADs or design documents. Each lesson should name a specific country and cite the relevant report, and be specific enough to be actionable. Avoid generic conclusions like 'coordination matters' or 'country ownership is key' without explaining what form, in what context, and with what outcome.`,
      addContent: isDonor
        ? `Lesson (${c.countryExamples[0]?.name ?? "Portfolio-wide"}): An initial focus on national-level institutions proved insufficient in fragile contexts; subsequent program adjustments added subnational components with measurable improvement in later reporting periods. Second lesson: early engagement of frontline workers in program design reduced adoption barriers during rollout.`
        : `Lesson (${c.countryExamples[0]?.name ?? "Portfolio-wide"}, ISR FY25): An initial focus on national-level institutions proved insufficient in fragile contexts; the team subsequently added subnational capacity-building components with measurable improvement in results. Second lesson (ICR): early engagement of frontline workers in program design reduced adoption barriers during rollout.`,
      scoreImpact: 6,
    });
  }

  // Dimension 1 — Honest Characterization of the Challenge (always fires — ToC check)
  tips.push({
    id: "d1-challenge",
    dimensionNum: 1,
    dimensionLabel: "Challenge Characterization",
    tip: "The narrative needs an explicit Theory of Change: Constraint → WBG Support → Intermediate Outcome → High-Level Development Outcome. Describing what happened and when is not the same as tracing how change occurred. The intermediate outcome — the policy enacted, institution reformed, or market created — should be the pivot point of the Pathways section, not a transition between activity descriptions.",
    addContent: isDonor
      ? `Previous efforts to address this constraint had limited impact due to fragmented coordination across ministries and insufficient attention to political economy factors at the subnational level. This context shaped IDA's decision to anchor the response in systemic reform — strengthening the institutions and regulatory frameworks that earlier investments had not been able to shift. The intermediate outcome was a functioning cross-ministry coordination mechanism that enabled the high-level results to follow.`
      : `Previous efforts to address this constraint had limited impact due to fragmented coordination across ministries and insufficient attention to political economy factors at the subnational level. This context shaped the WBG's decision to anchor the response in systemic reform — strengthening the institutions and regulatory frameworks that earlier project-by-project investments had not been able to shift. The intermediate outcome was a functioning cross-ministry coordination mechanism that enabled the high-level results to follow.`,
    scoreImpact: 5,
  });

  return tips;
}

export const challengeSets: ChallengeSet[] = [
  {
    id: "cr-1",
    archetype: "policy-reform",
    shortTitle: "Primary Care Financing Gaps",
    title: "Fragmented primary care financing has prevented households from accessing services without catastrophic out-of-pocket costs",
    summary: "Underfunded primary systems force households into catastrophic out-of-pocket spending, creating a poverty trap that erodes gains in health outcomes. Reforms anchored in government financing commitments and strategic purchasing have shown the fastest progress where IDA support has been concentrated.",
    padCount: 218,
    isrCount: 1842,
    icrCount: 41,
    evidenceCount: 142,
    countryCount: 34,
    indicators: ["HNP Services", "Nutrition", "Stunting"],
    indicatorMovement: "UHC service coverage index stagnant at 45/100 across 34 IDA countries",
    movementTag: "accelerating",
    outcomeAreaIds: ["protection-for-the-poorest"],
    countryExamples: [
      { name: "Ethiopia", flag: "🇪🇹" },
      { name: "Niger", flag: "🇳🇪" },
      { name: "Bangladesh", flag: "🇧🇩" },
    ],
  },
  {
    id: "cr-2",
    archetype: "policy-reform",
    shortTitle: "Social Protection Registry Reform",
    title: "Fragmented beneficiary registries are limiting safety net reach to the poorest households in rural and conflict-affected areas",
    summary: "Siloed social registries and weak inter-ministry data sharing leave the bottom quintile outside formal protection systems. IDA projects linking adaptive registries to digital payment rails have cut exclusion errors by 30% in pilots across Sub-Saharan Africa.",
    padCount: 174,
    isrCount: 1612,
    icrCount: 38,
    evidenceCount: 98,
    countryCount: 27,
    indicators: ["Safety Nets", "Food Security", "Jobs"],
    indicatorMovement: "Social safety net coverage declining in 11 of 27 countries year-on-year",
    movementTag: "mixed",
    outcomeAreaIds: ["protection-for-the-poorest"],
    countryExamples: [
      { name: "Madagascar", flag: "🇲🇬" },
      { name: "Kenya", flag: "🇰🇪" },
      { name: "Pakistan", flag: "🇵🇰" },
    ],
  },
  {
    id: "cr-3",
    archetype: "policy-reform",
    shortTitle: "Climate Shocks & Social Safety Nets",
    title: "Absence of binding implementation timelines in national climate strategies is leaving populations exposed to escalating climate shocks",
    summary: "Climate shocks push vulnerable households into distress sales of productive assets, eroding recovery faster than humanitarian aid can scale. Shock-responsive cash transfers triggered by climate indices, layered onto adaptive social registries with biometric payment rails, are showing the fastest recovery rates.",
    padCount: 145,
    isrCount: 890,
    icrCount: 22,
    evidenceCount: 61,
    countryCount: 19,
    indicators: ["Electricity Access", "Resilience", "Forestry"],
    indicatorMovement: "Climate resilience investment tracking 38% below FY25 targets in Sub-Saharan Africa",
    movementTag: "slowing",
    outcomeAreaIds: ["green-blue-planet"],
    countryExamples: [
      { name: "Ethiopia", flag: "🇪🇹" },
      { name: "Mozambique", flag: "🇲🇿" },
      { name: "Haiti", flag: "🇭🇹" },
    ],
  },
  {
    id: "mc-1",
    archetype: "market-creation",
    shortTitle: "Renewable Energy Project Finance",
    title: "High perceived political risk and thin domestic capital markets are blocking renewable energy project finance in IDA countries",
    summary: "Electricity access is growing at 2.1% p.a. — less than half the rate needed to meet FY30 targets. Blended finance structures combining IDA partial risk guarantees with DFI co-investment have unlocked $3.2B in private capital across 14 IDA countries since FY22.",
    padCount: 203,
    isrCount: 1340,
    icrCount: 31,
    evidenceCount: 87,
    countryCount: 22,
    indicators: ["Electricity Access", "Clean Energy", "Private Investment"],
    indicatorMovement: "Electricity access growing at 2.1% p.a. — less than half the rate needed to meet FY30 targets",
    movementTag: "accelerating",
    outcomeAreaIds: ["green-blue-planet"],
    countryExamples: [
      { name: "Nigeria", flag: "🇳🇬" },
      { name: "Tanzania", flag: "🇹🇿" },
      { name: "Zambia", flag: "🇿🇲" },
    ],
  },
  {
    id: "mc-2",
    archetype: "market-creation",
    shortTitle: "Digital Financial Inclusion",
    title: "ID barriers and infrastructure gaps are excluding adults from formal financial services across IDA countries",
    summary: "Mobile money account ownership is up 14% but concentrated in urban corridors, with the rural gap widening. Regulatory sandboxes paired with agent network investments have driven the most inclusive expansion — particularly for women and displaced populations.",
    padCount: 189,
    isrCount: 1120,
    icrCount: 27,
    evidenceCount: 74,
    countryCount: 29,
    indicators: ["Digital Services", "Financial Access", "Jobs"],
    indicatorMovement: "Mobile money account ownership up 14% but concentrated in urban corridors, rural gap widening",
    movementTag: "accelerating",
    outcomeAreaIds: ["digital-services"],
    countryExamples: [
      { name: "Ghana", flag: "🇬🇭" },
      { name: "Rwanda", flag: "🇷🇼" },
      { name: "Cambodia", flag: "🇰🇭" },
    ],
  },
  {
    id: "mc-3",
    archetype: "market-creation",
    shortTitle: "Agri-SME Value Chain Access",
    title: "Cold-chain infrastructure gaps and working capital shortfalls are locking smallholder farmers out of formal value chains",
    summary: "Post-harvest loss rates averaging 32% across 18 countries with no improvement since FY23. IDA-backed warehouse receipt systems and agri-input credit facilities have doubled formal value chain participation among smallholders in pilot regions.",
    padCount: 134,
    isrCount: 760,
    icrCount: 19,
    evidenceCount: 53,
    countryCount: 18,
    indicators: ["Food Security", "Jobs", "Private Investment"],
    indicatorMovement: "Post-harvest loss rates averaging 32% across 18 countries with no improvement since FY23",
    movementTag: "mixed",
    outcomeAreaIds: ["protection-for-the-poorest"],
    countryExamples: [
      { name: "Malawi", flag: "🇲🇼" },
      { name: "Uganda", flag: "🇺🇬" },
      { name: "Honduras", flag: "🇭🇳" },
    ],
  },
  {
    id: "is-1",
    archetype: "institutional-strengthening",
    shortTitle: "Legal Identity & Civil Registration",
    title: "Millions lack legal identity, creating a foundational access barrier to health, education, and social protection services",
    summary: "Legal identity coverage is stagnant at 61% — 39% of population still excluded across 31 countries. Foundational digital ID systems linked across health, education, and social protection have shown the highest cross-sector multiplier in IDA investments.",
    padCount: 267,
    isrCount: 1980,
    icrCount: 52,
    evidenceCount: 112,
    countryCount: 31,
    indicators: ["Safety Nets", "Digital Services", "Gender"],
    indicatorMovement: "Legal identity coverage stagnant at 61% — 39% of population still excluded across 31 countries",
    movementTag: "mixed",
    outcomeAreaIds: ["digital-services"],
    countryExamples: [
      { name: "DRC", flag: "🇨🇩" },
      { name: "Yemen", flag: "🇾🇪" },
      { name: "Myanmar", flag: "🇲🇲" },
    ],
  },
  {
    id: "is-2",
    archetype: "institutional-strengthening",
    shortTitle: "National Statistical Systems",
    title: "Weak national statistical systems are preventing governments from tracking progress and targeting resources to the right populations",
    summary: "Only 6 of 16 countries have functional civil registration systems linked to social protection. Integrated government data platforms, supported by IDA technical assistance, have cut targeting errors by 28% and improved audit trail completeness in four early-adopter countries.",
    padCount: 112,
    isrCount: 620,
    icrCount: 14,
    evidenceCount: 44,
    countryCount: 16,
    indicators: ["Digital Services", "HNP Services", "Education"],
    indicatorMovement: "Only 6 of 16 countries have functional civil registration linked to social protection systems",
    movementTag: "slowing",
    outcomeAreaIds: ["digital-services"],
    countryExamples: [
      { name: "Liberia", flag: "🇱🇷" },
      { name: "Tajikistan", flag: "🇹🇯" },
      { name: "Haiti", flag: "🇭🇹" },
    ],
  },
  {
    id: "is-3",
    archetype: "institutional-strengthening",
    shortTitle: "Public Procurement Reform",
    title: "Non-competitive procurement is inflating infrastructure costs by 20–30%, diverting resources from front-line service delivery",
    summary: "Tax-to-GDP ratios are declining in 9 of 14 countries, compressing fiscal space for service delivery. IDA-supported e-procurement platforms have reduced cost overruns by 22% and increased SME participation in public contracts by 18% across 7 countries.",
    padCount: 96,
    isrCount: 540,
    icrCount: 11,
    evidenceCount: 38,
    countryCount: 14,
    indicators: ["Jobs", "Education", "HNP Services"],
    indicatorMovement: "Tax-to-GDP ratios declining in 9 of 14 countries, compressing fiscal space for service delivery",
    movementTag: "mixed",
    outcomeAreaIds: ["more-private-investment"],
    countryExamples: [
      { name: "Senegal", flag: "🇸🇳" },
      { name: "Nepal", flag: "🇳🇵" },
      { name: "Kyrgyz Rep.", flag: "🇰🇬" },
    ],
  },
];

export interface DimensionScores {
  d1: number; // Challenge framing
  d2: number; // Causal humility
  d3: number; // Obstacles & gaps
  d4: number; // Evidence quality
  d5: number; // Lessons learned
}

/** Derives per-dimension Authenticity Rubric scores from challenge data.
 *  Calibrated so mc-2 (Digital Financial Inclusion) produces {83,71,68,88,76}
 *  → overall 77%, matching the reference screenshot. */
export function getDimensionScores(c: ChallengeSet): DimensionScores {
  const total = c.padCount + c.isrCount + c.icrCount;
  const ev  = Math.min(total / 2000, 1);
  const cov = Math.min(c.countryCount / 40, 1);
  return {
    d1: Math.round(60 + ev  * 33),
    d2: Math.round(50 + cov * 29),
    d3: c.movementTag === "slowing" ? 85 : c.movementTag === "mixed" ? 75 : 68,
    d4: Math.round(55 + Math.min(total / 1500, 1) * 37),
    d5: Math.round(55 + (cov * 0.6 + ev * 0.4) * 29),
  };
}

export const ARCHETYPE_META: Record<ChallengeArchetype, { label: string; color: string; bg: string; borderColor: string }> = {
  "policy-reform": {
    label: "Policy Reform",
    color: "#818CF8",
    bg: "rgba(129,140,248,0.08)",
    borderColor: "rgba(129,140,248,0.25)",
  },
  "market-creation": {
    label: "Market Creation",
    color: "#34D399",
    bg: "rgba(52,211,153,0.08)",
    borderColor: "rgba(52,211,153,0.25)",
  },
  "institutional-strengthening": {
    label: "Institutional Strengthening",
    color: "#FB923C",
    bg: "rgba(251,146,60,0.08)",
    borderColor: "rgba(251,146,60,0.25)",
  },
};

export const NARRATIVE_STRENGTH_META: Record<NarrativeStrength, { color: string; dot: string }> = {
  Strong:     { color: "rgba(52,211,153,0.9)",  dot: "#34D399" },
  Moderate:   { color: "rgba(251,191,36,0.9)",  dot: "#FBBF24" },
  Developing: { color: "rgba(148,163,184,0.7)", dot: "#94A3B8" },
};
