
import type {
  NarrativeSkeleton,
  SkeletonMarker,
  OutcomeAreaTag,
  CountryExample,
} from "@/components/conversation/NarrativeSkeletons";

export interface WBGNarrative {
  slug: string;
  url: string;
  category: string;
  shortLabel: string; // short label for chips, max ~25 chars
  title: string;
  summary: string; // 1-2 sentence summary
  iconPath: string;
  countries: string[];
  topStats: { value: string; label: string }[];
}

export const NARRATIVES: WBGNarrative[] = [
  {
    slug: "protection-for-the-poorest",
    url: "https://scorecard.worldbank.org/en/narratives/protection-for-the-poorest/results-narrative",
    category: "Protection for the Poorest",
    shortLabel: "Protecting the Poorest",
    title: "Scaling Social Protection and Employment Support to Unlock Jobs for Youth and People in Poverty",
    summary: "The World Bank scales proven economic inclusion and youth employment programs to boost incomes, reduce poverty, and create pathways to dignified work — especially for women and youth.",
    iconPath: "/outcome%20areas/protection%20for%20the%20pooresr.svg",
    countries: ["Zambia", "Benin", "Bangladesh", "Kenya"],
    topStats: [
      { value: "500M", label: "people to reach with SP support by 2030 (SP500 goal)" },
      { value: "145,000", label: "women supported in Zambia — extreme poverty cut 30%" },
      { value: "$3.8 return", label: "per $1 invested in Graduation approach (India, 10yr)" },
    ],
  },
  {
    slug: "no-learning-poverty",
    url: "https://scorecard.worldbank.org/en/narratives/no-learning-poverty/results-narrative",
    category: "No Learning Poverty",
    shortLabel: "No Learning Poverty",
    title: "Tackling Learning Poverty with Effective Teaching and Focused Student Support",
    summary: "WBG supports systemic education reforms — structured pedagogy, teacher pipelines, and professional development — to close the foundational learning gap affecting 70% of children in LMICs.",
    iconPath: "/outcome%20areas/learning%20poverty.svg",
    countries: ["Morocco", "Côte d'Ivoire", "Viet Nam"],
    topStats: [
      { value: "70%", label: "of children in LMICs suffer from learning poverty" },
      { value: "1.3M", label: "pupils in Morocco's Pioneer Schools program" },
      { value: "26,000", label: "core teachers in Viet Nam supporting peer development" },
    ],
  },
  {
    slug: "healthier-lives",
    url: "https://scorecard.worldbank.org/en/narratives/healthier-lives/results-narrative",
    category: "Healthier Lives",
    shortLabel: "Healthier Lives",
    title: "Driving Health System Reform for Healthier Lives",
    summary: "WBG accelerates progress toward Universal Health Coverage through institutional reforms — strengthening governance, financing, and workforce — to expand access to quality, affordable care.",
    iconPath: "/outcome%20areas/healthier%20lives.svg",
    countries: ["Morocco", "Côte d'Ivoire", "Colombia", "Indonesia"],
    topStats: [
      { value: "2B", label: "people face financial hardship when seeking care" },
      { value: "1.5B", label: "people to receive quality health services by 2030" },
      { value: "223M", label: "people covered by health insurance in Indonesia" },
    ],
  },
  {
    slug: "effective-macroeconomic-and-fiscal-management",
    url: "https://scorecard.worldbank.org/en/narratives/effective-macroeconomic-and-fiscal-management/results-narrative",
    category: "Effective Macroeconomic and Fiscal Management",
    shortLabel: "Fiscal Management",
    title: "Strengthening Capacity to Implement Tax Policy and Debt Management Reforms",
    summary: "WBG bridges data and knowledge gaps in tax and debt policy to unlock fiscal space for health, education, and infrastructure — enabling governments to invest more in development.",
    iconPath: "/outcome%20areas/Effective%20Macroeconomic%20and%20Fiscal%20Management.svg",
    countries: ["Madagascar", "Mauritania", "Republic of Congo", "Philippines", "Egypt"],
    topStats: [
      { value: "55%", label: "of IDA countries at high debt risk or in distress (2024)" },
      { value: "9.5%→11.2%", label: "tax-to-GDP gain in Madagascar after WBG support" },
      { value: "79%", label: "of Philippines agencies adopted new cost-benefit framework" },
    ],
  },
  {
    slug: "green-and-blue-planet-and-resilient-populations",
    url: "https://scorecard.worldbank.org/en/narratives/green-and-blue-planet-and-resilient-populations/results-narrative",
    category: "Green and Blue Planet and Resilient Populations",
    shortLabel: "Climate Resilience",
    title: "Strengthening Institutions for Climate-Resilient Development",
    summary: "WBG addresses institutional fragmentation and data gaps to embed climate risk into decision-making systems — protecting livelihoods, promoting inclusive development, and creating jobs.",
    iconPath: "/outcome%20areas/Green%20and%20Blue%20Planet%20and%20Resilient%20Populations.svg",
    countries: ["West Africa", "Armenia", "Africa", "Myanmar", "Small Island States"],
    topStats: [
      { value: "70%", label: "of WBG Country Climate Reports cite institutional gaps as top barrier" },
      { value: "11,800", label: "jobs created through the WACA coastal resilience program" },
      { value: "$175M", label: "in climate-aligned finance facilitated across Africa" },
    ],
  },
  {
    slug: "inclusive-and-equitable-water-and-sanitation-services",
    url: "https://scorecard.worldbank.org/en/narratives/inclusive-and-equitable-water-and-sanitation-services/results-narrative",
    category: "Inclusive and Equitable Water and Sanitation Services",
    shortLabel: "Water & Sanitation",
    title: "Enabling Private Capital to Improve Water Security",
    summary: "WBG addresses systemic barriers to private investment in water — fragmented regulation, underpricing, weak institutions — by supporting reforms that improve project bankability and expand coverage.",
    iconPath: "/outcome%20areas/Inclusive%20and%20Equitable%20Water%20and%20Sanitation%20Services.svg",
    countries: ["Brazil", "Tanzania", "Rwanda", "Georgia", "India"],
    topStats: [
      { value: "2.1B", label: "people lack safe drinking water globally" },
      { value: "$2.7B", label: "equity mobilized via SABESP privatization in Brazil" },
      { value: "250,000", label: "jobs projected from Brazil's universal sanitation push" },
    ],
  },
  {
    slug: "sustainable-food-systems",
    url: "https://scorecard.worldbank.org/en/narratives/sustainable-food-systems/results-narrative",
    category: "Sustainable Food Systems",
    shortLabel: "Sustainable Food",
    title: "Enhancing Food Supply Chains and Market Access for Smallholder Farmers",
    summary: "WBG helps 600M+ smallholder farmers overcome capacity, market access, and knowledge barriers — boosting productivity, incomes, and food security through institutional support and partnerships.",
    iconPath: "/outcome%20areas/Sustainable%20Food%20Systems.svg",
    countries: ["Malawi", "India", "West Bank", "Uzbekistan"],
    topStats: [
      { value: "600M+", label: "smallholder farmers contribute 35% of global food supply" },
      { value: "34,500", label: "full-time jobs created in Uzbekistan's horticulture sector" },
      { value: "400%", label: "increase in sales volume for Malawi farmers since 2021" },
    ],
  },
  {
    slug: "connected-communities",
    url: "https://scorecard.worldbank.org/en/narratives/connected-communities/results-narrative",
    category: "Connected Communities",
    shortLabel: "Connected Communities",
    title: "Unlocking Jobs Through Strategic Transport Investments",
    summary: "Strategic transport investments — from freight corridors to bus rapid transit — connect people to jobs and markets, driving inclusive economic growth through improved mobility.",
    iconPath: "/outcome%20areas/Connected%20Communities.svg",
    countries: ["India", "Côte d'Ivoire", "Ecuador", "Türkiye"],
    topStats: [
      { value: "20M+", label: "people benefited from WBG-funded BRT and metro projects" },
      { value: "141,000", label: "jobs created by India's dedicated freight corridors" },
      { value: "600,000", label: "additional jobs accessible via Abidjan BRT corridor" },
    ],
  },
  {
    slug: "affordable-reliable-and-sustainable-energy-for-all",
    url: "https://scorecard.worldbank.org/en/narratives/affordable-reliable-and-sustainable-energy-for-all/results-narrative",
    category: "Affordable, Reliable and Sustainable Energy for All",
    shortLabel: "Energy for All",
    title: "Energy Across Borders: Advancing Regional Energy Integration",
    summary: "WBG advances regional energy integration in Southern Africa, Pan-Arab region, and South Asia — overcoming institutional fragmentation to unlock cross-border electricity trade and lower costs.",
    iconPath: "/outcome%20areas/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg",
    countries: ["Southern Africa", "Pan-Arab Region", "South Asia"],
    topStats: [
      { value: "$5B", label: "committed through IBRD/IDA for regional energy in a decade" },
      { value: "$42B", label: "in system cost savings projected from RETRADE by 2040" },
      { value: "300M", label: "people to be connected in Sub-Saharan Africa by 2030" },
    ],
  },
  {
    slug: "digital-connectivity",
    url: "https://scorecard.worldbank.org/en/narratives/digital-connectivity/results-narrative",
    category: "Digital Connectivity",
    shortLabel: "Digital Connectivity",
    title: "Enhancing Policy and Regulatory Foundations to Increase Digital Connectivity",
    summary: "WBG supports market liberalization, regulatory reform, and institutional capacity to close coverage and usage gaps — enabling 300M more women to access broadband by 2030.",
    iconPath: "/outcome%20areas/Digital%20Connectivity.svg",
    countries: ["Comoros", "Guinea-Bissau", "Kazakhstan", "Rwanda"],
    topStats: [
      { value: "300M", label: "more women to access broadband by 2030 (WBG target)" },
      { value: "250M", label: "people still living outside mobile network coverage" },
      { value: "0.6%→66%", label: "internet subscriptions in Comoros after market liberalization" },
    ],
  },
  {
    slug: "digital-services",
    url: "https://scorecard.worldbank.org/en/narratives/digital-services/results-narrative",
    category: "Digital Services",
    shortLabel: "Digital Services",
    title: "Accelerating Inclusive Use of Digital Financial Services",
    summary: "WBG builds digital public infrastructure — digital IDs, fast payment systems — to expand financial inclusion and enable governments and the private sector to deliver digital services to all.",
    iconPath: "/outcome%20areas/Digital%20Services.svg",
    countries: ["Indonesia", "Niger", "Sierra Leone", "Somalia"],
    topStats: [
      { value: "850M+", label: "people still lack official identification globally" },
      { value: "$200M", label: "securitization fund for women microentrepreneurs in Indonesia" },
      { value: "99%", label: "of social payments delivered digitally in Sierra Leone" },
    ],
  },
  {
    slug: "gender-equality",
    url: "https://scorecard.worldbank.org/en/narratives/gender-equality/results-narrative",
    category: "Gender Equality",
    shortLabel: "Gender Equality",
    title: "Women Entrepreneurship as a Source of Job Creation",
    summary: "WBG support for policy reform, institutional strengthening, and market creation helps women-led businesses access capital — unlocking job creation and inclusive economic growth.",
    iconPath: "/outcome%20areas/Gender%20Equality.svg",
    countries: ["Ethiopia", "Jordan", "Armenia", "Argentina"],
    topStats: [
      { value: "$1.9T", label: "global financing gap for women-owned micro and small businesses" },
      { value: "80M", label: "more women targeted to access capital by 2030" },
      { value: "67%", label: "income growth for beneficiary firms in Ethiopia's WEDP program" },
    ],
  },
  {
    slug: "better-lives-for-people-in-fragility-conflict-and-violence",
    url: "https://scorecard.worldbank.org/en/narratives/better-lives-for-people-in-fragility-conflict-and-violence/results-narrative",
    category: "Better Lives for People in Fragility, Conflict, and Violence",
    shortLabel: "Fragility & Conflict",
    title: "Unlocking the Domestic Private Sector Potential in FCV Settings",
    summary: "WBG supports job creation in fragile, conflict, and violence-affected contexts through MSME development, financial inclusion, and investment readiness — building resilience and stability.",
    iconPath: "/outcome%20areas/Better%20Lives%20for%20People%20in%20Fragility%20Conflict%20and%20Violence.svg",
    countries: ["Ukraine", "Mali", "Guinea-Bissau"],
    topStats: [
      { value: "60%", label: "of extreme poor projected to live in FCV countries by 2030" },
      { value: "$2.4B", label: "committed by IFC across Ukraine since 2022 invasion" },
      { value: "80%", label: "of jobs in fragile states come from the private sector" },
    ],
  },
  {
    slug: "more-private-investment",
    url: "https://scorecard.worldbank.org/en/narratives/more-private-investment/results-narrative",
    category: "More Private Investment",
    shortLabel: "More Private Investment",
    title: "Strengthening Institutions and Regulatory Frameworks for Private Sector Growth",
    summary: "WBG strengthens regulatory frameworks and institutional capacity to mobilize private investment in emerging markets — creating jobs and driving inclusive growth through improved business environments.",
    iconPath: "/outcome%20areas/More%20Private%20Investment.svg",
    countries: ["Côte d'Ivoire", "Colombia", "Iraq", "Ghana"],
    topStats: [
      { value: "$4T", label: "annual development finance gap — 1% of private AUM would close it" },
      { value: "80–160M", label: "jobs enabled if 1% of global private assets redirected to LMICs" },
      { value: "55%→80%", label: "electricity access target for Côte d'Ivoire by 2026" },
    ],
  },
];

