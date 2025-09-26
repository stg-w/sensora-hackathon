export interface PublicKey {
  key: string;
  format: 'pem';
}

export interface PrivateKey {
  key: string;
  format: 'pem';
}

export interface KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

export interface EncryptedMessage {
  id: string;
  encryptedData: string;
  signature: string;
  timestamp: number;
  expiresAt?: number;
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  version: string;
  algorithm: string;
  keyId: string;
  iv: string;
  authTag: string;
}

export interface SecureMessage {
  id: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: number;
  expiresAt?: number;
  isDestructible: boolean;
}

export interface MessageOptions {
  ttl?: number; // Time to live in seconds
  requireConfirmation?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface CryptoConfig {
  keySize: number;
  algorithm: string;
  hashAlgorithm: string;
  signatureAlgorithm: string;
}