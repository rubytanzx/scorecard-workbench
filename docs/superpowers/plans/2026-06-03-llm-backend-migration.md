# LLM Narrative Backend Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the LLM narrative backend from `ida-scorecard` into `wbg-scorecard-2` and wire the frontend so the narrative picker, the 4-card carousel, and the generated narrative are all grounded in `data/narratives.json` via the backend — with no mock content on those paths and honest loading/empty/error states.

**Architecture:** Next.js App Router route handlers + server libs (no separate server). Content comes from `narratives.json`; outcome-area chrome (icons/short labels) comes from a static slug-keyed map. The frontend already has an "injected skeletons override mock" seam; we feed it from the API and remove the `FLOW_SKELETONS`/mock fallbacks.

**Tech Stack:** Next.js 16.1.7 (Turbopack), React 19, TypeScript (strict), `@anthropic-ai/sdk`, `openai`. Path alias `@/*` → repo root. No test runner — verify with `tsc --noEmit`, `npm run build`, curl, and the browser.

**Source repo (read-only):** `/Users/ruby.tan/Downloads/ida-scorecard`
**Target repo:** `/Users/ruby.tan/wbg-scorecard-2` (branch `migrate-llm-backend`)

---

## File Structure

**Phase 1 — Backend (new files in target):**
- `lib/llmClient.ts` — provider abstraction (copy verbatim)
- `lib/narrativePrompt.ts` — prompts (copy verbatim)
- `lib/narrativeScorer.ts` — scorer (copy verbatim)
- `lib/narrativeTypes.ts` — `NarrativeFilters` (copy verbatim)
- `lib/narrativeStore.ts` — server fs reader + helpers (copy of source `lib/narrativeData.ts`, **renamed**)
- `lib/narrativePresentation.ts` — **new**; static slug→{shortLabel, iconPath} map + `deriveTopStats` + `toWBGNarrative`
- `lib/narrativeApi.ts` — client adapter (copy + adapt mappers + add `fetchNarrativeDetail`)
- `app/api/narrative/match/route.ts` — copy + import rewrite
- `app/api/narrative/generate/route.ts` — copy + import rewrite
- `app/api/narrative/topics/route.ts` — copy + import rewrite
- `app/api/narrative/detail/route.ts` — **new**; returns WBGNarrative[] from json + presentation
- `data/narratives.json` — copy verbatim
- `.env.example` — new

**Phase 2 — Frontend grounding (edits in target):**
- `components/conversation/GuidedDiscovery.tsx` — picker sources from `/detail`
- `app/page.tsx` — carousel from `/match`; remove `FLOW_SKELETONS` fallback
- `components/conversation/ConversationView.tsx` — carousel from `/match`
- `components/conversation/NarrativeSkeletonChoice.tsx` — require injected skeletons
- `components/conversation/SkeletonPreviewPanel.tsx` — require injected skeletons
- `components/conversation/SkeletonRefinedMessage.tsx` — require injected skeletons
- `components/conversation/InteractiveElementsMessage.tsx` — add `skeletons` prop
- `components/conversation/NarrativePanel.tsx` — drop `FLOW_SKELETONS` branch
- `components/conversation/NarrativeOutput.tsx` — injected `narrative` prop

---

# PHASE 1 — BACKEND

## Task 1: Add LLM SDK dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add dependencies**

Edit `package.json` `dependencies` to add these two entries (keep alphabetical-ish grouping with existing deps):

```json
"@anthropic-ai/sdk": "^0.100.1",
"openai": "^6.41.0",
```

- [ ] **Step 2: Install**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npm install`
Expected: installs without error; `node_modules/@anthropic-ai/sdk` and `node_modules/openai` exist.

- [ ] **Step 3: Sanity-check native binaries (macOS)**

Run: `node -e "require('lightningcss'); require('@tailwindcss/oxide'); console.log('native ok')"`
Expected: prints `native ok`. If it errors with "library load disallowed by system policy" or a missing `.node`, run `xattr -dr com.apple.quarantine node_modules` and re-run; if still missing, `rm -rf node_modules && npm install`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add @anthropic-ai/sdk and openai for narrative backend"
```

---

## Task 2: Copy verbatim backend libs + data

**Files:**
- Create: `lib/llmClient.ts`, `lib/narrativePrompt.ts`, `lib/narrativeScorer.ts`, `lib/narrativeTypes.ts`, `lib/narrativeStore.ts`, `data/narratives.json`

- [ ] **Step 1: Copy the verbatim files**

Run:
```bash
SRC=/Users/ruby.tan/Downloads/ida-scorecard
DST=/Users/ruby.tan/wbg-scorecard-2
cp "$SRC/lib/llmClient.ts"       "$DST/lib/llmClient.ts"
cp "$SRC/lib/narrativePrompt.ts" "$DST/lib/narrativePrompt.ts"
cp "$SRC/lib/narrativeScorer.ts" "$DST/lib/narrativeScorer.ts"
cp "$SRC/lib/narrativeTypes.ts"  "$DST/lib/narrativeTypes.ts"
cp "$SRC/lib/narrativeData.ts"   "$DST/lib/narrativeStore.ts"
cp "$SRC/data/narratives.json"   "$DST/data/narratives.json"
```

- [ ] **Step 2: Verify the rename didn't clobber the mock**

Run: `grep -c "generateNarrativeSkeletons\|export const NARRATIVES" /Users/ruby.tan/wbg-scorecard-2/lib/narrativeData.ts`
Expected: `2` (the original mock `lib/narrativeData.ts` is untouched — `narrativeStore.ts` is a separate new file).

- [ ] **Step 3: Verify narrativeStore.ts imports resolve**

`lib/narrativeStore.ts` imports only `path`, `fs`, and `./narrativeTypes`. Confirm:
Run: `head -3 /Users/ruby.tan/wbg-scorecard-2/lib/narrativeStore.ts`
Expected: shows `import path`, `import fs`, `import type { NarrativeFilters } from "./narrativeTypes";` — no `@/lib/narrativeData` self-reference.

- [ ] **Step 4: Commit**

```bash
git add lib/llmClient.ts lib/narrativePrompt.ts lib/narrativeScorer.ts lib/narrativeTypes.ts lib/narrativeStore.ts data/narratives.json
git commit -m "feat(backend): add llm client, prompts, scorer, types, store, narratives data"
```

---

## Task 3: Create the presentation map + WBGNarrative adapter

**Files:**
- Create: `lib/narrativePresentation.ts`

