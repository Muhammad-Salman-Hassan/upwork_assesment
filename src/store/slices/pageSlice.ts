import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PageData, PageNode, Language } from "../../types";
import homeJson from "../../data/home.json";

const initialData = homeJson[0] as PageData;

function updateNodeAtPath(
  nodes: PageNode[] | undefined,
  path: number[],
  updater: (node: PageNode) => PageNode
): PageNode[] {
  if (!nodes || path.length === 0) return nodes ?? [];

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

function getTargetPage(data: PageData, pageId?: number, subPageId?: number): PageData | undefined {
  if (!pageId) return data;
  const page = data.pages?.find((p) => p.id == pageId);
  if (!page) return undefined;
  if (!subPageId) return page;
  return page.pages?.find((p) => p.id == subPageId);
}

interface PageState {
  data: PageData;
  language: Language;
}

const initialState: PageState = {
  data: initialData,
  language: "en",
};

interface UpdateTextPayload {
  sectionIndex: number;
  path: number[];
  value: string;
  pageId?: number;
  subPageId?: number;
}

interface UpdateImagePayload {
  sectionIndex: number;
  path: number[];
  src: string;
  pageId?: number;
  subPageId?: number;
}

const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    setData(state, action: PayloadAction<PageData>) {
      state.data = action.payload;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    updateTextField(state, action: PayloadAction<UpdateTextPayload>) {
      const { sectionIndex, path, value, pageId, subPageId } = action.payload;
      const langKey = state.language === "en" ? "content_en" : "content_ar";
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target) return;
      target.sections = updateNodeAtPath(
        target.sections,
        [sectionIndex, ...path],
        (node) => {
          if (node.type === "text" || node.type === "textarea") {
            return { ...node, params: { ...node.params, [langKey]: value } };
          }
          return node;
        }
      );
    },
    updateImageSrc(state, action: PayloadAction<UpdateImagePayload>) {
      const { sectionIndex, path, src, pageId, subPageId } = action.payload;
      const srcKey = state.language === "en" ? "src_en" : "src_ar";
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target) return;
      target.sections = updateNodeAtPath(
        target.sections,
        [sectionIndex, ...path],
        (node) => {
          if (node.type === "image") {
            return { ...node, params: { ...node.params, [srcKey]: src } };
          }
          return node;
        }
      );
    },
  },
});

export const { setData, setLanguage, updateTextField, updateImageSrc } = pageSlice.actions;
export default pageSlice.reducer;
