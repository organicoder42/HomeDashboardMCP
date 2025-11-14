import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { dashboardEntries } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const updates = await request.json();

    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Set completedAt when marking as completed
    if (updates.status === 'completed') {
      updateData.completedAt = new Date();
    }

    const [updatedEntry] = await db
      .update(dashboardEntries)
      .set(updateData)
      .where(eq(dashboardEntries.id, id))
      .returning();

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}
