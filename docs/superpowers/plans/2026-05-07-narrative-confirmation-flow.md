# Narrative Confirmation Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the instant "Create narrative → panel opens" with a 3-block conversational confirmation flow: AI planning animation → skeleton outline → "Got it" confirmation, before the NarrativePanel slides in.

**Architecture:** `page.tsx` owns `narrativePhase: NarrativePhase` replacing the `narrativeGenerating` boolean. It threads the phase to `PromptBar` (chip rendering) and `ConversationView` (new AI message blocks). `ConversationView` fires `onNarrativePlanningComplete` when the step animation ends, advancing the phase. On "Yes", `page.tsx` saves the artefact, waits 500ms, then opens the panel.

**Tech Stack:** React 18 (`useState`, `useEffect`, `useRef`), TypeScript, Tailwind CSS, `@tabler/icons-react`. No new dependencies.

---

## File map

| File | Change |
|---|---|
| `app/page.tsx` | Replace `narrativeGenerating` boolean with `NarrativePhase` state; update `handleCreateNarrative`; add `handleNarrativePlanningComplete`, `handleNarrativeConfirm`, `handleNarrativeMakeChanges`; update props on `PromptBar`, `ConversationView`, `NarrativePanel` |
| `components/PromptBar.tsx` | Add `narrativePhase`, `onNarrativeConfirm`, `onNarrativeMakeChanges` props; rewrite chip area to render "Yes / Make changes" in `skeleton-ready` phase |
| `components/conversation/ConversationView.tsx` | Add `NarrativePhase` type + `NARRATIVE_PLAN_STEPS` data; add `NarrativePlanningMessage`, `NarrativeSkeletonMessage`, `NarrativeGeneratingMessage` components; add `narrativePhase` + `onNarrativePlanningComplete` to Props; wire blocks into render |

---

### Task 1: Replace `narrativeGenerating` with `NarrativePhase` in `page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the `NarrativePhase` type and swap the state**

Find (around line 182):
```ts
const [narrativeGenerating, setNarrativeGenerating] = useState(false);
```

Replace with:
```ts
type NarrativePhase = "idle" | "planning" | "skeleton-ready" | "generating";
const [narrativePhase, setNarrativePhase] = useState<NarrativePhase>("idle");
```

- [ ] **Step 2: Rewrite `handleCreateNarrative`**

Find the entire `handleCreateNarrative` function (around line 257–286) and replace it:

```ts
const handleCreateNarrative = () => {
  if (!currentConversationId) return;
  // One narrative per conversation — if one already exists, just re-open the panel.
  const existing = currentConversation?.artefacts.find((a) => a.kind === "narrative");
  if (existing) {
    setRightPane("narrative");
    return;
  }
  setNarrativePhase("planning");
};
```

- [ ] **Step 3: Add three new handlers directly after `handleCreateNarrative`**

```ts
const handleNarrativePlanningComplete = () => {
  setNarrativePhase("skeleton-ready");
};

const handleNarrativeConfirm = () => {
  if (!currentConversationId) return;
  setNarrativePhase("generating");
  // Save the artefact now so the panel has it when it opens.
  const a: Artefact = {
    id: Date.now().toString(),
    kind: "narrative",
    title: deriveArtefactTitle(conversationPrompt) || "Untitled narrative",
    prompt: conversationPrompt,
    createdAt: Date.now(),
  };
  setConversations((prev) =>
    prev.map((c) =>
      c.id === currentConversationId ? { ...c, artefacts: [...c.artefacts, a] } : c
    )
  );
  // Brief pause so Block 3 "Got it…" is visible before the panel slides in.
  window.setTimeout(() => {
    setRightPane("narrative");
    setNarrativePhase("idle");
  }, 500);
};

const handleNarrativeMakeChanges = () => {
  setNarrativePhase("idle");
};
```

- [ ] **Step 4: Update `PromptBar` props**

Find the `<PromptBar` JSX (around line 434). Make two changes:

Change `showCreateChip` to:
```tsx
showCreateChip={
  view === "conversation" &&
  !currentArtefacts.some((a) => a.kind === "narrative") &&
  (narrativePhase === "idle" || narrativePhase === "skeleton-ready")
}
```

