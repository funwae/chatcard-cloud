import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  try {
    const card = await apiClient.getCard(handle);
    return NextResponse.json(card, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Card not found' },
      { status: 404 }
    );
  }
}

