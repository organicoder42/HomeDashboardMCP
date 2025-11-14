import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { moodEntries } from '@/db/schema';
import { desc } from 'drizzle-orm';

// GET - Retrieve mood entries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const days = searchParams.get('days');

    let query = db.select().from(moodEntries).orderBy(desc(moodEntries.createdAt));

    // Filter by days if specified
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      // Note: Additional filtering would go here if needed
    }

    const moods = await query.limit(limit);

    return NextResponse.json(moods);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood entries' },
      { status: 500 }
    );
  }
}

// POST - Create mood entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mood, note, energyLevel, tags } = body;

    if (!mood || !['struggling', 'difficult', 'okay', 'good', 'great'].includes(mood)) {
      return NextResponse.json(
        { error: 'Valid mood is required' },
        { status: 400 }
      );
    }

    const tagsJson = tags ? JSON.stringify(tags) : null;

    const [newMood] = await db.insert(moodEntries).values({
      mood,
      note: note || null,
      energyLevel: energyLevel || null,
      tags: tagsJson,
    }).returning();

    return NextResponse.json(newMood);
  } catch (error) {
    console.error('Error creating mood entry:', error);
    return NextResponse.json(
      { error: 'Failed to create mood entry' },
      { status: 500 }
    );
  }
}
