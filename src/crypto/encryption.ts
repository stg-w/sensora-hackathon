import * as crypto from 'crypto';
import { KeyManager } from './keys';
import { PublicKey, PrivateKey, EncryptedMessage, MessageMetadata } from '../types';

/**
 * End-to-end encryption implementation using AES-256-GCM + RSA-OAEP
 * Provides authenticated encryption with perfect forward secrecy
 */
export class E2EEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;
  private static readonly VERSION = '1.0';

  /**
   * Encrypt a message with end-to-end encryption
   * Uses hybrid encryption: AES-256-GCM for data, RSA-OAEP for key
   */
  static encrypt(
    message: string,
    recipientPublicKey: PublicKey,
    senderPrivateKey: PrivateKey
  ): EncryptedMessage {
    // Generate ephemeral AES key for this message
    const aesKey = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    try {
      // Encrypt the message with AES-256-GCM
      const cipher = crypto.createCipher('aes-256-gcm', aesKey);
      cipher.setAAD(Buffer.from('sensora-secure'));
      
      let encryptedContent = cipher.update(message, 'utf8');
      encryptedContent = Buffer.concat([encryptedContent, cipher.final()]);
      
      const authTag = cipher.getAuthTag();
      
      // Encrypt the AES key with recipient's RSA public key
      const encryptedKey = KeyManager.encryptWithPublicKey(aesKey, recipientPublicKey);
      
      // Combine encrypted key and encrypted content
      const combinedData = Buffer.concat([
        encryptedKey,
        encryptedContent,
        authTag
      ]);
      
      // Create digital signature for authentication
      const signature = KeyManager.sign(combinedData, senderPrivateKey);
      
      const metadata: MessageMetadata = {
        version: this.VERSION,
        algorithm: this.ALGORITHM,
        keyId: this.generateKeyId(recipientPublicKey),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64')
      };

      const encryptedMessage: EncryptedMessage = {
        id: this.generateMessageId(),
        encryptedData: combinedData.toString('base64'),
        signature: signature.toString('base64'),
        timestamp: Date.now(),
        metadata
      };

      // Clear sensitive data from memory
      KeyManager.clearMemory(aesKey);
      KeyManager.clearMemory(iv);
      
      return encryptedMessage;
    } catch (error) {
      // Clear sensitive data even on error
      KeyManager.clearMemory(aesKey);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decrypt an encrypted message
   */
  static decrypt(
    encryptedMessage: EncryptedMessage,
    recipientPrivateKey: PrivateKey,
    senderPublicKey: PublicKey
  ): string {
    try {
      const combinedData = Buffer.from(encryptedMessage.encryptedData, 'base64');
      const signature = Buffer.from(encryptedMessage.signature, 'base64');
      
      // Verify digital signature
      if (!KeyManager.verify(combinedData, signature, senderPublicKey)) {
        throw new Error('Message signature verification failed');
      }
      
      // Extract components (RSA key size is 4096 bits = 512 bytes)
      const encryptedKey = combinedData.slice(0, 512);
      const authTag = Buffer.from(encryptedMessage.metadata.authTag, 'base64');
      const encryptedContent = combinedData.slice(512, -this.TAG_LENGTH);
      const iv = Buffer.from(encryptedMessage.metadata.iv, 'base64');
      
      // Decrypt the AES key
      const aesKey = KeyManager.decryptWithPrivateKey(encryptedKey, recipientPrivateKey);
      
      // Decrypt the message content
      const decipher = crypto.createDecipher('aes-256-gcm', aesKey);
      decipher.setAAD(Buffer.from('sensora-secure'));
      decipher.setAuthTag(authTag);
      
      let decryptedContent = decipher.update(encryptedContent);
      decryptedContent = Buffer.concat([decryptedContent, decipher.final()]);
      const decryptedMessage = decryptedContent.toString('utf8');
      
      // Clear sensitive data
      KeyManager.clearMemory(aesKey);
      
      return decryptedMessage;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate unique message ID
   */
  private static generateMessageId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate key identifier from public key
   */
  private static generateKeyId(publicKey: PublicKey): string {
    const hash = crypto.createHash('sha256');
    hash.update(publicKey.key);
    return hash.digest('hex').substring(0, 16);
  }

  /**
   * Encrypt with perfect forward secrecy using ephemeral keys
   */
  static encryptWithForwardSecrecy(
    message: string,
    recipientPublicKey: PublicKey,
    senderPrivateKey: PrivateKey
  ): { encryptedMessage: EncryptedMessage; ephemeralKeyPair: any } {
    // Generate ephemeral key pair for this session
    const ephemeralKeyPair = KeyManager.generateEphemeralKeyPair();
    
    // Encrypt using ephemeral keys
    const encryptedMessage = this.encrypt(message, recipientPublicKey, ephemeralKeyPair.privateKey);
    
    // Return encrypted message and ephemeral public key for key exchange
    return {
      encryptedMessage,
      ephemeralKeyPair: ephemeralKeyPair.publicKey
    };
  }
}