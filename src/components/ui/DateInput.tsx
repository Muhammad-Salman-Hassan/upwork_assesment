import { Calendar } from "lucide-react";

interface DateInputProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export default function DateInput({ label, value, onChange }: DateInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-gray-500">{label}</label>
      <div className="relative">
        <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 appearance-none"
        />
      </div>
    </div>
  );
}
