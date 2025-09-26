import { SelfDestructingMessage } from './self-destruct';

describe('SelfDestructingMessage', () => {
  beforeEach(() => {
    // Clear any existing messages
    SelfDestructingMessage.cleanupExpiredMessages();
  });

  test('should create self-destructing message', () => {
    const message = SelfDestructingMessage.create(
      'Secret mission details',
      'agent-001',
      'agent-002',
      { ttl: 10 }
    );

    expect(message.id).toBeDefined();
    expect(message.content).toBe('Secret mission details');
    expect(message.sender).toBe('agent-001');
    expect(message.recipient).toBe('agent-002');
    expect(message.isDestructible).toBe(true);
    expect(message.expiresAt).toBeDefined();
  });

  test('should retrieve message content before expiration', () => {
    const message = SelfDestructingMessage.create(
      'Test message',
      'sender',
      'recipient',
      { ttl: 60 }
    );

    const content = SelfDestructingMessage.retrieveContent(message.id);
    expect(content).toBe('Test message');
  });

  test('should destroy message manually', () => {
    const message = SelfDestructingMessage.create(
      'Test message',
      'sender',
      'recipient',
      { ttl: 60 }
    );

    const destroyed = SelfDestructingMessage.destroyMessage(message.id);
    expect(destroyed).toBe(true);

    const content = SelfDestructingMessage.retrieveContent(message.id);
    expect(content).toBeNull();
  });

  test('should check if message is expired', () => {
    const message = SelfDestructingMessage.create(
      'Test message',
      'sender',
      'recipient',
      { ttl: 1 }
    );

    // Message should not be expired immediately
    expect(SelfDestructingMessage.isExpired(message)).toBe(false);

    // Simulate expiration by modifying expiresAt
    const expiredMessage = { ...message, expiresAt: Date.now() - 1000 };
    expect(SelfDestructingMessage.isExpired(expiredMessage)).toBe(true);
  });

  test('should calculate time remaining correctly', () => {
    const message = SelfDestructingMessage.create(
      'Test message',
      'sender',
      'recipient',
      { ttl: 30 }
    );

    const timeRemaining = SelfDestructingMessage.getTimeRemaining(message);
    expect(timeRemaining).toBeGreaterThan(25);
    expect(timeRemaining).toBeLessThanOrEqual(30);
  });

  test('should auto-destruct after TTL', (done) => {
    const message = SelfDestructingMessage.create(
      'Test message',
      'sender',
      'recipient',
      { ttl: 1 } // 1 second
    );

    // Check that message exists initially
    expect(SelfDestructingMessage.retrieveContent(message.id)).toBe('Test message');

    // Wait for auto-destruction
    setTimeout(() => {
      const content = SelfDestructingMessage.retrieveContent(message.id);
      expect(content).toBeNull();
      done();
    }, 1500);
  });

  test('should provide statistics', () => {
    SelfDestructingMessage.create('Msg 1', 'sender', 'recipient', { ttl: 60 });
    SelfDestructingMessage.create('Msg 2', 'sender', 'recipient', { ttl: 60 });

    const stats = SelfDestructingMessage.getStats();
    expect(stats.activeMessages).toBeGreaterThanOrEqual(2);
    expect(stats.scheduledDestructions).toBeGreaterThanOrEqual(2);
  });
});