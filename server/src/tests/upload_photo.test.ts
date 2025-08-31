import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type UploadPhotoInput } from '../schema';
import { uploadPhoto } from '../handlers/upload_photo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: UploadPhotoInput = {
  filename: 'test-photo-123.jpg',
  original_name: 'My Test Photo.jpg',
  file_path: '/uploads/photos/test-photo-123.jpg',
  uploaded_by: 'john_doe'
};

describe('uploadPhoto', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should upload a photo', async () => {
    const result = await uploadPhoto(testInput);

    // Basic field validation
    expect(result.filename).toEqual('test-photo-123.jpg');
    expect(result.original_name).toEqual('My Test Photo.jpg');
    expect(result.file_path).toEqual('/uploads/photos/test-photo-123.jpg');
    expect(result.uploaded_by).toEqual('john_doe');
    expect(result.id).toBeDefined();
    expect(result.uploaded_at).toBeInstanceOf(Date);
  });

  it('should save photo to database', async () => {
    const result = await uploadPhoto(testInput);

    // Query using proper drizzle syntax
    const photos = await db.select()
      .from(photosTable)
      .where(eq(photosTable.id, result.id))
      .execute();

    expect(photos).toHaveLength(1);
    expect(photos[0].filename).toEqual('test-photo-123.jpg');
    expect(photos[0].original_name).toEqual('My Test Photo.jpg');
    expect(photos[0].file_path).toEqual('/uploads/photos/test-photo-123.jpg');
    expect(photos[0].uploaded_by).toEqual('john_doe');
    expect(photos[0].uploaded_at).toBeInstanceOf(Date);
  });

  it('should handle different file types', async () => {
    const pngInput: UploadPhotoInput = {
      filename: 'image.png',
      original_name: 'Screenshot 2024.png',
      file_path: '/uploads/photos/image.png',
      uploaded_by: 'jane_smith'
    };

    const result = await uploadPhoto(pngInput);

    expect(result.filename).toEqual('image.png');
    expect(result.original_name).toEqual('Screenshot 2024.png');
    expect(result.uploaded_by).toEqual('jane_smith');
    expect(result.id).toBeDefined();
  });

  it('should handle long file paths', async () => {
    const longPathInput: UploadPhotoInput = {
      filename: 'very-long-filename-with-lots-of-characters.jpg',
      original_name: 'Original Very Long Filename With Lots Of Characters.jpg',
      file_path: '/uploads/photos/2024/01/15/subfolder/very-long-filename-with-lots-of-characters.jpg',
      uploaded_by: 'photographer_user'
    };

    const result = await uploadPhoto(longPathInput);

    expect(result.filename).toEqual('very-long-filename-with-lots-of-characters.jpg');
    expect(result.file_path).toEqual('/uploads/photos/2024/01/15/subfolder/very-long-filename-with-lots-of-characters.jpg');
    expect(result.uploaded_by).toEqual('photographer_user');
  });

  it('should create multiple photos independently', async () => {
    const input1: UploadPhotoInput = {
      filename: 'photo1.jpg',
      original_name: 'First Photo.jpg',
      file_path: '/uploads/photos/photo1.jpg',
      uploaded_by: 'user1'
    };

    const input2: UploadPhotoInput = {
      filename: 'photo2.png',
      original_name: 'Second Photo.png',
      file_path: '/uploads/photos/photo2.png',
      uploaded_by: 'user2'
    };

    const result1 = await uploadPhoto(input1);
    const result2 = await uploadPhoto(input2);

    // Verify both photos have different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.filename).toEqual('photo1.jpg');
    expect(result2.filename).toEqual('photo2.png');
    expect(result1.uploaded_by).toEqual('user1');
    expect(result2.uploaded_by).toEqual('user2');

    // Verify both are in database
    const allPhotos = await db.select().from(photosTable).execute();
    expect(allPhotos).toHaveLength(2);
  });

  it('should handle special characters in names', async () => {
    const specialInput: UploadPhotoInput = {
      filename: 'café-photo_2024.jpg',
      original_name: 'Café Photo #1 (2024).jpg',
      file_path: '/uploads/photos/café-photo_2024.jpg',
      uploaded_by: 'user@example.com'
    };

    const result = await uploadPhoto(specialInput);

    expect(result.filename).toEqual('café-photo_2024.jpg');
    expect(result.original_name).toEqual('Café Photo #1 (2024).jpg');
    expect(result.uploaded_by).toEqual('user@example.com');
  });
});