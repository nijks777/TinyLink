import { NextResponse } from 'next/server';
import { deleteExpiredLinks } from '@/lib/db';

// GET /api/cron/cleanup - Delete expired links (called by Vercel Cron)
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deletedCount = await deleteExpiredLinks();

    return NextResponse.json(
      {
        success: true,
        deletedCount,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in cleanup cron:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