This module supplies outcome-area chrome (`shortLabel`, `iconPath`) and converts a `NarrativeSource` (from `narratives.json`) into the `WBGNarrative` shape the picker/output consume. `value` for topStats comes from the data; `label` is derived from the stat context, falling back to the category.

- [ ] **Step 1: Write the module**

Create `lib/narrativePresentation.ts`:

```ts
import { getNarratives, extractPreview, extractCountryNames, type NarrativeSource } from "@/lib/narrativeStore";

/** The WBGNarrative shape the picker (GuidedDiscovery) and NarrativeOutput consume.
 *  Mirrors the interface in the (mock) lib/narrativeData.ts so existing components
 *  render unchanged — but every instance is built from narratives.json here. */
export interface WBGNarrative {
  slug: string;
  url: string;
  category: string;
  shortLabel: string;
  title: string;
  summary: string;
  iconPath: string;
  countries: string[];
  topStats: { value: string; label: string }[];
}

/** Outcome-area chrome keyed by the real narrative slug. shortLabel + iconPath
 *  are presentation identity (not narrative content); icons live in public/outcome areas/. */
const OA_PRESENTATION: Record<string, { shortLabel: string; iconPath: string }> = {
  "protection-for-the-poorest": { shortLabel: "Protecting the Poorest", iconPath: "/outcome%20areas/protection%20for%20the%20pooresr.svg" },
  "no-learning-poverty": { shortLabel: "No Learning Poverty", iconPath: "/outcome%20areas/learning%20poverty.svg" },
  "healthier-lives": { shortLabel: "Healthier Lives", iconPath: "/outcome%20areas/healthier%20lives.svg" },
  "effective-macroeconomic-and-fiscal-management": { shortLabel: "Fiscal Management", iconPath: "/outcome%20areas/Effective%20Macroeconomic%20and%20Fiscal%20Management.svg" },
  "green-and-blue-planet-and-resilient-populations": { shortLabel: "Climate Resilience", iconPath: "/outcome%20areas/Green%20and%20Blue%20Planet%20and%20Resilient%20Populations.svg" },
  "inclusive-and-equitable-water-and-sanitation-services": { shortLabel: "Water & Sanitation", iconPath: "/outcome%20areas/Inclusive%20and%20Equitable%20Water%20and%20Sanitation%20Services.svg" },
  "sustainable-food-systems": { shortLabel: "Sustainable Food", iconPath: "/outcome%20areas/Sustainable%20Food%20Systems.svg" },
  "connected-communities": { shortLabel: "Connected Communities", iconPath: "/outcome%20areas/Connected%20Communities.svg" },
  "affordable-reliable-and-sustainable-energy-for-all": { shortLabel: "Energy for All", iconPath: "/outcome%20areas/Affordable%20Reliable%20and%20Sustainable%20Energy%20for%20All.svg" },
  "digital-connectivity": { shortLabel: "Digital Connectivity", iconPath: "/outcome%20areas/Digital%20Connectivity.svg" },
  "digital-services": { shortLabel: "Digital Services", iconPath: "/outcome%20areas/Digital%20Services.svg" },
  "gender-equality": { shortLabel: "Gender Equality", iconPath: "/outcome%20areas/Gender%20Equality.svg" },
  "better-lives-for-people-in-fragility-conflict-and-violence": { shortLabel: "Fragility & Conflict", iconPath: "/outcome%20areas/Better%20Lives%20for%20People%20in%20Fragility%20Conflict%20and%20Violence.svg" },
  "more-private-investment": { shortLabel: "More Private Investment", iconPath: "/outcome%20areas/More%20Private%20Investment.svg" },
};

/** Derive a short, clean label from a stat's messy free-text context.
 *  Takes the first clause (up to a sentence/clause boundary), trims to ~40 chars;
 *  falls back to the narrative category when the context is unusable. */
function deriveStatLabel(context: string, category: string): string {
  const firstClause = (context ?? "").split(/[—.;:]|\s-\s/)[0]?.trim() ?? "";
  const cleaned = firstClause.replace(/\s+/g, " ");
  if (cleaned.length >= 6 && cleaned.length <= 60) return cleaned;
  if (cleaned.length > 60) return cleaned.slice(0, 57).trimEnd() + "…";
  return category;
}

function toWBGNarrative(n: NarrativeSource): WBGNarrative {
  const preview = extractPreview(n);
  const pres = OA_PRESENTATION[n.slug] ?? { shortLabel: n.category, iconPath: "" };
  return {
    slug: n.slug,
    url: n.url,
    category: n.category,
    shortLabel: pres.shortLabel,
    title: n.title,
    summary: preview.summary,
    iconPath: pres.iconPath,
    countries: extractCountryNames(n),
    topStats: n.stats.slice(0, 3).map((s) => ({
      value: s.value,
      label: deriveStatLabel(s.context, n.category),
    })),
  };
}

/** All 14 narratives in WBGNarrative shape, content grounded in narratives.json. */
export function getWBGNarratives(): WBGNarrative[] {
  return getNarratives().map(toWBGNarrative);
}

export function getWBGNarrativeBySlug(slug: string): WBGNarrative | undefined {
  const n = getNarratives().find((x) => x.slug === slug);
  return n ? toWBGNarrative(n) : undefined;
}
```

- [ ] **Step 2: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors referencing `lib/narrativePresentation.ts`. (`extractCountryNames` and `extractPreview` are exported from `narrativeStore.ts` — verified in source.)

- [ ] **Step 3: Commit**

```bash
git add lib/narrativePresentation.ts
git commit -m "feat(backend): add WBGNarrative presentation adapter over narratives.json"
```

---

## Task 4: Copy + import-rewrite the three API routes

**Files:**
- Create: `app/api/narrative/match/route.ts`, `app/api/narrative/generate/route.ts`, `app/api/narrative/topics/route.ts`

- [ ] **Step 1: Copy the routes**

Run:
```bash
SRC=/Users/ruby.tan/Downloads/ida-scorecard
DST=/Users/ruby.tan/wbg-scorecard-2
mkdir -p "$DST/app/api/narrative/match" "$DST/app/api/narrative/generate" "$DST/app/api/narrative/topics"
cp "$SRC/app/api/narrative/match/route.ts"    "$DST/app/api/narrative/match/route.ts"
cp "$SRC/app/api/narrative/generate/route.ts" "$DST/app/api/narrative/generate/route.ts"
cp "$SRC/app/api/narrative/topics/route.ts"   "$DST/app/api/narrative/topics/route.ts"
```

- [ ] **Step 2: Rewrite the data-module import in all three routes**

