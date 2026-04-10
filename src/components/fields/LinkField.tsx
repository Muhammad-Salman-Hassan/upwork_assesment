import { useState, useRef, useEffect } from "react";
import { Pencil, Check, Link } from "lucide-react";

interface LinkFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function LinkField({ label, value, onChange }: LinkFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  return (
    <div className="border border-blue-100 rounded-lg p-3 bg-blue-50/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
          <Link size={12} className="text-blue-400" />
          {label}
        </span>
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
          className="w-full text-sm outline-none border-b border-blue-400 text-gray-700 pb-0.5 bg-transparent font-mono"
          placeholder="/path/to/page"
        />
      ) : (
        <p className="text-sm text-gray-700 min-h-[20px] font-mono">
          {value || <span className="text-gray-400">/path</span>}
        </p>
      )}
    </div>
  );
}