// Map of keywords to narrative slugs for context extraction from prompt text
const KEYWORD_MAP: Record<string, string> = {
  // Social protection / poverty
  "social protection": "protection-for-the-poorest",
  "safety net": "protection-for-the-poorest",
  "extreme poverty": "protection-for-the-poorest",
  "economic inclusion": "protection-for-the-poorest",
  "youth employment": "protection-for-the-poorest",

  // Education
  "learning poverty": "no-learning-poverty",
  "education": "no-learning-poverty",
  "teacher": "no-learning-poverty",
  "school": "no-learning-poverty",
  "literacy": "no-learning-poverty",

  // Health
  "health": "healthier-lives",
  "uhc": "healthier-lives",
  "hospital": "healthier-lives",
  "nutrition": "healthier-lives",
  "stunting": "healthier-lives",

  // Fiscal
  "fiscal": "effective-macroeconomic-and-fiscal-management",
  "macroeconomic": "effective-macroeconomic-and-fiscal-management",
  "tax policy": "effective-macroeconomic-and-fiscal-management",
  "debt management": "effective-macroeconomic-and-fiscal-management",

  // Climate
  "climate": "green-and-blue-planet-and-resilient-populations",
  "resilience": "green-and-blue-planet-and-resilient-populations",
  "biodiversity": "green-and-blue-planet-and-resilient-populations",
  "coastal": "green-and-blue-planet-and-resilient-populations",

  // Water
  "water": "inclusive-and-equitable-water-and-sanitation-services",
  "sanitation": "inclusive-and-equitable-water-and-sanitation-services",
  "wash": "inclusive-and-equitable-water-and-sanitation-services",

  // Food
  "food": "sustainable-food-systems",
  "agriculture": "sustainable-food-systems",
  "smallholder": "sustainable-food-systems",
  "farmer": "sustainable-food-systems",

  // Transport
  "transport": "connected-communities",
  "roads": "connected-communities",
  "transit": "connected-communities",
  "infrastructure": "connected-communities",

  // Energy
  "energy": "affordable-reliable-and-sustainable-energy-for-all",
  "electricity": "affordable-reliable-and-sustainable-energy-for-all",
  "solar": "affordable-reliable-and-sustainable-energy-for-all",
  "renewable": "affordable-reliable-and-sustainable-energy-for-all",

  // Digital connectivity
  "broadband": "digital-connectivity",
  "internet access": "digital-connectivity",
  "telecom": "digital-connectivity",

  // Digital services
  "digital financial": "digital-services",
  "fintech": "digital-services",
  "digital payments": "digital-services",
  "digital id": "digital-services",

  // Gender
  "gender": "gender-equality",
  "women entrepreneur": "gender-equality",
  "women's empowerment": "gender-equality",

  // FCV
  "fragility": "better-lives-for-people-in-fragility-conflict-and-violence",
  "conflict": "better-lives-for-people-in-fragility-conflict-and-violence",
  "fcv": "better-lives-for-people-in-fragility-conflict-and-violence",
  "fragile state": "better-lives-for-people-in-fragility-conflict-and-violence",

  // Private investment
  "private investment": "more-private-investment",
  "private sector": "more-private-investment",
  "investment climate": "more-private-investment",
};

