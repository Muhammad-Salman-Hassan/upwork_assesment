import { useRef } from "react";
import type { Language, PageNode } from "../../types";
import { getEditableNodes } from "../../utils/getEditableNodes";
import TextField from "../../components/fields/TextField";
import TextareaField from "../../components/fields/TextareaField";
import ImageField from "../../components/fields/ImageField";
import type { ImageFieldHandle } from "../../components/fields/ImageField";

interface WhyProps {
  readonly sectionIndex: number;
  readonly section: PageNode;
  readonly language: Language;
  readonly onTextChange: (sectionIndex: number, path: number[], value: string) => void;
  readonly onImageChange: (sectionIndex: number, path: number[], src: string) => void;
  readonly onSave: () => void;
}

export default function Why({
  sectionIndex,
  section,
  language,
  onTextChange,
  onImageChange,
  onSave,
}: WhyProps) {
  const imageRef = useRef<ImageFieldHandle>(null);
  const children = section.type === "frame" ? section.params.children : [];
  const editableNodes = getEditableNodes(children);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 gap-4">
      {editableNodes.map(({ node, path }) => {
        const pathKey = path.join("-");

        if (node.type === "text") {
          const value = language === "en" ? node.params.content_en : node.params.content_ar;
          return (
            <TextField
              key={pathKey}
              label="Edit Tittle"
              value={value}
              onChange={(val) => onTextChange(sectionIndex, path, val)}
            />
          );
        }

        if (node.type === "textarea") {
          const value = language === "en" ? node.params.content_en : node.params.content_ar;
          return (
            <TextareaField
              key={pathKey}
              label="Edit Content"
              value={value}
              onChange={(val) => onTextChange(sectionIndex, path, val)}
            />
          );
        }

        if (node.type === "image") {
          const src = language === "en" ? node.params.src_en : node.params.src_ar;
          return (
            <ImageField
              key={pathKey}
              ref={imageRef}
              src={src}
              onImageChange={(val) => onImageChange(sectionIndex, path, val)}
            />
          );
        }

        return null;
      })}

      <div className="flex items-center justify-between pt-2 mt-auto">
        <button
          onClick={() => imageRef.current?.triggerSelect()}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded transition-colors"
        >
          Change Image
        </button>
        <button
          onClick={onSave}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-6 py-1.5 rounded transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
