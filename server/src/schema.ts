import { z } from 'zod';

// Photo schema
export const photoSchema = z.object({
  id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  file_path: z.string(),
  uploaded_by: z.string(),
  uploaded_at: z.coerce.date()
});

export type Photo = z.infer<typeof photoSchema>;

// Input schema for uploading photos
export const uploadPhotoInputSchema = z.object({
  filename: z.string().min(1),
  original_name: z.string().min(1),
  file_path: z.string().min(1),
  uploaded_by: z.string().min(1)
});

export type UploadPhotoInput = z.infer<typeof uploadPhotoInputSchema>;

// Video schema
export const videoSchema = z.object({
  id: z.number(),
  title: z.string(),
  video_url: z.string(),
  thumbnail_url: z.string().nullable(),
  uploaded_by: z.string(),
  uploaded_at: z.coerce.date()
});

export type Video = z.infer<typeof videoSchema>;

// Input schema for adding videos
export const addVideoInputSchema = z.object({
  title: z.string().min(1),
  video_url: z.string().url(),
  thumbnail_url: z.string().url().nullable().optional(),
  uploaded_by: z.string().min(1)
});

export type AddVideoInput = z.infer<typeof addVideoInputSchema>;

// Guestbook message schema
export const guestbookMessageSchema = z.object({
  id: z.number(),
  author_name: z.string(),
  message: z.string(),
  created_at: z.coerce.date()
});

export type GuestbookMessage = z.infer<typeof guestbookMessageSchema>;

// Input schema for creating guestbook messages
export const createGuestbookMessageInputSchema = z.object({
  author_name: z.string().min(1).max(100),
  message: z.string().min(1).max(1000)
});

export type CreateGuestbookMessageInput = z.infer<typeof createGuestbookMessageInputSchema>;

// Input schema for getting photos with optional pagination
export const getPhotosInputSchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional()
});

export type GetPhotosInput = z.infer<typeof getPhotosInputSchema>;

// Input schema for getting videos with optional pagination
export const getVideosInputSchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional()
});

export type GetVideosInput = z.infer<typeof getVideosInputSchema>;

// Input schema for getting guestbook messages with optional pagination
export const getGuestbookMessagesInputSchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional()
});

export type GetGuestbookMessagesInput = z.infer<typeof getGuestbookMessagesInputSchema>;