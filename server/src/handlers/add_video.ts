import { db } from '../db';
import { videosTable } from '../db/schema';
import { type AddVideoInput, type Video } from '../schema';

export const addVideo = async (input: AddVideoInput): Promise<Video> => {
  try {
    // Insert video record
    const result = await db.insert(videosTable)
      .values({
        title: input.title,
        video_url: input.video_url,
        thumbnail_url: input.thumbnail_url || null,
        uploaded_by: input.uploaded_by
      })
      .returning()
      .execute();

    const video = result[0];
    return video;
  } catch (error) {
    console.error('Video creation failed:', error);
    throw error;
  }
};