Add three new props after `showCreateChip`:
```tsx
narrativePhase={narrativePhase}
onNarrativeConfirm={handleNarrativeConfirm}
onNarrativeMakeChanges={handleNarrativeMakeChanges}
```

- [ ] **Step 5: Update `NarrativePanel` and `ConversationView` props**

In `<NarrativePanel` (around line 461), change:
```tsx
loading={narrativeGenerating}
```
to:
```tsx
loading={narrativePhase === "generating"}
```

In `<ConversationView` (around line 512), add two new props:
```tsx
narrativePhase={narrativePhase}
onNarrativePlanningComplete={handleNarrativePlanningComplete}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors only about the new props not yet accepted by `PromptBar` and `ConversationView` — no errors within `page.tsx` itself.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat: replace narrativeGenerating bool with NarrativePhase state machine"
```

---

### Task 2: Update `PromptBar` chip area

**Files:**
- Modify: `components/PromptBar.tsx`

- [ ] **Step 1: Add `NarrativePhase` type at the top of the file**

After the last import statement, add:

```ts
type NarrativePhase = "idle" | "planning" | "skeleton-ready" | "generating";
```

- [ ] **Step 2: Add three new props to the `Props` interface**

Find the `Props` interface (around line 20). After `showCreateChip?: boolean;`, add:

```ts
/** Current phase of the narrative creation flow — controls which chips to show. */
narrativePhase?: NarrativePhase;
/** Fires when the user clicks "Yes, create narrative" in skeleton-ready phase. */
onNarrativeConfirm?: () => void;
/** Fires when the user clicks "Make changes" in skeleton-ready phase. */
onNarrativeMakeChanges?: () => void;
```

- [ ] **Step 3: Destructure the new props**

Find the function destructuring (around line 48). After `showCreateChip = false,` add:

```ts
narrativePhase = "idle" as NarrativePhase,
onNarrativeConfirm,
onNarrativeMakeChanges,
```

- [ ] **Step 4: Check whether `IconCheck` is already imported**

```bash
grep "IconCheck" /Users/ruby.tan/wbg-scorecard-2/components/PromptBar.tsx
```

If not present, add `IconCheck` to the `@tabler/icons-react` import at the top of the file.

- [ ] **Step 5: Replace the chip render block**

Find the entire `{/* "Create narrative" chip */}` block (around lines 170–192):

```tsx
{/* "Create narrative" chip */}
{isBottom && showCreateChip && (
  <div
    className={`fixed flex justify-end ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
    style={{
      left: leftCss,
      transform: "translateX(-50%)",
      top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 36}px)`,
      width: widthCss,
      zIndex: 50,
      transitionTimingFunction: suppressTransition ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
    }}
  >
    <button
      type="button"
      onClick={() => onCreateNarrative?.()}
      className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-colors"
    >
      <IconNotebook size={12} className="opacity-60" />
      Create narrative
    </button>
  </div>
)}
```

Replace with:

```tsx
{/* Narrative chips — "Create narrative" when idle, "Yes / Make changes" when skeleton-ready */}
{isBottom && showCreateChip && (
  <div
    className={`fixed flex justify-end gap-2 ${suppressTransition ? "" : "transition-[left,width] duration-[900ms]"}`}
    style={{
      left: leftCss,
      transform: "translateX(-50%)",
      top: `calc(100vh - ${PILL_HEIGHT + BOTTOM_GAP + 36}px)`,
      width: widthCss,
      zIndex: 50,
      transitionTimingFunction: suppressTransition ? undefined : "cubic-bezier(0.22, 1, 0.36, 1)",
    }}
  >
    {narrativePhase === "skeleton-ready" ? (
      <>
        <button
          type="button"
          onClick={() => onNarrativeMakeChanges?.()}
          className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-colors"
        >
          Make changes
        </button>
        <button
          type="button"
          onClick={() => onNarrativeConfirm?.()}
          className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-white bg-blue-600 border border-blue-600 rounded-full shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-colors"
        >
          <IconCheck size={12} />
          Yes, create narrative
        </button>
      </>
    ) : (
      <button
        type="button"
        onClick={() => onCreateNarrative?.()}
        className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-colors"
      >
        <IconNotebook size={12} className="opacity-60" />
        Create narrative
      </button>
    )}
  </div>
)}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit 2>&1 | head -40
```