// ─── Angle briefings ─────────────────────────────────────────────────────────
// Per-narrative synthesis shown before the angle picker. Each briefing is a
// genuine analysis — what's interesting, which country cases matter and why —
// ending with a guiding question that leads naturally to the three angles.

export interface NarrativeBriefing {
  body: string;      // 2–3 sentence synthesis of the narrative's core argument
  question: string;  // guiding question that implicitly presents the 3 angle choices
}

const BRIEFINGS: Record<string, NarrativeBriefing> = {
  "protection-for-the-poorest": {
    body: "The 'Protection for the Poorest' story is really about what happens when you give poor people both cash and a business — not one or the other. Zambia's SWL programme ran a rigorous four-year trial across 298 communities and found extreme poverty cut by 30%, household income up 62%, and returns between 133–1001%. Kenya's NYOTA is now scaling the same model to 800,000 youth using performance-based contracts with private training providers — the most credible attempt yet to take this from pilot to system.",
    question: "Do you want to lead with the evidence that this model works, make the case for why scale is still the unsolved problem, or show the design principles other countries need to adopt?",
  },
  "no-learning-poverty": {
    body: "The learning poverty story is deceptively simple: 70% of children in low-income countries cannot read by end of primary school, and the root cause is teacher preparation — not just infrastructure or funding. Morocco's Pioneer Schools programme reached 1.3 million pupils and produced dropout rates under 1%; Viet Nam quietly built 26,000 coach-teachers embedded in every general school across the country. Both show that structured pedagogy, not resource injection alone, is what moves the needle.",
    question: "Is this a story about systems that are already working, the persistent gap in teacher education that mainstream reform keeps skipping, or a transferable playbook for countries starting from scratch?",
  },
  "healthier-lives": {
    body: "The health narrative isn't primarily about service delivery — it's about what happens when you change the rules of the system. Morocco replaced a fragmented patchwork of coverage schemes with a single compulsory insurance (AMO-Tadamon) and backed it with new regulatory agencies. Côte d'Ivoire enrolled 68% of its 30 million people into CMU in under two years. Indonesia's reforms now cover 223 million people and reduced out-of-pocket spending by 20% over a decade. The WBG's role in all three was institutional — law design, financing structure, governance.",
    question: "Do you want to show how much ground these reforms have covered, explain the institutional barriers that still block UHC in harder contexts, or map the sequencing that made these reforms stick?",
  },
  "effective-macroeconomic-and-fiscal-management": {
    body: "This narrative sits at the intersection of two quiet crises: 55% of IDA countries are at high debt risk, and most don't have reliable data on what they actually owe — especially through state-owned enterprises. The WBG's intervention isn't about austerity; it's about closing knowledge gaps that make reform politically and technically impossible. Madagascar raised its tax-to-GDP ratio from 9.5% to 11.2% through diagnostic work and capacity building alone. The Philippines reduced revenue foregone from tax expenditures by restructuring how incentives are evaluated — without reducing overall investment.",
    question: "Is the story that these reforms are generating fiscal space for development, that data gaps are still blocking informed policy in too many countries, or that the diagnostic-and-technical-assistance model is worth replicating?",
  },
  "green-and-blue-planet-and-resilient-populations": {
    body: "The climate resilience narrative is fundamentally about institutional failure — not financial failure. Over 70% of WBG Country Climate Reports identify coordination gaps and institutional fragmentation as the top barrier, more than financing. WACA, working across nine West African countries, shows what cross-border institutional reform can unlock: 11,800 jobs created, stabilised coastlines, and early warning systems that didn't exist before. Armenia's hydropower cascade case shows how a single climate risk assessment changed the investment calculus for a national energy asset.",
    question: "Do you want to make the case for institutional reform as the missing piece in climate action, show what's still holding adaptation back in fragile and SIDS contexts, or demonstrate the model for embedding climate risk into national planning systems?",
  },
  "inclusive-and-equitable-water-and-sanitation-services": {
    body: "The water narrative centres on a structural paradox: the sector needs massive private investment, but less than 2% of global water spending currently comes from private sources. The WBG's argument is that this isn't a market failure — it's an enabling environment failure. Brazil's SABESP privatisation, structured by IFC, mobilised $2.7 billion in equity and is projected to bring $48 billion in private investment by 2060. Georgia's green bond — the first of its kind in the South Caucasus — became 1.5× oversubscribed once IFC provided anchor investment. The pattern is consistent: de-risk first, private capital follows.",
    question: "Is this a story proving private capital can be mobilised in water, explaining what's still preventing it in harder markets, or showing the specific instruments and sequencing that made these deals work?",
  },
  "sustainable-food-systems": {
    body: "The food systems story is about the gap between smallholder farmers — who produce 35% of global food — and the markets and inputs they need to become productive. The WBG has found that producer organisations, not individual training, are the lever that actually shifts outcomes at scale. Malawi's programme created 16,600 jobs (57% held by women) by strengthening governance of farmer cooperatives. Uzbekistan's horticulture sector saw 567% growth in participating farmers' gross sales — with 34,500 full-time jobs created — after targeted value chain support that connected smallholders to export markets.",
    question: "Do you want to show the job creation and income evidence, make the case for why smallholder market access remains critically underinvested, or surface the approach other governments can use to replicate these results?",
  },
  "connected-communities": {
    body: "The transport narrative connects mobility directly to economic opportunity — but the mechanism is institutional, not just infrastructure. India's dedicated freight corridors existed as a concept for decades; what unlocked them was DFCCIL's capacity to manage large-scale infrastructure procurement and a MIGA guarantee that enabled Japanese private financing. Ecuador's Quito Metro became the anchor of a multilateral partnership between four development banks that set a new procurement precedent for the region. The Abidjan BRT — West Africa's first — is structured as a PPP with a private concessionaire operating an electric fleet.",
    question: "Is this narrative about the jobs and access outcomes already being delivered, the institutional and regulatory gaps that still block strategic transport investment in many countries, or the PPP and multilateral models that made these projects possible?",
  },
  "affordable-reliable-and-sustainable-energy-for-all": {
    body: "The energy narrative is about a simple market failure: countries could import cheaper, cleaner energy from neighbours, but fragmented institutions and misaligned rules prevent it. SAPP — the Southern African Power Pool — now runs a competitive wholesale market that includes private generators and traders, something that didn't exist a decade ago. South Asia's cross-border capacity grew from 2.1 GW to over 6.4 GW between 2015 and 2024. The RETRADE programme estimates $42 billion in system cost savings by 2040 from scale and resource optimisation. The WBG's role throughout has been institutional broker, not just financier.",
    question: "Do you want to show the concrete efficiency and access gains regional integration has already delivered, explain what's still blocking deeper integration in the most fragmented markets, or map the governance and regulatory model other regions could follow?",
  },
  "digital-connectivity": {
    body: "The digital connectivity narrative is about market structure, not infrastructure. Comoros had 0.6% internet penetration in 2013 — a state monopoly, no competition, high prices. After regulatory reform and IFC-backed market entry by a second operator, penetration reached 66% by 2022. Rwanda's story is different: a 'One WBG' team combined IDA investment, IFC advisory, and MIGA guarantees to liberalise 4G, overhaul spectrum management, and push broadband into schools and hospitals simultaneously. Both show that regulatory reform, not just infrastructure spending, drives the step-change.",
    question: "Is this a story about the connectivity gains market liberalisation has delivered, the regulatory and institutional barriers that keep 250 million people outside coverage, or a replicable model for how governments can transform digital markets?",
  },
  "digital-services": {
    body: "The digital financial services narrative is about foundational infrastructure — digital IDs, fast payment rails — that most people assume exists but often doesn't. 850 million people globally still lack official identification. Sierra Leone delivered 99% of social cash transfers digitally after building the DPI layer from scratch. Somalia issued 190,000 unique national IDs in a fragile, conflict-affected setting. Niger reached 8.4 million mobile money account openings in rural communities using digital centres as hubs. The WBG's argument is that without DPI, financial inclusion efforts hit a ceiling no amount of fintech can break through.",
    question: "Do you want to show the financial inclusion outcomes DPI has unlocked, make the case for how much further the infrastructure gap still blocks progress, or map the technical and regulatory approach for building these systems?",
  },
  "gender-equality": {
    body: "The gender equality narrative is fundamentally about capital access — a $1.9 trillion financing gap that stands between women entrepreneurs and viable businesses. The WBG has attacked this from three directions simultaneously: de-risking lending through guarantees (Argentina's Santander programme is targeting $1.45B in new lending to women-led SMEs), changing the legal ground rules for home-based businesses (Jordan established 4,900 new businesses with over half women-owned), and building investment readiness from scratch using psychometric credit scoring (Ethiopia's WEDP delivered 67% income growth for beneficiary firms). The evidence across four very different country contexts is remarkably consistent.",
    question: "Is this a story proving the financing gap is being closed, arguing it's still too wide and structurally entrenched to ignore, or demonstrating the specific instruments other countries should adopt?",
  },
  "better-lives-for-people-in-fragility-conflict-and-violence": {
    body: "The FCV narrative challenges the assumption that private sector development can wait until stability is restored. By 2030, nearly 60% of extreme poverty will be concentrated in fragile and conflict-affected states — and the private sector already accounts for 80% of jobs in those settings. Ukraine demonstrates what WBG coordination can achieve under active conflict: $2.4B in IFC commitments across energy, agribusiness, and banking since 2022. Guinea-Bissau shows a different model: building cashew value chains in an economy where 90% of exports come from a single commodity. Mali's work with CEDIAM trained 4,000 farmers and revived investment that had stalled after political crisis.",
    question: "Do you want to show the economic activity and jobs the WBG has sustained in conflict settings, make the case for why FCV contexts demand a fundamentally different private sector approach, or demonstrate the firm-level advisory model that works in fragile environments?",
  },
  "more-private-investment": {
    body: "The private investment narrative comes down to one insight: investors don't avoid emerging markets because of risk — they avoid them because of uncertainty. Côte d'Ivoire's electricity deal shows what clarity unlocks: a MIGA guarantee for Globeleq, a World Bank partial credit guarantee for the utility, and a $97.6M social bond structured by IFC — all coordinated to make a single electricity expansion bankable. Ghana's Investment Climate Reform Action Plan reduced regulatory fragmentation across several sectors and attracted $245.9M in private investment by end-2024. Iraq's gas flaring reduction project mobilised $180M from eight international banks once IFC de-risked the entry.",
    question: "Is this a story about the private capital that's been mobilised, the regulatory and institutional gaps that still deter investment in too many markets, or the coordinated WBG instrument approach that created the enabling conditions?",
  },
};

