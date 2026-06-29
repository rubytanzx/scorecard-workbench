
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconX,
  IconShare,
  IconChartBar,
  IconFiles,
  IconNotebook,
} from "@tabler/icons-react";
import { InfographicBody } from "./InfographicPanel";
import InfographicPanel from "./InfographicPanel";
import ViewerChat from "./ViewerChat";
import NarrativePanel from "./NarrativePanel";

interface Props {
  prompt: string;
  title: string;
  /** Person who shared the link — shown in the header chip. */
  sharedBy?: string;
  onClose: () => void;
}

// Layout constants — kept here so the transition math stays in one place.
const HEADER_H = 60;
const CHAT_RAIL_W = 380;
const NARRATIVE_W = 480;

// In data mode the right pane rotates between two artefacts. The two are
// kept as discrete objects (rather than threaded through the conversation
// state) because this is a UX prototype — clarity beats normalization.
type DataPane = "narrative" | "infographic" | null;

interface Artefact {
  id: string;
  kind: "narrative" | "infographic";
  title: string;
  createdAt: number;
}

export default function ViewerView({
  prompt,
  title,
  sharedBy = "Ruby Tan",
  onClose,
}: Props) {
  // ── Mode + right-pane state ──
  const [mode, setMode] = useState<"viewer" | "data">("viewer");
  const isViewer = mode === "viewer";
  // Which artefact panel is open in data mode. Defaults to narrative when
  // the user first crosses over from viewer mode.
  const [dataPane, setDataPane] = useState<DataPane>("narrative");
  // Shared right-pane width — drag-resizing one panel persists when the
  // user swaps to the other artefact.
  const [paneWidth, setPaneWidth] = useState(NARRATIVE_W);
  const [paneDragging, setPaneDragging] = useState(false);

  // ── Files dropdown state ──
  const [filesOpen, setFilesOpen] = useState(false);
  const filesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filesOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (filesRef.current && !filesRef.current.contains(e.target as Node)) {
        setFilesOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filesOpen]);

  // Synthetic artefacts attached to this shared link. Two objects rather
  // than a normalized list — the prototype doesn't need persistence.
  const artefacts: Artefact[] = useMemo(
    () => [
      { id: "art-insight", kind: "infographic", title: "Infographic", createdAt: Date.now() - 24 * 60 * 60 * 1000 },
      { id: "art-narr",    kind: "narrative",        title: "Narrative",       createdAt: Date.now() - 24 * 60 * 60 * 1000 },
    ],
    []
  );

  // Visible right-pane width: 0 in viewer mode (the chat sits in the rail
  // instead) or when no artefact is open in data mode; otherwise the
  // resizable paneWidth.
  const visibleRightW = (!isViewer && dataPane !== null) ? paneWidth : 0;

  // Suppress 500ms tweening during pane drag so the layout follows the cursor.
  const lockedTransition = paneDragging ? "" : "transition-all duration-500 ease-in-out";
  const headerTransition = paneDragging ? "" : "transition-[right] duration-500 ease-in-out";

  return (
    <div className="relative h-screen overflow-hidden bg-white view-enter">
      {/* ── Header ─────────────────────────────────────────────────────
          Right edge follows whichever artefact panel is open so the
          centered title is centered against the *visible* canvas
          rather than the full viewport. */}
      <header
        className={`absolute top-0 left-0 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 border-b border-gray-100 bg-white z-50 ${headerTransition}`}
        style={{ height: HEADER_H, right: isViewer ? 0 : visibleRightW }}
      >
        <div className="justify-self-start flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <IconChartBar size={14} className="text-emerald-600" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 leading-none">
              Shared infographic
            </span>
            <span className="text-[11px] text-gray-500 truncate">
              from {sharedBy}
            </span>
          </div>
        </div>

        <h1 className="justify-self-center text-[15px] font-semibold text-gray-900 truncate max-w-[420px]">
          {title}
        </h1>

        <div className="justify-self-end flex items-center gap-2 shrink-0">
          {/* Files icon — only meaningful once the user has crossed into
              data mode, so it surfaces the same way the conversation
              view's Files icon does. The path *into* data mode runs
              through the chat itself (the narrative-built card's Open
              button). */}
          {!isViewer && (
            <div ref={filesRef} className="relative">
              <button
                onClick={() => setFilesOpen((v) => !v)}
                aria-label={`Artefacts (${artefacts.length})`}
                className={`relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ${
                  filesOpen ? "text-gray-900 bg-gray-100" : "text-gray-500"
                }`}
              >
                <IconFiles size={16} />
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-semibold flex items-center justify-center">
                  {artefacts.length}
                </span>
              </button>

              {filesOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Artefacts
                    </div>
                  </div>
                  <ul>
                    {artefacts.map((a) => {
                      const isInsight = a.kind === "infographic";
                      const Icon = isInsight ? IconChartBar : IconNotebook;
                      const active = dataPane === a.kind;
                      return (
                        <li key={a.id}>
                          <button
                            onClick={() => { setDataPane(a.kind); setFilesOpen(false); }}
                            className={`w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors border-b border-gray-50 last:border-b-0 ${
                              active ? "bg-blue-50/50" : "hover:bg-gray-50"
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                              isInsight ? "bg-emerald-50" : "bg-blue-50"
                            }`}>
                              <Icon size={13} className={isInsight ? "text-emerald-600" : "text-blue-600"} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12.5px] font-medium text-gray-900 truncate">{a.title}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] font-semibold uppercase tracking-wider px-1 py-px rounded ${
                                  isInsight ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                                }`}>
                                  {isInsight ? "Insight" : "Narrative"}
                                </span>
                                {active && (
                                  <span className="text-[10px] text-gray-500">· open</span>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Share"
          >
            <IconShare size={15} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close viewer"
          >
            <IconX size={16} />
          </button>
        </div>
      </header>

      {/* ── Body container ────────────────────────────────────────────
          Three layers, absolutely positioned and animated together.
          Mode switch (viewer ↔ data) runs a single 500ms ease-in-out:
          infographic exits left, the chat morphs from right rail
          into main canvas while its content cross-fades, and the
          narrative panel slides in from the right. Within data mode,
          the right pane (narrative ↔ infographic) swaps via each
          panel's own internal translateX. */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{ top: HEADER_H }}
      >
        {/* Infographic — left/main canvas in viewer mode only */}
        <div
          className={`absolute top-0 bottom-0 left-0 overflow-hidden border-r border-gray-100 ${lockedTransition}`}
          style={{
            right: isViewer ? CHAT_RAIL_W : 0,
            transform: isViewer ? "translateX(0)" : "translateX(-100%)",
            opacity: isViewer ? 1 : 0,
          }}
          aria-hidden={!isViewer}
        >
          <div className="h-full overflow-y-auto scrollbar-auto-hide">
            <div className="max-w-[640px] mx-auto">
              <InfographicBody prompt={prompt} />
            </div>
          </div>
        </div>

        {/* Chat container — morphs from right rail (viewer) to main
            canvas (data). Width tracks the right pane: when no
            artefact is open in data mode, the chat fills the canvas.
            ViewerChat persists across the mode change so the
            conversation history isn't lost — the only thing that
            animates is the container's position + width. */}
        <div
          className={`absolute top-0 bottom-0 border-l border-gray-100 ${lockedTransition}`}
          style={{
            right: isViewer ? 0 : visibleRightW,
            width: isViewer ? CHAT_RAIL_W : `calc(100% - ${visibleRightW}px)`,
          }}
        >
          <ViewerChat
            prompt={prompt}
            onOpenNarrative={() => { setMode("data"); setDataPane("narrative"); }}
          />
        </div>

        {/* Right rail in data mode — both panels rendered, only the
            active one slid into view via its own translateX. They
            share width state so a drag-resize on one persists when
            the user swaps artefacts. */}
        <NarrativePanel
          open={!isViewer && dataPane === "narrative"}
          prompt={prompt}
          onClose={() => setDataPane(null)}
          width={paneWidth}
          onResize={(w, dragging) => {
            setPaneWidth(w);
            setPaneDragging(dragging);
          }}
        />
        <InfographicPanel
          open={!isViewer && dataPane === "infographic"}
          prompt={prompt}
          onClose={() => setDataPane(null)}
          onOpenNarrative={() => setDataPane("narrative")}
          width={paneWidth}
          onResize={(w, dragging) => {
            setPaneWidth(w);
            setPaneDragging(dragging);
          }}
        />
      </div>
    </div>
  );
}
