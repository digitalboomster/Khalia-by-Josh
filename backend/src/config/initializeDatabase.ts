/**
 * Database initialization script
 * Creates necessary tables if they don't exist
 */

import logger from './logger';

async function initializeDatabase(queryFn: (sql: string, params?: any[]) => Promise<any>): Promise<void> {
  try {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        kyc_status VARCHAR(50) DEFAULT 'not_started',
        kyc_level INT DEFAULT 1,
        kyc_verified_at TIMESTAMP,
        trust_score DECIMAL(5, 2) DEFAULT 20.00,
        aml_risk_level VARCHAR(50) DEFAULT 'low',
        email_verified BOOLEAN DEFAULT FALSE,
        bank_account_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
    `;

    await queryFn(createUsersTable);
    logger.info('✅ Users table initialized');

    // Create audit_logs table
    const createAuditLogsTable = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100),
        entity_id UUID,
        actor_id UUID,
        changes JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    `;

    await queryFn(createAuditLogsTable);
    logger.info('✅ Audit logs table initialized');

    // Create groups table
    const createGroupsTable = `
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        founder_id UUID NOT NULL REFERENCES users(id),
        target_amount DECIMAL(15, 2) DEFAULT 0,
        frequency VARCHAR(50) DEFAULT 'monthly',
        next_due TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_groups_founder_id ON groups(founder_id);
      CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
    `;

    await queryFn(createGroupsTable);
    logger.info('✅ Groups table initialized');

    // Create group_members table
    const createGroupMembersTable = `
      CREATE TABLE IF NOT EXISTS group_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
      CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
    `;

    await queryFn(createGroupMembersTable);
    logger.info('✅ Group members table initialized');

    // Create ledger_entries table
    const createLedgerTable = `
      CREATE TABLE IF NOT EXISTS ledger_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        account_type VARCHAR(100) NOT NULL,
        debit_credit_type VARCHAR(10) NOT NULL,
        amount_naira DECIMAL(15, 2) NOT NULL,
        description TEXT,
        reference_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON ledger_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_account_type ON ledger_entries(account_type);
      CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON ledger_entries(created_at);
    `;

    await queryFn(createLedgerTable);
    logger.info('✅ Ledger entries table initialized');

    // Create contributions table
    const createContributionsTable = `
      CREATE TABLE IF NOT EXISTS contributions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id),
        amount_naira DECIMAL(15, 2) NOT NULL,
        due_date TIMESTAMP NOT NULL,
        paid_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_contributions_group_id ON contributions(group_id);
      CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
      CREATE INDEX IF NOT EXISTS idx_contributions_due_date ON contributions(due_date);
    `;

    await queryFn(createContributionsTable);
    logger.info('✅ Contributions table initialized');

    // Create transactions table
    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        amount_naira DECIMAL(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        description TEXT,
        reference_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
    `;

    await queryFn(createTransactionsTable);
    logger.info('✅ Transactions table initialized');

  } catch (error) {
    logger.error('Failed to initialize database tables', { error });
    throw error;
  }
}

export default initializeDatabase;
