import { db } from '../db';
import { guestbookMessagesTable } from '../db/schema';
import { type GuestbookMessage, type GetGuestbookMessagesInput } from '../schema';
import { desc } from 'drizzle-orm';

export const getGuestbookMessages = async (input?: GetGuestbookMessagesInput): Promise<GuestbookMessage[]> => {
  try {
    // Build the complete query based on input parameters
    let baseQuery = db.select()
      .from(guestbookMessagesTable)
      .orderBy(desc(guestbookMessagesTable.created_at));

    // Handle pagination cases
    if (input?.limit !== undefined && input?.offset !== undefined) {
      // Both limit and offset provided
      const results = await baseQuery
        .limit(input.limit)
        .offset(input.offset)
        .execute();
      return results;
    } else if (input?.limit !== undefined) {
      // Only limit provided
      const results = await baseQuery
        .limit(input.limit)
        .execute();
      return results;
    } else if (input?.offset !== undefined) {
      // Only offset provided
      const results = await baseQuery
        .offset(input.offset)
        .execute();
      return results;
    } else {
      // No pagination parameters
      const results = await baseQuery.execute();
      return results;
    }
  } catch (error) {
    console.error('Failed to fetch guestbook messages:', error);
    throw error;
  }
};