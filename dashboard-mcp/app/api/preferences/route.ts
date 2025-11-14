import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { userPreferences } from '@/db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_USER_ID = 'default';

// GET - Retrieve user preferences
export async function GET() {
  try {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, DEFAULT_USER_ID))
      .limit(1);

    // If no preferences exist, create default
    if (!prefs) {
      const [newPrefs] = await db
        .insert(userPreferences)
        .values({ userId: DEFAULT_USER_ID })
        .returning();
      return NextResponse.json(newPrefs);
    }

    return NextResponse.json(prefs);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PATCH - Update user preferences
export async function PATCH(request: Request) {
  try {
    const updates = await request.json();

    // Ensure preferences exist
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, DEFAULT_USER_ID))
      .limit(1);

    if (!existing) {
      // Create if doesn't exist
      const [newPrefs] = await db
        .insert(userPreferences)
        .values({
          userId: DEFAULT_USER_ID,
          ...updates,
        })
        .returning();
      return NextResponse.json(newPrefs);
    }

    // Update existing
    const [updatedPrefs] = await db
      .update(userPreferences)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, DEFAULT_USER_ID))
      .returning();

    return NextResponse.json(updatedPrefs);
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
