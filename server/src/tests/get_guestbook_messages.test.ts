import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guestbookMessagesTable } from '../db/schema';
import { type GetGuestbookMessagesInput } from '../schema';
import { getGuestbookMessages } from '../handlers/get_guestbook_messages';

describe('getGuestbookMessages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no messages exist', async () => {
    const result = await getGuestbookMessages();

    expect(result).toEqual([]);
  });

  it('should return all messages when no pagination is provided', async () => {
    // Create test messages one by one to ensure different timestamps
    await db.insert(guestbookMessagesTable)
      .values({
        author_name: 'Alice',
        message: 'First message'
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(guestbookMessagesTable)
      .values({
        author_name: 'Bob',
        message: 'Second message'
      })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(guestbookMessagesTable)
      .values({
        author_name: 'Charlie',
        message: 'Third message'
      })
      .execute();

    const result = await getGuestbookMessages();

    expect(result).toHaveLength(3);
    expect(result[0].author_name).toBe('Charlie'); // Newest first
    expect(result[1].author_name).toBe('Bob');
    expect(result[2].author_name).toBe('Alice'); // Oldest last
  });

  it('should return messages in descending order by created_at', async () => {
    // Create messages with slight delays to ensure different timestamps
    await db.insert(guestbookMessagesTable)
      .values({
        author_name: 'First',
        message: 'I was here first'
      })
      .execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(guestbookMessagesTable)
      .values({
        author_name: 'Second',
        message: 'I came later'
      })
      .execute();

    const result = await getGuestbookMessages();

    expect(result).toHaveLength(2);
    expect(result[0].author_name).toBe('Second'); // Most recent first
    expect(result[1].author_name).toBe('First');
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
  });

  it('should apply limit when provided', async () => {
    // Create 5 test messages with delays to ensure proper ordering
    const users = ['User1', 'User2', 'User3', 'User4', 'User5'];
    
    for (const user of users) {
      await db.insert(guestbookMessagesTable)
        .values({ 
          author_name: user, 
          message: `Message from ${user}` 
        })
        .execute();
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const input: GetGuestbookMessagesInput = {
      limit: 3
    };

    const result = await getGuestbookMessages(input);

    expect(result).toHaveLength(3);
    // Should return the 3 most recent messages
    expect(result[0].author_name).toBe('User5');
    expect(result[1].author_name).toBe('User4');
    expect(result[2].author_name).toBe('User3');
  });

  it('should apply offset when provided', async () => {
    // Create 5 test messages with delays to ensure proper ordering
    const users = ['User1', 'User2', 'User3', 'User4', 'User5'];
    
    for (const user of users) {
      await db.insert(guestbookMessagesTable)
        .values({ 
          author_name: user, 
          message: `Message from ${user}` 
        })
        .execute();
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const input: GetGuestbookMessagesInput = {
      offset: 2
    };

    const result = await getGuestbookMessages(input);

    expect(result).toHaveLength(3); // Total 5 - offset 2 = 3 remaining
    // Should skip the 2 most recent messages
    expect(result[0].author_name).toBe('User3');
    expect(result[1].author_name).toBe('User2');
    expect(result[2].author_name).toBe('User1');
  });

  it('should apply both limit and offset when provided', async () => {
    // Create 10 test messages with delays to ensure proper ordering
    for (let i = 1; i <= 10; i++) {
      await db.insert(guestbookMessagesTable)
        .values({
          author_name: `User${i}`,
          message: `Message ${i}`
        })
        .execute();
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const input: GetGuestbookMessagesInput = {
      limit: 3,
      offset: 2
    };

    const result = await getGuestbookMessages(input);

    expect(result).toHaveLength(3);
    // Should skip 2 most recent, then take next 3
    expect(result[0].author_name).toBe('User8');
    expect(result[1].author_name).toBe('User7');
    expect(result[2].author_name).toBe('User6');
  });

  it('should handle edge cases with pagination', async () => {
    // Create only 2 messages with delays to ensure proper ordering
    await db.insert(guestbookMessagesTable)
      .values({ author_name: 'User1', message: 'Message 1' })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(guestbookMessagesTable)
      .values({ author_name: 'User2', message: 'Message 2' })
      .execute();

    // Test offset beyond available records
    const result1 = await getGuestbookMessages({ offset: 5 });
    expect(result1).toHaveLength(0);

    // Test limit larger than available records
    const result2 = await getGuestbookMessages({ limit: 10 });
    expect(result2).toHaveLength(2);

    // Test zero limit
    const result3 = await getGuestbookMessages({ limit: 0 });
    expect(result3).toHaveLength(0);

    // Test zero offset (should be same as no offset)
    const result4 = await getGuestbookMessages({ offset: 0 });
    expect(result4).toHaveLength(2);
    expect(result4[0].author_name).toBe('User2'); // Most recent
  });

  it('should return proper message structure', async () => {
    await db.insert(guestbookMessagesTable)
      .values({
        author_name: 'Test User',
        message: 'This is a test message for structure validation'
      })
      .execute();

    const result = await getGuestbookMessages();

    expect(result).toHaveLength(1);
    const message = result[0];

    // Verify all required fields are present and have correct types
    expect(typeof message.id).toBe('number');
    expect(message.id).toBeGreaterThan(0);
    expect(message.author_name).toBe('Test User');
    expect(message.message).toBe('This is a test message for structure validation');
    expect(message.created_at).toBeInstanceOf(Date);
    expect(message.created_at.getTime()).toBeLessThanOrEqual(Date.now());
  });
});