import { useState, useCallback } from "react";
import type { PageData, PageNode, Language } from "../types";
import initialData from "../data/mock-data.json";

function updateNodeAtPath(
  nodes: PageNode[],
  path: number[],
  updater: (node: PageNode) => PageNode
): PageNode[] {
  if (path.length === 0) return nodes;

  return nodes.map((node, index) => {
    if (index !== path[0]) return node;

    if (path.length === 1) return updater(node);

    if (node.type === "frame") {
      return {
        ...node,
        params: {
          ...node.params,
          children: updateNodeAtPath(node.params.children, path.slice(1), updater),
        },
      };
    }

    return node;
  });
}

export function usePageData() {
  const [pageData, setPageData] = useState<PageData>(initialData as PageData);
  const [language, setLanguage] = useState<Language>("en");

  const updateTextField = useCallback(
    (sectionIndex: number, path: number[], value: string) => {
      setPageData((prev) => {
        const langKey = language === "en" ? "content_en" : "content_ar";
        const updatedSections = updateNodeAtPath(
          prev.sections,
          [sectionIndex, ...path],
          (node) => {
            if (node.type === "text" || node.type === "textarea") {
              return {
                ...node,
                params: { ...node.params, [langKey]: value },
              };
            }
            return node;
          }
        );
        return { ...prev, sections: updatedSections };
      });
    },
    [language]
  );

  const updateImageSrc = useCallback(
    (sectionIndex: number, path: number[], src: string) => {
      setPageData((prev) => {
        const srcKey = language === "en" ? "src_en" : "src_ar";
        const updatedSections = updateNodeAtPath(
          prev.sections,
          [sectionIndex, ...path],
          (node) => {
            if (node.type === "image") {
              return {
                ...node,
                params: { ...node.params, [srcKey]: src },
              };
            }
            return node;
          }
        );
        return { ...prev, sections: updatedSections };
      });
    },
    [language]
  );

  const saveData = useCallback(() => {
    console.log("Saved Page Data:", JSON.stringify(pageData, null, 2));
  }, [pageData]);

  return {
    pageData,
    language,
    setLanguage,
    updateTextField,
    updateImageSrc,
    saveData,
  };
}
