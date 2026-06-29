# LLM Narrative Backend Migration — Design

**Date:** 2026-06-03
**Status:** Approved (design); pending spec review
**Target repo:** `wbg-scorecard-2`
**Source repo:** `ida-scorecard` (`/Users/ruby.tan/Downloads/ida-scorecard`)

## 1. Goal

Migrate the self-contained LLM narrative backend from `ida-scorecard` into the
improved frontend in `wbg-scorecard-2`, and wire the frontend so that every
narrative the user **picks or reads** is grounded in `data/narratives.json`
through the backend. No mock narrative content may render on those paths. When
the backend cannot answer, the UI shows loading → empty/error states — never
fabricated content.

## 2. Guiding principles

1. **Grounded, not mocked.** The narrative *picker*, the 4-card *carousel*, and
   the *generated narrative* (preview / refine / interactive / panel / full
   output) all source from `narratives.json` via the API. The hardcoded
   `FLOW_SKELETONS` and the mock `lib/narrativeData.ts` (`NARRATIVES`,
   `generateNarrativeSkeletons`, `findNarrative`) are removed from these paths.
2. **Honest failure.** No silent mock fallback. A missing API key, a 502, or a
   network error yields an explicit loading/empty/error state.
3. **Preserve the improved frontend.** Edits are surgical and confined to the
   narrative-result paths. Decorative surfaces stay as-is (see §7 Out of scope).
4. **No destructive overwrites.** Incoming files that share a name with an
   existing target file are renamed (see §4).

## 3. Provider configuration

Support both providers; ship with **blank keys**. `lib/llmClient.ts` migrates
verbatim (reads `LLM_PROVIDER`, `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`, and the
optional `*_MODEL` vars). A `.env.example` documents both. Both
`@anthropic-ai/sdk` and `openai` are added to `package.json` because
`llmClient.ts` imports both at module load.

## 4. Backend files added to target

All paths below are free in the target (verified) except where a rename is noted.

| Incoming (source) | Target path | Note |
|---|---|---|
| `app/api/narrative/match/route.ts` | same | import `@/lib/narrativeData` → `@/lib/narrativeStore` |
| `app/api/narrative/generate/route.ts` | same | same import rewrite |
| `app/api/narrative/topics/route.ts` | same | same import rewrite |
| `lib/llmClient.ts` | same | verbatim |
| `lib/narrativePrompt.ts` | same | verbatim |
| `lib/narrativeScorer.ts` | same | verbatim |
| `lib/narrativeTypes.ts` | same | verbatim |
| `lib/narrativeApi.ts` | same | mappers updated — see §5 |
| `lib/narrativeData.ts` (server fs reader) | **`lib/narrativeStore.ts`** | **renamed** to avoid clobbering the target's existing mock `lib/narrativeData.ts` |
| `data/narratives.json` | same | verbatim (≈368 KB, 14 narratives) |
| — | `.env.example` | new; both providers, keys blank |

The target already provides the `@/*` path alias and `resolveJsonModule`; no
`tsconfig`/`next.config` changes are required.

## 5. Type adaptation in `narrativeApi.ts`

The target's `NarrativeSkeleton` (in `components/conversation/NarrativeSkeletons.ts`)
is richer than the source's. The migrated mappers must populate the extra
required fields (data the LLM/prompt already produces):

- `generatedToSkeleton` (from `/generate`):
  - `openingClaim` ← `narrative.opening_line`
  - `keyResults` ← `narrative.key_results` parsed into `{ value, consequence }`
    (split a leading stat token as `value`, remainder as `consequence`; if no
    leading stat, `value: ""`, `consequence:` whole string)
  - per-country `result` ← `country_example.result`
- `previewToSkeleton` (from `/match`):
  - `openingClaim` ← first sentence of `preview.summary`
  - `keyResults` ← `[]` (renders as no stat chips — valid for the type)
  - per-country `result` ← omitted (optional)

This is the only logic change to migrated backend code; it is required for
type-checking against the new frontend.

## 6. Frontend wiring (grounded; mock removed from these paths)

The new frontend already prefers injected skeletons over the mock
(`skeletonsProp ?? FLOW_SKELETONS[flow]`). The migration feeds real API
skeletons through that existing seam, then removes the mock fallback.

### 6.1 Picker — `components/conversation/GuidedDiscovery.tsx`
- Replace the displayed list sourced from the mock `NARRATIVES` with the real
  list from `GET /api/narrative/topics` (slug, category, title, url).
- Show a loading state while topics load; empty/error state on failure.
- Prompt-parsing helpers that only read the user's input (e.g.
  `extractOutcomeAreaFromPrompt`) may remain — they display no mock content.
  Any displayed briefing text comes from the narrative preview (`/match` or a
  topics-derived preview), not from mock `getNarrativeBriefing`.

### 6.2 Carousel — `app/page.tsx` and `components/conversation/ConversationView.tsx`
- `app/page.tsx` `handleGuidedDiscoveryComplete`: stop seeding `guidedSkeletons`
  from `generateNarrativeSkeletons(mock)`. Set a loading state, call
  `fetchMatchedSkeletons(query, filters)` (query = the user's prompt/discovery
  context), and populate `guidedSkeletons` from the real result. On
  null/empty/error, set an empty/error state (no mock).
- `ConversationView.tsx`: convert the `guidedSkeletons` `useMemo`
  (currently `findNarrative` + `generateNarrativeSkeletons`) into
  state + effect that calls `/match` and renders loading/empty/error. Remove the
  mock generators from this path.

