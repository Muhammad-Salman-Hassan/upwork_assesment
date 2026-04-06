import { Check, Image } from "lucide-react";

const OCCASION_THEMES = [
  { id: "default", label: "Default" },
  { id: "kuwait", label: "Kuwait National Day" },
  { id: "saudi", label: "Saudi National Day" },
  { id: "ramadan", label: "Ramadan / Eid" },
];

interface OccasionThemeTabProps {
  readonly selected: string;
  readonly onSelect: (id: string) => void;
}

export default function OccasionThemeTab({ selected, onSelect }: OccasionThemeTabProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {OCCASION_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id)}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 overflow-hidden transition-all ${
            selected === theme.id
              ? "border-blue-500"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="w-full h-24 bg-gray-100 flex items-center justify-center relative">
            <Image size={28} className="text-gray-300" />
            {selected === theme.id && (
              <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-0.5">
                <Check size={12} className="text-white" />
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-gray-700 pb-2 px-1 text-center leading-tight">
            {theme.label}
          </span>
        </button>
      ))}
    </div>
  );
}
