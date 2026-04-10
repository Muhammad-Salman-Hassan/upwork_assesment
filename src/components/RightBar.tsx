import { Loader2, Layers } from "lucide-react";
import type { PageData, PageNode } from "../types";

interface RightBarProps {
  readonly title: string;
  readonly pages: PageData[];
  readonly activePageId: number | null;
  readonly saving: boolean;
  readonly sections?: PageNode[];
  readonly activeSectionIndex?: number | null;
  readonly onPageSelect: (page: PageData) => void;
  readonly onSectionSelect?: (index: number) => void;
  readonly onSave: () => void;
}

export default function RightBar({
  title,
  pages,
  activePageId,
  saving,
  sections = [],
  activeSectionIndex,
  onPageSelect,
  onSectionSelect,
  onSave,
}: RightBarProps) {
  const showSections = pages.length === 0 && sections.length > 0;

  return (
    <div className="w-64 bg-white flex flex-col p-4 gap-3 h-full">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">Edit sections and content on this page</p>
      </div>

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {!showSections && pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onPageSelect(page)}
            className={`flex items-center justify-between px-3 py-2 rounded border text-sm transition-colors w-full ${
              activePageId === page.id
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-left truncate">{page.title_en ?? page.title}</span>
            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded shrink-0">Edit</span>
          </button>
        ))}

        {showSections && (
          <>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">Sections</p>
            {sections.map((section, index) => {
              const label = section.key?.trim() ? section.key : `Section ${index + 1}`;
              const isActive = activeSectionIndex === index;
              return (
                <button
                  key={section.id ?? index}
                  onClick={() => onSectionSelect?.(index)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded border text-sm transition-colors w-full text-left ${
                    isActive
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Layers size={13} className={isActive ? "text-blue-400" : "text-gray-400"} />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </>
        )}
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors w-full mt-auto"
      >
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Saving…
          </>
        ) : (
          "Save & Publish"
        )}
      </button>
    </div>
  );
}
