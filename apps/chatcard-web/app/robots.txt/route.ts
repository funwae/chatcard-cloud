import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /me/dashboard/
Disallow: /me/proof-studio/
Disallow: /me/*/settings/

Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://chatcard.cloud'}/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

