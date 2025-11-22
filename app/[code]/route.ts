import { NextRequest, NextResponse } from 'next/server';
import { getLinkByCode, incrementClicks } from '@/lib/db';

// GET /:code - Redirect to target URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const link = await getLinkByCode(code);

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Increment click count and update last_clicked_at
    await incrementClicks(code);

    // Perform 302 redirect
    return NextResponse.redirect(link.target_url, 302);
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