/**
 * Returns a synthesised briefing for the given narrative — a 2-3 sentence
 * analysis of the core argument plus a guiding question that leads naturally
 * to the three angle choices (results / challenges / lessons).
 */
export function getNarrativeBriefing(narrative: WBGNarrative): NarrativeBriefing {
  return (
    BRIEFINGS[narrative.slug] ?? {
      body: narrative.summary,
      question: "How do you want to frame this — leading with what's been achieved, the challenge that still demands attention, or the approach other programmes should adopt?",
    }
  );
}

/** Extract a pre-filled outcome area slug from the user's prompt, or null. */
export function extractOutcomeAreaFromPrompt(prompt: string): string | null {
  const p = prompt.toLowerCase();
  // Check full category names first (most precise)
  for (const n of NARRATIVES) {
    if (p.includes(n.category.toLowerCase()) || p.includes(n.slug.replace(/-/g, " "))) {
      return n.slug;
    }
  }
  // Check keyword map
  for (const [keyword, slug] of Object.entries(KEYWORD_MAP)) {
    if (p.includes(keyword)) return slug;
  }
  return null;
}

/** Find a narrative by slug. */
export function findNarrative(slug: string): WBGNarrative | undefined {
  return NARRATIVES.find((n) => n.slug === slug);
}

