
import {
  IconArrowLeft,
  IconMessageCircle,
  IconNotebook,
  IconChevronRight,
} from "@tabler/icons-react";

export interface WorkspaceConversation {
  id: string;
  title: string;
  prompt: string;
  createdAt: number;
  artefactCount: number;
}

interface Props {
  items: WorkspaceConversation[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function WorkspaceView({ items, onSelect, onClose }: Props) {
  return (
    <div className="cv-dark flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <button
          onClick={onClose}
          aria-label="Back"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <IconArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-semibold text-gray-900">My workspace</h1>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium">
          {items.length} conversation{items.length === 1 ? "" : "s"}
        </span>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[920px] mx-auto px-6 py-8">
          {items.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <IconMessageCircle size={24} className="text-gray-400" />
              </div>
              <div className="text-[15px] font-semibold text-gray-900 mb-1">No conversations yet</div>
              <div className="text-[13px] text-gray-500">
                Ask a question on the home page to start your first conversation.
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {[...items].reverse().map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c.id)}
                    className="w-full group flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm text-left transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <IconMessageCircle size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-[14.5px] font-semibold text-gray-900 truncate">
                          {c.title}
                        </h3>
                        <span className="shrink-0 text-[11px] text-gray-400">
                          {new Date(c.createdAt).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-gray-500 line-clamp-2">
                        {c.prompt}
                      </p>
                      {c.artefactCount > 0 && (
                        <span className="mt-1 inline-flex items-center gap-1 w-fit text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                          <IconNotebook size={11} />
                          {c.artefactCount} narrative{c.artefactCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <IconChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-gray-500 mt-2 shrink-0 transition-colors"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
