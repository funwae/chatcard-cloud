import { createHash } from 'crypto';

/**
 * Compute SHA-256 hash and return as base64 string
 */
export function sha256Base64(data: Uint8Array | string): string {
  const hash = createHash('sha256');
  if (typeof data === 'string') {
    hash.update(data, 'utf8');
  } else {
    hash.update(data);
  }
  return hash.digest('base64');
}

/**
 * Canonicalize content based on the specified mode
 */
export async function canonicalize(
  content: Uint8Array | string,
  mode: 'cc-bytes' | 'cc-html-1' | 'cc-pdf-1' | 'cc-md-1'
): Promise<Uint8Array> {
  switch (mode) {
    case 'cc-bytes':
      return typeof content === 'string'
        ? new TextEncoder().encode(content)
        : content;

    case 'cc-html-1':
      if (typeof content !== 'string') {
        throw new Error('cc-html-1 requires string content');
      }
      const { canonicalizeHtml } = await import('./htmlCanon.js');
      const canonical = canonicalizeHtml(content);
      return new TextEncoder().encode(canonical);

    case 'cc-pdf-1':
      // TODO: Implement PDF canonicalization
      throw new Error('cc-pdf-1 not yet implemented');

    case 'cc-md-1':
      // TODO: Implement Markdown canonicalization
      throw new Error('cc-md-1 not yet implemented');

    default:
      throw new Error(`Unknown canonicalization mode: ${mode}`);
  }
}

