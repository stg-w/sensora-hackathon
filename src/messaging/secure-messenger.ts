import { E2EEncryption } from '../crypto/encryption';
import { KeyManager } from '../crypto/keys';
import { SelfDestructingMessage } from './self-destruct';
import { MetadataResistance } from './metadata-resistance';
import { 
  KeyPair, 
  SecureMessage, 
  EncryptedMessage, 
  MessageOptions, 
  PublicKey, 
  PrivateKey 
} from '../types';

/**
 * Main secure messaging system integrating all security features
 * Provides tamper-proof, encrypted messaging with metadata resistance
 */
export class SecureMessenger {
  private keyPair: KeyPair;
  private sessionId: string;
  private contacts: Map<string, PublicKey> = new Map();

  constructor() {
    this.keyPair = KeyManager.generateKeyPair();
    this.sessionId = this.generateSessionId();
    
    // Start traffic padding for metadata resistance
    MetadataResistance.startTrafficPadding(this.sessionId);
  }

  /**
   * Get public key for key exchange
   */
  getPublicKey(): PublicKey {
    return this.keyPair.publicKey;
  }

  /**
   * Add a contact's public key
   */
  addContact(contactId: string, publicKey: PublicKey): void {
    this.contacts.set(contactId, publicKey);
  }

  /**
   * Send a secure message with all security features enabled
   */
  async sendSecureMessage(
    recipientId: string,
    content: string,
    options: MessageOptions = {}
  ): Promise<{ messageId: string; encrypted: EncryptedMessage }> {
    const recipientPublicKey = this.contacts.get(recipientId);
    if (!recipientPublicKey) {
      throw new Error(`No public key found for recipient: ${recipientId}`);
    }

    try {
      // Create self-destructing message
      const secureMessage = SelfDestructingMessage.create(
        content,
        this.sessionId,
        recipientId,
        options
      );

      // Encrypt with end-to-end encryption
      let encryptedMessage: EncryptedMessage;
      
      if (options.requireConfirmation) {
        // Use perfect forward secrecy for critical messages
        const { encryptedMessage: encrypted } = E2EEncryption.encryptWithForwardSecrecy(
          content,
          recipientPublicKey,
          this.keyPair.privateKey
        );
        encryptedMessage = encrypted;
      } else {
        encryptedMessage = E2EEncryption.encrypt(
          content,
          recipientPublicKey,
          this.keyPair.privateKey
        );
      }

      // Add expiration to encrypted message
      if (options.ttl) {
        encryptedMessage.expiresAt = Date.now() + (options.ttl * 1000);
      }

      // Apply metadata resistance
      const obfuscatedMessage = MetadataResistance.obfuscateMessage(encryptedMessage);

      // Add to batch for timing obfuscation
      MetadataResistance.addToBatch(this.sessionId, obfuscatedMessage);

      console.log(`Secure message sent to ${recipientId} with ID: ${secureMessage.id}`);
      console.log(`Message will self-destruct in ${options.ttl || 3600} seconds`);

      return {
        messageId: secureMessage.id,
        encrypted: encryptedMessage
      };

    } catch (error) {
      throw new Error(`Failed to send secure message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Receive and decrypt a secure message
   */
  async receiveSecureMessage(
    encryptedMessage: EncryptedMessage,
    senderPublicKey: PublicKey
  ): Promise<SecureMessage | null> {
    try {
      // Check if message has expired
      if (encryptedMessage.expiresAt && Date.now() > encryptedMessage.expiresAt) {
        console.log(`Message ${encryptedMessage.id} has expired and cannot be decrypted`);
        return null;
      }

      // Decrypt the message
      const decryptedContent = E2EEncryption.decrypt(
        encryptedMessage,
        this.keyPair.privateKey,
        senderPublicKey
      );

      // Create secure message object
      const secureMessage: SecureMessage = {
        id: encryptedMessage.id,
        content: decryptedContent,
        sender: this.getContactId(senderPublicKey) || 'unknown',
        recipient: this.sessionId,
        timestamp: encryptedMessage.timestamp,
        expiresAt: encryptedMessage.expiresAt,
        isDestructible: true
      };

      // If message has TTL, set up self-destruction
      if (encryptedMessage.expiresAt) {
        const ttl = Math.max(0, encryptedMessage.expiresAt - Date.now()) / 1000;
        SelfDestructingMessage.create(
          decryptedContent,
          secureMessage.sender,
          secureMessage.recipient,
          { ttl }
        );
      }

      console.log(`Secure message received from ${secureMessage.sender}`);
      return secureMessage;

    } catch (error) {
      console.error(`Failed to decrypt message: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Send a critical priority message with maximum security
   */
  async sendCriticalMessage(
    recipientId: string,
    content: string,
    ttl: number = 1800 // 30 minutes default
  ): Promise<{ messageId: string; encrypted: EncryptedMessage }> {
    return this.sendSecureMessage(recipientId, content, {
      ttl,
      requireConfirmation: true,
      priority: 'critical'
    });
  }

  /**
   * Destroy a message immediately
   */
  destroyMessage(messageId: string): boolean {
    return SelfDestructingMessage.destroyMessage(messageId);
  }

  /**
   * Check message status and time remaining
   */
  getMessageStatus(message: SecureMessage): {
    isExpired: boolean;
    timeRemaining: number;
    status: string;
  } {
    const isExpired = SelfDestructingMessage.isExpired(message);
    const timeRemaining = SelfDestructingMessage.getTimeRemaining(message);
    
    let status: string;
    if (isExpired) {
      status = 'expired';
    } else if (timeRemaining < 300) { // Less than 5 minutes
      status = 'expiring_soon';
    } else {
      status = 'active';
    }

    return { isExpired, timeRemaining, status };
  }

  /**
   * Get system statistics
   */
  getSystemStats(): any {
    return {
      sessionId: this.sessionId,
      contacts: this.contacts.size,
      selfDestruct: SelfDestructingMessage.getStats(),
      metadataResistance: MetadataResistance.getStats()
    };
  }

  /**
   * Shutdown the messenger and clean up resources
   */
  shutdown(): void {
    // Stop metadata resistance traffic padding
    MetadataResistance.stopTrafficPadding(this.sessionId);
    
    // Clean up expired messages
    SelfDestructingMessage.cleanupExpiredMessages();
    
    // Clear sensitive data from memory
    if (this.keyPair.privateKey) {
      // In a real implementation, we'd securely wipe the private key
      console.log('Messenger shutdown complete');
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return require('crypto').randomBytes(16).toString('hex');
  }

  /**
   * Find contact ID by public key
   */
  private getContactId(publicKey: PublicKey): string | undefined {
    for (const [contactId, contactPublicKey] of this.contacts.entries()) {
      if (contactPublicKey.key === publicKey.key) {
        return contactId;
      }
    }
    return undefined;
  }

  /**
   * Perform secure key exchange with another party
   */
  async performKeyExchange(otherPartyPublicKey: PublicKey): Promise<string> {
    // In a real implementation, this would perform a proper key exchange protocol
    // For now, we'll simulate it by generating a shared session key
    const sharedKey = KeyManager.deriveSharedKey(this.keyPair.privateKey, otherPartyPublicKey);
    
    // Return a session identifier for this key exchange
    const sessionKey = require('crypto').createHash('sha256')
      .update(sharedKey)
      .digest('hex')
      .substring(0, 32);
    
    return sessionKey;
  }
}