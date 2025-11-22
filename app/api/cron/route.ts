import { NextRequest, NextResponse } from 'next/server';
import { deleteExpiredLinks } from '@/lib/db';

// This endpoint is called by Vercel Cron to delete expired links
// Scheduled to run daily at midnight UTC
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (security check)
    const authHeader = request.headers.get('authorization');

    // In production, you should validate with CRON_SECRET
    // For now, we'll allow all requests (you can add this later)
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Delete all expired links
    const deletedCount = await deleteExpiredLinks();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} expired link(s)`,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete expired links',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
