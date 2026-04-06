import type { PageData } from "../types";

interface RightBarProps {
  readonly title: string;
  readonly pages: PageData[];
  readonly activePageId: number | null;
  readonly onPageSelect: (page: PageData) => void;
  readonly onSave: () => void;
}

export default function RightBar({
  title,
  pages,
  activePageId,
  onPageSelect,
  onSave,
}: RightBarProps) {
  return (
    <div className="w-52 bg-white border-l border-gray-200 flex flex-col p-4 gap-3 h-full">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">Edit sections and content on this page</p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {pages.map((page) => (
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
      </div>

      <button
        onClick={onSave}
        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors w-full mt-auto"
      >
        Save
      </button>
    </div>
  );
}
