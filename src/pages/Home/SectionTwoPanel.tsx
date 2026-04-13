import type { ReactNode } from "react";

interface SectionTwoPanelProps {
  readonly leftTitle: string;
  readonly rightTitle: string;
  readonly left: ReactNode;
  readonly right: ReactNode;
}

export default function SectionTwoPanel({ leftTitle, rightTitle, left, right }: SectionTwoPanelProps) {
  return (
    <div className="flex gap-4 min-h-0 h-full">
      
      <div className="w-[270px] flex-shrink-0 border border-gray-200 rounded-2xl bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-blue-500">{leftTitle}</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {left}
        </div>
      </div>

      
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white flex flex-col overflow-hidden min-w-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-blue-500">{rightTitle}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {right}
        </div>
      </div>
    </div>
  );
}
