import type { PageNode, TextNode, TextareaNode, ImageNode, ButtonNode } from "../types";

export interface EditableNode {
  node: TextNode | TextareaNode | ImageNode | ButtonNode;
  path: number[];
}

export function getEditableNodes(
  nodes: PageNode[],
  currentPath: number[] = []
): EditableNode[] {
  const result: EditableNode[] = [];

  nodes.forEach((node, index) => {
    const nodePath = [...currentPath, index];

    if (node.type === "text" || node.type === "textarea" || node.type === "image" || node.type === "button") {
      result.push({ node, path: nodePath });
    }

    if (node.type === "frame") {
      result.push(...getEditableNodes(node.params.children, nodePath));
    }
  });

  return result;
}
