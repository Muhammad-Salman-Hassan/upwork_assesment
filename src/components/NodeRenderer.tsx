import type { PageNode } from "../types";
import { mapFrameStyles, mapTextStyles, mapImageStyles } from "../utils/styleMapper";

interface NodeRendererProps {
  node: PageNode;
  language: "en" | "ar";
}

export default function NodeRenderer({ node, language }: NodeRendererProps) {
  const lgStyles = (node.styles?.lg ?? {}) as Record<string, unknown>;

  if (node.type === "frame") {
    return (
      <div className={mapFrameStyles(lgStyles)}>
        {node.params.children.map((child, i) => (
          <NodeRenderer key={child.id ?? i} node={child} language={language} />
        ))}
      </div>
    );
  }

  if (node.type === "slider") {
    const slides = node.params.slides ?? [];
    return (
      <div className="flex overflow-x-auto gap-4">
        {slides.map((slide, i) => (
          <NodeRenderer key={slide.id ?? i} node={slide} language={language} />
        ))}
      </div>
    );
  }

  if (node.type === "slide") {
    const src = (language === "en" ? node.params.src_en : node.params.src_ar) ?? node.params.src ?? "";
    return <img src={src} alt={node.params.alt as string ?? ""} className="w-full object-cover" />;
  }

  if (node.type === "text" || node.type === "textarea") {
    const content = (language === "en" ? node.params.content_en : node.params.content_ar) ?? node.params.content ?? "";
    const link = node.params.link as string | undefined;
    const textClass = mapTextStyles(lgStyles);

    if (link) {
      return <a href={link} className={`${textClass} hover:opacity-80`}>{content}</a>;
    }
    return <p className={textClass}>{content}</p>;
  }

  if (node.type === "image") {
    const src = (language === "en" ? node.params.src_en : node.params.src_ar) ?? node.params.src ?? "";
    return <img src={src} alt="" className={mapImageStyles(lgStyles)} />;
  }

  return null;
}
