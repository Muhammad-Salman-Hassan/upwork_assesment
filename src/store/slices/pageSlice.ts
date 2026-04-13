import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PageData, PageNode, FrameNode, Language } from "../../types";


export const BLANK_OFFER_CARD: FrameNode = {
  key: "",
  type: "frame",
  styles: {
    lg: { align: "start", background: "primary", gap: 0, height: "50", justify: "start", orientation: "vertical", radius: "lg", width: " w-[300px] " },
    sm: { align: "start", background: "primary", gap: 0, height: "30", justify: "start", maxHeight: "400", minHeight: "300", minWidth: 200, orientation: "vertical", radius: "lg" },
  },
  params: {
    children: [
      {
        key: "",
        type: "image",
        styles: {
          lg: { height: " h-[350px] ", radius: "lg", width: " w-[300px] " },
          sm: { height: " h-[250px] ", radius: "lg", width: " w-[200px]  " },
        },
        params: { src_en: "", src_ar: "" },
      },
      {
        key: "",
        type: "frame",
        styles: {
          lg: { align: "center", background: "primary", gap: 4, height: "9", justify: "between", orientation: "horizontal", padding: "px-4 py-0", radius: "md", width: "100" },
          sm: { align: "center", background: "primary", gap: 4, height: "9", justify: "between", orientation: "horizontal", padding: "py-1 px-2 ", radius: "md", width: "100" },
        },
        params: {
          children: [
            {
              key: "",
              type: "text",
              styles: {
                lg: { color: "primary", size: "base", underline: false, weight: "500" },
                sm: { color: "primary", size: "xxs", underline: false, weight: "500" },
              },
              params: { content_en: "", content_ar: "" },
            },
            {
              key: "",
              type: "button",
              styles: {
                lg: { background: "brand", color: "invert", height: "10", margin: "my-1", padding: "px-2 py-2", radius: "md", textSize: "sm", textWeight: "400" },
                sm: { background: "brand", color: "invert", height: "10", margin: "my-1", padding: "px-2 py-2", radius: "md", textSize: "xxs", textWeight: "400" },
              },
              params: {
                cta: { label_en: "View More", label_ar: "عرض المزيد", link_en: "", link_ar: "" },
              },
            },
          ],
        },
      },
    ],
  },
};
const initialData: PageData = {
  slug: "",
  path: "",
  type: "content",
};

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

interface ReorderSlidesPayload {
  sectionIndex: number;
  fromIndex: number;
  toIndex: number;
  pageId?: number;
  subPageId?: number;
}

interface UpdateSlideImagePayload {
  sectionIndex: number;
  slideIndex: number;
  src: string;
  pageId?: number;
  subPageId?: number;
}

interface UpdateLinkPayload {
  sectionIndex: number;
  path: number[];
  field: "link_en" | "link_ar";
  value: string;
  pageId?: number;
  subPageId?: number;
}

