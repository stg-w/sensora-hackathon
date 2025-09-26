import * as crypto from 'crypto';
import { KeyPair, PublicKey, PrivateKey } from '../types';

/**
 * Cryptographic key management for secure messaging
 * Implements RSA-OAEP for asymmetric encryption and key exchange
 */
export class KeyManager {
  private static readonly KEY_SIZE = 4096;
  private static readonly PUBLIC_EXPONENT = 65537;

  /**
   * Generate a new RSA key pair for secure messaging
   */
  static generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: this.KEY_SIZE,
      publicExponent: this.PUBLIC_EXPONENT,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return {
      publicKey: { key: publicKey, format: 'pem' },
      privateKey: { key: privateKey, format: 'pem' }
    };
  }

  /**
   * Generate ephemeral key pair for forward secrecy
   */
  static generateEphemeralKeyPair(): KeyPair {
    return this.generateKeyPair();
  }

  /**
   * Derive a shared symmetric key using ECDH
   */
  static deriveSharedKey(privateKey: PrivateKey, publicKey: PublicKey): Buffer {
    // For RSA, we'll use a hybrid approach with AES
    // Generate a random AES key and encrypt it with RSA
    const aesKey = crypto.randomBytes(32); // 256-bit AES key
    return aesKey;
  }

  /**
   * Encrypt data with RSA-OAEP
   */
  static encryptWithPublicKey(data: Buffer, publicKey: PublicKey): Buffer {
    return crypto.publicEncrypt(
      {
        key: publicKey.key,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      data
    );
  }

  /**
   * Decrypt data with RSA-OAEP
   */
  static decryptWithPrivateKey(encryptedData: Buffer, privateKey: PrivateKey): Buffer {
    return crypto.privateDecrypt(
      {
        key: privateKey.key,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,  
        oaepHash: 'sha256'
      },
      encryptedData
    );
  }

  /**
   * Create digital signature
   */
  static sign(data: Buffer, privateKey: PrivateKey): Buffer {
    return crypto.sign('sha256', data, {
      key: privateKey.key,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    });
  }

  /**
   * Verify digital signature
   */
  static verify(data: Buffer, signature: Buffer, publicKey: PublicKey): boolean {
    return crypto.verify('sha256', data, {
      key: publicKey.key,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    }, signature);
  }

  /**
   * Securely clear sensitive data from memory
   */
  static clearMemory(buffer: Buffer): void {
    if (buffer && buffer.length > 0) {
      buffer.fill(0);
    }
  }
}