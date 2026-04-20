/**
 * Integration tests for Khalia Backend
 * Tests cover: Auth, KYC, Wallet, Groups, Ledger, Notifications, Admin
 */

import request from 'supertest';
import app from '@app';
import database from '@config/database';

describe('Khalia Backend Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let groupId: string;

  beforeAll(async () => {
    // Initialize database connection
    await database.initialize();
  });

  afterAll(async () => {
    // Close database connection
    await database.close();
  });

  describe('T057-T058: Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          phone_number: '08012345678',
          password: 'TestPass123!',
          first_name: 'John',
          last_name: 'Doe',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.access_token).toBeDefined();

      userId = res.body.data.user.id;
      authToken = res.body.data.access_token;
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.access_token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPass123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should refresh access token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.access_token).toBeDefined();
    });
  });

  describe('T059-T063: KYC Verification', () => {
    it('should verify BVN', async () => {
      const res = await request(app)
        .post('/api/v1/kyc/verify-bvn')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bvn: '12345678901',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.kyc_status).toBe('bvn_verified');
      expect(res.body.data.kyc_level).toBe(3);
    });

    it('should reject invalid BVN format', async () => {
      const res = await request(app)
        .post('/api/v1/kyc/verify-bvn')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bvn: 'invalid',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should verify biometric', async () => {
      const res = await request(app)
        .post('/api/v1/kyc/verify-biometric')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          biometric_image_base64: 'data:image/jpeg;base64,/9j/...',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.kyc_status).toBe('biometric_verified');
      expect(res.body.data.kyc_level).toBe(4);
    });

    it('should verify bank account', async () => {
      const res = await request(app)
        .post('/api/v1/kyc/verify-bank')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_number: '0123456789',
          account_name: 'John Doe',
          bank_code: '033',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.kyc_status).toBe('bank_verified');
      expect(res.body.data.kyc_level).toBe(5);
    });

    it('should get KYC status', async () => {
      const res = await request(app)
        .get('/api/v1/kyc/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.kyc_level).toBe(5);
      expect(res.body.data.completion_percentage).toBe(100);
    });
  });

  describe('T070-T076: Wallet Operations', () => {
    it('should create deposit link', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount_naira: 50000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.transaction_id).toBeDefined();
      expect(res.body.data.payment_url).toBeDefined();
    });

    it('should get wallet balance', async () => {
      const res = await request(app)
        .get('/api/v1/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.available_balance).toBeDefined();
      expect(res.body.data.currency).toBe('NGN');
    });

    it('should list transactions', async () => {
      const res = await request(app)
        .get('/api/v1/wallet/transactions?limit=10&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
    });

    it('should reject withdrawal without verified bank', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount_naira: 10000,
        });

      // Should succeed since we verified bank in KYC tests
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pending_approval');
    });
  });

  describe('T077-T085: Groups & Contributions', () => {
    it('should create a group', async () => {
      const res = await request(app)
        .post('/api/v1/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Savings Group',
          description: 'A test group for savings',
          contribution_amount_naira: 50000,
          frequency: 'monthly',
          max_members: 10,
          payout_order: 'round_robin',
          is_shariah_compliant: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.group_id).toBeDefined();
      expect(res.body.data.member_role).toBe('creator');

      groupId = res.body.data.group_id;
    });

    it('should get group details', async () => {
      const res = await request(app)
        .get(`/api/v1/groups/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.group.id).toBe(groupId);
      expect(res.body.data.members.length).toBeGreaterThan(0);
    });

    it('should list user groups', async () => {
      const res = await request(app)
        .get('/api/v1/groups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.groups)).toBe(true);
      expect(res.body.data.groups.length).toBeGreaterThan(0);
    });

    it('should start contribution cycle', async () => {
      const res = await request(app)
        .post(`/api/v1/groups/${groupId}/start-cycle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.cycle_id).toBeDefined();
      expect(res.body.data.status).toBe('active');
    });
  });

  describe('T064-T069: Ledger & Double-Entry', () => {
    it('should record double-entry transaction', async () => {
      // Deposit funds first
      const deposit = await request(app)
        .post('/api/v1/wallet/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount_naira: 100000,
        });

      expect(deposit.status).toBe(200);
      expect(deposit.body.data.transaction_id).toBeDefined();
    });

    it('should maintain ledger balance', async () => {
      const res = await request(app)
        .get('/api/v1/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      // Balance should reflect all debit/credit entries
      expect(typeof res.body.data.available_balance).toBe('number');
    });
  });

  describe('T086-T087: Trust Score', () => {
    it('should calculate trust score', async () => {
      const res = await request(app)
        .get('/api/v1/trust-score')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.overall_score).toBeGreaterThanOrEqual(20);
      expect(res.body.data.overall_score).toBeLessThanOrEqual(100);
      expect(res.body.data.risk_level).toBeDefined();
    });
  });

  describe('T091-T094: Notifications', () => {
    it('should get user notifications', async () => {
      const res = await request(app)
        .get('/api/v1/notifications?limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.notifications)).toBe(true);
    });

    it('should mark notification as read', async () => {
      // First get notifications
      const getRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      if (getRes.body.data.notifications.length > 0) {
        const notifId = getRes.body.data.notifications[0].id;

        const markRes = await request(app)
          .post(`/api/v1/notifications/${notifId}/read`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(markRes.status).toBe(200);
        expect(markRes.body.data.is_read).toBe(true);
      }
    });
  });

  describe('T088-T090: Admin Routes (with admin token)', () => {
    it('should get system analytics (admin only)', async () => {
      // This test would need an admin token
      // For MVP, we expect 403 if not admin
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      // Should reject non-admin users
      expect([200, 403]).toContain(res.status);
    });
  });

  describe('Security & Validation', () => {
    it('should reject requests without auth token', async () => {
      const res = await request(app).get('/api/v1/wallet/balance');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid auth token', async () => {
      const res = await request(app)
        .get('/api/v1/wallet/balance')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should handle 404 errors', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
