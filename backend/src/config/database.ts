import { Pool, PoolClient } from 'pg';
import logger from './logger';

interface PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

class Database {
  private pool: Pool | null = null;

  /**
   * Initialize connection pool
   */
  async initialize(): Promise<void> {
    if (this.pool) {
      logger.info('Database pool already initialized');
      return;
    }

    const config: PoolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'khalia_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
      min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config);

    // Event handlers
    this.pool.on('connect', (client: PoolClient) => {
      logger.debug('Database client connected');
    });

    this.pool.on('error', (err: Error) => {
      logger.error('Unexpected error in database pool', { error: err });
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection successful', {
        timestamp: result.rows[0].now,
      });
    } catch (error) {
      logger.error('Database connection failed', { error });
      throw error;
    }
  }

  /**
   * Get pool instance
   */
  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  /**
   * Execute query
   */
  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      logger.error('Database query error', {
        error,
        query: text,
        params: params ? 'hidden' : undefined,
      });
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1');
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        logger.info('Database pool closed');
      } catch (error) {
        logger.error('Error closing database pool', { error });
        throw error;
      }
    }
  }
}

// Singleton instance
const database = new Database();

export default database;
