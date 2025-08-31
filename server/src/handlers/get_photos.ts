import { db } from '../db';
import { photosTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type Photo, type GetPhotosInput } from '../schema';

export const getPhotos = async (input?: GetPhotosInput): Promise<Photo[]> => {
  try {
    // Build the base query
    const baseQuery = db.select()
      .from(photosTable)
      .orderBy(desc(photosTable.uploaded_at));

    // Apply pagination conditionally by building the complete query
    let results;
    if (input?.limit !== undefined && input?.offset !== undefined) {
      results = await baseQuery.limit(input.limit).offset(input.offset).execute();
    } else if (input?.limit !== undefined) {
      results = await baseQuery.limit(input.limit).execute();
    } else if (input?.offset !== undefined) {
      results = await baseQuery.offset(input.offset).execute();
    } else {
      results = await baseQuery.execute();
    }

    // Convert timestamp columns to Date objects to match Photo type
    return results.map(photo => ({
      ...photo,
      uploaded_at: new Date(photo.uploaded_at)
    }));
  } catch (error) {
    console.error('Get photos failed:', error);
    throw error;
  }
};