In each of the three copied route files, change every import specifier `@/lib/narrativeData` to `@/lib/narrativeStore`. The affected import lines are:
- `match/route.ts` line 2: `... from "@/lib/narrativeData";` → `... from "@/lib/narrativeStore";`
- `generate/route.ts` line 2: `import { getNarrativeBySlug, extractPreview } from "@/lib/narrativeData";` → `... from "@/lib/narrativeStore";`
- `topics/route.ts` line 2: `import { getNarratives } from "@/lib/narrativeData";` → `... from "@/lib/narrativeStore";`

Run to confirm none remain:
```bash
grep -rn "@/lib/narrativeData\"" /Users/ruby.tan/wbg-scorecard-2/app/api/narrative
```
Expected: no output (all rewritten to `narrativeStore`).

- [ ] **Step 3: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors in `app/api/narrative/*`.

- [ ] **Step 4: Commit**

```bash
git add app/api/narrative/match/route.ts app/api/narrative/generate/route.ts app/api/narrative/topics/route.ts
git commit -m "feat(backend): add match/generate/topics narrative API routes"
```

---

## Task 5: Add the `/api/narrative/detail` route

**Files:**
- Create: `app/api/narrative/detail/route.ts`

- [ ] **Step 1: Write the route**

Create `app/api/narrative/detail/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getWBGNarratives, getWBGNarrativeBySlug } from "@/lib/narrativePresentation";

/** GET /api/narrative/detail            → all 14 WBGNarratives (for the picker)
 *  GET /api/narrative/detail?slug=<slug> → a single WBGNarrative (or 404) */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const one = getWBGNarrativeBySlug(slug);
    if (!one) {
      return NextResponse.json({ error: "Narrative not found." }, { status: 404 });
    }
    return NextResponse.json(one);
  }
  return NextResponse.json(getWBGNarratives());
}
```

- [ ] **Step 2: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/narrative/detail/route.ts
git commit -m "feat(backend): add detail route serving WBGNarrative shape from narratives.json"
```

---

## Task 6: Adapt `narrativeApi.ts` mappers + add detail/topics client helpers

**Files:**
- Create: `lib/narrativeApi.ts` (copy from source, then adapt)

The target's `NarrativeSkeleton` requires `openingClaim` and `keyResults`, and `CountryExample` has an optional `result`. The source mappers don't populate these. We copy the file, then update both mappers and add client helpers for `/detail` and `/topics`.

- [ ] **Step 1: Copy the source file**

Run: `cp /Users/ruby.tan/Downloads/ida-scorecard/lib/narrativeApi.ts /Users/ruby.tan/wbg-scorecard-2/lib/narrativeApi.ts`

- [ ] **Step 2: Add a key-result parser**

In `lib/narrativeApi.ts`, immediately after the `flagFor` function (around line 99), add:

```ts
// Parse an LLM key-result string ("9.5M households reached ...") into the
// {value, consequence} shape the new NarrativeSkeleton.keyResults expects.
function parseKeyResult(s: string): { value: string; consequence: string } {
  const m = s.match(/^\s*([+\-−]?[\d.,]+\s?(?:%|pp|M|B|K|bn|mn|GW|MtCO2eq|days?|hrs?|hours?|months?|years?)?)\b[\s:—-]*(.*)$/i);
  if (m && m[1] && m[2]) return { value: m[1].trim(), consequence: m[2].trim() };
  return { value: "", consequence: s.trim() };
}
```

- [ ] **Step 3: Update `generatedToSkeleton` to populate the richer fields**

Replace the entire `generatedToSkeleton` function body so the country examples carry `result`, and the returned object includes `openingClaim` + `keyResults`:

```ts
function generatedToSkeleton(res: GenerateResponse): NarrativeSkeleton {
  const n = res.narrative;

  const rawExamples = n.country_examples.map((e) => ({
    name: e.country,
    flag: flagFor(e.country),
    description: e.body,
    result: e.result,
  }));
  const countryExamples = pairExamples(rawExamples);
  const extraCountryExample: CountryExample = rawExamples[2]
    ? { name: rawExamples[2].name, flag: rawExamples[2].flag, description: rawExamples[2].description, result: rawExamples[2].result }
    : { name: "Global", flag: "🌍", description: "" };

  const pathways: Pathways = {
    challenge: n.challenge.split(".")[0] + ".",
    wbgApproach: n.intervention,
    outcomes: n.key_results.slice(0, 2).join(" "),
    longTermImpact: n.pathway_to_outcome,
  };

  return {
    id: res.slug,
    marker: "I",
    title: res.title,
    outcomeArea: oaFor(res.slug, res.category),
    openingClaim: n.opening_line,
    keyResults: n.key_results.slice(0, 3).map(parseKeyResult),
    challengeText: n.challenge,
    interventionText: n.intervention,
    countryExamples,
    extraCountryExample,
    extraCountryReasoning: `${extraCountryExample.name} adds a further dimension to the narrative.`,
    pathways,
    lessonsText: n.lessons_learned.join("\n\n"),
    sourceCounts: { pads: 0, isrs: 0, icrs: res.rewritten_score },
  };
}
```

Then update `pairExamples`'s `toExample` (around line 129) to preserve `result`:

```ts
  const toExample = (e: { name: string; flag?: string; description?: string; result?: string }): CountryExample => ({
    name: e.name,
    flag: e.flag ?? flagFor(e.name),
    description: e.description ?? "",
    ...(e.result ? { result: e.result } : {}),
  });
