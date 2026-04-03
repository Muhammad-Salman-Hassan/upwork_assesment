import { useState, useRef, useEffect } from "react";
import { Pencil, Check } from "lucide-react";

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextareaField({ label, value, onChange }: TextareaFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
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
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          rows={4}
          className="w-full text-sm outline-none resize-none text-gray-700 bg-gray-50 rounded p-2 border border-blue-300 focus:border-blue-400"
        />
      ) : (
        <div className="min-h-[88px] bg-gray-50 rounded p-2 text-sm text-gray-700 whitespace-pre-wrap">
          {value || <span className="text-gray-400">Text</span>}
        </div>
      )}
    </div>
  );
}
