import { db } from '../db';
import { videosTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type Video, type GetVideosInput } from '../schema';

export async function getVideos(input?: GetVideosInput): Promise<Video[]> {
  try {
    // Use any to bypass TypeScript's strict type checking for Drizzle query builder
    let query: any = db.select().from(videosTable).orderBy(desc(videosTable.uploaded_at));
    
    // Apply pagination if provided
    if (input?.limit !== undefined) {
      query = query.limit(input.limit);
    }
    
    if (input?.offset !== undefined) {
      query = query.offset(input.offset);
    }
    
    const results = await query.execute();
    
    // Return the results - no type conversion needed since all fields are strings, numbers, or dates
    return results;
  } catch (error) {
    console.error('Get videos failed:', error);
    throw error;
  }
}