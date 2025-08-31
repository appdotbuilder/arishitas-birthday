import { db } from '../db';
import { photosTable } from '../db/schema';
import { type UploadPhotoInput, type Photo } from '../schema';

export const uploadPhoto = async (input: UploadPhotoInput): Promise<Photo> => {
  try {
    // Insert photo record
    const result = await db.insert(photosTable)
      .values({
        filename: input.filename,
        original_name: input.original_name,
        file_path: input.file_path,
        uploaded_by: input.uploaded_by
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Photo upload failed:', error);
    throw error;
  }
};