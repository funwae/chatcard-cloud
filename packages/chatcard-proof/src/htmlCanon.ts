import { parse, serialize } from 'parse5';
import type { Document, Element, TextNode, CommentNode } from 'parse5/dist/tree-adapters/default';

/**
 * Canonicalize HTML content according to cc-html-1 rules:
 * - Strip comments
 * - Collapse whitespace in text nodes
 * - Sort attributes lexicographically
 * - Remove volatile attributes (nonce, integrity, data-n-*, data-nextjs*)
 * - Stable serialization
 */
export function canonicalizeHtml(html: string): string {
  const document = parse(html);
  const canonical = processNode(document);
  return serialize(canonical);
}

function processNode(node: any): any {
  if (node.nodeName === '#comment') {
    // Strip comments
    return null;
  }

  if (node.nodeName === '#text') {
    const textNode = node as TextNode;
    // Collapse whitespace
    const collapsed = textNode.value.replace(/\s+/g, ' ').trim();
    if (!collapsed) {
      return null; // Remove empty text nodes
    }
    return {
      ...textNode,
      value: collapsed,
    };
  }

  if (node.nodeName === '#documentType') {
    return node;
  }

  if (node.nodeName === '#document') {
    return {
      ...node,
      childNodes: node.childNodes
        .map(processNode)
        .filter((n: any) => n !== null),
    };
  }

  // Element node
  const element = node as Element;
  const attrs = element.attrs
    .filter((attr: any) => {
      // Remove volatile attributes
      const name = attr.name.toLowerCase();
      return !(
        name === 'nonce' ||
        name === 'integrity' ||
        name.startsWith('data-n-') ||
        name.startsWith('data-nextjs')
      );
    })
    .sort((a: any, b: any) => a.name.localeCompare(b.name)); // Sort lexicographically

  return {
    ...element,
    attrs,
    childNodes: element.childNodes
      .map(processNode)
      .filter((n: any) => n !== null),
  };
}