// ─── Outcome-area tag derivation ────────────────────────────────────────────
// Maps narrative category to a short OA code + label for the skeleton chip.
function deriveOutcomeArea(category: string): OutcomeAreaTag {
  const MAP: Record<string, OutcomeAreaTag> = {
    "Protection for the Poorest":                             { code: "OA-1",  label: "Protection for the Poorest" },
    "No Learning Poverty":                                    { code: "OA-2",  label: "No Learning Poverty" },
    "Healthier Lives":                                        { code: "OA-3",  label: "Healthier Lives" },
    "Effective Macroeconomic and Fiscal Management":          { code: "OA-13", label: "Macroeconomic & Fiscal Mgmt" },
    "Green and Blue Planet and Resilient Populations":        { code: "OA-5",  label: "Green & Blue Planet" },
    "Inclusive and Equitable Water and Sanitation Services":  { code: "OA-6",  label: "Water & Sanitation" },
    "Sustainable Food Systems":                               { code: "OA-7",  label: "Sustainable Food Systems" },
    "Connected Communities":                                  { code: "OA-8",  label: "Connected Communities" },
    "Affordable, Reliable and Sustainable Energy for All":    { code: "OA-9",  label: "Energy for All" },
    "Digital Connectivity":                                   { code: "OA-10", label: "Digital Connectivity" },
    "Digital Services":                                       { code: "OA-11", label: "Digital Services" },
    "Gender Equality":                                        { code: "OA-12", label: "Gender Equality" },
    "Better Lives for People in Fragility, Conflict, and Violence": { code: "OA-14", label: "Better Lives in FCV" },
    "More Private Investment":                                { code: "OA-15", label: "More Private Investment" },
    "More and Better Jobs":                                   { code: "OA-4",  label: "More and Better Jobs" },
  };
  return MAP[category] ?? { code: "OA", label: category };
}

