import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { videosTable } from '../db/schema';
import { type AddVideoInput } from '../schema';
import { addVideo } from '../handlers/add_video';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: AddVideoInput = {
  title: 'Test Video',
  video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  uploaded_by: 'testuser'
};

// Test input without optional thumbnail_url
const testInputWithoutThumbnail: AddVideoInput = {
  title: 'Video Without Thumbnail',
  video_url: 'https://vimeo.com/123456789',
  uploaded_by: 'anotheruser'
};

describe('addVideo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should add a video with thumbnail', async () => {
    const result = await addVideo(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Video');
    expect(result.video_url).toEqual('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.thumbnail_url).toEqual('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
    expect(result.uploaded_by).toEqual('testuser');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.uploaded_at).toBeInstanceOf(Date);
  });

  it('should add a video without thumbnail', async () => {
    const result = await addVideo(testInputWithoutThumbnail);

    // Basic field validation
    expect(result.title).toEqual('Video Without Thumbnail');
    expect(result.video_url).toEqual('https://vimeo.com/123456789');
    expect(result.thumbnail_url).toBeNull();
    expect(result.uploaded_by).toEqual('anotheruser');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.uploaded_at).toBeInstanceOf(Date);
  });

  it('should save video to database', async () => {
    const result = await addVideo(testInput);

    // Query using proper drizzle syntax
    const videos = await db.select()
      .from(videosTable)
      .where(eq(videosTable.id, result.id))
      .execute();

    expect(videos).toHaveLength(1);
    expect(videos[0].title).toEqual('Test Video');
    expect(videos[0].video_url).toEqual('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(videos[0].thumbnail_url).toEqual('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
    expect(videos[0].uploaded_by).toEqual('testuser');
    expect(videos[0].uploaded_at).toBeInstanceOf(Date);
  });

  it('should handle different video platforms', async () => {
    const youtubeInput: AddVideoInput = {
      title: 'YouTube Video',
      video_url: 'https://www.youtube.com/watch?v=example123',
      uploaded_by: 'youtubeuser'
    };

    const vimeoInput: AddVideoInput = {
      title: 'Vimeo Video',
      video_url: 'https://vimeo.com/987654321',
      uploaded_by: 'vimeouser'
    };

    // Add both videos
    const youtubeResult = await addVideo(youtubeInput);
    const vimeoResult = await addVideo(vimeoInput);

    // Verify both were created successfully
    expect(youtubeResult.title).toEqual('YouTube Video');
    expect(youtubeResult.video_url).toEqual('https://www.youtube.com/watch?v=example123');
    expect(youtubeResult.uploaded_by).toEqual('youtubeuser');

    expect(vimeoResult.title).toEqual('Vimeo Video');
    expect(vimeoResult.video_url).toEqual('https://vimeo.com/987654321');
    expect(vimeoResult.uploaded_by).toEqual('vimeouser');

    // Verify they have different IDs
    expect(youtubeResult.id).not.toEqual(vimeoResult.id);
  });

  it('should preserve video creation order', async () => {
    const firstVideo: AddVideoInput = {
      title: 'First Video',
      video_url: 'https://www.youtube.com/watch?v=first',
      uploaded_by: 'user1'
    };

    const secondVideo: AddVideoInput = {
      title: 'Second Video', 
      video_url: 'https://www.youtube.com/watch?v=second',
      uploaded_by: 'user2'
    };

    // Add videos in sequence
    const firstResult = await addVideo(firstVideo);
    const secondResult = await addVideo(secondVideo);

    // Verify creation timestamps are in order
    expect(firstResult.uploaded_at.getTime()).toBeLessThanOrEqual(secondResult.uploaded_at.getTime());

    // Query all videos and verify they're stored correctly
    const allVideos = await db.select()
      .from(videosTable)
      .execute();

    expect(allVideos).toHaveLength(2);
    
    const firstInDb = allVideos.find(v => v.id === firstResult.id);
    const secondInDb = allVideos.find(v => v.id === secondResult.id);

    expect(firstInDb).toBeDefined();
    expect(secondInDb).toBeDefined();
    expect(firstInDb!.title).toEqual('First Video');
    expect(secondInDb!.title).toEqual('Second Video');
  });
});