```

and widen the `pairExamples` parameter type and the `IDA_FALLBACK`/`a`/`b` handling accordingly:

```ts
function pairExamples(
  examples: Array<{ name: string; flag?: string; description?: string; result?: string }>,
): readonly [CountryExample, CountryExample] {
```

- [ ] **Step 4: Update `previewToSkeleton` to populate the richer fields**

In `previewToSkeleton`, add `openingClaim` and `keyResults` to the returned object (insert after the `outcomeArea:` line):

```ts
    openingClaim: (preview.summary.split(/(?<=[.!?])\s+/)[0] ?? preview.summary).trim(),
    keyResults: [],
```

- [ ] **Step 5: Add `WBGNarrative` client type + detail/topics fetch helpers**

At the end of `lib/narrativeApi.ts`, append:

```ts
/** Client-side mirror of the server WBGNarrative shape (see lib/narrativePresentation.ts). */
export interface WBGNarrative {
  slug: string;
  url: string;
  category: string;
  shortLabel: string;
  title: string;
  summary: string;
  iconPath: string;
  countries: string[];
  topStats: { value: string; label: string }[];
}

/** Fetch all narratives in WBGNarrative shape (for the picker). null on failure. */
export async function fetchNarrativeDetails(): Promise<WBGNarrative[] | null> {
  try {
    const res = await fetch(`${API_BASE}/detail`);
    if (!res.ok) return null;
    return (await res.json()) as WBGNarrative[];
  } catch {
    return null;
  }
}

/** Fetch a single narrative in WBGNarrative shape by slug. null on failure. */
export async function fetchNarrativeDetail(slug: string): Promise<WBGNarrative | null> {
  try {
    const res = await fetch(`${API_BASE}/detail?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    return (await res.json()) as WBGNarrative;
  } catch {
    return null;
  }
}
```

- [ ] **Step 6: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors. In particular, no "missing property openingClaim/keyResults" on `NarrativeSkeleton` returns.

- [ ] **Step 7: Commit**

```bash
git add lib/narrativeApi.ts
git commit -m "feat(backend): adapt narrativeApi mappers to richer skeleton + add detail/topics helpers"
```

---

## Task 7: Add `.env.example` and verify the backend end-to-end

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Write `.env.example`**

Create `.env.example`:

```bash
# LLM provider selection: "anthropic" (default) or "openai"
LLM_PROVIDER=anthropic

# --- Anthropic (used when LLM_PROVIDER=anthropic) ---
ANTHROPIC_API_KEY=
# Optional model overrides:
# ANTHROPIC_MATCH_MODEL=claude-haiku-4-5-20251001
# ANTHROPIC_GENERATE_MODEL=claude-sonnet-4-6

# --- OpenAI (used when LLM_PROVIDER=openai) ---
OPENAI_API_KEY=
# Optional model overrides:
# OPENAI_MATCH_MODEL=gpt-4o-mini
# OPENAI_GENERATE_MODEL=gpt-4o
```

- [ ] **Step 2: Confirm `.env*` is gitignored**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && git check-ignore .env.local; grep -n "env" .gitignore`
Expected: `.gitignore` ignores `.env*`. `.env.example` is NOT ignored (it's committed). Confirm `git status` shows `.env.example` as untracked/addable.

- [ ] **Step 3: Build**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npm run build`
Expected: build succeeds; output lists the four `/api/narrative/*` routes.

- [ ] **Step 4: Start dev server and smoke-test no-key routes**

Run (background): `cd /Users/ruby.tan/wbg-scorecard-2 && npm run dev`
Then:
```bash
curl -s localhost:3000/api/narrative/topics | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const a=JSON.parse(d);console.log('topics:',a.length)})"
curl -s "localhost:3000/api/narrative/detail" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const a=JSON.parse(d);console.log('detail:',a.length,'first:',a[0].shortLabel,a[0].iconPath,'topStats:',JSON.stringify(a[0].topStats[0]))})"
```
Expected: `topics: 14`; `detail: 14` with a real `shortLabel`, an `iconPath` under `/outcome%20areas/`, and a `topStats[0]` `{value,label}`. (`/match` and `/generate` need an API key — deferred to Task 18.)

- [ ] **Step 5: Commit**

```bash
git add .env.example
git commit -m "chore(backend): add .env.example documenting both LLM providers"
```

---

# PHASE 2 — FRONTEND GROUNDING

> Phase 2 depends on Phase 1. After Phase 2, no mock content renders on the picker / carousel / generated-narrative paths.

## Task 8: Ground the picker (`GuidedDiscovery`) in `/api/narrative/detail`

**Files:**
- Modify: `components/conversation/GuidedDiscovery.tsx`

Currently imports `NARRATIVES`, `findNarrative`, `getNarrativeBriefing`, `extractOutcomeAreaFromPrompt`, `type WBGNarrative` from `@/lib/narrativeData` (mock). We source the narrative list + lookups from the API; keep `extractOutcomeAreaFromPrompt` (pure prompt parsing) but import the `WBGNarrative` type from `@/lib/narrativeApi`; replace `getNarrativeBriefing` with a derived briefing.

- [ ] **Step 1: Replace the mock import (line 5)**

Change:
```tsx
import { NARRATIVES, extractOutcomeAreaFromPrompt, findNarrative, getNarrativeBriefing, type WBGNarrative } from "@/lib/narrativeData";
```
to:
```tsx
import { extractOutcomeAreaFromPrompt } from "@/lib/narrativeData";
import { fetchNarrativeDetails, type WBGNarrative } from "@/lib/narrativeApi";
```

- [ ] **Step 2: Load the real narratives on mount (state + effect)**

Inside the `GuidedDiscovery` component, replace the local-only state init by adding a narratives list with loading/error. After the existing `const [step, setStep] = ...` line (line 68), add:

```tsx
  const [narratives, setNarratives] = useState<WBGNarrative[]>([]);
  const [narrativesError, setNarrativesError] = useState(false);
  const narrativesLoading = narratives.length === 0 && !narrativesError;
```

Then add an effect (place beside the existing mount effect):

```tsx
  useEffect(() => {
    let cancelled = false;
    fetchNarrativeDetails().then((list) => {
      if (cancelled) return;
      if (list && list.length) setNarratives(list);
      else setNarrativesError(true);
    });
    return () => { cancelled = true; };
  }, []);
```

- [ ] **Step 3: Replace `findNarrative` lookups with the loaded list**

Change line 120:
```tsx
  const selectedNarrative = selectedSlug ? findNarrative(selectedSlug) : null;
```
to:
```tsx
  const selectedNarrative = selectedSlug ? (narratives.find((n) => n.slug === selectedSlug) ?? null) : null;
```

- [ ] **Step 4: Replace the `NARRATIVES.map` picker grid + add loading/error states**

Replace the grid block (lines 142-171, the `<div className="grid ...">{NARRATIVES.map(...)}</div>`) so it renders `narratives` and shows loading/error honestly:

```tsx
            {narrativesLoading && (
              <p className={`text-[13px] ${dark ? "text-[#94A3B8]" : "text-gray-500"}`}>Loading outcome areas…</p>
            )}
            {narrativesError && (
              <p className={`text-[13px] ${dark ? "text-[#FCA5A5]" : "text-red-600"}`}>
                Couldn&apos;t load narratives. Check that the API is configured, then retry.
              </p>
            )}
            {!narrativesLoading && !narrativesError && (
              <div className="grid grid-cols-2 gap-2 mt-1" style={{ maxWidth: 560 }}>
                {narratives.map((n) => (
                  <button
                    key={n.slug}
                    onClick={() => handleSelectOutcomeArea(n.slug)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${cardBase} ${
                      selectedSlug === n.slug ? selectedBorder : borderBase
                    }`}
                    style={{ fontFamily: "'Open Sans', sans-serif" }}
                  >
                    <div className="relative w-5 h-5 shrink-0">
                      <Image src={n.iconPath} alt={n.shortLabel} width={20} height={20} className="object-contain" unoptimized />
                    </div>
                    <span className={`text-[12.5px] font-medium leading-tight ${dark ? "text-[#CBD5E1]" : "text-gray-700"}`}>
                      {n.shortLabel}
                    </span>
                  </button>
                ))}
              </div>
            )}
