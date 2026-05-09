import logger from '@config/logger';
import database from '@config/database';
import { KhaliaError } from '@middleware/errorHandler';
import crypto from 'crypto';

interface BVNVerificationRequest {
  userId: string;
  bvn: string;
}

interface BiometricVerificationRequest {
  userId: string;
  biometricImageBase64: string;
}

interface BankVerificationRequest {
  userId: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

class KYCService {
  /**
   * Initiate BVN verification (T059)
   * In MVP, we mock the BVN provider API response
   */
  async verifyBVN(request: BVNVerificationRequest): Promise<any> {
    const { userId, bvn } = request;

    // Validate BVN format (11 digits)
    if (!bvn || !/^\d{11}$/.test(bvn)) {
      throw new KhaliaError('Invalid BVN format (must be 11 digits)', 400, 'VALIDATION_ERROR');
    }

    try {
      // Mock BVN provider response for MVP
      const bvnDetails = await this.mockBVNLookup(bvn);

      if (!bvnDetails) {
        throw new KhaliaError('BVN verification failed', 400, 'BVN_VERIFICATION_FAILED');
      }

      // Hash BVN for storage (never store plaintext)
      const bvnHash = this.hashBVN(bvn);

      // Update user with BVN data
      await database.query(
        `UPDATE users SET 
          bvn_hash = $1,
          first_name = COALESCE(first_name, $2),
          last_name = COALESCE(last_name, $3),
          date_of_birth = COALESCE(date_of_birth, $4),
          kyc_status = $5,
          kyc_level = 3,
          updated_at = NOW()
        WHERE id = $6`,
        [bvnHash, bvnDetails.firstName, bvnDetails.lastName, bvnDetails.dateOfBirth, 'bvn_verified', userId],
      );

      // Record audit log
      this.recordAuditLog('kyc_verified', userId, 'bvn_verified').catch((err) => {
        logger.error('Audit log error', { error: err });
      });

      logger.info('BVN verification successful', { userId });

      return {
        verification_id: `bvn_req_${Date.now()}`,
        status: 'confirmed',
        kyc_status: 'bvn_verified',
        kyc_level: 3,
        details: {
          name: `${bvnDetails.firstName} ${bvnDetails.lastName}`,
          date_of_birth: bvnDetails.dateOfBirth,
          account_number: bvnDetails.accountNumber,
        },
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('BVN verification error', { error, userId });
      throw new KhaliaError('BVN verification failed', 500, 'BVN_ERROR');
    }
  }

  /**
   * Verify biometric (facial recognition) (T060)
   */
  async verifyBiometric(request: BiometricVerificationRequest): Promise<any> {
    const { userId, biometricImageBase64 } = request;

    if (!biometricImageBase64) {
      throw new KhaliaError('Biometric image required', 400, 'VALIDATION_ERROR');
    }

    try {
      // Mock facial recognition API response for MVP
      const confidenceScore = 0.99; // Mock: very confident match

      if (confidenceScore < 0.85) {
        throw new KhaliaError('Biometric verification failed - low confidence', 400, 'BIOMETRIC_FAILED');
      }

      // Hash biometric (never store plaintext image)
      const biometricToken = this.hashBiometric(biometricImageBase64);

      // Update user
      const result = await database.query(
        `UPDATE users SET 
          biometric_token = $1,
          kyc_status = $2,
          kyc_level = 4,
          updated_at = NOW()
        WHERE id = $3
        RETURNING kyc_status, kyc_level`,
        [biometricToken, 'biometric_verified', userId],
      );

      // Audit log
      this.recordAuditLog('kyc_verified', userId, 'biometric_verified').catch((err) => {
        logger.error('Audit log error', { error: err });
      });

      logger.info('Biometric verification successful', { userId, confidenceScore });

      return {
        status: 'verified',
        kyc_status: 'biometric_verified',
        kyc_level: 4,
        confidence_score: confidenceScore,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Biometric verification error', { error, userId });
      throw new KhaliaError('Biometric verification failed', 500, 'BIOMETRIC_ERROR');
    }
  }

  /**
   * Verify bank account (T061)
   */
  async verifyBankAccount(request: BankVerificationRequest): Promise<any> {
    const { userId, accountNumber, accountName, bankCode } = request;

    if (!accountNumber || !accountName || !bankCode) {
      throw new KhaliaError('Bank details required', 400, 'VALIDATION_ERROR');
    }

    try {
      // Mock Naira name match check
      const nameMatch = await this.mockBankNameMatch(accountNumber, accountName, bankCode);

      if (!nameMatch) {
        throw new KhaliaError('Bank account name does not match KYC details', 400, 'BANK_VERIFICATION_FAILED');
      }

      // Update user with encrypted bank account
      const encryptedAccountNumber = this.encryptSensitiveData(accountNumber);

      const result = await database.query(
        `UPDATE users SET 
          bank_account_name = $1,
          bank_account_number = $2,
          bank_code = $3,
          bank_account_verified = true,
          kyc_status = $4,
          kyc_level = 5,
          updated_at = NOW()
        WHERE id = $5
        RETURNING kyc_status, kyc_level`,
        [accountName, encryptedAccountNumber, bankCode, 'bank_verified', userId],
      );

      this.recordAuditLog('kyc_verified', userId, 'bank_verified').catch((err) => {
        logger.error('Audit log error', { error: err });
      });

      logger.info('Bank verification successful', { userId, bankCode });

      return {
        status: 'verified',
        kyc_status: 'bank_verified',
        kyc_level: 5,
        bank_account: `****${accountNumber.slice(-4)}`,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('Bank verification error', { error, userId });
      throw new KhaliaError('Bank verification failed', 500, 'BANK_ERROR');
    }
  }

  /**
   * Get KYC status (T063)
   */
  async getKYCStatus(userId: string): Promise<any> {
    try {
      const result = await database.query(
        `SELECT 
          kyc_status, kyc_level, 
          aml_risk_level,
          created_at
        FROM users WHERE id = $1`,
        [userId],
      );

      if (result.rows.length === 0) {
        throw new KhaliaError('User not found', 404, 'NOT_FOUND');
      }

      const user = result.rows[0];

      // Calculate progress percentage
      const kycLevelMap: { [key: number]: number } = {
        1: 0,
        2: 25,
        3: 50,
        4: 75,
        5: 100,
      };

      const completionPercentage = kycLevelMap[user.kyc_level] || 0;

      // Determine next required step
      let nextStep = 'Email verification';
      if (user.kyc_level >= 2) nextStep = 'Phone verification';
      if (user.kyc_level >= 3) nextStep = 'Facial recognition';
      if (user.kyc_level >= 4) nextStep = 'Bank account verification';
      if (user.kyc_level === 5) nextStep = 'KYC Complete';

      return {
        status: user.kyc_status,
        level: user.kyc_level,
        completion_percentage: completionPercentage,
        next_step: nextStep,
        requirements: {
          email_verified: user.kyc_level >= 1,
          phone_verified: user.kyc_level >= 2,
          bvn_verified: user.kyc_level >= 3,
          biometric_verified: user.kyc_level >= 4,
          bank_verified: user.kyc_level >= 4,
        },
        aml_risk_level: user.aml_risk_level,
      };
    } catch (error: any) {
      if (error instanceof KhaliaError) throw error;
      logger.error('KYC status error', { error, userId });
      throw new KhaliaError('Failed to fetch KYC status', 500, 'KYC_STATUS_ERROR');
    }
  }

  /**
   * Mock BVN lookup (MVP - replace with real API call in production)
   */
  private async mockBVNLookup(bvn: string): Promise<any> {
    // In production, call actual BVN provider API
    // For MVP, return mock data
    return {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      accountNumber: '0123456789',
    };
  }

  /**
   * Mock bank name match verification
   */
  private async mockBankNameMatch(accountNumber: string, accountName: string, bankCode: string): Promise<boolean> {
    // In production, call NACCS or bank API
    // For MVP, just verify account name is not empty
    return accountName.length > 2;
  }

  /**
   * Hash BVN/NIN for storage (never store plaintext)
   */
  private hashBVN(bvn: string): string {
    const salt = process.env.BVN_SALT || 'khalia-bvn-salt';
    return crypto.createHash('sha256').update(bvn + salt).digest('hex');
  }

  /**
   * Hash biometric template
   */
  private hashBiometric(biometric: string): string {
    const salt = process.env.BIOMETRIC_SALT || 'khalia-biometric-salt';
    return crypto.createHash('sha256').update(biometric + salt).digest('hex');
  }

  /**
   * Encrypt sensitive data (bank account)
   */
  private encryptSensitiveData(data: string): string {
    // In production, use AES-256 encryption from crypto module
    // For MVP, just return simple encryption
    return Buffer.from(data).toString('base64');
  }

  /**
   * Record audit log
   */
  private async recordAuditLog(action: string, userId: string, resource: string): Promise<void> {
    try {
      await database.query(
        `INSERT INTO audit_logs (action, actor_id, entity_type, entity_id, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [action, userId, 'user', resource],
      );
    } catch (error) {
      logger.error('Audit log insert failed', { error, action, userId });
    }
  }
}

export default new KYCService();
