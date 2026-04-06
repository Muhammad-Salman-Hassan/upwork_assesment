const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayPickerProps {
  readonly selected: string[];
  readonly onChange: (days: string[]) => void;
}

export default function DayPicker({ selected, onChange }: DayPickerProps) {
  const toggle = (day: string) => {
    onChange(
      selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day]
    );
  };

  return (
    <div className="flex gap-1 flex-wrap">
      {DAYS.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => toggle(day)}
          className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
            selected.includes(day)
              ? "bg-blue-100 text-blue-600 border border-blue-300"
              : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
}