```

- [ ] **Step 5: Replace `getNarrativeBriefing(selectedNarrative)` with a derived briefing (line 184-185)**

Change:
```tsx
          {showStep2 && selectedNarrative && (() => {
            const briefing = getNarrativeBriefing(selectedNarrative);
```
to:
```tsx
          {showStep2 && selectedNarrative && (() => {
            const briefing = {
              body: selectedNarrative.summary,
              question: "Which angle should this narrative lead with?",
            };
```

- [ ] **Step 6: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors. `CountrySuggestion`/`getSuggestion` keep using `selectedNarrative` fields (`countries`, `topStats`, `shortLabel`, `category`) which the API `WBGNarrative` provides.

- [ ] **Step 7: Commit**

```bash
git add components/conversation/GuidedDiscovery.tsx
git commit -m "feat(ui): source narrative picker from /api/narrative/detail (no mock)"
```

---

## Task 9: Ground the carousel in `/api/narrative/match` — `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

Replace the synchronous mock skeleton generation in `handleGuidedDiscoveryComplete` with an async `/match` call, and add carousel loading/error state.

- [ ] **Step 1: Update imports (lines 20-21)**

Change:
```tsx
import { FLOW_SKELETONS, type NarrativeSkeleton } from "@/components/conversation/NarrativeSkeletons";
import { findNarrative, generateNarrativeSkeletons } from "@/lib/narrativeData";
```
to:
```tsx
import { type NarrativeSkeleton } from "@/components/conversation/NarrativeSkeletons";
import { fetchMatchedSkeletons } from "@/lib/narrativeApi";
```

- [ ] **Step 2: Add carousel loading/error state (after line 240)**

After `const [guidedSkeletons, setGuidedSkeletons] = useState<NarrativeSkeleton[]>([]);` add:

```tsx
  const [guidedSkeletonsLoading, setGuidedSkeletonsLoading] = useState(false);
  const [guidedSkeletonsError, setGuidedSkeletonsError] = useState(false);
```

- [ ] **Step 3: Rewrite `handleGuidedDiscoveryComplete` (lines 405-414)**

Replace the function with:

```tsx
  const handleGuidedDiscoveryComplete = (slug: string, angle: string, countries: string[], params: import("@/components/conversation/GuidedDiscovery").NarrativeParams) => {
    setGuidedNarrativeSlug(slug);
    setGuidedNarrativeAngle(angle);
    setGuidedNarrativeCountries(countries);
    setGuidedDiscoveryCompleted(true);
    setNarrativePhase("planning");
    void params;

    // Ground the carousel in real matched narratives (no mock fallback).
    setGuidedSkeletons([]);
    setGuidedSkeletonsError(false);
    setGuidedSkeletonsLoading(true);
    const query = conversationPrompt || slug;
    fetchMatchedSkeletons(query, { outcomeArea: undefined }).then((matched) => {
      setGuidedSkeletonsLoading(false);
      if (matched && matched.length) setGuidedSkeletons(matched);
      else setGuidedSkeletonsError(true);
    });
  };
```

- [ ] **Step 4: Remove the `FLOW_SKELETONS` fallback in `refiningChip` (lines 762-766)**

Replace:
```tsx
                title:
                  (guidedSkeletons.find((s) => s.id === refiningSkeletonId) ??
                   FLOW_SKELETONS[detectFlow(conversationPrompt)].find(
                     (s) => s.id === refiningSkeletonId,
                   ))?.title ?? "narrative angle",
```
with:
```tsx
                title:
                  guidedSkeletons.find((s) => s.id === refiningSkeletonId)?.title ?? "narrative angle",
```

- [ ] **Step 5: Pass loading/error down to ConversationView**

In the `<ConversationView ... />` props block (around lines 978-983), after `guidedSkeletons={guidedSkeletons}` add:
```tsx
          guidedSkeletonsLoading={guidedSkeletonsLoading}
          guidedSkeletonsError={guidedSkeletonsError}
```
(These props are added to ConversationView in Task 10.)

- [ ] **Step 6: Typecheck (expect ConversationView prop errors until Task 10)**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: the only remaining errors reference the new `guidedSkeletonsLoading/Error` props on `ConversationView` (resolved in Task 10). No `FLOW_SKELETONS`/`findNarrative`/`generateNarrativeSkeletons` errors in `page.tsx`.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat(ui): drive carousel from /api/narrative/match in page.tsx (no mock)"
```

---

## Task 10: Ground the carousel in `ConversationView`

**Files:**
- Modify: `components/conversation/ConversationView.tsx`

The component currently derives `guidedSkeletons` from the mock via `useMemo`. It also receives a `guidedSkeletons` prop from page.tsx. Make the prop the single source, add loading/error props, and remove the mock import.

- [ ] **Step 1: Remove the mock import (line 44)**

Delete:
```tsx
import { findNarrative, generateNarrativeSkeletons } from "@/lib/narrativeData";
```

- [ ] **Step 2: Add the new props to the Props interface (after line 127)**

After the `guidedSkeletons?: ...NarrativeSkeleton[];` prop declaration add:
```tsx
  /** Carousel loading state (true while /match is in flight). */
  guidedSkeletonsLoading?: boolean;
  /** Carousel error state (true when /match returned nothing/failed). */
  guidedSkeletonsError?: boolean;
```

- [ ] **Step 3: Destructure the new props**

Where props are destructured (near line 1747-1751, alongside `guidedSkeletons: guidedSkeletonsProp = []`), add:
```tsx
  guidedSkeletonsLoading = false,
  guidedSkeletonsError = false,
```

- [ ] **Step 4: Replace the mock `useMemo` (lines 1766-1771)**

Replace:
```tsx
  const guidedSkeletons = useMemo((): NarrativeSkeleton[] | undefined => {
    if (!guidedNarrativeSlug) return undefined;
    const narr = findNarrative(guidedNarrativeSlug);
    if (!narr) return undefined;
    return generateNarrativeSkeletons(narr);
  }, [guidedNarrativeSlug]);
```
with (use the prop as the source of truth):
```tsx
  const guidedSkeletons: NarrativeSkeleton[] | undefined =
    guidedSkeletonsProp.length > 0 ? guidedSkeletonsProp : undefined;
```

- [ ] **Step 5: Update the `NarrativeSkeletonChoice` call site (lines 2141-2151)**

Set `guidedNarrative` to `undefined` (the single-narrative context card no longer applies to a 4-narrative match set), and pass loading/error so the choice component can render states. Replace the block with:
```tsx
                <NarrativeSkeletonChoice
                  flow={flow}
                  selectedSkeletonId={selectedSkeletonId}
                  onSelect={(id) => onSelectSkeleton?.(id)}
                  onPreview={(id) => onPreviewSkeleton?.(id)}
                  onPreviewClose={() => onClosePreviewSkeleton?.()}
                  animate={narrativePhase === "skeleton-ready"}
                  dark={dark}
                  guidedNarrative={undefined}
                  skeletons={guidedSkeletons ?? []}
                  loading={guidedSkeletonsLoading}
                  error={guidedSkeletonsError}
                />
```
(`loading`/`error` props are added to `NarrativeSkeletonChoice` in Task 11.)

- [ ] **Step 6: Update the `SkeletonRefinedMessage` call site (line 2163)**

Replace:
```tsx
                  guidedSkeletons={guidedSkeletons ?? guidedSkeletonsProp}
```
with:
```tsx
                  guidedSkeletons={guidedSkeletons ?? guidedSkeletonsProp}
```
(unchanged — still resolves to the prop; left explicit for the executor. No edit needed if identical.)

- [ ] **Step 7: Typecheck (expect NarrativeSkeletonChoice prop errors until Task 11)**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: remaining errors only reference the new `loading`/`error` props on `NarrativeSkeletonChoice` (Task 11) and possibly the line-2149 `findNarrative` (removed below). Ensure no `generateNarrativeSkeletons` errors remain.

- [ ] **Step 8: Commit**

```bash
git add components/conversation/ConversationView.tsx
git commit -m "feat(ui): carousel sourced from match-prop in ConversationView (no mock)"
```

---

## Task 11: Make `NarrativeSkeletonChoice` require injected skeletons + render states

**Files:**
- Modify: `components/conversation/NarrativeSkeletonChoice.tsx`

- [ ] **Step 1: Update imports (lines 13-18)**

Change:
```tsx
import {
  FLOW_SKELETONS,
  type NarrativeSkeleton,
} from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";
import type { WBGNarrative } from "@/lib/narrativeData";
```
to:
```tsx
import { type NarrativeSkeleton } from "./NarrativeSkeletons";
import type { FlowId } from "./ConversationView";
import type { WBGNarrative } from "@/lib/narrativeApi";
```

- [ ] **Step 2: Update Props (lines 35-40) — required skeletons + loading/error**

Replace the `skeletons?` declaration with:
```tsx
  /** Real matched skeletons to render (grounded in narratives.json via /match). */
  skeletons: NarrativeSkeleton[];
  /** True while /match is in flight. */
  loading?: boolean;
  /** True when /match failed or returned nothing. */
  error?: boolean;
```

- [ ] **Step 3: Update destructuring + remove the FLOW_SKELETONS fallback (lines 49-53)**

Replace:
```tsx
  dark = false,
  guidedNarrative,
  skeletons: skeletonsProp,
}: Props) {
  const skeletons = skeletonsProp ?? FLOW_SKELETONS[flow];
```
with:
```tsx
  dark = false,
  guidedNarrative,
  skeletons,
  loading = false,
  error = false,
}: Props) {
```

- [ ] **Step 4: Render loading/error before the carousel**

Immediately after the destructuring/`const totals = ...` setup, add an early branch (place right before the main `return (`):
```tsx
  if (loading) {
    return <p className={`text-[13px] ${dark ? "text-[#94A3B8]" : "text-gray-500"}`}>Matching narratives…</p>;
  }
  if (error || skeletons.length === 0) {
    return (
      <p className={`text-[13px] ${dark ? "text-[#FCA5A5]" : "text-red-600"}`}>
        Couldn&apos;t generate narrative angles. Check that the API is configured, then retry.
      </p>
    );
  }
```
(`flow` is still used elsewhere in the component; keep the param. If `flow` becomes unused after removing the fallback, prefix with `void flow;` to satisfy lint, or keep if still referenced.)

- [ ] **Step 5: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors in this file. `guidedNarrative` may now be unused — if so, keep the prop (passed by callers) but reference or `void guidedNarrative;`.

- [ ] **Step 6: Commit**

```bash
git add components/conversation/NarrativeSkeletonChoice.tsx
git commit -m "feat(ui): require real skeletons in NarrativeSkeletonChoice + loading/error states"
```

---

## Task 12: Remove `FLOW_SKELETONS` fallback in `SkeletonPreviewPanel`

**Files:**
- Modify: `components/conversation/SkeletonPreviewPanel.tsx`

- [ ] **Step 1: Update imports (lines 12-16)**

Change:
```tsx
import {
  FLOW_SKELETONS,
  type NarrativeSkeleton,
  type Pathways,
} from "./NarrativeSkeletons";
```
to:
```tsx
import {
  type NarrativeSkeleton,
  type Pathways,
} from "./NarrativeSkeletons";
```

- [ ] **Step 2: Remove the fallback (lines 58-63)**

Replace:
```tsx
  const skeleton =
    skeletonId == null
      ? null
      : (guidedSkeletons.find((s) => s.id === skeletonId) ??
         FLOW_SKELETONS[flow].find((s) => s.id === skeletonId) ??
         null);
```
with:
```tsx
  const skeleton =
    skeletonId == null
      ? null
      : (guidedSkeletons.find((s) => s.id === skeletonId) ?? null);
```

- [ ] **Step 3: Handle the now-possibly-unused `flow` prop**

`flow` remains a declared prop (passed by callers). If TypeScript/lint flags it unused, add `void flow;` after destructuring. Keep the prop in `Props`.

- [ ] **Step 4: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors in this file.

- [ ] **Step 5: Commit**

```bash
git add components/conversation/SkeletonPreviewPanel.tsx
git commit -m "feat(ui): drop FLOW_SKELETONS fallback in SkeletonPreviewPanel"
```

---

## Task 13: Remove `FLOW_SKELETONS` fallback in `SkeletonRefinedMessage`

**Files:**
- Modify: `components/conversation/SkeletonRefinedMessage.tsx`

- [ ] **Step 1: Update import (line 10)**

Change:
```tsx
import { FLOW_SKELETONS, type NarrativeSkeleton } from "./NarrativeSkeletons";
```
to:
```tsx
import { type NarrativeSkeleton } from "./NarrativeSkeletons";
```

- [ ] **Step 2: Remove the fallback (lines 31-34)**

Replace:
```tsx
  const skeleton =
    guidedSkeletons.find((s) => s.id === skeletonId) ??
    FLOW_SKELETONS[flow].find((s) => s.id === skeletonId) ??
    null;
```
with:
```tsx
  const skeleton =
    guidedSkeletons.find((s) => s.id === skeletonId) ?? null;
```

- [ ] **Step 3: Handle unused `flow`**

`flow` is still a declared prop. If flagged unused, add `void flow;` after destructuring. Keep it in `Props`.

- [ ] **Step 4: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors in this file.

- [ ] **Step 5: Commit**

```bash
git add components/conversation/SkeletonRefinedMessage.tsx
git commit -m "feat(ui): drop FLOW_SKELETONS fallback in SkeletonRefinedMessage"
```

---

## Task 14: Add a `skeletons` prop to `InteractiveElementsMessage`

**Files:**
- Modify: `components/conversation/InteractiveElementsMessage.tsx`
- Modify (call site): wherever `<InteractiveElementsMessage .../>` is rendered

- [ ] **Step 1: Locate the call site**

Run: `grep -rn "InteractiveElementsMessage" /Users/ruby.tan/wbg-scorecard-2/components /Users/ruby.tan/wbg-scorecard-2/app`
Note the file + line where it is rendered (expected inside `ConversationView.tsx`). You will pass `skeletons={guidedSkeletons ?? []}` there in Step 5.

- [ ] **Step 2: Update import (line 10)**

Change:
```tsx
import { FLOW_SKELETONS } from "./NarrativeSkeletons";
```
to:
```tsx
import { type NarrativeSkeleton } from "./NarrativeSkeletons";
```

- [ ] **Step 3: Add the prop to `Props` (after line 18, `skeletonId`)**

Add:
```tsx
  /** Real matched skeletons (grounded). Used to resolve the chosen angle. */
  skeletons: NarrativeSkeleton[];
```

- [ ] **Step 4: Destructure + replace the lookup (lines 29-38)**

Replace:
```tsx
export default function InteractiveElementsMessage({
  flow,
  skeletonId,
  active,
  onProceed,
}: Props) {
  const skeleton =
    skeletonId == null
      ? null
      : FLOW_SKELETONS[flow].find((s) => s.id === skeletonId) ?? null;
```
with:
```tsx
export default function InteractiveElementsMessage({
  flow,
  skeletonId,
  active,
  onProceed,
  skeletons,
}: Props) {
  void flow;
  const skeleton =
    skeletonId == null
      ? null
      : skeletons.find((s) => s.id === skeletonId) ?? null;
```

- [ ] **Step 5: Pass `skeletons` at the call site**

At the call site found in Step 1, add `skeletons={guidedSkeletons ?? []}` to the `<InteractiveElementsMessage .../>` props. (In `ConversationView`, `guidedSkeletons` is the variable from Task 10 Step 4.)

- [ ] **Step 6: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors; no remaining `FLOW_SKELETONS` reference in this file.

- [ ] **Step 7: Commit**

```bash
git add components/conversation/InteractiveElementsMessage.tsx components/conversation/ConversationView.tsx
git commit -m "feat(ui): resolve chosen angle from injected skeletons in InteractiveElementsMessage"
```

---

## Task 15: Drop the `FLOW_SKELETONS` branch in `NarrativePanel`

**Files:**
- Modify: `components/conversation/NarrativePanel.tsx`

NarrativePanel uses the injected `guidedSkeleton` (single) for the guided flow and `FLOW_SKELETONS[flow].find(...)` for the non-guided flow. With the carousel grounded, the guided path is the live one; the non-guided `FLOW_SKELETONS` branch is removed (falls back to unpatched `content.sections`).

- [ ] **Step 1: Update import (line 40)**

Change:
```tsx
import { FLOW_SKELETONS, type Pathways, type NarrativeSkeleton } from "./NarrativeSkeletons";
```
to:
```tsx
import { type Pathways, type NarrativeSkeleton } from "./NarrativeSkeletons";
```

- [ ] **Step 2: Replace the non-guided lookup (lines 2340-2342)**

Replace:
```tsx
    if (!skeletonId) return content.sections;
    const skeleton = FLOW_SKELETONS[flow].find((s) => s.id === skeletonId);
    if (!skeleton) return content.sections;
```
with (prefer the injected `guidedSkeleton`; no mock lookup):
```tsx
    if (!skeletonId) return content.sections;
    const skeleton = guidedSkeleton && guidedSkeleton.id === skeletonId ? guidedSkeleton : undefined;
    if (!skeleton) return content.sections;
```
(`guidedSkeleton` is already a destructured prop of this component. `flow` may become unused in this code path but is used elsewhere in the file — leave it.)

- [ ] **Step 3: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors; no remaining `FLOW_SKELETONS` reference in this file.

- [ ] **Step 4: Commit**

```bash
git add components/conversation/NarrativePanel.tsx
git commit -m "feat(ui): use injected guidedSkeleton, drop FLOW_SKELETONS branch in NarrativePanel"
```

---

## Task 16: Inject `narrative` into `NarrativeOutput`

**Files:**
- Modify: `components/conversation/NarrativeOutput.tsx`
- Modify (call site): wherever `<NarrativeOutput .../>` is rendered

- [ ] **Step 1: Locate the call site**

Run: `grep -rn "NarrativeOutput" /Users/ruby.tan/wbg-scorecard-2/components /Users/ruby.tan/wbg-scorecard-2/app`
Note the file + line(s) where it is rendered and what `narrativeSlug` value is passed.

- [ ] **Step 2: Update import (line 5) + Props**

Change line 5:
```tsx
import { findNarrative } from "@/lib/narrativeData";
```
to:
```tsx
import type { WBGNarrative } from "@/lib/narrativeApi";
```
Add to `Props` (after `narrativeSlug: string;`):
```tsx
  /** The matched narrative (grounded in narratives.json), injected by the parent. */
  narrative: WBGNarrative;
```

- [ ] **Step 3: Replace the lookup (lines 20-22)**

Replace:
```tsx
export default function NarrativeOutput({ narrativeSlug, angle, countries, dark = false }: Props) {
  const narrative = findNarrative(narrativeSlug);
  if (!narrative) return null;
```
with:
```tsx
export default function NarrativeOutput({ narrativeSlug, narrative, angle, countries, dark = false }: Props) {
  void narrativeSlug;
```
(All downstream field accesses — `narrative.countries`, `iconPath`, `category`, `title`, `topStats[].value/label`, `summary` — match the `WBGNarrative` shape, so no further edits in the body.)

- [ ] **Step 4: Provide `narrative` at the call site**

At the call site (Step 1), the parent must pass `narrative={...}`. If the parent already holds a matched `WBGNarrative`, pass it. If it only has a slug, fetch it via `fetchNarrativeDetail(slug)` into state and render `NarrativeOutput` once loaded (show nothing/loading until then). Implement the minimal state+effect in that parent:
```tsx
const [outputNarrative, setOutputNarrative] = useState<import("@/lib/narrativeApi").WBGNarrative | null>(null);
useEffect(() => {
  let cancelled = false;
  import("@/lib/narrativeApi").then(({ fetchNarrativeDetail }) =>
    fetchNarrativeDetail(narrativeSlug).then((n) => { if (!cancelled) setOutputNarrative(n); }),
  );
  return () => { cancelled = true; };
}, [narrativeSlug]);
```
then render `{outputNarrative && <NarrativeOutput narrativeSlug={narrativeSlug} narrative={outputNarrative} .../>}`. (Prefer a static top-level `import { fetchNarrativeDetail }` if the parent is a client component — the dynamic import above avoids adding an import line if the call site is in a server/edge boundary.)

- [ ] **Step 5: Typecheck**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit`
Expected: no errors; no remaining `findNarrative` reference in this file.

- [ ] **Step 6: Commit**

```bash
git add components/conversation/NarrativeOutput.tsx <call-site-file>
git commit -m "feat(ui): inject grounded narrative into NarrativeOutput (no mock)"
```

---

## Task 17: Repo-wide guard — no mock on grounded paths

**Files:** none (verification only)

- [ ] **Step 1: Confirm the grounded paths no longer import the mock**

Run:
```bash
cd /Users/ruby.tan/wbg-scorecard-2
grep -rn "generateNarrativeSkeletons\|FLOW_SKELETONS" app components | grep -v "NarrativeSkeletons.ts:"
grep -rn "from \"@/lib/narrativeData\"" app components
```
Expected:
- First command: no matches in `GuidedDiscovery`, `page.tsx`, `ConversationView`, `NarrativeSkeletonChoice`, `SkeletonPreviewPanel`, `SkeletonRefinedMessage`, `InteractiveElementsMessage`, `NarrativePanel`, `NarrativeOutput`. (Matches may remain only inside `NarrativeSkeletons.ts` itself, which still defines `FLOW_SKELETONS` — that constant is now unused by grounded paths and may be left or removed in a follow-up.)
- Second command: only `GuidedDiscovery.tsx` (for `extractOutcomeAreaFromPrompt`, the kept pure prompt-parser) and the out-of-scope decorative consumers (`ConversationView` local `NARRATIVES` is defined inline, not imported). No grounded result path imports mock content.

- [ ] **Step 2: Full typecheck + build**

Run: `cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit && npm run build`
Expected: both succeed with zero errors.

- [ ] **Step 3: Commit (if any lint touch-ups were needed)**

```bash
git add -A
git commit -m "chore(ui): guard grounded narrative paths against mock imports" || echo "nothing to commit"
```

---

## Task 18: Runtime verification + live LLM smoke test

**Files:** none (verification only). Requires a user-provided API key.

- [ ] **Step 1: Create `.env.local` with a real key**

Ask the user for an `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`). Create `/Users/ruby.tan/wbg-scorecard-2/.env.local` from `.env.example` with `LLM_PROVIDER` set and the matching key filled in. (Do not commit `.env.local`.)

- [ ] **Step 2: Start the dev server**

Run (background): `cd /Users/ruby.tan/wbg-scorecard-2 && npm run dev`

- [ ] **Step 3: Smoke-test match + generate**

```bash
curl -s -X POST localhost:3000/api/narrative/match -H 'content-type: application/json' \
  -d '{"query":"education in Africa"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);console.log('match total:',r.total_matched,'first slug:',r.matches?.[0]?.slug)})"
curl -s -X POST localhost:3000/api/narrative/generate -H 'content-type: application/json' \
  -d '{"slug":"no-learning-poverty"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const r=JSON.parse(d);console.log('generate status ok; opening_line:',(r.narrative?.opening_line||'').slice(0,60))})"
```
Expected: `match total: <n>` with a real slug; `generate` returns a `narrative.opening_line`. HTTP 200 (not 502).

- [ ] **Step 4: Browser check**

Open `localhost:3000`. Run the narrative flow: enter a prompt → pick an outcome area (real icons/labels from `/detail`) → confirm the carousel shows matched real narratives (loading state first), → open a preview → generate the full narrative. Confirm: no mock angle titles (e.g. "Climate Shocks & Social Safety Nets" from the old `FLOW_SKELETONS`) appear; content reflects `narratives.json`.

- [ ] **Step 5: Failure-path check**

Temporarily set an empty/invalid key in `.env.local`, restart dev, and confirm the carousel shows the error state ("Couldn't generate narrative angles…") and the picker still lists narratives from `/detail` (which needs no key). Restore the real key.

- [ ] **Step 6: Final summary commit (docs only, if applicable)**

```bash
git add -A
git commit -m "docs: mark migration plan tasks complete" || echo "nothing to commit"
```

---

## Notes for the executor

- **Renamed module:** the incoming server data file is `lib/narrativeStore.ts` in the target (NOT `narrativeData.ts`, which is the untouched mock). Never overwrite `lib/narrativeData.ts`.
- **Two `findNarrative` sites in ConversationView:** line ~1768 (in the removed `useMemo`) and line ~2149 (inline JSX). Both must stop calling the mock — the useMemo is replaced (Task 10 Step 4) and the JSX `guidedNarrative` is set to `undefined` (Task 10 Step 5).
- **Two `detectFlow`/`FlowId` definitions:** `ConversationView` (5-value) and `NarrativePanel` (local 2-value). They are independent; do not unify.
- **Out of scope (leave as mock):** `ConversationView`'s inline `NARRATIVES`/`pickNarratives` (related-narrative cards), `lib/mockData.ts`, `data/mockInteraction.ts`, globe components.
- **`extractOutcomeAreaFromPrompt`** stays imported from `@/lib/narrativeData` — it parses the user's prompt and displays no mock content.
