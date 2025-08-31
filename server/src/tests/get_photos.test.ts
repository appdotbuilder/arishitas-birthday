import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { photosTable } from '../db/schema';
import { type GetPhotosInput } from '../schema';
import { getPhotos } from '../handlers/get_photos';

// Test photos data
const testPhotos = [
  {
    filename: 'photo1.jpg',
    original_name: 'My First Photo.jpg',
    file_path: '/uploads/photo1.jpg',
    uploaded_by: 'user1'
  },
  {
    filename: 'photo2.png',
    original_name: 'Second Photo.png',
    file_path: '/uploads/photo2.png',
    uploaded_by: 'user2'
  },
  {
    filename: 'photo3.gif',
    original_name: 'Third Photo.gif',
    file_path: '/uploads/photo3.gif',
    uploaded_by: 'user1'
  }
];

describe('getPhotos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no photos exist', async () => {
    const result = await getPhotos();
    expect(result).toEqual([]);
  });

  it('should return all photos when no input provided', async () => {
    // Insert test photos
    await db.insert(photosTable).values(testPhotos).execute();

    const result = await getPhotos();

    expect(result).toHaveLength(3);
    expect(result[0].filename).toBeDefined();
    expect(result[0].original_name).toBeDefined();
    expect(result[0].file_path).toBeDefined();
    expect(result[0].uploaded_by).toBeDefined();
    expect(result[0].uploaded_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should return photos ordered by upload date (newest first)', async () => {
    // Insert photos with different timestamps
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    await db.insert(photosTable).values([
      { ...testPhotos[0], uploaded_at: twoHoursAgo },
      { ...testPhotos[1], uploaded_at: now },
      { ...testPhotos[2], uploaded_at: oneHourAgo }
    ]).execute();

    const result = await getPhotos();

    expect(result).toHaveLength(3);
    // Should be ordered newest first
    expect(result[0].uploaded_at.getTime()).toBeGreaterThanOrEqual(result[1].uploaded_at.getTime());
    expect(result[1].uploaded_at.getTime()).toBeGreaterThanOrEqual(result[2].uploaded_at.getTime());
    expect(result[0].filename).toEqual('photo2.png'); // Most recent
    expect(result[2].filename).toEqual('photo1.jpg'); // Oldest
  });

  it('should apply limit correctly', async () => {
    await db.insert(photosTable).values(testPhotos).execute();

    const input: GetPhotosInput = { limit: 2 };
    const result = await getPhotos(input);

    expect(result).toHaveLength(2);
    expect(result[0].filename).toBeDefined();
    expect(result[1].filename).toBeDefined();
  });

  it('should apply offset correctly', async () => {
    await db.insert(photosTable).values(testPhotos).execute();

    const input: GetPhotosInput = { offset: 1 };
    const result = await getPhotos(input);

    expect(result).toHaveLength(2); // Should return 2 out of 3 photos
    expect(result[0].filename).toBeDefined();
    expect(result[1].filename).toBeDefined();
  });

  it('should apply both limit and offset correctly', async () => {
    await db.insert(photosTable).values(testPhotos).execute();

    const input: GetPhotosInput = { limit: 1, offset: 1 };
    const result = await getPhotos(input);

    expect(result).toHaveLength(1);
    expect(result[0].filename).toBeDefined();
  });

  it('should handle edge cases with pagination', async () => {
    await db.insert(photosTable).values(testPhotos).execute();

    // Test offset beyond available records
    const beyondInput: GetPhotosInput = { offset: 10 };
    const beyondResult = await getPhotos(beyondInput);
    expect(beyondResult).toEqual([]);

    // Test limit of 0
    const zeroLimitInput: GetPhotosInput = { limit: 0 };
    const zeroLimitResult = await getPhotos(zeroLimitInput);
    expect(zeroLimitResult).toEqual([]);

    // Test large limit
    const largeLimitInput: GetPhotosInput = { limit: 100 };
    const largeLimitResult = await getPhotos(largeLimitInput);
    expect(largeLimitResult).toHaveLength(3); // Should return all available photos
  });

  it('should return correct data types', async () => {
    await db.insert(photosTable).values([testPhotos[0]]).execute();

    const result = await getPhotos();

    expect(result).toHaveLength(1);
    const photo = result[0];
    
    expect(typeof photo.id).toBe('number');
    expect(typeof photo.filename).toBe('string');
    expect(typeof photo.original_name).toBe('string');
    expect(typeof photo.file_path).toBe('string');
    expect(typeof photo.uploaded_by).toBe('string');
    expect(photo.uploaded_at).toBeInstanceOf(Date);
  });

  it('should preserve all photo data fields', async () => {
    const testPhoto = testPhotos[0];
    await db.insert(photosTable).values([testPhoto]).execute();

    const result = await getPhotos();

    expect(result).toHaveLength(1);
    const photo = result[0];
    
    expect(photo.filename).toEqual(testPhoto.filename);
    expect(photo.original_name).toEqual(testPhoto.original_name);
    expect(photo.file_path).toEqual(testPhoto.file_path);
    expect(photo.uploaded_by).toEqual(testPhoto.uploaded_by);
  });
});