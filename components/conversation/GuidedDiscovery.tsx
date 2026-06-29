
import { useEffect, useState } from "react";
import { extractOutcomeAreaFromPrompt } from "@/lib/narrativeData";
import { fetchNarrativeDetails, type WBGNarrative } from "@/lib/narrativeApi";

export interface NarrativeParams {
  audience: string;
  intent: string;
  regionFocus: string;
  tone: string;
}

interface Props {
  initialPrompt: string;
  onComplete: (slug: string, angle: string, countries: string[], params: NarrativeParams) => void;
  dark?: boolean;
}

const PARAM_OPTIONS = {
  audience: ["Donor government", "NGO partner", "Journalist", "Internal PM"],
  intent: ["Inform", "Advocate", "Evaluate", "Replicate"],
  regionFocus: ["By Region", "All IDA"],
  tone: ["Evidence-led", "Story-led", "Data-dense"],
};

const REGION_OPTIONS = ["SSA", "MENA", "ECA", "LAC"];

function AiAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#0288D1] flex items-center justify-center shrink-0 text-white text-[10px] font-bold select-none">
      SC
    </div>
  );
}

function AiMessage({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <AiAvatar />
      <div
        className={`text-[14px] leading-relaxed narrative-content-enter ${
          dark ? "text-[#CBD5E1]" : "text-gray-700"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="self-end flex items-center gap-3 max-w-[85%] narrative-content-enter">
      <div className="bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl text-[14px]">
        {text}
      </div>
    </div>
  );
}

export default function GuidedDiscovery({ initialPrompt, onComplete, dark = false }: Props) {
  // step: 1=outcome area, 2=summary+explore, 3=parameters, 4=countries, 5=done
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [narratives, setNarratives] = useState<WBGNarrative[]>([]);
  const [narrativesError, setNarrativesError] = useState(false);
  const narrativesLoading = narratives.length === 0 && !narrativesError;
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [params, setParams] = useState<NarrativeParams>({
    audience: "Donor government",
    intent: "Advocate",
    regionFocus: "All IDA",
    tone: "Story-led",
  });
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);
  const [paramsConfirmed, setParamsConfirmed] = useState(false);
  const [showRegionStep, setShowRegionStep] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showStep4, setShowStep4] = useState(false);
  const [showDone, setShowDone] = useState(false);

  // On mount: check if prompt already answers the outcome area question
  useEffect(() => {
    const prefilledSlug = extractOutcomeAreaFromPrompt(initialPrompt);
    if (prefilledSlug) {
      setSelectedSlug(prefilledSlug);
      setStep(2);
      setShowStep2(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchNarrativeDetails().then((list) => {
      if (cancelled) return;
      if (list && list.length) setNarratives(list);
      else setNarrativesError(true);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSelectOutcomeArea = (slug: string) => {
    setSelectedSlug(slug);
    setTimeout(() => { setStep(2); setShowStep2(true); }, 300);
  };

  const handleContinueToParams = () => {
    setTimeout(() => { setStep(3); setShowStep3(true); }, 200);
  };

  const handleConfirmParams = (confirmed: NarrativeParams) => {
    setParams(confirmed);
    setParamsConfirmed(true);
    if (confirmed.regionFocus === "By Region") {
      setTimeout(() => setShowRegionStep(true), 300);
    } else {
      setTimeout(() => { setStep(4); setShowStep4(true); }, 300);
    }
  };

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
    setParams((prev) => ({ ...prev, regionFocus: region }));
    setShowRegionStep(false);
    setTimeout(() => { setStep(4); setShowStep4(true); }, 300);
  };

  const handleSelectCountries = (countries: string[]) => {
    setSelectedCountries(countries);
    setStep(5);
    setShowDone(true);
    setTimeout(() => {
      if (selectedSlug) {
        onComplete(selectedSlug, "results", countries, params);
      }
    }, 1500);
  };

  const selectedNarrative = selectedSlug ? (narratives.find((n) => n.slug === selectedSlug) ?? null) : null;
  const outcomeLabel = selectedNarrative?.shortLabel ?? "";

  const borderBase = dark
    ? "border border-[#334155] hover:border-violet-500"
    : "border border-gray-200 hover:border-violet-300";
  const selectedBorder = dark
    ? "border-violet-400 bg-[rgba(167,139,250,0.12)]"
    : "border-violet-400 bg-violet-50";
  const cardBase = dark ? "bg-[#1E293B]" : "bg-white";

  return (
    <div className="flex flex-col gap-5 narrative-content-enter">

      {/* Step 1: Outcome area (skip display if pre-filled) */}
      {step === 1 && (
        <>
          <AiMessage dark={dark}>
            <p className="mb-4">
              Which WBG outcome area would you like to focus on? Select one below.
            </p>
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
                  <div key={n.slug} className="relative group">
                    <button
                      onClick={() => handleSelectOutcomeArea(n.slug)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${cardBase} ${
                        selectedSlug === n.slug ? selectedBorder : borderBase
                      }`}
                      style={{ fontFamily: "'Open Sans', sans-serif" }}
                    >
                      <span aria-hidden="true" style={{ display: "block", width: 20, height: 20, flexShrink: 0, backgroundImage: `url(${n.iconPath})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
                      <span className={`flex-1 text-[12.5px] font-medium leading-tight ${dark ? "text-[#CBD5E1]" : "text-gray-700"}`}>
                        {n.shortLabel}
                      </span>
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`opacity-0 group-hover:opacity-100 text-[11px] font-medium transition-opacity px-2 py-0.5 rounded-md shrink-0 ${
                          dark
                            ? "text-[#38BDF8] hover:bg-[rgba(56,189,248,0.10)]"
                            : "text-[#0288D1] hover:bg-blue-50"
                        }`}
                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                        aria-label={`Explore ${n.shortLabel} narrative`}
                      >
                        Explore ↗
                      </a>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </AiMessage>
        </>
      )}

      {/* After outcome area selected — show summary + Explore link, then continue */}
      {step >= 2 && selectedSlug && (
        <>
          {/* User bubble: only show if they selected manually (not pre-filled) */}
          {!extractOutcomeAreaFromPrompt(initialPrompt) && (
            <UserBubble text={outcomeLabel} />
          )}

          {showStep2 && selectedNarrative && (
            <AiMessage dark={dark}>
              <div className="flex flex-col gap-4" style={{ maxWidth: 520 }}>
                <p className="leading-relaxed">{selectedNarrative.summary}</p>

                {step === 2 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleContinueToParams}
                      className="px-4 py-2 rounded-lg bg-[#0288D1] text-white text-[12.5px] font-semibold hover:bg-[#0277BD] transition-colors"
                      style={{ fontFamily: "'Open Sans', sans-serif" }}
                    >
                      Build narrative →
                    </button>
                    <a
                      href={selectedNarrative.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-[12.5px] font-medium transition-colors ${
                        dark ? "text-[#38BDF8] hover:text-[#7DD3FC]" : "text-[#0288D1] hover:text-[#0277BD]"
                      }`}
                      style={{ fontFamily: "'Open Sans', sans-serif" }}
                    >
                      Explore full narrative ↗
                    </a>
                  </div>
                )}
              </div>
            </AiMessage>
          )}
        </>
      )}

      {/* Step 3: Parameters */}
      {step >= 3 && (
        <>
          {showStep3 && selectedNarrative && (
            <AiMessage dark={dark}>
              <NarrativeParameters
                defaults={params}
                dark={dark}
                disabled={step !== 3 || paramsConfirmed}
                onConfirm={handleConfirmParams}
                cardBase={cardBase}
                borderBase={borderBase}
                selectedBorder={selectedBorder}
              />
            </AiMessage>
          )}
        </>
      )}

      {/* Region focus step — shown when user picks "By Region" */}
      {(showRegionStep || selectedRegion != null) && (
        <AiMessage dark={dark}>
          <div className="flex flex-col gap-3" style={{ maxWidth: 480 }}>
            <p className={`text-[13.5px] leading-relaxed ${dark ? "text-[#CBD5E1]" : "text-gray-700"}`}>
              Which region would you like to focus on?
            </p>
            <div className="flex flex-wrap gap-2">
              {REGION_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => showRegionStep && handleSelectRegion(r)}
                  disabled={!showRegionStep}
                  className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all border ${
                    selectedRegion === r
                      ? selectedBorder
                      : !showRegionStep
                      ? dark
                        ? "border-[#1E293B] text-[#334155] cursor-default"
                        : "border-gray-100 text-gray-300 cursor-default"
                      : dark
                      ? `${borderBase} text-[#CBD5E1]`
                      : `${borderBase} text-gray-700`
                  } ${cardBase}`}
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </AiMessage>
      )}
      {selectedRegion && <UserBubble text={selectedRegion} />}

      {/* Step 4: Country suggestions — after parameters confirmed */}
      {step >= 4 && selectedNarrative && (
        <>
          {showStep4 && (
            <AiMessage dark={dark}>
              <CountrySuggestion
                narrative={selectedNarrative}
                angle="results"
                regionFocus={params.regionFocus}
                dark={dark}
                disabled={step !== 4}
                onConfirm={handleSelectCountries}
                cardBase={cardBase}
                borderBase={borderBase}
                selectedBorder={selectedBorder}
              />
            </AiMessage>
          )}
        </>
      )}

      {/* Done state */}
      {step === 5 && showDone && (
        <>
          <UserBubble
            text={
              selectedCountries.length === 0
                ? "Global — all countries"
                : selectedCountries.join(", ")
            }
          />
          <AiMessage dark={dark}>
            <span>
              Got it — building a <strong>{params.tone.toLowerCase()}</strong>{" "}
              <strong>{selectedNarrative?.category}</strong> narrative for a{" "}
              <strong>{params.audience.toLowerCase()}</strong> audience...
            </span>
          </AiMessage>
        </>
      )}
    </div>
  );
}

// ─── Country suggestion sub-component ─────────────────────────────────────────
//
// Instead of a blank "pick countries" question, the AI suggests specific
// countries based on the outcome area + angle the user already chose, with a
// contextual reason. The suggestion is pre-selected; the user can confirm,
// swap in other countries, or go global.

// ─── Parameters step — conversational, one question at a time ─────────────────

const PARAM_QUESTIONS: {
  key: keyof NarrativeParams;
  question: string;
  options: string[];
}[] = [
  {
    key: "audience",
    question: "Who's the primary audience for this narrative?",
    options: PARAM_OPTIONS.audience,
  },
  {
    key: "intent",
    question: "What should it move readers to do?",
    options: PARAM_OPTIONS.intent,
  },
  {
    key: "regionFocus",
    question: "Any specific regional focus, or covering all IDA countries?",
    options: PARAM_OPTIONS.regionFocus,
  },
  {
    key: "tone",
    question: "What tone should it take?",
    options: PARAM_OPTIONS.tone,
  },
];

function NarrativeParameters({
  defaults,
  dark,
  disabled,
  onConfirm,
  cardBase,
  borderBase,
  selectedBorder,
}: {
  defaults: NarrativeParams;
  dark?: boolean;
  disabled: boolean;
  onConfirm: (params: NarrativeParams) => void;
  cardBase: string;
  borderBase: string;
  selectedBorder: string;
}) {
  // Which param question we're currently on (0–3)
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<NarrativeParams>>({});

  const pick = (key: keyof NarrativeParams, val: string) => {
    if (disabled) return;
    const next = { ...answers, [key]: val };
    setAnswers(next);
    if (qIndex < PARAM_QUESTIONS.length - 1) {
      setTimeout(() => setQIndex((i) => i + 1), 280);
    } else {
      // All answered — build final params and confirm
      const final: NarrativeParams = {
        audience: next.audience ?? defaults.audience,
        intent: next.intent ?? defaults.intent,
        regionFocus: next.regionFocus ?? defaults.regionFocus,
        tone: next.tone ?? defaults.tone,
      };
      setTimeout(() => onConfirm(final), 400);
    }
  };

  const textCls = dark ? "text-[#CBD5E1]" : "text-gray-700";
  const answeredTextCls = dark ? "text-[#64748B]" : "text-gray-400";

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 480 }}>
      {PARAM_QUESTIONS.map((q, i) => {
        const answered = answers[q.key];
        const isActive = i === qIndex && !disabled;
        const isPast = i < qIndex || disabled;

        if (i > qIndex) return null; // not yet revealed

        return (
          <div key={q.key} className="flex flex-col gap-2 narrative-content-enter">
            {/* Question */}
            <p className={`text-[13.5px] leading-relaxed ${isPast ? answeredTextCls : textCls}`}>
              {q.question}
            </p>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => isActive && pick(q.key, opt)}
                  disabled={!isActive}
                  className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all border ${
                    answered === opt
                      ? selectedBorder
                      : !isActive
                      ? dark
                        ? "border-[#1E293B] text-[#334155] cursor-default"
                        : "border-gray-100 text-gray-300 cursor-default"
                      : dark
                      ? `${borderBase} text-[#CBD5E1]`
                      : `${borderBase} text-gray-700`
                  } ${cardBase}`}
                  style={{ fontFamily: "'Open Sans', sans-serif" }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Country suggestion sub-component ─────────────────────────────────────────

function getSuggestion(narrative: WBGNarrative, angle: string): {
  suggested: string[];
  reason: string;
} {
  const c = narrative.countries;
  const stat = narrative.topStats[0];

  // Each angle points to a different pair of countries with a tailored reason.
  if (angle === "results") {
    return {
      suggested: [c[0], c[1]].filter(Boolean),
      reason: `These have the most documented results for a ${narrative.shortLabel} story — ${stat.value} ${stat.label.toLowerCase()}.`,
    };
  }
  if (angle === "challenges") {
    // Spread geography: first + last country for maximum contrast
    const last = c[c.length - 1];
    return {
      suggested: [c[0], last !== c[0] ? last : c[1]].filter(Boolean),
      reason: `These cases show the sharpest contrast in starting conditions — useful for grounding the challenge before the WBG intervention.`,
    };
  }
  if (angle === "lessons") {
    // Second + third countries tend to be the replication / scale cases
    return {
      suggested: [c[1] ?? c[0], c[2] ?? c[0]].filter(Boolean),
      reason: `These are where the approach has been adapted and scaled — ideal for surfacing transferable lessons.`,
    };
  }
  return {
    suggested: [c[0], c[1]].filter(Boolean),
    reason: `These are the primary documented cases for this narrative.`,
  };
}

// Region → rough country keyword mapping for filtering suggestions
const REGION_KEYWORDS: Record<string, string[]> = {
  SSA: ["zambia", "benin", "kenya", "mali", "ghana", "ethiopia", "tanzania", "rwanda", "malawi", "west africa", "guinea-bissau", "côte d'ivoire", "ivory coast", "nigeria", "mozambique", "cameroon", "senegal", "niger", "burkina"],
  MENA: ["egypt", "jordan", "morocco", "iraq", "yemen", "tunisia", "lebanon", "afghanistan", "somalia"],
  ECA: ["ukraine", "armenia", "georgia", "kazakhstan", "uzbekistan", "turkey", "türkiye"],
  LAC: ["brazil", "colombia", "ecuador", "argentina", "west bank", "bolivia", "haiti"],
  "All IDA": [],
};

function filterCountriesByRegion(countries: string[], regionFocus: string): string[] {
  if (regionFocus === "All IDA" || !REGION_KEYWORDS[regionFocus]) return countries;
  const keywords = REGION_KEYWORDS[regionFocus];
  const filtered = countries.filter((c) =>
    keywords.some((kw) => c.toLowerCase().includes(kw))
  );
  return filtered.length > 0 ? filtered : countries;
}

function CountrySuggestion({
  narrative,
  angle,
  regionFocus = "All IDA",
  dark,
  disabled,
  onConfirm,
  cardBase,
  borderBase,
  selectedBorder,
}: {
  narrative: WBGNarrative;
  angle: string;
  regionFocus?: string;
  dark?: boolean;
  disabled: boolean;
  onConfirm: (countries: string[]) => void;
  cardBase: string;
  borderBase: string;
  selectedBorder: string;
}) {
  const regionFiltered = filterCountriesByRegion(narrative.countries, regionFocus);
  const { suggested, reason } = getSuggestion({ ...narrative, countries: regionFiltered }, angle);
  const [picked, setPicked] = useState<Set<string>>(new Set(suggested));

  const toggle = (c: string) => {
    if (disabled) return;
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const visibleCountries = narrative.countries;

  return (
    <div className="flex flex-col gap-3" style={{ maxWidth: 480 }}>
      {/* Contextual suggestion message */}
      <p className="text-[13.5px] leading-relaxed">
        For this angle, I&apos;d suggest{" "}
        {suggested.map((c, i) => (
          <span key={c}>
            {i > 0 && i < suggested.length - 1 && ", "}
            {i > 0 && i === suggested.length - 1 && " and "}
            <strong>{c}</strong>
          </span>
        ))}
        {" "}— {reason}
      </p>

      {/* Country chips — suggestions pre-selected */}
      <div className="flex flex-wrap gap-2">
        {visibleCountries.map((c) => (
          <button
            key={c}
            onClick={() => toggle(c)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all border ${
              picked.has(c)
                ? selectedBorder
                : disabled
                ? dark
                  ? "border-[#334155] text-[#94A3B8] cursor-default"
                  : "border-gray-200 text-gray-400 cursor-default"
                : dark
                ? "border-[#334155] text-[#CBD5E1] hover:border-violet-500"
                : "border-gray-200 text-gray-700 hover:border-violet-300"
            } ${cardBase}`}
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Actions */}
      {!disabled && (
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => onConfirm(Array.from(picked))}
            className="px-4 py-2 rounded-lg bg-[#0288D1] text-white text-[12.5px] font-semibold hover:bg-[#0277BD] transition-colors"
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            {picked.size > 0 ? `Use ${picked.size === suggested.length && [...picked].every(p => suggested.includes(p)) ? "suggested" : "selected"}` : "Confirm"}
          </button>
          <button
            onClick={() => onConfirm([])}
            className={`px-4 py-2 rounded-lg text-[12.5px] font-medium transition-colors border ${
              dark
                ? "border-[#334155] text-[#94A3B8] hover:border-violet-500 hover:text-[#CBD5E1]"
                : "border-gray-200 text-gray-500 hover:border-violet-300 hover:text-gray-700"
            } ${cardBase}`}
            style={{ fontFamily: "'Open Sans', sans-serif" }}
          >
            Use all countries
          </button>
        </div>
      )}
    </div>
  );
}
