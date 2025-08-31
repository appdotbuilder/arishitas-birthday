import { db } from '../db';
import { guestbookMessagesTable } from '../db/schema';
import { type CreateGuestbookMessageInput, type GuestbookMessage } from '../schema';

export const createGuestbookMessage = async (input: CreateGuestbookMessageInput): Promise<GuestbookMessage> => {
  try {
    // Insert guestbook message record
    const result = await db.insert(guestbookMessagesTable)
      .values({
        author_name: input.author_name,
        message: input.message
      })
      .returning()
      .execute();

    // Return the created message
    const message = result[0];
    return {
      ...message,
      created_at: message.created_at // Already a Date object from timestamp column
    };
  } catch (error) {
    console.error('Guestbook message creation failed:', error);
    throw error;
  }
};