import { Check } from "lucide-react";

const COLOR_OPTIONS = [
  { id: "default", label: "Default", color: "bg-gradient-to-br from-blue-50 to-gray-100", border: "border-gray-200" },
  { id: "blue", label: "Blue", color: "bg-blue-500", border: "border-blue-500" },
  { id: "purple", label: "Purple", color: "bg-purple-500", border: "border-purple-500" },
  { id: "green", label: "Green", color: "bg-green-500", border: "border-green-500" },
  { id: "teal", label: "Teal", color: "bg-teal-400", border: "border-teal-400" },
  { id: "orange", label: "Orange", color: "bg-orange-400", border: "border-orange-400" },
  { id: "red", label: "Red", color: "bg-red-500", border: "border-red-500" },
  { id: "sage", label: "Sage", color: "bg-stone-400", border: "border-stone-400", disabled: true },
  { id: "dark", label: "Dark", color: "bg-gray-800", border: "border-gray-800" },
];

interface WebsiteThemeTabProps {
  readonly selected: string;
  readonly onSelect: (id: string) => void;
}

export default function WebsiteThemeTab({ selected, onSelect }: WebsiteThemeTabProps) {
  return (
    <div className="flex flex-wrap gap-4 items-start">
      {COLOR_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={opt.disabled}
          onClick={() => !opt.disabled && onSelect(opt.id)}
          className={`flex flex-col items-center gap-1.5 group ${opt.disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
        >
          <div
            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${opt.color} ${
              selected === opt.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
            }`}
          >
            {selected === opt.id && (
              <Check size={18} className={opt.id === "default" ? "text-blue-500" : "text-white"} />
            )}
          </div>
          <span className={`text-xs text-gray-600 ${opt.disabled ? "line-through text-gray-400" : ""}`}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}