Expected: `PromptBar` errors resolved; remaining errors only in `ConversationView`.

- [ ] **Step 7: Commit**

```bash
git add components/PromptBar.tsx
git commit -m "feat: update PromptBar chips for narrative confirmation flow"
```

---

### Task 3: Add `NarrativePlanningMessage` to `ConversationView`

**Files:**
- Modify: `components/conversation/ConversationView.tsx`

- [ ] **Step 1: Add `NarrativePhase` type and `NARRATIVE_PLAN_STEPS` data**

Find the `THOUGHT_STEPS_HEALTH` array and the `ThoughtProcess` function (around line 617). Just before `ThoughtProcess`, add:

```ts
type NarrativePhase = "idle" | "planning" | "skeleton-ready" | "generating";

const NARRATIVE_PLAN_STEPS: ThoughtStep[] = [
  { type: "search",  text: "Reading conversation context",          detail: "africa-poverty signal · 1 query" },
  { type: "search",  text: "Loading indicator catalogue",           detail: "IDA_Scorecard_Metadata_1.xlsx · 21 Results indicators" },
  { type: "filter",  text: "Matching 6 Results indicators",         detail: "SOC_SAF · EDU_SUPP · HEA_SERV · RESI_CLIM · ELC_ACCS · EXT_POOR_FCS" },
  { type: "compute", text: "Filtering to AFE + AFW · FY25 cut-off", detail: "Time_Period == 2025-06-30 · Double_Counting_Flag ≠ Y" },
  { type: "filter",  text: "Pairing 3 Client Context series",       detail: "CSC_CLI_EXT_POOR_FCS · SE_LPV_PRIM · EG_ELC_ACCS_ZS" },
  { type: "analyze", text: "Structuring narrative sections",        detail: "Context · Intervention · Evidence · Impact" },
];
```

- [ ] **Step 2: Add `NarrativePlanningMessage` component**

After the closing `}` of `ThoughtProcess` (around line 694), add:

