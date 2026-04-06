import type { Language, PageNode } from "../../types";
import { getEditableNodes } from "../../utils/getEditableNodes";
import type { EditableNode } from "../../utils/getEditableNodes";
import TextField from "../../components/fields/TextField";

// Builds correct paths relative to the outer sections array.
// Calling getEditableNodes([child], [childIndex]) always assigns index=0 to the
// single-element wrapper, producing paths like [childIndex, 0] instead of [childIndex].
function getChildEditableNodes(child: PageNode, childIndex: number): EditableNode[] {
  if (child.type === 'text' || child.type === 'textarea' || child.type === 'image') {
    return [{ node: child, path: [childIndex] }];
  }
  if (child.type === 'frame') {
    return getEditableNodes(child.params.children, [childIndex]);
  }
  return [];
}
import TextareaField from "../../components/fields/TextareaField";
import ImageField from "../../components/fields/ImageField";

interface WhyProps {
  readonly sectionIndex: number;
  readonly section: PageNode;
  readonly language: Language;
  readonly onTextChange: (sectionIndex: number, path: number[], value: string) => void;
  readonly onImageChange: (sectionIndex: number, path: number[], src: string) => void;
}

export default function Why({
  sectionIndex,
  section,
  language,
  onTextChange,
  onImageChange,
}: WhyProps) {

  if (section.type === "slider") {
    const slides = section.params.slides ?? [];

    return (
      <div className="flex flex-col gap-4">
        {slides.map((slide, i) => {
          const p = slide.params as { alt?: string; src_en?: string; src_ar?: string; src?: string };
          const label = p.alt || `Slide ${i + 1}`;
          const src = (language === "en" ? p.src_en : p.src_ar) ?? p.src ?? "";

          return (
            <div
              key={slide.id ?? i}
              className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-6 gap-3"
            >
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <ImageField
                src={src}
                onImageChange={(val) => onImageChange(sectionIndex, [i], val)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  const children: PageNode[] =
    section.type === "frame" ? section.params.children : [];

  return (
    <div className="flex flex-col gap-6">
      {children.map((child, childIndex) => {
        const editableNodes = getChildEditableNodes(child, childIndex);

        return (
          <div
            key={child.id ?? childIndex}
            className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-6 gap-4"
          >
            {editableNodes.map(({ node, path }) => {
              const pathKey = path.join("-");

              if (node.type === "text") {
                const value =
                  (language === "en" ? node.params.content_en : node.params.content_ar) ??
                  node.params.content ??
                  "";
                return (
                  <TextField
                    key={pathKey}
                    label="Edit Field"
                    value={value}
                    onChange={(val) => onTextChange(sectionIndex, path, val)}
                  />
                );
              }

              if (node.type === "textarea") {
                const value =
                  (language === "en" ? node.params.content_en : node.params.content_ar) ??
                  node.params.content ??
                  "";
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
                const src =
                  (language === "en" ? node.params.src_en : node.params.src_ar) ??
                  node.params.src ??
                  "";
                return (
                  <ImageField
                    key={pathKey}
                    src={src}
                    onImageChange={(val) => onImageChange(sectionIndex, path, val)}
                  />
                );
              }

              return null;
            })}
          </div>
        );
      })}
    </div>
  );
}
