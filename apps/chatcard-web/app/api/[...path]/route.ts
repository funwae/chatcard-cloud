/**
 * Vercel serverless function wrapper for Express API
 * Proxies all API requests to the Express app
 *
 * This route handles all API paths and forwards them to the Express serverless handler
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// For Vercel deployment, import the serverless handler from source
// Vercel will bundle this during the build process
let cachedHandler: any = null;

async function getExpressHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  try {
    // Import from built dist folder (API is built by Turborepo before web build)
    // The path is relative to apps/chatcard-web/app/api/[...path]/route.ts
    // Path from apps/chatcard-web/app/api/[...path]/route.ts
    // Up to apps/chatcard-web/app/api/[...path] (../)
    // Up to apps/chatcard-web/app/api (../)
    // Up to apps/chatcard-web/app (../)
    // Up to apps/chatcard-web (../)
    // Up to apps (../)
    // Then into chatcard-api/dist/serverless.js
    // So: ../../../chatcard-api/dist/serverless.js
    const module = await import('../../../chatcard-api/dist/serverless.js');
    cachedHandler = module.handler;
    return cachedHandler;
  } catch (error) {
    console.error('Failed to load Express handler:', error);
    // Return a fallback handler that returns an error
    cachedHandler = async () => ({
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API handler not available', details: error instanceof Error ? error.message : 'Unknown error' }),
    });
    return cachedHandler;
  }
}

// Convert Next.js request to serverless-http compatible format
async function handleRequest(request: NextRequest, path: string[]) {
  try {
    const handler = await getExpressHandler();
    const url = new URL(request.url);
    // Handle empty path array (root API route)
    const pathname = path.length > 0 ? `/${path.join('/')}` : '/';

    // Read body if present
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
      } catch {
        body = undefined;
      }
    }

    // Create serverless-http compatible event
    const event = {
      httpMethod: request.method,
      path: pathname,
      pathParameters: { path: pathname },
      queryStringParameters: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      isBase64Encoded: false,
      requestContext: {
        requestId: crypto.randomUUID(),
        httpMethod: request.method,
        path: pathname,
        stage: 'production',
        requestTime: new Date().toISOString(),
        requestTimeEpoch: Date.now(),
      },
    };

    const context = {
      requestId: crypto.randomUUID(),
      functionName: 'chatcard-api',
      functionVersion: '$LATEST',
      memoryLimitInMB: '1024',
    };

    // Call the serverless handler
    const result = await handler(event as any, context as any);

    // Convert response
    const headers = new Headers();
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers.set(key, value);
        } else if (Array.isArray(value)) {
          headers.set(key, value.join(', '));
        }
      });
    }

    // Handle different response body types
    let responseBody: string | ReadableStream | null = null;
    if (result.body) {
      if (typeof result.body === 'string') {
        responseBody = result.body;
      } else if (result.body instanceof ReadableStream) {
        responseBody = result.body;
      } else {
        responseBody = JSON.stringify(result.body);
      }
    }

    return new Response(responseBody || '', {
      status: result.statusCode || 200,
      headers,
    });
  } catch (error) {
    console.error('API handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path);
}