```tsx
function NarrativePlanningMessage({
  animate,
  onComplete,
}: {
  animate: boolean;
  onComplete?: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(() =>
    animate ? 0 : NARRATIVE_PLAN_STEPS.length
  );
  const [open, setOpen] = useState(animate);
  const done = visibleCount >= NARRATIVE_PLAN_STEPS.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reveal one step every 400ms while animating
  useEffect(() => {
    if (!animate || done) return;
    const t = setTimeout(() => setVisibleCount((n) => n + 1), 400);
    return () => clearTimeout(t);
  }, [animate, visibleCount, done]);

  // Auto-collapse and fire callback once all steps are visible
  useEffect(() => {
    if (!animate || !done) return;
    const t = setTimeout(() => {
      setOpen(false);
      onCompleteRef.current?.();
    }, 400);
    return () => clearTimeout(t);
  }, [animate, done]);

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0">
        <div className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
          <button
            onClick={() => done && setOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            aria-expanded={open}
          >
            <span className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0">
              <IconSparkles
                size={13}
                className={done ? "text-blue-500" : "text-blue-500 animate-pulse"}
              />
            </span>
            <span className="text-[13px] font-semibold text-gray-700">Narrative planning</span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-500 font-mono">
              {NARRATIVE_PLAN_STEPS.length} steps
            </span>
            {done ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                <IconCheck size={10} stroke={3} />
                Complete
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Running
              </span>
            )}
            {done && (
              <IconChevronDown
                size={14}
                className={`text-gray-400 transition-transform ml-1 ${open ? "rotate-180" : ""}`}
              />
            )}
          </button>

          {open && (
            <div className="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
              <ol className="relative pl-7">
                <span
                  aria-hidden
                  className="absolute top-3 bottom-3 w-px bg-gray-200"
                  style={{ left: 12 }}
                />
                {NARRATIVE_PLAN_STEPS.map((step, i) => {
                  const meta = THOUGHT_STEP_META[step.type];
                  const Icon = meta.icon;
                  const visible = i < visibleCount;
                  return (
                    <li
                      key={i}
                      className={`relative py-2 first:pt-0 last:pb-0 transition-opacity duration-300 ${
                        visible ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <span
                        className="absolute -left-7 top-2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                        style={{ background: meta.tint }}
                      >
                        <Icon size={11} style={{ color: meta.color }} />
                      </span>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[9.5px] font-semibold uppercase tracking-wider px-1 py-px rounded"
                          style={{ background: meta.tint, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Step {i + 1}</span>
                      </div>
                      <div className="text-[12.5px] text-gray-800 leading-snug">{step.text}</div>
                      {step.detail && visible && (
                        <div className="mt-1 text-[10.5px] text-gray-500 font-mono bg-gray-50 border border-gray-100 rounded px-2 py-1 inline-block">
                          → {step.detail}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors from `NarrativePlanningMessage`.

- [ ] **Step 4: Commit**

```bash
git add components/conversation/ConversationView.tsx
git commit -m "feat: add NarrativePlanningMessage with animated step reveal"
```

---

### Task 4: Add `NarrativeSkeletonMessage` and `NarrativeGeneratingMessage`

**Files:**
- Modify: `components/conversation/ConversationView.tsx`

- [ ] **Step 1: Add `NarrativeSkeletonMessage` after `NarrativePlanningMessage`'s closing `}`**

```tsx
function NarrativeSkeletonMessage() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <p className="text-[13.5px] text-gray-700 leading-relaxed">
          Here&rsquo;s the outline for your narrative. Let me know if this looks right:
        </p>

        <div className="flex flex-col gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          {/* Context */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Context
            </span>
            <p className="text-[13px] text-gray-800 leading-relaxed">
              Sub-Saharan Africa remains the epicentre of extreme poverty. FCS-country poverty sits
              at 30.4%{" "}
              <code className="text-[11.5px] font-mono bg-gray-100 px-1 py-px rounded text-gray-600">
                CSC_CLI_EXT_POOR_FCS
              </code>
              , 70% learning poverty persists in primary schools{" "}
              <code className="text-[11.5px] font-mono bg-gray-100 px-1 py-px rounded text-gray-600">
                SE_LPV_PRIM
              </code>
              , and 56 economies collect less than 15% tax-to-GDP — limiting fiscal space for
              homegrown investment.
            </p>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Intervention */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Intervention
            </span>
            <p className="text-[13px] text-gray-800 leading-relaxed">
              FY25 IDA operations targeted People-pillar programs across AFE + AFW, with safety
              nets, education access, and primary health care as the primary delivery channels.
              Climate resilience and electricity expansion{" "}
              <code className="text-[11.5px] font-mono bg-gray-100 px-1 py-px rounded text-gray-600">
                EG_ELC_ACCS_ZS
              </code>{" "}
              addressed the Planet and Infrastructure pillars.
            </p>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Evidence */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Evidence
            </span>
            <p className="text-[13px] text-gray-800 leading-relaxed mb-1.5">
              Key FY25 results vs. pipeline targets:
            </p>
            <ul className="flex flex-col gap-1.5 text-[12.5px] text-gray-700 pl-1">
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-[5px]" />
                <span>
                  Social safety nets: 244M / ~313M{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_SOC_SAF_PROG
                  </code>
                </span>
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-[5px]" />
                <span>
                  Students supported: 325M / ~452M{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_EDU_SUPP
                  </code>
                </span>
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-[5px]" />
                <span>
                  Health services: 370M / ~425M{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_HEA_SERV
                  </code>
                </span>
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0 mt-[5px]" />
                <span>
                  Climate resilience: 244M / ~425M — behind target{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_RESI_CLIM_RISK
                  </code>
                </span>
              </li>
              <li className="flex items-baseline gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-400 shrink-0 mt-[5px]" />
                <span>
                  Electricity access: 215M / 576M — significantly behind target{" "}
                  <code className="text-[11px] font-mono bg-gray-100 px-1 py-px rounded text-gray-500">
                    CSC_RES_ELC_ACCS
                  </code>
                </span>
              </li>
            </ul>
          </div>

          <div className="h-px bg-gray-200" />

          {/* Impact */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Impact
            </span>
            <p className="text-[13px] text-gray-800 leading-relaxed">
              The People vertical leads at 68% achievement. FCS-country health efficiency is 2.3×
              vs. non-FCS IDA peers. Infrastructure at 41% flags FY26 priorities, with electricity
              access warranting a dedicated funding push in AFE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add `NarrativeGeneratingMessage` directly after `NarrativeSkeletonMessage`'s closing `}`**

```tsx
function NarrativeGeneratingMessage() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[11px] font-bold">
        SC
      </div>
      <p className="text-[13.5px] text-gray-700 leading-relaxed pt-1">
        Got it — generating the first draft of your narrative now.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit 2>&1 | head -40
```

Expected: no errors from the two new components.

- [ ] **Step 4: Commit**

```bash
git add components/conversation/ConversationView.tsx
git commit -m "feat: add NarrativeSkeletonMessage and NarrativeGeneratingMessage components"
```

---

### Task 5: Wire blocks into `ConversationView` render and update Props

**Files:**
- Modify: `components/conversation/ConversationView.tsx`

- [ ] **Step 1: Add new props to the `Props` interface**

Find the `Props` interface (around line 47). After `onTitleChange?: (t: string) => void;`, add:

```ts
/** Current narrative creation phase — drives which AI message blocks to render. */
narrativePhase?: NarrativePhase;
/** Fires when the NarrativePlanningMessage step animation completes. */
onNarrativePlanningComplete?: () => void;
```

- [ ] **Step 2: Destructure the new props in `ConversationView`**

Find the function signature (around line 784). After `embedded,` add:

```ts
narrativePhase = "idle" as NarrativePhase,
onNarrativePlanningComplete,
```

- [ ] **Step 3: Add visibility flags**

Inside `ConversationView`, immediately after:
```ts
const narratives = useMemo(() => pickNarratives(prompt, 4), [prompt]);
```
add:
```ts
const narrativeArtefact = artefacts.find((a) => a.kind === "narrative");
// Keep blocks visible after confirmation as permanent chat history.
const showBlock1 = narrativePhase !== "idle" || !!narrativeArtefact;
const showBlock2 =
  narrativePhase === "skeleton-ready" ||
  narrativePhase === "generating" ||
  !!narrativeArtefact;
const showBlock3 = narrativePhase === "generating" || !!narrativeArtefact;
```

- [ ] **Step 4: Render the three blocks in the conversation body**

Find the `<div className="h-8" />` spacer at the bottom of the scrollable content (around line 1000). Replace it with:

```tsx
{/* ── Narrative confirmation flow ── */}
{showBlock1 && (
  <NarrativePlanningMessage
    animate={narrativePhase === "planning"}
    onComplete={onNarrativePlanningComplete}
  />
)}
{showBlock2 && <NarrativeSkeletonMessage />}
{showBlock3 && <NarrativeGeneratingMessage />}

<div className="h-8" />
```

- [ ] **Step 5: Verify TypeScript compiles clean**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors.

- [ ] **Step 6: Start dev server and manually test the happy path**

```bash
cd /Users/ruby.tan/wbg-scorecard-2 && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and follow this checklist:

1. Enter a query (use the africa-poverty flow, e.g. "extreme poverty in Africa") → conversation view opens
2. Click **"Create narrative"** chip → chip disappears; Block 1 planning animation begins (6 steps reveal one by one ~400ms apart)
3. After ~2.8s: Block 1 auto-collapses to "✓ Narrative planning · 6 steps · Complete"; Block 2 skeleton narrative appears with 4 sections; chips change to **"Make changes"** + **"Yes, create narrative"**
4. Click **"Yes, create narrative"** → Block 3 "Got it — generating the first draft…" appears; chips disappear; 500ms later NarrativePanel slides in with `loading=true`
5. After ~4s: NarrativePanel content loads; all 3 blocks remain visible in conversation as static history
6. Close panel → reopen via Files icon → panel re-opens directly (no phase re-run)
7. Reload and re-enter the query → click **"Create narrative"** → click **"Make changes"** → chips revert to single "Create narrative" chip; all blocks removed

- [ ] **Step 7: Commit**

```bash
git add components/conversation/ConversationView.tsx
git commit -m "feat: wire narrative confirmation flow into ConversationView render"
```
