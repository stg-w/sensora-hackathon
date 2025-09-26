# Sensora Secure Military Messaging System 🛡️

A tamper-proof, encrypted messaging system designed for mission-critical military communications with strong end-to-end encryption, metadata resistance, and self-destructing messages.

## 🔐 Security Features

### **Strong End-to-End Encryption**
- **AES-256-GCM**: Authenticated encryption for message content
- **RSA-4096-OAEP**: Asymmetric encryption for key exchange
- **Hybrid Cryptosystem**: Combines speed of symmetric with security of asymmetric encryption
- **Perfect Forward Secrecy**: Ephemeral keys ensure past communications remain secure

### **Self-Destructing Messages**
- **Configurable TTL**: Messages automatically expire after specified time
- **Secure Memory Wiping**: Multiple-pass overwrite prevents data recovery
- **Manual Destruction**: Immediate message deletion capability
- **No Recoverable Traces**: Complete elimination of message content

### **Metadata Resistance**
- **Traffic Padding**: Dummy messages obscure communication patterns
- **Message Batching**: Timing obfuscation prevents traffic analysis
- **Onion Routing**: Multi-layer encryption for sender anonymization
- **Size Normalization**: Prevents content analysis through size correlation
- **Timestamp Jittering**: Random delays prevent timing correlation

### **Message Authentication**
- **Digital Signatures**: RSA-PSS signatures prevent tampering
- **Key Fingerprinting**: Cryptographic identity verification
- **Tamper Detection**: Immediate detection of message modification
- **Non-Repudiation**: Cryptographic proof of message origin

## 🚀 Quick Start

### Installation
```bash
git clone https://github.com/stg-w/sensora-hackathon.git
cd sensora-hackathon
npm install
npm run build
```

### Run Security Demonstration
```bash
npm start demo
```

### Interactive Messaging Session
```bash
npm start
```

### Send a Message
```bash
npm start send --recipient "agent-001" --message "Mission Alpha: Proceed to coordinates" --ttl 3600
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Cryptography tests
npm test src/crypto/keys.test.ts

# Self-destructing message tests
npm test src/messaging/self-destruct.test.ts
```

## 🏗️ Architecture

### Core Components

#### **Cryptographic Layer** (`src/crypto/`)
- `KeyManager`: RSA key generation, encryption, decryption, and signing
- `E2EEncryption`: End-to-end encryption implementation with hybrid cryptosystem

#### **Messaging Layer** (`src/messaging/`)
- `SecureMessenger`: Main messaging interface integrating all security features
- `SelfDestructingMessage`: Automatic message expiration and secure deletion
- `MetadataResistance`: Traffic obfuscation and timing analysis prevention

#### **CLI Interface** (`src/cli/`)
- Interactive command-line interface for testing and demonstration
- Complete security feature showcase with real-time demonstrations

## 🔧 Configuration

### Message Options
```typescript
interface MessageOptions {
  ttl?: number;                    // Time to live in seconds
  requireConfirmation?: boolean;   // Use perfect forward secrecy
  priority?: 'low' | 'normal' | 'high' | 'critical';
}
```

### Cryptographic Configuration
```typescript
interface CryptoConfig {
  keySize: 4096;                   // RSA key size
  algorithm: 'aes-256-gcm';        // Symmetric encryption
  hashAlgorithm: 'sha256';         // Hash function
  signatureAlgorithm: 'rsa-pss';   // Digital signature algorithm
}
```

## 🎯 Usage Examples

### Basic Secure Messaging
```typescript
import { SecureMessenger } from './src/messaging/secure-messenger';

const messenger = new SecureMessenger();

// Add recipient
messenger.addContact('alice', alicePublicKey);

// Send secure message
const result = await messenger.sendSecureMessage(
  'alice',
  '🚁 Mission Alpha: Proceed to coordinates 34.0522°N 118.2437°W',
  { ttl: 3600, priority: 'critical' }
);
```

### Critical Message with Perfect Forward Secrecy
```typescript
const result = await messenger.sendCriticalMessage(
  'alice',
  'Top Secret: Operation details...',
  1800 // 30 minutes TTL
);
```

### Message Status Monitoring
```typescript
const status = messenger.getMessageStatus(message);
console.log(`Status: ${status.status}, Time remaining: ${status.timeRemaining}s`);
```

## 🛡️ Security Analysis

### **Threat Model Protection**

