import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { dashboardEntries } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = db.select().from(dashboardEntries).orderBy(desc(dashboardEntries.createdAt));

    if (status && status !== 'all') {
      query = query.where(eq(dashboardEntries.status, status as any)) as any;
    }

    if (category) {
      query = query.where(eq(dashboardEntries.category, category)) as any;
    }

    const entries = await query.limit(limit);

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}
