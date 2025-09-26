#!/usr/bin/env node

/**
 * Sensora Secure Messaging System
 * Main entry point for the tamper-proof, encrypted messaging system
 */

import { SensoraCliI } from './cli';

// Export main components for programmatic use
export { SecureMessenger } from './messaging/secure-messenger';
export { E2EEncryption } from './crypto/encryption';
export { KeyManager } from './crypto/keys';
export { SelfDestructingMessage } from './messaging/self-destruct';
export { MetadataResistance } from './messaging/metadata-resistance';
export * from './types';

// Start CLI interface when run directly
if (require.main === module) {
  const cli = new SensoraCliI();
  cli.start().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}