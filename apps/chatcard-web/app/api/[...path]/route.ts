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
async function getExpressHandler() {
  try {
    const module = await import('../../../../chatcard-api/src/serverless.js');
    return module.handler;
  } catch (error) {
    console.error('Failed to load Express handler:', error);
    throw error;
  }
}

// Convert Next.js request to serverless-http compatible format
async function handleRequest(request: NextRequest, path: string[]) {
  try {
    const handler = await getExpressHandler();
    const url = new URL(request.url);
    const pathname = `/${path.join('/')}`;

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

    return new Response(result.body || '', {
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
