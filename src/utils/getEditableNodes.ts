import type { PageNode, TextNode, TextareaNode, ImageNode } from "../types";

export interface EditableNode {
  node: TextNode | TextareaNode | ImageNode;
  path: number[];
}

export function getEditableNodes(
  nodes: PageNode[],
  currentPath: number[] = []
): EditableNode[] {
  const result: EditableNode[] = [];

  nodes.forEach((node, index) => {
    const nodePath = [...currentPath, index];

    if (node.type === "text" || node.type === "textarea" || node.type === "image") {
      result.push({ node, path: nodePath });
    }

    if (node.type === "frame") {
      result.push(...getEditableNodes(node.params.children, nodePath));
    }
  });

  return result;
}
