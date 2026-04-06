export type Language = "en" | "ar";

export type NodeType = "frame" | "text" | "textarea" | "image" | "slider" | "slide";

export interface Styles {
  lg?: Record<string, unknown>;
  sm?: Record<string, unknown>;
}

export interface TextParams {
  content_en?: string;
  content_ar?: string;
  content?: string;
  link?: string;
  [key: string]: unknown;
}

export interface ImageParams {
  src_en?: string;
  src_ar?: string;
  src?: string;
  alt?: string;
  [key: string]: unknown;
}

export interface FrameParams {
  children: PageNode[];
  [key: string]: unknown;
}

export interface SliderParams {
  config?: Record<string, unknown>;
  slides?: PageNode[];
  [key: string]: unknown;
}

interface BaseNode {
  id?: number;
  key?: string;
  styles: Styles;
}

export interface TextNode extends BaseNode {
  type: "text";
  params: TextParams;
}

export interface TextareaNode extends BaseNode {
  type: "textarea";
  params: TextParams;
}

export interface ImageNode extends BaseNode {
  type: "image";
  params: ImageParams;
}

export interface FrameNode extends BaseNode {
  type: "frame";
  params: FrameParams;
}

export interface SliderNode extends BaseNode {
  type: "slider";
  params: SliderParams;
}

export interface SlideNode extends BaseNode {
  type: "slide";
  params: ImageParams;
}

export type PageNode = TextNode | TextareaNode | ImageNode | FrameNode | SliderNode | SlideNode;

export interface PageStyles {
  lg?: Record<string, unknown>;
  sm?: Record<string, unknown>;
}

export interface PageData {
  id?: number;
  slug: string;
  path: string;
  type: string;
  title?: string;
  title_en?: string;
  title_ar?: string;
  styles?: PageStyles;
  sections?: PageNode[];
  pages?: PageData[];
}

export interface EditableField {
  path: number[];
  node: TextNode | TextareaNode | ImageNode;
}
