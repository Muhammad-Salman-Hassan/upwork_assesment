export type Language = "en" | "ar";

export type NodeType = "frame" | "text" | "textarea" | "image";

export interface Styles {
  lg?: Record<string, unknown>;
  sm?: Record<string, unknown>;
}

export interface TextParams {
  content_en: string;
  content_ar: string;
}

export interface ImageParams {
  src_en: string;
  src_ar: string;
}

export interface FrameParams {
  children: PageNode[];
}

export interface TextNode {
  type: "text";
  styles: Styles;
  params: TextParams;
}

export interface TextareaNode {
  type: "textarea";
  styles: Styles;
  params: TextParams;
}

export interface ImageNode {
  type: "image";
  styles: Styles;
  params: ImageParams;
}

export interface FrameNode {
  type: "frame";
  styles: Styles;
  params: FrameParams;
}

export type PageNode = TextNode | TextareaNode | ImageNode | FrameNode;

export interface PageStyles {
  lg?: Record<string, unknown>;
  sm?: Record<string, unknown>;
}

export interface PageData {
  slug: string;
  path: string;
  type: string;
  title_en: string;
  title_ar: string;
  styles: PageStyles;
  sections: PageNode[];
}

export interface EditableField {
  path: number[];
  node: TextNode | TextareaNode | ImageNode;
}
