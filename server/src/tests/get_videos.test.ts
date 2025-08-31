import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { videosTable } from '../db/schema';
import { type GetVideosInput, type AddVideoInput } from '../schema';
import { getVideos } from '../handlers/get_videos';

// Test video data
const testVideos: AddVideoInput[] = [
  {
    title: 'First Video',
    video_url: 'https://example.com/video1.mp4',
    thumbnail_url: 'https://example.com/thumb1.jpg',
    uploaded_by: 'user1'
  },
  {
    title: 'Second Video',
    video_url: 'https://example.com/video2.mp4',
    thumbnail_url: null,
    uploaded_by: 'user2'
  },
  {
    title: 'Third Video',
    video_url: 'https://example.com/video3.mp4',
    thumbnail_url: 'https://example.com/thumb3.jpg',
    uploaded_by: 'user1'
  }
];

describe('getVideos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no videos exist', async () => {
    const result = await getVideos();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all videos ordered by newest first', async () => {
    // Insert test videos with slight delay to ensure different timestamps
    for (let i = 0; i < testVideos.length; i++) {
      await db.insert(videosTable).values({
        ...testVideos[i],
        thumbnail_url: testVideos[i].thumbnail_url || null
      }).execute();
      
      // Small delay to ensure different timestamps
      if (i < testVideos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const result = await getVideos();

    // Should return all 3 videos
    expect(result).toHaveLength(3);
    
    // Verify all required fields are present
    result.forEach(video => {
      expect(video.id).toBeDefined();
      expect(typeof video.title).toBe('string');
      expect(typeof video.video_url).toBe('string');
      expect(video.thumbnail_url === null || typeof video.thumbnail_url === 'string').toBe(true);
      expect(typeof video.uploaded_by).toBe('string');
      expect(video.uploaded_at).toBeInstanceOf(Date);
    });

    // Should be ordered by newest first (latest timestamp first)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].uploaded_at >= result[i + 1].uploaded_at).toBe(true);
    }
  });

  it('should handle pagination with limit', async () => {
    // Insert test videos
    for (const video of testVideos) {
      await db.insert(videosTable).values({
        ...video,
        thumbnail_url: video.thumbnail_url || null
      }).execute();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const input: GetVideosInput = { limit: 2 };
    const result = await getVideos(input);

    expect(result).toHaveLength(2);
    
    // Should still be ordered by newest first
    expect(result[0].uploaded_at >= result[1].uploaded_at).toBe(true);
  });

  it('should handle pagination with offset', async () => {
    // Insert test videos
    for (const video of testVideos) {
      await db.insert(videosTable).values({
        ...video,
        thumbnail_url: video.thumbnail_url || null
      }).execute();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const input: GetVideosInput = { offset: 1 };
    const result = await getVideos(input);

    expect(result).toHaveLength(2); // Should skip first video
    
    // Get all videos to compare
    const allVideos = await getVideos();
    
    // Results should match all videos except the first one
    expect(result[0].id).toEqual(allVideos[1].id);
    expect(result[1].id).toEqual(allVideos[2].id);
  });

  it('should handle pagination with both limit and offset', async () => {
    // Insert test videos
    for (const video of testVideos) {
      await db.insert(videosTable).values({
        ...video,
        thumbnail_url: video.thumbnail_url || null
      }).execute();
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const input: GetVideosInput = { limit: 1, offset: 1 };
    const result = await getVideos(input);

    expect(result).toHaveLength(1); // Should return only 1 video
    
    // Get all videos to compare
    const allVideos = await getVideos();
    
    // Should return the second video (index 1)
    expect(result[0].id).toEqual(allVideos[1].id);
  });

  it('should handle empty input object', async () => {
    // Insert one test video
    await db.insert(videosTable).values({
      ...testVideos[0],
      thumbnail_url: testVideos[0].thumbnail_url || null
    }).execute();

    const result = await getVideos({});

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('First Video');
  });

  it('should handle videos with null thumbnail_url', async () => {
    const videoWithoutThumbnail = testVideos[1]; // Has thumbnail_url: null
    
    await db.insert(videosTable).values({
      ...videoWithoutThumbnail,
      thumbnail_url: null
    }).execute();

    const result = await getVideos();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Second Video');
    expect(result[0].thumbnail_url).toBeNull();
    expect(result[0].video_url).toEqual('https://example.com/video2.mp4');
    expect(result[0].uploaded_by).toEqual('user2');
  });
});