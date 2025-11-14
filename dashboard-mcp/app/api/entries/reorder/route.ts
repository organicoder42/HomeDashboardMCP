import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { dashboardEntries } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { updates } = await request.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid updates format' },
        { status: 400 }
      );
    }

    // Update each entry's order
    await Promise.all(
      updates.map(({ id, order }) =>
        db
          .update(dashboardEntries)
          .set({ order, updatedAt: new Date() })
          .where(eq(dashboardEntries.id, id))
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering entries:', error);
    return NextResponse.json(
      { error: 'Failed to reorder entries' },
      { status: 500 }
    );
  }
}
