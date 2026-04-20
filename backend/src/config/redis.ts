import { createClient, RedisClientType } from 'redis';
import logger from './logger';

class Redis {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  /**
   * Initialize Redis client
   */
  async initialize(): Promise<void> {
    if (this.isConnected) {
      logger.info('Redis client already initialized');
      return;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = createClient({
        url: redisUrl,
        password: process.env.REDIS_PASSWORD || undefined,
        socket: {
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              logger.error('Redis reconnect strategy: Max retries exceeded');
              return new Error('Max redis retries exceeded');
            }
            return Math.min(retries * 50, 500);
          },
        },
      });

      // Event handlers
      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (err: Error) => {
        logger.error('Redis error', { error: err });
        this.isConnected = false;
      });

      this.client.on('ready', () => {
        logger.info('Redis ready');
      });

      // Connect
      await this.client.connect();
    } catch (error) {
      logger.error('Redis initialization failed', { error });
      throw error;
    }
  }

  /**
   * Get Redis client
   */
  getClient(): RedisClientType {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Set key-value pair
   */
  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (!this.client) throw new Error('Redis not initialized');

    try {
      if (expirySeconds) {
        await this.client.setEx(key, expirySeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET error', { error, key });
      throw error;
    }
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis not initialized');

    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error', { error, key });
      throw error;
    }
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    if (!this.client) throw new Error('Redis not initialized');

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error', { error, key });
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client) throw new Error('Redis not initialized');

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error', { error, key });
      throw error;
    }
  }

  /**
   * Set hash field
   */
  async hSet(key: string, field: string, value: string): Promise<void> {
    if (!this.client) throw new Error('Redis not initialized');

    try {
      await this.client.hSet(key, field, value);
    } catch (error) {
      logger.error('Redis HSET error', { error, key, field });
      throw error;
    }
  }

  /**
   * Get hash field
   */
  async hGet(key: string, field: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis not initialized');

    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      logger.error('Redis HGET error', { error, key, field });
      throw error;
    }
  }

  /**
   * Store session
   */
  async storeSession(sessionId: string, data: any, expirySeconds: number = 1800): Promise<void> {
    await this.set(`session:${sessionId}`, JSON.stringify(data), expirySeconds);
  }

  /**
   * Get session
   */
  async getSession(sessionId: string): Promise<any | null> {
    const data = await this.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.client?.ping();
      return pong === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed', { error });
      return false;
    }
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect();
        logger.info('Redis disconnected');
        this.isConnected = false;
      } catch (error) {
        logger.error('Error closing Redis connection', { error });
        throw error;
      }
    }
  }
}

// Singleton instance
const redis = new Redis();

export default redis;
