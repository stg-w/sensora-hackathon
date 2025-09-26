import { KeyManager } from './keys';
import * as crypto from 'crypto';

describe('KeyManager', () => {
  test('should generate valid RSA key pair', () => {
    const keyPair = KeyManager.generateKeyPair();
    
    expect(keyPair.publicKey).toBeDefined();
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey.format).toBe('pem');
    expect(keyPair.privateKey.format).toBe('pem');
    expect(keyPair.publicKey.key).toContain('BEGIN PUBLIC KEY');
    expect(keyPair.privateKey.key).toContain('BEGIN PRIVATE KEY');
  });

  test('should encrypt and decrypt data correctly', () => {
    const keyPair = KeyManager.generateKeyPair();
    const testData = Buffer.from('Secret military message', 'utf8');
    
    const encrypted = KeyManager.encryptWithPublicKey(testData, keyPair.publicKey);
    const decrypted = KeyManager.decryptWithPrivateKey(encrypted, keyPair.privateKey);
    
    expect(decrypted.toString('utf8')).toBe('Secret military message');
  });

  test('should create and verify digital signatures', () => {
    const keyPair = KeyManager.generateKeyPair();
    const testData = Buffer.from('Message to sign', 'utf8');
    
    const signature = KeyManager.sign(testData, keyPair.privateKey);
    const isValid = KeyManager.verify(testData, signature, keyPair.publicKey);
    
    expect(isValid).toBe(true);
  });

  test('should detect tampered signatures', () => {
    const keyPair = KeyManager.generateKeyPair();
    const testData = Buffer.from('Original message', 'utf8');
    const tamperedData = Buffer.from('Tampered message', 'utf8');
    
    const signature = KeyManager.sign(testData, keyPair.privateKey);
    const isValid = KeyManager.verify(tamperedData, signature, keyPair.publicKey);
    
    expect(isValid).toBe(false);
  });

  test('should generate ephemeral key pairs', () => {
    const ephemeralKeyPair1 = KeyManager.generateEphemeralKeyPair();
    const ephemeralKeyPair2 = KeyManager.generateEphemeralKeyPair();
    
    expect(ephemeralKeyPair1.publicKey.key).not.toBe(ephemeralKeyPair2.publicKey.key);
    expect(ephemeralKeyPair1.privateKey.key).not.toBe(ephemeralKeyPair2.privateKey.key);
  });

  test('should clear memory securely', () => {
    const buffer = Buffer.from('sensitive data', 'utf8');
    const originalData = buffer.toString('utf8');
    
    KeyManager.clearMemory(buffer);
    
    // Buffer should be zeroed out
    expect(buffer.toString('utf8')).not.toBe(originalData);
    expect(buffer.every(byte => byte === 0)).toBe(true);
  });
});