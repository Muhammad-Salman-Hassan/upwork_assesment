import type { PageData, PageNode } from "../types";

const SECTION_LABELS = ["Hero section", "Why Us ?", "Offers", "Footer"];

interface RightBarProps {
  readonly pageData: PageData;
  readonly activeSectionIndex: number;
  readonly onSectionSelect: (index: number) => void;
}

export default function RightBar({ pageData, activeSectionIndex, onSectionSelect }: RightBarProps) {
  return (
    <aside className="w-52 bg-white border-l border-gray-200 flex flex-col p-4 gap-3">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">{pageData.title_en}</h2>
        <p className="text-xs text-gray-400 mt-0.5">Edit sections and content on this page</p>
      </div>

      <div className="flex flex-col gap-2">
        {pageData.sections.map((_: PageNode, index: number) => (
          <button
            key={index}
            onClick={() => onSectionSelect(index)}
            className={`flex items-center justify-between px-3 py-2 rounded border text-sm transition-colors w-full ${
              activeSectionIndex === index
                ? "border-blue-200 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>{SECTION_LABELS[index] ?? `Section ${index + 1}`}</span>
            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">Edit</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
