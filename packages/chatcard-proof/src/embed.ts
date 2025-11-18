/**
 * Generate HTML link tag for proof embedding
 */
export function embedHtml(proofUrl: string, digest?: string): string {
  let tag = `<link rel="cardproof" href="${escapeHtml(proofUrl)}">`;
  if (digest) {
    tag += `\n<meta name="card:digest" content="${escapeHtml(digest)}">`;
  }
  return tag;
}

/**
 * Add proof metadata to SVG
 */
export function embedSvg(svgContent: string, proofUrl: string, ownerDid: string, digest: string, signature: string): string {
  const metadata = `
  <metadata>
    <cc:proof xmlns:cc="https://chatcard.cloud/ns">
      <cc:proofUri>${escapeXml(proofUrl)}</cc:proofUri>
      <cc:ownerDid>${escapeXml(ownerDid)}</cc:ownerDid>
      <cc:digest>${escapeXml(digest)}</cc:digest>
      <cc:signature>${escapeXml(signature)}</cc:signature>
    </cc:proof>
  </metadata>`;

  // Insert metadata before closing </svg> tag
  if (svgContent.includes('</svg>')) {
    return svgContent.replace('</svg>', `${metadata}\n</svg>`);
  }

  // If no closing tag, append before end
  return svgContent + metadata;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

