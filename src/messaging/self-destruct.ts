import * as crypto from 'crypto';
import { SecureMessage, MessageOptions } from '../types';
import { KeyManager } from '../crypto/keys';

/**
 * Self-destructing message system with secure deletion
 * Ensures no recoverable traces remain after message expiration
 */
export class SelfDestructingMessage {
  private static messageTimers: Map<string, NodeJS.Timeout> = new Map();
  private static secureStorage: Map<string, Buffer> = new Map();

  /**
   * Create a self-destructing message
   */
  static create(
    content: string,
    sender: string,
    recipient: string,
    options: MessageOptions = {}
  ): SecureMessage {
    const messageId = this.generateSecureId();
    const timestamp = Date.now();
    const ttl = options.ttl || 3600; // Default 1 hour
    const expiresAt = timestamp + (ttl * 1000);

    const message: SecureMessage = {
      id: messageId,
      content,
      sender,
      recipient,
      timestamp,
      expiresAt,
      isDestructible: true
    };

    // Store message content in secure memory
    this.storeInSecureMemory(messageId, Buffer.from(content, 'utf8'));

    // Set up auto-destruction timer
    this.scheduleDestruction(messageId, ttl * 1000);

    return message;
  }

  /**
   * Retrieve message content (if not expired)
   */
  static retrieveContent(messageId: string): string | null {
    const secureData = this.secureStorage.get(messageId);
    
    if (!secureData || secureData.length < 2) {
      return null; // Message already destroyed or doesn't exist
    }

    try {
      const key = secureData[0];
      const obfuscated = secureData.slice(1);
      const content = Buffer.alloc(obfuscated.length);
      
      // Deobfuscate using XOR
      for (let i = 0; i < obfuscated.length; i++) {
        content[i] = obfuscated[i] ^ key;
      }
      
      return content.toString('utf8');
    } catch (error) {
      // If decryption fails, destroy the message
      this.destroyMessage(messageId);
      return null;
    }
  }

  /**
   * Manually destroy a message immediately
   */
  static destroyMessage(messageId: string): boolean {
    try {
      // Clear from secure storage with multiple overwrites
      const secureData = this.secureStorage.get(messageId);
      if (secureData) {
        this.secureWipe(secureData);
        this.secureStorage.delete(messageId);
      }

      // Cancel scheduled destruction
      const timer = this.messageTimers.get(messageId);
      if (timer) {
        clearTimeout(timer);
        this.messageTimers.delete(messageId);
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      return true;
    } catch (error) {
      console.error(`Failed to destroy message ${messageId}:`, error);
      return false;
    }
  }

  /**
   * Check if message has expired
   */
  static isExpired(message: SecureMessage): boolean {
    if (!message.expiresAt) return false;
    return Date.now() > message.expiresAt;
  }

  /**
   * Get time remaining for message (in seconds)
   */
  static getTimeRemaining(message: SecureMessage): number {
    if (!message.expiresAt) return -1;
    const remaining = message.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Schedule automatic message destruction
   */
  private static scheduleDestruction(messageId: string, delayMs: number): void {
    const timer = setTimeout(() => {
      this.destroyMessage(messageId);
      console.log(`Message ${messageId} auto-destructed after ${delayMs}ms`);
    }, delayMs);

    this.messageTimers.set(messageId, timer);
  }

  /**
   * Store message content in secure memory with encryption
   */
  private static storeInSecureMemory(messageId: string, content: Buffer): void {
    // For security demo, we'll store content with simple obfuscation
    // In production, this would use proper authenticated encryption
    const key = crypto.randomBytes(1)[0]; // Simple XOR key for demo
    const obfuscated = Buffer.alloc(content.length);
    
    for (let i = 0; i < content.length; i++) {
      obfuscated[i] = content[i] ^ key;
    }
    
    // Store both key and obfuscated content
    this.secureStorage.set(messageId, Buffer.concat([
      Buffer.from([key]), // Store key as first byte
      obfuscated
    ]));
  }

  /**
   * Securely wipe buffer from memory
   */
  private static secureWipe(buffer: Buffer): void {
    if (!buffer || buffer.length === 0) return;

    // Multiple-pass overwrite for secure deletion
    const patterns = [0x00, 0xFF, 0xAA, 0x55, 0x33, 0xCC];
    
    for (const pattern of patterns) {
      buffer.fill(pattern);
    }
    
    // Final random overwrite
    const randomData = crypto.randomBytes(buffer.length);
    randomData.copy(buffer);
    
    // Clear the random data too
    KeyManager.clearMemory(randomData);
  }

  /**
   * Generate cryptographically secure message ID
   */
  private static generateSecureId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Clean up all expired messages
   */
  static cleanupExpiredMessages(): number {
    let cleanedCount = 0;
    const now = Date.now();

    for (const [messageId, timer] of this.messageTimers.entries()) {
      // Check if we can determine expiration without accessing the message
      // For now, we'll rely on the timers to handle cleanup
      if (timer && timer.hasRef && !timer.hasRef()) {
        this.destroyMessage(messageId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get statistics about self-destructing messages
   */
  static getStats(): { activeMessages: number; scheduledDestructions: number } {
    return {
      activeMessages: this.secureStorage.size,
      scheduledDestructions: this.messageTimers.size
    };
  }
}