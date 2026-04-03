import { useState, useRef, useEffect } from "react";
import { Pencil, Check } from "lucide-react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextField({ label, value, onChange }: TextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="text-gray-400 hover:text-blue-500 transition-colors"
        >
          {isEditing ? <Check size={14} className="text-blue-500" /> : <Pencil size={14} />}
        </button>
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          className="w-full text-sm outline-none border-b border-blue-400 text-gray-700 pb-0.5 bg-transparent"
        />
      ) : (
        <p className="text-sm text-gray-700 min-h-[20px]">{value || <span className="text-gray-400">text</span>}</p>
      )}
    </div>
  );
}
