import { ChevronDown } from "lucide-react";

interface SelectFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: { label: string; value: string }[];
}

export default function SelectField({ value, onChange, options }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white pr-10 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