### 6.3 Generated narrative — preview / refine / interactive / panel / full output
- Thread the `/api/narrative/generate` result (skeleton + raw narrative content)
  through the existing injected-skeleton props already accepted by
  `SkeletonPreviewPanel`, `SkeletonRefinedMessage`, `InteractiveElementsMessage`,
  `NarrativePanel`, and `NarrativeOutput`.
- Remove the `FLOW_SKELETONS[flow].find(...)` and `findNarrative(...)` mock
  fallbacks on these result paths so no mock can render. Where a lookup currently
  falls back to `FLOW_SKELETONS`, it instead uses the injected real skeleton; if
  absent, it renders the empty/error state.

### 6.4 ID / slug space
With the carousel fed by `/match`, every skeleton `id` is a real narrative slug,
so the downstream `/generate` call and the by-id lookups in the result
components operate on a consistent real-slug space.

## 7. Out of scope (explicitly left as-is)

- The separate decorative related-narrative cards in `ConversationView.tsx`
  (its own local `NARRATIVES` array + `pickNarratives`).
- `lib/mockData.ts` card content, `data/mockInteraction.ts`, globe components,
  styling, and all non-narrative frontend.
- The unused `anthropic@^0.0.0` stub dependency from the source (not migrated).

## 8. Error handling

- API client functions (`fetchMatchedSkeletons`, `generateNarrativeSkeleton`)
  already `try/catch` and return `null`. The wiring treats `null` as
  empty/error (not mock).
- Routes return 404 (unknown slug / non-IDA query) and 502 (LLM failure /
  invalid JSON) as designed; the client surfaces these as the error state.

## 9. Verification

1. `npx tsc --noEmit` clean; `npm run build` succeeds.
2. `npm run dev`: `GET /api/narrative/topics` returns 14 narratives; the picker
   and carousel render from real data; failure paths show loading/empty/error,
   never mock.
3. With a user-provided API key: hit `POST /api/narrative/generate` once,
   confirm HTTP 200 with real LLM content, and confirm the live carousel
   (`/match`) and generated narrative in-browser.

## 10. Risks

- Threading real skeletons and removing `FLOW_SKELETONS` fallbacks touches large
  files (`ConversationView.tsx`, `NarrativePanel.tsx`). Mitigation: keep edits
  confined to narrative-result paths; rely on `tsc` + build + smoke test.
- The target's `node_modules` may carry the same macOS quarantine/stripped
  native-binary issue seen in the source repo. Mitigation: `npm install` after
  adding deps refreshes native binaries; clear quarantine if the dev server
  reports a native-module load error.
- Semantic shift accepted by the user: the carousel now shows up to 4
  best-matching real narratives (not 4 angles of one mock narrative).

## 11. Planning refinements (post-recon)

Detailed recon of both codebases refined the design as follows. These do not
change the approved decisions — they record *how* to honor them.

### 11.1 Slugs align (verified)
The 14 slugs in `data/narratives.json` are **identical** to the 14 slugs in the
target's mock `lib/narrativeData.ts`. No slug reconciliation is needed; the same
slug keys the picker, `/match`, `/generate`, and all downstream lookups.

### 11.2 Data-shape gap → presentation map + detail endpoint
The picker (`GuidedDiscovery`) and `NarrativeOutput` consume a `WBGNarrative`
shape (`slug, url, category, shortLabel, title, summary, iconPath, countries[],
topStats[{value,label}]`). `narratives.json` supplies `slug, url, category,
title` directly and `summary, countries[]` via the existing `extractPreview`
logic in the server data module. Two fields are **not** in the data:
- `shortLabel`, `iconPath` — outcome-area chrome. Sourced from a **static
  slug-keyed map** (`lib/narrativePresentation.ts`, 14 entries lifted verbatim
  from the current mock, pointing at the existing `public/outcome areas/*.svg`).
  This is OA identity, not narrative results.
- `topStats[{value,label}]` — `value` from `narratives.json` `stats[].value`;
  `label` derived from the first clause of the stat's `context`, falling back to
  the narrative `category` when the context is unusable.

A new **`GET /api/narrative/detail`** route returns all 14 narratives in the
`WBGNarrative` shape (content from `narratives.json` + the presentation map),
so the frontend never imports the mock for content.

### 11.3 Component fallbacks to remove
`NarrativeSkeletonChoice`, `SkeletonPreviewPanel`, `SkeletonRefinedMessage`
already accept injected skeletons and fall back to `FLOW_SKELETONS` via `??` —
the fallback clause and the `FLOW_SKELETONS` import are removed and the injected
prop becomes required. `InteractiveElementsMessage` has **no** injected prop and
must gain a `skeletons` prop. `NarrativePanel` keeps its injected `guidedSkeleton`
(single) and drops the `FLOW_SKELETONS[flow].find(...)` non-guided branch.
`NarrativeOutput` switches from `findNarrative(slug)` to an injected `narrative`
prop. `app/page.tsx` drops its `refiningChip` `FLOW_SKELETONS` fallback.

### 11.4 Carousel context card
`NarrativeSkeletonChoice` renders an optional single `guidedNarrative` context
card. Because the carousel now shows up to 4 *different* matched narratives,
this single-narrative card no longer applies and is passed `undefined`.

### 11.5 Out-of-scope mock that remains
`extractOutcomeAreaFromPrompt` (pure prompt-keyword parsing, displays nothing)
may continue to be imported. The local `NARRATIVES`/`pickNarratives` in
`ConversationView` (decorative related-narrative cards) and `lib/mockData.ts`
remain, per the approved scope.

### 11.6 No test framework
The target has no test runner. Per-task verification uses `tsc --noEmit`,
`npm run build`, and runtime checks (curl + browser), not unit tests.