interface UpdateCtaPayload {
  sectionIndex: number;
  path: number[];
  field: "label_en" | "label_ar" | "link_en" | "link_ar";
  value: string;
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
    clearData(state) {
      state.data = initialData;
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
    updatePageSections(
      state,
      action: PayloadAction<{ pageId: number; sections: PageNode[] }>
    ) {
      const page = state.data.pages?.find((p) => p.id === action.payload.pageId);
      if (page) page.sections = action.payload.sections;
    },
    updateSubPageSections(
      state,
      action: PayloadAction<{ pageId: number; subPageId: number; sections: PageNode[] }>
    ) {
      const page = state.data.pages?.find((p) => p.id === action.payload.pageId);
      if (page) {
        const subPage = page.pages?.find((p) => p.id === action.payload.subPageId);
        if (subPage) subPage.sections = action.payload.sections;
      }
    },
    updateSlideImage(state, action: PayloadAction<UpdateSlideImagePayload>) {
      const { sectionIndex, slideIndex, src, pageId, subPageId } = action.payload;
      const srcKey = state.language === "en" ? "src_en" : "src_ar";
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target?.sections) return;
      const section = target.sections[sectionIndex];
      if (section.type !== 'slider' || !section.params.slides) return;
      const slide = section.params.slides[slideIndex];
      if (slide) {
        slide.params = { ...slide.params, [srcKey]: src };
      }
    },
    updateLinkField(state, action: PayloadAction<UpdateLinkPayload>) {
      const { sectionIndex, path, field, value, pageId, subPageId } = action.payload;
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target) return;
      target.sections = updateNodeAtPath(
        target.sections,
        [sectionIndex, ...path],
        (node) => {
          if (node.type === "text" || node.type === "textarea") {
            return { ...node, params: { ...node.params, [field]: value } };
          }
          if (node.type === "frame") {
            return { ...node, params: { ...node.params, children: node.params.children, [field]: value } };
          }
          return node;
        }
      );
    },
    updateCtaField(state, action: PayloadAction<UpdateCtaPayload>) {
      const { sectionIndex, path, field, value, pageId, subPageId } = action.payload;
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target) return;
      target.sections = updateNodeAtPath(
        target.sections,
        [sectionIndex, ...path],
        (node) => {
          if (node.type === "button") {
            return { ...node, params: { ...node.params, cta: { ...node.params.cta, [field]: value } } };
          }
          return node;
        }
      );
    },
    addSection(state, action: PayloadAction<{ section: PageNode; pageId?: number; subPageId?: number }>) {
      const { section, pageId, subPageId } = action.payload;
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target) return;
      target.sections = [...(target.sections ?? []), section];
    },
    removeSlide(state, action: PayloadAction<{ sectionIndex: number; slideIndex: number; pageId?: number; subPageId?: number }>) {
      const { sectionIndex, slideIndex, pageId, subPageId } = action.payload;
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target?.sections) return;
      const section = target.sections[sectionIndex];
      if (section?.type !== "slider" || !section.params.slides) return;
      section.params.slides = section.params.slides.filter((_, i) => i !== slideIndex);
    },
    // Appends a blank slide to a slider section
    addSlide(state, action: PayloadAction<{ sliderSectionIndex: number; pageId?: number; subPageId?: number }>) {
      const { sliderSectionIndex, pageId, subPageId } = action.payload;
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target?.sections) return;
      const section = target.sections[sliderSectionIndex];
      if (section?.type !== "slider") return;
      const blank = { key: "", type: "slide" as const, styles: {}, params: { alt: "", src_en: "", src_ar: "" } };
      section.params.slides = [...(section.params.slides ?? []), blank];
    },
    // Appends a blank offer card into the Offers section's horizontal card row (children[1])
    addOfferCard(state, action: PayloadAction<{ offerSectionIndex: number; card: PageNode; pageId?: number; subPageId?: number }>) {
      const { offerSectionIndex, card, pageId, subPageId } = action.payload;
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target?.sections) return;
      const offerSection = target.sections[offerSectionIndex];
      if (offerSection?.type !== "frame") return;
      const cardRow = offerSection.params.children[1];
      if (cardRow?.type !== "frame") return;
      cardRow.params.children = [...cardRow.params.children, card];
    },
    // Removes an offer card from the Offers section's card row (children[1])
    removeOfferCard(state, action: PayloadAction<{ offerSectionIndex: number; cardIndex: number; pageId?: number; subPageId?: number }>) {
      const { offerSectionIndex, cardIndex, pageId, subPageId } = action.payload;
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target?.sections) return;
      const offerSection = target.sections[offerSectionIndex];
      if (offerSection?.type !== "frame") return;
      const cardRow = offerSection.params.children[1];
      if (cardRow?.type !== "frame") return;
      cardRow.params.children = cardRow.params.children.filter((_, i) => i !== cardIndex);
    },
    reorderSlides(state, action: PayloadAction<ReorderSlidesPayload>) {
      const { sectionIndex, fromIndex, toIndex, pageId, subPageId } = action.payload;
      if (fromIndex === toIndex) return;
      const target = getTargetPage(state.data, pageId, subPageId);
      if (!target?.sections) return;
      const section = target.sections[sectionIndex];
      if (section.type !== 'slider' || !section.params.slides) return;
      const slides = [...section.params.slides];
      const [moved] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, moved);
      section.params.slides = slides;
    },
  },
});

export const { setData, clearData, setLanguage, updateTextField, updateImageSrc, updatePageSections, updateSubPageSections, reorderSlides, updateSlideImage, updateLinkField, updateCtaField, addSection, addOfferCard, removeOfferCard, addSlide, removeSlide } =
  pageSlice.actions;
export default pageSlice.reducer;