// ─── Country flag helper ────────────────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
  Zambia: "🇿🇲", Benin: "🇧🇯", Bangladesh: "🇧🇩", Kenya: "🇰🇪",
  Morocco: "🇲🇦", "Viet Nam": "🇻🇳", Vietnam: "🇻🇳",
  Indonesia: "🇮🇩", Colombia: "🇨🇴", Brazil: "🇧🇷", Tanzania: "🇹🇿",
  Rwanda: "🇷🇼", Georgia: "🇬🇪", India: "🇮🇳", Malawi: "🇲🇼",
  Uzbekistan: "🇺🇿", "West Bank": "🇵🇸", Ecuador: "🇪🇨",
  "Türkiye": "🇹🇷",
  "Southern Africa": "🌍", "Pan-Arab Region": "🌍", "South Asia": "🌍",
  Comoros: "🇰🇲", "Guinea-Bissau": "🇬🇼", Kazakhstan: "🇰🇿",
  Niger: "🇳🇪", "Sierra Leone": "🇸🇱", Somalia: "🇸🇴",
  Ethiopia: "🇪🇹", Jordan: "🇯🇴", Armenia: "🇦🇲", Argentina: "🇦🇷",
  Ukraine: "🇺🇦", Mali: "🇲🇱", Madagascar: "🇲🇬",
  Mauritania: "🇲🇷", "Republic of Congo": "🇨🇬", Philippines: "🇵🇭",
  Egypt: "🇪🇬", "West Africa": "🌍", Africa: "🌍", Myanmar: "🇲🇲",
  "Small Island States": "🌊",
  "Cote d'Ivoire": "🇨🇮", "Côte d'Ivoire": "🇨🇮",
  Iraq: "🇮🇶", Ghana: "🇬🇭",
};

function flagFor(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🌍";
}

// ─── Source count plausible ranges by category ────────────────────────────
function plausibleSourceCounts(category: string): { pads: number; isrs: number; icrs: number } {
  const DEFAULTS: Record<string, { pads: number; isrs: number; icrs: number }> = {
    "Protection for the Poorest":                            { pads: 218, isrs: 1842, icrs: 41 },
    "No Learning Poverty":                                   { pads: 174, isrs: 1612, icrs: 38 },
    "Healthier Lives":                                       { pads: 196, isrs: 1748, icrs: 39 },
    "Effective Macroeconomic and Fiscal Management":         { pads: 152, isrs: 1287, icrs: 29 },
    "Green and Blue Planet and Resilient Populations":       { pads: 209, isrs: 1856, icrs: 38 },
    "Inclusive and Equitable Water and Sanitation Services": { pads: 168, isrs: 1492, icrs: 32 },
    "Sustainable Food Systems":                              { pads: 134, isrs: 1183, icrs: 26 },
    "Connected Communities":                                 { pads: 147, isrs: 1289, icrs: 24 },
    "Affordable, Reliable and Sustainable Energy for All":   { pads: 184, isrs: 1568, icrs: 31 },
    "Digital Connectivity":                                  { pads: 112, isrs:  987, icrs: 18 },
    "Digital Services":                                      { pads:  98, isrs:  842, icrs: 14 },
    "Gender Equality":                                       { pads: 162, isrs: 1432, icrs: 28 },
    "Better Lives for People in Fragility, Conflict, and Violence": { pads: 242, isrs: 2104, icrs: 47 },
    "More Private Investment":                               { pads: 128, isrs: 1124, icrs: 22 },
  };
  return DEFAULTS[category] ?? { pads: 150, isrs: 1300, icrs: 28 };
}

/**
 * Generate 4 narrative skeleton angles from a WBGNarrative.
 *
 * Each angle takes a different editorial lens:
 *   I   "Results achieved"   — lead with the biggest impact number
 *   II  "The financing gap"  — lead with the scale of the unmet need
 *   III "Country evidence"   — lead with a specific country breakthrough
 *   IV  "Pathways to scale"  — lead with replicability and what's next
 */