| Threat | Protection Mechanism | Implementation |
|--------|---------------------|----------------|
| **Eavesdropping** | AES-256-GCM + RSA-4096-OAEP | Hybrid encryption |
| **Traffic Analysis** | Metadata resistance + padding | Traffic obfuscation |
| **Message Tampering** | Digital signatures | RSA-PSS signatures |
| **Key Compromise** | Perfect forward secrecy | Ephemeral keys |
| **Data Recovery** | Secure deletion | Multi-pass wiping |
| **Timing Analysis** | Message batching | Timing obfuscation |

### **Cryptographic Primitives**
- **AES-256-GCM**: NIST-approved authenticated encryption
- **RSA-4096**: Quantum-resistant until cryptographically relevant quantum computers
- **SHA-256**: Collision-resistant cryptographic hash
- **RSA-PSS**: Provably secure digital signature scheme

## 📊 Performance Metrics

### **Encryption Performance**
- **Key Generation**: ~2-5 seconds (RSA-4096)
- **Message Encryption**: ~1-10ms (depending on message size)
- **Message Decryption**: ~1-10ms (depending on message size)
- **Signature Generation**: ~5-15ms
- **Signature Verification**: ~1-5ms

### **Security Metrics**
- **Key Strength**: 4096-bit RSA (equivalent to ~150-bit symmetric)
- **Encryption Strength**: 256-bit AES (quantum-resistant for ~30 years)
- **Hash Strength**: 256-bit SHA (collision-resistant)
- **Memory Clearing**: 6-pass overwrite (DoD 5220.22-M standard)

## 🌟 Advanced Features

### **Perfect Forward Secrecy**
Each critical message uses ephemeral key pairs, ensuring that compromise of long-term keys doesn't affect past communications.

### **Metadata Resistance**
- **Decoy Traffic**: Continuous dummy message generation
- **Size Padding**: Messages padded to standard sizes (1KB, 2KB, 4KB, etc.)
- **Batch Processing**: Messages sent in randomized batches
- **Routing Obfuscation**: Multi-hop routing with timing delays

### **Self-Destruction**
- **Time-based**: Messages expire after configurable TTL
- **Event-based**: Manual destruction capability
- **Secure Wiping**: Multiple overwrite passes with random data
- **Memory Protection**: Sensitive data cleared from RAM

## 🔍 Security Audit

### **Code Security**
- **No hardcoded secrets**: All keys generated dynamically
- **Secure random generation**: Using Node.js crypto.randomBytes()
- **Memory management**: Explicit clearing of sensitive buffers
- **Error handling**: Secure error messages without information leakage

### **Operational Security**
- **Key rotation**: Support for ephemeral key generation
- **Session isolation**: Each messaging session uses unique identifiers
- **Audit logging**: Comprehensive security event logging
- **Fail-safe defaults**: Secure-by-default configuration

## 📋 Testing Coverage

### **Unit Tests**
- ✅ Key generation and management
- ✅ Encryption/decryption operations
- ✅ Digital signature creation/verification
- ✅ Self-destructing message functionality
- ✅ Metadata resistance features

### **Integration Tests**
- ✅ End-to-end message flow
- ✅ Multi-user scenarios
- ✅ Error handling and edge cases
- ✅ Performance under load

### **Security Tests**
- ✅ Cryptographic primitive validation
- ✅ Memory clearing verification
- ✅ Timing attack resistance
- ✅ Tamper detection accuracy

## 🚨 Security Considerations

### **Operational Guidelines**
1. **Key Management**: Store private keys in secure hardware (HSM) when possible
2. **Network Security**: Use TLS 1.3+ for transport layer security
3. **System Security**: Run on hardened, up-to-date operating systems
4. **Access Control**: Implement strict authentication and authorization
5. **Monitoring**: Enable comprehensive security logging and monitoring

### **Limitations**
- **Quantum Computing**: RSA-4096 vulnerable to sufficiently large quantum computers
- **Side Channels**: Implementation may be vulnerable to side-channel attacks
- **Endpoint Security**: Security assumes endpoints are not compromised
- **Network Analysis**: Advanced traffic analysis may still reveal some patterns

## 📚 References

- [NIST Special Publication 800-57](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final) - Cryptographic Key Management
- [RFC 8446](https://tools.ietf.org/html/rfc8446) - TLS 1.3 Specification
- [FIPS 140-2](https://csrc.nist.gov/publications/detail/fips/140/2/final) - Security Requirements for Cryptographic Modules
- [DoD 5220.22-M](https://www.dss.mil/documents/odaa/nispom2006-5220.pdf) - Data Sanitization Standards

## 📝 License

This project is for educational and demonstration purposes. For production military use, conduct thorough security audit and compliance review.

---

**⚠️ Security Notice**: This implementation is designed for demonstration of cryptographic concepts. For actual military/government use, undergo formal security certification and compliance review.
