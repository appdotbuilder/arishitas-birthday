import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { guestbookMessagesTable } from '../db/schema';
import { type CreateGuestbookMessageInput } from '../schema';
import { createGuestbookMessage } from '../handlers/create_guestbook_message';
import { eq, gte, between, and } from 'drizzle-orm';

// Simple test input
const testInput: CreateGuestbookMessageInput = {
  author_name: 'John Doe',
  message: 'This is a test guestbook message for testing purposes.'
};

describe('createGuestbookMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a guestbook message', async () => {
    const result = await createGuestbookMessage(testInput);

    // Basic field validation
    expect(result.author_name).toEqual('John Doe');
    expect(result.message).toEqual('This is a test guestbook message for testing purposes.');
    expect(result.id).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save guestbook message to database', async () => {
    const result = await createGuestbookMessage(testInput);

    // Query using proper drizzle syntax
    const messages = await db.select()
      .from(guestbookMessagesTable)
      .where(eq(guestbookMessagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].author_name).toEqual('John Doe');
    expect(messages[0].message).toEqual('This is a test guestbook message for testing purposes.');
    expect(messages[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle long author names and messages correctly', async () => {
    const longInput: CreateGuestbookMessageInput = {
      author_name: 'A'.repeat(100), // Max length according to schema
      message: 'B'.repeat(1000) // Max length according to schema
    };

    const result = await createGuestbookMessage(longInput);

    expect(result.author_name).toEqual('A'.repeat(100));
    expect(result.message).toEqual('B'.repeat(1000));
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should query messages by date range correctly', async () => {
    // Create test message
    await createGuestbookMessage(testInput);

    // Test date filtering - demonstration of correct date handling
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Apply date filter - Date objects work directly with timestamp columns
    const messages = await db.select()
      .from(guestbookMessagesTable)
      .where(
        and(
          gte(guestbookMessagesTable.created_at, yesterday),
          between(guestbookMessagesTable.created_at, yesterday, tomorrow)
        )
      )
      .execute();

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach(message => {
      expect(message.created_at).toBeInstanceOf(Date);
      expect(message.created_at >= yesterday).toBe(true);
      expect(message.created_at <= tomorrow).toBe(true);
    });
  });

  it('should create multiple messages with unique IDs', async () => {
    const input1: CreateGuestbookMessageInput = {
      author_name: 'Alice',
      message: 'First message'
    };

    const input2: CreateGuestbookMessageInput = {
      author_name: 'Bob',
      message: 'Second message'
    };

    const result1 = await createGuestbookMessage(input1);
    const result2 = await createGuestbookMessage(input2);

    // Check that IDs are unique and incremental
    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
    expect(result1.id).not.toEqual(result2.id);
    expect(result2.id).toBeGreaterThan(result1.id);

    // Verify both messages are in database
    const allMessages = await db.select()
      .from(guestbookMessagesTable)
      .execute();

    expect(allMessages).toHaveLength(2);
    expect(allMessages.find(m => m.author_name === 'Alice')).toBeDefined();
    expect(allMessages.find(m => m.author_name === 'Bob')).toBeDefined();
  });

  it('should handle special characters in messages', async () => {
    const specialInput: CreateGuestbookMessageInput = {
      author_name: 'José María',
      message: 'Hello! 🌟 This message contains special chars: @#$%^&*()_+ and unicode: café, naïve, résumé'
    };

    const result = await createGuestbookMessage(specialInput);

    expect(result.author_name).toEqual('José María');
    expect(result.message).toEqual('Hello! 🌟 This message contains special chars: @#$%^&*()_+ and unicode: café, naïve, résumé');
    
    // Verify it's properly stored in database
    const savedMessage = await db.select()
      .from(guestbookMessagesTable)
      .where(eq(guestbookMessagesTable.id, result.id))
      .execute();

    expect(savedMessage[0].author_name).toEqual('José María');
    expect(savedMessage[0].message).toEqual('Hello! 🌟 This message contains special chars: @#$%^&*()_+ and unicode: café, naïve, résumé');
  });
});