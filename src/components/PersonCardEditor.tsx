import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { FrameNode, Language } from "../types";
import ImageField from "./fields/ImageField";
import TextField from "./fields/TextField";

interface PersonCardEditorProps {
  card: FrameNode;
  
  basePath: number[];
  sectionIndex: number;
  language: Language;
  onTextChange: (si: number, path: number[], val: string) => void;
  onImageChange: (si: number, path: number[], src: string) => void;
}

export default function PersonCardEditor({
  card,
  basePath,
  sectionIndex,
  language,
  onTextChange,
  onImageChange,
}: PersonCardEditorProps) {
  const [isEditing, setIsEditing] = useState(false);

  const imageNode = card.params.children[0];
  const infoFrame = card.params.children[1];
  const nameNode = infoFrame?.type === "frame" ? infoFrame.params.children[0] : null;
  const posNode  = infoFrame?.type === "frame" ? infoFrame.params.children[1] : null;

  const imgSrc = imageNode?.type === "image"
    ? ((language === "en" ? imageNode.params.src_en : imageNode.params.src_ar) ?? imageNode.params.src ?? "")
    : "";

  const name = nameNode?.type === "text"
    ? ((language === "en" ? nameNode.params.content_en : nameNode.params.content_ar) ?? nameNode.params.content ?? "")
    : "";

  const position = posNode?.type === "text"
    ? ((language === "en" ? posNode.params.content_en : posNode.params.content_ar) ?? posNode.params.content ?? "")
    : "";

  
  const imgPath  = [...basePath, 0];
  const namePath = [...basePath, 1, 0];
  const posPath  = [...basePath, 1, 1];

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      
      <div className="flex items-center gap-4 p-4">
       
        <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
          {imgSrc
            ? <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gray-200" />
          }
        </div>

       
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{name || "Person name"}</p>
          <p className="text-xs text-gray-500 truncate">{position || "person title, position"}</p>
        </div>

      
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditing((v) => !v)}
            className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-colors"
          >
            {isEditing ? <X size={14} /> : <Pencil size={14} />}
          </button>
          <button className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

    
      {isEditing && (
        <div className="border-t border-gray-100 p-4 flex flex-col gap-3 bg-gray-50">
          <ImageField
            src={imgSrc}
            onImageChange={(val) => onImageChange(sectionIndex, imgPath, val)}
          />
          <TextField
            label="Name"
            value={name}
            onChange={(val) => onTextChange(sectionIndex, namePath, val)}
          />
          <TextField
            label="Position"
            value={position}
            onChange={(val) => onTextChange(sectionIndex, posPath, val)}
          />
          <button
            onClick={() => setIsEditing(false)}
            className="self-end flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600"
          >
            <Check size={12} /> Done
          </button>
        </div>
      )}
    </div>
  );
}