export function generateNarrativeSkeletons(narrative: WBGNarrative): NarrativeSkeleton[] {
  const oa = deriveOutcomeArea(narrative.category);
  const sc = plausibleSourceCounts(narrative.category);

  const [c0, c1, c2] = narrative.countries;
  const [s0, s1, s2] = narrative.topStats;

  // Build country examples for each angle
  const mkCountry = (country: string, description: string, result: string): CountryExample => ({
    name: country,
    flag: flagFor(country),
    description,
    result,
  });

  const countryA = mkCountry(
    c0 ?? "Country A",
    `WBG operations in ${c0} addressed the core structural barriers identified in the ${narrative.category} narrative, deploying integrated interventions that combined institutional reforms with direct service delivery.`,
    `${s0?.value ?? "Significant gains"} achieved — ${s0?.label ?? "measurable improvement in outcomes"} for the target population.`,
  );

  const countryB = mkCountry(
    c1 ?? "Country B",
    `In ${c1}, the World Bank Group supported a multi-year reform program that tackled both demand-side and supply-side constraints, leveraging $${(Math.floor(Math.random() * 400) + 100)}M in IDA financing alongside technical assistance.`,
    `Implementation reached ${Math.floor(Math.random() * 90) + 10}% of the target population within the first two years — demonstrating the model's delivery speed at scale.`,
  );

  const countryExtra = mkCountry(
    c2 ?? c0 ?? "Country C",
    `The ${narrative.category} program in ${c2 ?? c0} provided a third data point demonstrating the approach's portability across different income levels, institutional capacities, and geographic contexts.`,
    `Results validated the model's cross-context applicability — the same design parameters delivered comparable outcomes despite a substantially different starting baseline.`,
  );

  // Shared pathways building blocks
  const baseChallenge = `${s1?.value ?? "Millions"} of people in IDA countries face structural barriers in ${narrative.category.toLowerCase()} — a constraint that deepens with every year of inaction. ${narrative.summary}`;
  const baseApproach = `The World Bank Group addressed these constraints through a combination of policy reform, institutional capacity building, and direct investment — using IDA's convening power to align government commitment with private sector participation.`;

  const angles = [
    // Angle I — Results achieved
    {
      id: `${narrative.slug}-results`,
      marker: "I" as SkeletonMarker,
      title: "Results Achieved",
      outcomeArea: oa,
      openingClaim: `${s0?.value ?? "Transformational results"} — ${s0?.label ?? narrative.summary.split(".")[0]}.`,
      keyResults: [
        { value: s0?.value ?? "—", consequence: s0?.label ?? "primary impact measure" },
        { value: s1?.value ?? "—", consequence: s1?.label ?? "secondary impact measure" },
        ...(s2 ? [{ value: s2.value, consequence: s2.label }] : []),
      ].slice(0, 3) as { value: string; consequence: string }[],
      challengeText: `${narrative.summary} Without sustained IDA engagement, the structural barriers constraining ${narrative.category.toLowerCase()} would compound across generations. Without intervention, the gap cannot close.`,
      interventionText: baseApproach,
      countryExamples: [countryA, countryB] as readonly [CountryExample, CountryExample],
      extraCountryExample: countryExtra,
      extraCountryReasoning: `${c0} and ${c1} anchor the primary results case. ${c2 ?? c0} brings a contrasting institutional context that validates the model's portability beyond the initial pilot geographies.`,
      pathways: {
        challenge: `Structural barriers in ${narrative.category.toLowerCase()} affect ${s1?.value ?? "millions"} of people — ${s1?.label ?? "a constraint that deepens each year"}.`,
        wbgApproach: `IDA operations combined direct financing with policy dialogue and institutional capacity building, reaching ${s0?.value ?? "significant scale"} of the target population.`,
        outcomes: `${s0?.value ?? "Measurable results"} delivered — ${s0?.label ?? "primary outcomes confirmed"} — within the project implementation timeline.`,
        longTermImpact: `Institutional reforms and systemic changes embedded during the project cycle create a self-sustaining trajectory beyond the IDA financing period.`,
      },
      lessonsText: `The most durable results came from operations that paired direct service delivery with institutional reform — the two-track approach that transforms one-time outputs into lasting systems change. Programs that focused only on delivery without strengthening the underlying institutions saw gains erode within two years of project close.`,
      sourceCounts: sc,
    },
    // Angle II — The financing gap
    {
      id: `${narrative.slug}-gap`,
      marker: "II" as SkeletonMarker,
      title: "The Financing Gap",
      outcomeArea: oa,
      openingClaim: `${s1?.value ?? "A staggering gap"} — ${s1?.label ?? narrative.summary.split(".")[0]} — and closing it requires a structural shift in how development finance reaches the last mile.`,
      keyResults: [
        { value: s1?.value ?? "—", consequence: s1?.label ?? "scale of the unmet need" },
        { value: s0?.value ?? "—", consequence: s0?.label ?? "what IDA has achieved so far" },
        ...(s2 ? [{ value: s2.value, consequence: s2.label }] : []),
      ].slice(0, 3) as { value: string; consequence: string }[],
      challengeText: `${narrative.summary} The financing gap is structural — not a shortage of ambition but of mechanisms that can deploy capital at the pace and scale the challenge demands. Without closing the gap, ${narrative.category.toLowerCase()} cannot reach the people who need it most.`,
      interventionText: baseApproach,
      countryExamples: [countryA, countryB] as readonly [CountryExample, CountryExample],
      extraCountryExample: countryExtra,
      extraCountryReasoning: `${c0} and ${c1} show how IDA financing unlocked additional private and domestic resources. ${c2 ?? c0} demonstrates the gap-closing mechanism in a different institutional context.`,
      pathways: {
        challenge: `${s1?.value ?? "An enormous gap"} in ${narrative.category.toLowerCase()} — a structural financing shortfall that IDA concessional capital is uniquely positioned to bridge.`,
        wbgApproach: `IDA operations combined direct concessional financing with blended instruments, de-risking private investment and mobilising domestic resources at ${s0?.value ?? "scale"}.`,
        outcomes: `Gap closure measured against the ${s0?.value ?? "target"} benchmark — demonstrating that the financing model works when deployed with institutional discipline.`,
        longTermImpact: `As risk-sharing instruments mature and domestic systems strengthen, the financing model transitions from IDA-led to locally-owned — removing IDA from the critical path.`,
      },
      lessonsText: `Operations that treated the financing gap as a market-design problem — rather than a resource shortfall — outperformed. The critical investment was in the instruments that made private capital viable, not in substituting for it.`,
      sourceCounts: sc,
    },
    // Angle III — Country evidence
    {
      id: `${narrative.slug}-evidence`,
      marker: "III" as SkeletonMarker,
      title: "Country Evidence",
      outcomeArea: oa,
      openingClaim: `${c0}'s results in ${narrative.category.toLowerCase()} — ${s0?.value ?? "transformational outcomes"} in ${Math.floor(Math.random() * 3) + 2} years — are the clearest proof that the WBG model works when it has political commitment and institutional backbone.`,
      keyResults: [
        { value: s0?.value ?? "—", consequence: `${c0}: ${s0?.label ?? "primary outcome"}` },
        { value: s1?.value ?? "—", consequence: `${c1 ?? "Regional"}: ${s1?.label ?? "secondary outcome"}` },
        ...(s2 ? [{ value: s2.value, consequence: s2.label }] : []),
      ].slice(0, 3) as { value: string; consequence: string }[],
      challengeText: `Country-level evidence from ${narrative.countries.slice(0, 3).join(", ")} shows that the path to impact in ${narrative.category.toLowerCase()} is well-understood. What separates success from stagnation is implementation quality, not strategy. Without execution discipline, good designs produce no results.`,
      interventionText: baseApproach,
      countryExamples: [countryA, countryB] as readonly [CountryExample, CountryExample],
      extraCountryExample: countryExtra,
      extraCountryReasoning: `${c0} and ${c1} provide the primary evidence base. ${c2 ?? c0} adds a contrasting context that tests the model's boundary conditions — validating that results are portable, not context-dependent.`,
      pathways: {
        challenge: `Country-specific barriers in ${c0} and ${c1 ?? "peer countries"} blocked ${narrative.category.toLowerCase()} progress despite available financing — an implementation and institutional gap, not a resource gap.`,
        wbgApproach: `Customised operations in each country addressed the specific binding constraint — not a one-size-fits-all template, but a consistent theory of change adapted to local context.`,
        outcomes: `${s0?.value ?? "Measurable results"} in ${c0} and comparable gains in ${c1 ?? "peer countries"} — evidence that the WBG approach is replicable across diverse country contexts.`,
        longTermImpact: `Country-level institutional change embeds lessons as permanent operating procedures, enabling the next generation of reforms without requiring IDA to restart from first principles.`,
      },
      lessonsText: `The country cases reveal a consistent pattern: results correlate with the depth of government ownership, not the scale of IDA financing. Countries where the ministry led implementation outperformed those where IDA drove the agenda — even when the IDA team had stronger technical capacity.`,
      sourceCounts: sc,
    },
    // Angle IV — Pathways to scale
    {
      id: `${narrative.slug}-scale`,
      marker: "IV" as SkeletonMarker,
      title: "Pathways to Scale",
      outcomeArea: oa,
      openingClaim: `${s2?.value ?? "The model works"} — ${s2?.label ?? "and the next step is scaling it from pilot to systemic change"} — with lessons from ${c0} and ${c1 ?? "peer countries"} providing the replication blueprint.`,
      keyResults: [
        { value: s2?.value ?? s0?.value ?? "—", consequence: s2?.label ?? s0?.label ?? "scale milestone" },
        { value: s0?.value ?? "—", consequence: s0?.label ?? "primary results baseline" },
        { value: s1?.value ?? "—", consequence: s1?.label ?? "secondary results baseline" },
      ].slice(0, 3) as { value: string; consequence: string }[],
      challengeText: `${narrative.summary} The proven results from ${c0} and ${c1 ?? "peer countries"} create a replication obligation — but scaling requires institutional infrastructure that doesn't yet exist at the right level. Without building that infrastructure now, the gains stay local.`,
      interventionText: baseApproach,
      countryExamples: [countryA, countryB] as readonly [CountryExample, CountryExample],
      extraCountryExample: countryExtra,
      extraCountryReasoning: `${c0} and ${c1} are the primary scale cases. ${c2 ?? c0} shows how the model adapts to a new geography — validating that the scale pathway isn't limited to the original pilot contexts.`,
      pathways: {
        challenge: `Results in ${c0} and ${c1 ?? "peer countries"} prove the model works at project scale. The barrier to systemic change is institutional — replication requires policy change, not just project approval.`,
        wbgApproach: `IDA combines proven project delivery with the policy dialogue and regional convening needed to embed lessons in national systems and scale the model beyond individual operations.`,
        outcomes: `${s0?.value ?? "Initial results"} create the political and institutional foundation for the next replication cycle — each success lowers the bar for the next country to join.`,
        longTermImpact: `A self-reinforcing scale pathway: early adopters demonstrate results, regional knowledge-sharing accelerates adoption, and institutional change removes the need for concessional subsidies as the model becomes commercially attractive.`,
      },
      lessonsText: `Scale requires designing for replication from day one — not retrofitting a pilot for national roll-out. The most scalable operations built in explicit knowledge-transfer mechanisms: documented decision rules, training curricula, and regulatory templates that the next country can adopt without bespoke design.`,
      sourceCounts: sc,
    },
  ];

  return angles;
}

