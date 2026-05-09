import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import logger from '@config/logger';
import database from '@config/database';
import { KhaliaError } from '@middleware/errorHandler';

interface RegisterData {
  email: string;
  phone_number: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UserPayload {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  kyc_status: string;
  kyc_level: number;
  trust_score: number;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
  private accessTokenExpiry = '15m'; // 15 minutes
  private refreshTokenExpiry = '30d'; // 30 days

  /**
   * Validate password strength
   * Min 12 chars, uppercase, lowercase, number, special char
   */
  private validatePassword(password: string): boolean {
    const minLength = password.length >= 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<UserPayload & TokenPair> {
    const { email, phone_number, password, first_name, last_name } = data;

    // Validate inputs
    if (!this.validateEmail(email)) {
      throw new KhaliaError('Invalid email format', 400, 'VALIDATION_ERROR', {
        field: 'email',
      });
    }

    if (!this.validatePhoneNumber(phone_number)) {
      throw new KhaliaError('Invalid Nigerian phone number', 400, 'VALIDATION_ERROR', {
        field: 'phone_number',
      });
    }

    if (!this.validatePassword(password)) {
      throw new KhaliaError(
        'Password must be at least 12 characters with uppercase, lowercase, number, and special character',
        400,
        'VALIDATION_ERROR',
        { field: 'password' },
      );
    }

    if (!first_name || first_name.length < 2 || first_name.length > 50) {
      throw new KhaliaError('First name must be 2-50 characters', 400, 'VALIDATION_ERROR', {
        field: 'first_name',
      });
    }

    if (!last_name || last_name.length < 2 || last_name.length > 50) {
      throw new KhaliaError('Last name must be 2-50 characters', 400, 'VALIDATION_ERROR', {
        field: 'last_name',
      });
    }

    try {
      // Check if user already exists
      const existingEmailResult = await database.query(
        'SELECT id FROM users WHERE email = $1',
        [email],
      );

      if (existingEmailResult.rows.length > 0) {
        throw new KhaliaError('Email already registered', 400, 'CONFLICT', {
          field: 'email',
        });
      }

      const existingPhoneResult = await database.query(
        'SELECT id FROM users WHERE phone_number = $1',
        [phone_number],
      );

      if (existingPhoneResult.rows.length > 0) {
        throw new KhaliaError('Phone number already registered', 400, 'CONFLICT', {
          field: 'phone_number',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));

      // Generate user ID
      const userId = uuidv4();

      // Insert user
      const query = `
        INSERT INTO users (
          id, email, phone_number, password_hash, first_name, last_name,
          kyc_status, kyc_level, trust_score, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING id, email, first_name, last_name, kyc_status, kyc_level, trust_score
      `;

      const result = await database.query(query, [
        userId,
        email,
        phone_number,
        passwordHash,
        first_name,
        last_name,
        'not_started',
        1,
        20, // Initial trust score
      ]);

      const user = result.rows[0] as UserPayload;

      // Generate tokens
      const tokens = this.generateTokens(user.id, email, user.kyc_level);

      logger.info('User registered successfully', {
        userId: user.id,
        email,
        phone_number,
      });

      // Audit log (async, non-blocking)
      this.recordAuditLog('user_registered', userId, 'user', null).catch((err) => {
        logger.error('Failed to record audit log', { error: err });
      });

      return {
        ...user,
        ...tokens,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) {
        throw error;
      }

      logger.error('User registration error', {
        error,
        email,
        phone_number,
      });

      throw new KhaliaError('Failed to register user', 500, 'REGISTRATION_ERROR');
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<UserPayload & TokenPair> {
    const { email, password } = data;

    if (!email || !password) {
      throw new KhaliaError('Email and password required', 400, 'VALIDATION_ERROR');
    }

    try {
      // Load user
      const result = await database.query(
        'SELECT id, email, first_name, last_name, password_hash, kyc_status, kyc_level, trust_score FROM users WHERE email = $1',
        [email],
      );

      if (result.rows.length === 0) {
        throw new KhaliaError('Invalid email or password', 401, 'AUTH_FAILED');
      }

      const user = result.rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        // TODO: Track failed login attempts (log it for now)
        logger.warn('Failed login attempt', { email });
        throw new KhaliaError('Invalid email or password', 401, 'AUTH_FAILED');
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id, email, user.kyc_level);

      logger.info('User logged in', {
        userId: user.id,
        email,
      });

      // Audit log (async, non-blocking)
      this.recordAuditLog('user_login', user.id, 'user', null).catch((err) => {
        logger.error('Failed to record audit log', { error: err });
      });

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        kyc_status: user.kyc_status,
        kyc_level: user.kyc_level,
        trust_score: user.trust_score,
        ...tokens,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) {
        throw error;
      }

      logger.error('Login error', { error, email });
      throw new KhaliaError('Failed to login', 500, 'LOGIN_ERROR');
    }
  }

  /**
   * Generate JWT token pair
   */
  private generateTokens(userId: string, email: string, kycLevel: number): TokenPair {
    const accessToken = jwt.sign(
      {
        userId,
        email,
        kyc_level: kycLevel,
      },
      this.jwtSecret,
      { expiresIn: this.accessTokenExpiry },
    );

    const refreshToken = jwt.sign(
      {
        userId,
        type: 'refresh',
      },
      this.jwtSecret,
      { expiresIn: this.refreshTokenExpiry },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes in seconds
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded: any = jwt.verify(refreshToken, this.jwtSecret);

      if (decoded.type !== 'refresh') {
        throw new KhaliaError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }

      // Get user for kyc_level
      const result = await database.query(
        'SELECT id, email, kyc_level FROM users WHERE id = $1',
        [decoded.userId],
      );

      if (result.rows.length === 0) {
        throw new KhaliaError('User not found', 404, 'NOT_FOUND');
      }

      const user = result.rows[0];

      return this.generateTokens(user.id, user.email, user.kyc_level);
    } catch (error: any) {
      if (error instanceof KhaliaError) {
        throw error;
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new KhaliaError('Refresh token expired', 401, 'TOKEN_EXPIRED');
      }

      logger.error('Token refresh error', { error });
      throw new KhaliaError('Failed to refresh token', 401, 'TOKEN_REFRESH_ERROR');
    }
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Nigerian phone number
   */
  private validatePhoneNumber(phone: string): boolean {
    // Nigerian format: +234901234567 or 09012345670  or 0801234567
    const phoneRegex = /^(\+234|0)[789]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Record audit log entry (fire and forget)
   */
  private async recordAuditLog(
    action: string,
    userId: string,
    actorType: string,
    resourceId: string | null,
  ): Promise<void> {
    try {
      await database.query(
        `INSERT INTO audit_logs (action, actor_id, entity_type, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [action, userId, actorType],
      );
    } catch (error) {
      logger.error('Audit log insert failed', { error, action, userId });
    }
  }
}

export default new AuthService();
