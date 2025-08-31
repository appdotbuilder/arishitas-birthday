import { serial, text, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

// Photos table
export const photosTable = pgTable('photos', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  original_name: varchar('original_name', { length: 255 }).notNull(),
  file_path: text('file_path').notNull(),
  uploaded_by: varchar('uploaded_by', { length: 100 }).notNull(),
  uploaded_at: timestamp('uploaded_at').defaultNow().notNull(),
});

// Videos table
export const videosTable = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  video_url: text('video_url').notNull(),
  thumbnail_url: text('thumbnail_url'), // Nullable by default
  uploaded_by: varchar('uploaded_by', { length: 100 }).notNull(),
  uploaded_at: timestamp('uploaded_at').defaultNow().notNull(),
});

// Guestbook messages table
export const guestbookMessagesTable = pgTable('guestbook_messages', {
  id: serial('id').primaryKey(),
  author_name: varchar('author_name', { length: 100 }).notNull(),
  message: text('message').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type Photo = typeof photosTable.$inferSelect;
export type NewPhoto = typeof photosTable.$inferInsert;

export type Video = typeof videosTable.$inferSelect;
export type NewVideo = typeof videosTable.$inferInsert;

export type GuestbookMessage = typeof guestbookMessagesTable.$inferSelect;
export type NewGuestbookMessage = typeof guestbookMessagesTable.$inferInsert;

// Important: Export all tables for proper query building
export const tables = { 
  photos: photosTable,
  videos: videosTable, 
  guestbookMessages: guestbookMessagesTable 
};