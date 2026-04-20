# Data Model: Khalia MVP

**Document**: Entity Schemas and Database Design
**Date**: April 20, 2026
**Status**: Phase 1 Design Complete
**Database**: PostgreSQL 15+
**Link**: [spec.md](spec.md) | [contracts/api.md](contracts/api.md)

---

## Overview

The data model defines all core entities for the Khalia MVP platform. Designed for:

- Immutable financial audit trail (double-entry ledger)
- KYC/AML state machine tracking
- Group-based contribution cycles
- Zero-discrepancy transaction reconciliation

**Key Principles**:

- 🔐 **Immutable**: Transactions never deleted, only voided/reversed
- 📊 **Double-Entry**: Every transaction has debit/credit pair (balance always correct)
- 🔒 **Encrypted**: BVN, NIN, bank accounts encrypted at rest
- 📈 **Audit Trail**: All state changes timestamped and user-attributed

---

## Core Entities

### 1. User (Users Table)

**Purpose**: User identity, verification status, trust score

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  -- KYC/AML State
  kyc_status VARCHAR(50) NOT NULL DEFAULT 'not_started'
    CHECK (kyc_status IN ('not_started', 'email_verified', 'phone_verified',
           'bvn_verified', 'biometric_verified', 'bank_verified', 'approved', 'rejected')),
  kyc_level INT NOT NULL DEFAULT 1,
    COMMENT '1=unverified, 2=basic, 3=full, 4=premium',

  -- Verified Identity (encrypted)
  bvn_hash VARCHAR(255),
  nin_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,

  -- Bank Account (encrypted)
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(20),
  bank_code VARCHAR(10),
  bank_account_verified BOOLEAN DEFAULT false,

  -- Biometric (tokenized, never plaintext)
  biometric_token VARCHAR(255),
    COMMENT 'Encrypted hash of facial recognition template',

  -- Trust & Reputation
  trust_score INT NOT NULL DEFAULT 20,
    COMMENT 'Starting trust: 20%, increases with activity',
  trust_score_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Compliance
  aml_risk_level VARCHAR(50) NOT NULL DEFAULT 'low'
    CHECK (aml_risk_level IN ('low', 'medium', 'high', 'blocked')),
  aml_checked_at TIMESTAMP,
  sanctions_screened_at TIMESTAMP,

  -- Contact Preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,

  -- Profile
  profile_picture_url VARCHAR(500),
  bio TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  -- Indexes
  INDEX idx_email (email),
  INDEX idx_phone (phone_number),
  INDEX idx_kyc_status (kyc_status),
  INDEX idx_trust_score (trust_score),
  INDEX idx_created_at (created_at)
);
```

**Key Fields**:

- `kyc_status`: State machine for verification progression
- `trust_score`: Algorithm-calculated, 20-100 scale
- `bvn_hash`, `nin_hash`: Salted hashes, never store plaintext
- `biometric_token`: Encrypted facial recognition template
- `aml_risk_level`: Automated + manual review flag

---

### 2. Group (Groups Table)

**Purpose**: Savings group metadata, contribution schedule, payout order

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id),

  -- Meta
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal VARCHAR(255), -- e.g., "Buy group transportation"
  logo_url VARCHAR(500),

  -- Contribution Schedule
  contribution_amount_naira INT NOT NULL,
    COMMENT 'Amount in naira (no decimals to avoid float errors)',
  contribution_frequency VARCHAR(50) NOT NULL
    CHECK (contribution_frequency IN ('weekly', 'biweekly', 'monthly')),
  contribution_due_day INT,
    COMMENT 'Day of week (0-6) or month (1-31)',

  -- Governance
  max_members INT NOT NULL DEFAULT 10,
  current_member_count INT NOT NULL DEFAULT 1,
  payout_order VARCHAR(50) NOT NULL
    CHECK (payout_order IN ('round_robin', 'manual', 'lottery', 'seniority')),

  -- Compliance
  is_shariah_compliant BOOLEAN DEFAULT true,
    COMMENT 'No interest-based lending, Islamic principles',
  requires_approval BOOLEAN DEFAULT true,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed', 'dissolved')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,

  INDEX idx_creator_id (creator_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

**Key Fields**:

- `contribution_amount_naira`: Stored as INT (no floats for money)
- `contribution_frequency` + `contribution_due_day`: Cron-like schedule
- `payout_order`: Determines recipient sequence
- `is_shariah_compliant`: Governance + audit flag

---

### 3. GroupMember (Group_Members Table)

**Purpose**: User membership in groups with roles and status

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Role & Status
  role VARCHAR(50) NOT NULL DEFAULT 'member'
    CHECK (role IN ('creator', 'admin', 'member')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'removed')),

  -- Individual Trust
  individual_trust_score INT DEFAULT 0,
    COMMENT 'Member-specific trust in this group',

  -- Payout Info
  payout_order INT,
    COMMENT 'Position in rotation (1, 2, 3...)',
  payout_recipient_bank_account VARCHAR(255),
    COMMENT 'Can differ from user profile bank account',

  -- Timeline
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  left_at TIMESTAMP,

  INDEX idx_group_user (group_id, user_id) UNIQUE,
  INDEX idx_status (status)
);
```

**Key Fields**:

- `role`: Creator > Admin > Member permission hierarchy
- `payout_order`: Position in contribution rotation
- `individual_trust_score`: Group-specific reputation

---

### 4. Contribution (Contributions Table)

**Purpose**: Individual contribution tracking (due date, payment status, escrow)

```sql
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  user_id UUID NOT NULL REFERENCES users(id),
  group_member_id UUID NOT NULL REFERENCES group_members(id),

  -- Amount & Status
  amount_naira INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'waived', 'refunded')),

  -- Payment Tracking
  payment_method VARCHAR(50),
    CHECK (payment_method IN ('card', 'bank_transfer', 'wallet', 'ussd', 'cash')),
  payment_reference VARCHAR(255),
    COMMENT 'Payment gateway transaction ID',

  -- Dates
  due_date DATE NOT NULL,
  paid_at TIMESTAMP,

  INDEX idx_group_user_due (group_id, user_id, due_date),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);
```

**Key Fields**:

- `due_date`: When contribution is due (auto-generated from group schedule)
- `status`: Tracks payment lifecycle (pending → paid)
- `payment_reference`: Links to payment gateway transaction
- Escrow hold created when contribution is paid (see LedgerEntry)

---

### 5. Transaction (Transactions Table)

**Purpose**: High-level transaction record (type, amount, status)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Type & Amount
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('deposit', 'withdrawal', 'contribution', 'payout', 'transfer', 'reversal')),
  amount_naira INT NOT NULL,

  -- Actor & Context
  user_id UUID NOT NULL REFERENCES users(id),
  group_id UUID REFERENCES groups(id),
  initiated_by_user BOOLEAN NOT NULL DEFAULT true,

  -- Payment Gateway
  payment_gateway VARCHAR(50),
    CHECK (payment_gateway IN ('paystack', 'flutterwave', 'remita', 'manual', 'bank')),
  payment_reference VARCHAR(255),
    COMMENT 'External gateway or bank reference',
  payment_status VARCHAR(50) DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'confirmed', 'failed', 'reversed')),

  -- Status & Audit
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  failure_reason TEXT,

  -- Idempotency Key (prevent duplicate charges)
  idempotency_key VARCHAR(255) UNIQUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  failed_at TIMESTAMP,

  INDEX idx_user_type (user_id, type),
  INDEX idx_status (status),
  INDEX idx_payment_reference (payment_reference)
);
```

**Key Fields**:

- `type`: Categorizes transaction purpose
- `payment_gateway`: Tracks which processor handled it
- `idempotency_key`: Prevents double-charging if request retried
- Ledger entries created when transaction completes

---

### 6. LedgerEntry (Ledger Table)

**Purpose**: Immutable double-entry accounting (every transaction = debit + credit pair)

```sql
CREATE TABLE ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Double-Entry Pair
  debit_credit_type VARCHAR(50) NOT NULL
    CHECK (debit_credit_type IN ('debit', 'credit')),
  amount_naira INT NOT NULL,
    COMMENT 'Always positive; debit/credit type determines sign',

  -- Account Context
  account_type VARCHAR(50) NOT NULL
    CHECK (account_type IN ('wallet', 'escrow', 'Group_holding', 'expense', 'revenue', 'suspense')),
  user_id UUID REFERENCES users(id),
  group_id UUID REFERENCES groups(id),

  -- Reference to Original Transaction
  transaction_id UUID REFERENCES transactions(id),
  contribution_id UUID REFERENCES contributions(id),
  reference_type VARCHAR(50),
  reference_id VARCHAR(255),
    COMMENT '{"type": "deposit", "id": "txn_123", ...}',

  -- Reconciliation
  reconciliation_batch_id UUID,
    COMMENT 'Links to daily/monthly reconciliation run',

  -- Immutability
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id UUID REFERENCES users(id),

  -- Never Modify These Fields
  PRIMARY KEY (id),
  INDEX idx_account (account_type, user_id, group_id),
  INDEX idx_transaction (transaction_id),
  INDEX idx_created_at (created_at),
  INDEX idx_reconciliation (reconciliation_batch_id)
);

-- Daily Reconciliation Verification
CREATE TABLE ledger_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_date DATE NOT NULL UNIQUE,

  -- Totals
  total_debits INT NOT NULL,
  total_credits INT NOT NULL,

  -- Verification
  is_balanced BOOLEAN NOT NULL,
  discrepancies_found INT NOT NULL DEFAULT 0,
  discrepancy_notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_by_user_id UUID REFERENCES users(id),

  INDEX idx_date (reconciliation_date),
  INDEX idx_balanced (is_balanced)
);
```

**Key Fields**:

- `debit_credit_type`: Indicates direction (always use positive amounts)
- `account_type`: Which ledger account this affects
- `transaction_id`: Links to source transaction
- **IMMUTABLE**: Never UPDATE or DELETE ledger entries; only INSERT and mark reconciliation
- `reconciliation_batch_id`: Groups daily reconciliation checks

---

### 7. Escrow (Escrow Table)

**Purpose**: Track locked funds during contribution cycle (escrow hold)

```sql
CREATE TABLE escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship
  group_id UUID NOT NULL REFERENCES groups(id),
  contribution_id UUID NOT NULL REFERENCES contributions(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Amount
  amount_naira INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'held'
    CHECK (status IN ('held', 'released', 'refunded', 'cancelled')),

  -- Release Conditions
  release_reason VARCHAR(50),
    CHECK (release_reason IN ('payout_executed', 'contribution_cancelled', 'manual_override')),

  -- Dates
  held_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP,

  INDEX idx_group (group_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);

-- Escrow Summary View: Calculate total locked per user
CREATE VIEW user_escrow_total AS
SELECT
  user_id,
  SUM(amount_naira) as total_locked_naira,
  COUNT(*) as held_contribution_count
FROM escrow
WHERE status = 'held'
GROUP BY user_id;
```

**Key Fields**:

- `contribution_id`: Links to specific contribution being escrowed
- `status`: Tracks if funds are locked, released, or refunded
- `release_reason`: Audit trail for why funds released
- View `user_escrow_total`: Fast lookup of total locked funds per user

---

### 8. PayoutCycle (Payout_Cycles Table)

**Purpose**: Track each payout cycle (recipient, amount, approval, settlement)

```sql
CREATE TABLE payout_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id),
  recipient_user_id UUID NOT NULL REFERENCES users(id),

  -- Amount & Status
  amount_naira INT NOT NULL,
  payout_sequence INT NOT NULL,
    COMMENT 'First payout = 1, second = 2, etc.',

  -- State Machine
  status VARCHAR(50) NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('pending_approval', 'approved', 'processing', 'settled', 'failed', 'cancelled')),

  -- Admin Approval
  approved_by_user_id UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  approval_notes TEXT,

  -- Settlement
  settlement_method VARCHAR(50) NOT NULL
    CHECK (settlement_method IN ('bank_transfer', 'wallet_credit', 'check', 'cash')),
  settlement_reference VARCHAR(255),
    COMMENT 'Bank reference number',
  settled_at TIMESTAMP,

  -- Dates
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_group (group_id),
  INDEX idx_recipient (recipient_user_id),
  INDEX idx_status (status),
  INDEX idx_scheduled_date (scheduled_date)
);
```

**Key Fields**:

- `payout_sequence`: Tracks which round (1st, 2nd payout) in group
- `status`: State machine for payout lifecycle
- Full approval workflow audit trail timestamped

---

### 9. Notification (Notifications Table)

**Purpose**: Track all user notifications (email, SMS, in-app)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Content
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('contribution_due', 'contribution_paid', 'payout_ready',
           'member_joined', 'group_created', 'kyc_progress', 'alert')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Action
  action_url VARCHAR(500),
  action_type VARCHAR(50),

  -- Channels
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,
  sms_sent BOOLEAN DEFAULT false,
  sms_sent_at TIMESTAMP,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user (user_id),
  INDEX idx_type (type),
  INDEX idx_read (is_read)
);
```

**Key Fields**:

- `type`: Categories for filtering
- `email_sent`, `sms_sent`: Track delivery channels
- `is_read`: User engagement tracking

---

### 10. AuditLog (Audit_Logs Table)

**Purpose**: Immutable audit trail of all system actions (7-year retention)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action & Actor
  action VARCHAR(100) NOT NULL,
    CHECK (action IN ('user_login', 'kyc_verified', 'contribution_paid', 'payout_executed',
           'group_created', 'member_approved', 'admin_action', 'system_action')),
  actor_user_id UUID REFERENCES users(id),
  actor_type VARCHAR(50) NOT NULL
    CHECK (actor_type IN ('user', 'admin', 'system', 'external')),

  -- Resource
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),

  -- Details (JSON)
  before_state JSONB,
  after_state JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Immutable
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_actor (actor_user_id),
  INDEX idx_action (action),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_created_at (created_at)
);

-- Retention: Set PostgreSQL BRIN index on created_at for time-based partitioning
-- Partition audit_logs by year, archive to cold storage after 7 years
CREATE INDEX idx_audit_year ON audit_logs USING BRIN (created_at)
  WITH (pages_per_range = 128);
```

**Key Fields**:

- ALL FIELDS IMMUTABLE (never update after creation)
- `before_state`, `after_state`: Full state change history
- `actor_type`: Track if user, admin, or system action
- Partitioned by year for compliance retention

---

## Verification Flow (State Machine)

### KYC State Progression

```
not_started
    ↓
email_verified (user confirms email)
    ↓
phone_verified (OTP confirmation)
    ↓
bvn_verified (BVN lookup + match)
    ↓
biometric_verified (facial recognition)
    ↓
bank_verified (name & account match)
    ↓
approved ✅ (full KYC complete, level 3)

Reject at any stage:
    ↓
rejected ❌ (with reason in audit log)
```

### Transaction Status Flow

```
pending (initial state)
    ↓
processing (payment gateway confirmed)
    ↓
confirmed ✅ (webhook received, ledger posted)

If failure:
    ↓
failed ❌ (reason stored, can retry)
```

### Payout Status Flow

```
pending_approval (waiting for admin)
    ↓
approved (admin review complete)
    ↓
processing (funds released from escrow)
    ↓
settled ✅ (bank receipt confirmed)

If rejected:
    ↓
cancelled ❌ (escrow funds returned)
```

---

## Migrations Strategy (Knex.js or TypeORM)

### Migration Files

```text
backend/migrations/
├── 001_create_users_table.ts
├── 002_create_groups_table.ts
├── 003_create_group_members_table.ts
├── 004_create_contributions_table.ts
├── 005_create_transactions_table.ts
├── 006_create_ledger_table.ts
├── 007_create_escrow_table.ts
├── 008_create_payout_cycles_table.ts
├── 009_create_notifications_table.ts
├── 010_create_audit_logs_table.ts
├── 011_create_indexes_and_views.ts
└── 012_add_initial_constraints.ts
```

### Rollback Strategy

- All migrations must be reversible (down function)
- Test rollback in staging before production
- Keep migration history immutable
- Use transactions for all DDL operations

---

## Indexes & Query Optimization

### Required Indexes

| Table         | Columns                                 | Purpose                   |
| ------------- | --------------------------------------- | ------------------------- |
| users         | email, phone, kyc_status, trust_score   | Fast lookup by identity   |
| groups        | creator_id, status                      | Group discovery filtering |
| group_members | (group_id, user_id), status             | Member queries            |
| contributions | (group_id, user_id, due_date), status   | Contribution schedules    |
| transactions  | user_id, status, created_at             | Transaction history       |
| ledger        | (account_type, user_id), transaction_id | Reconciliation queries    |
| escrow        | group_id, status                        | Escrow holds per group    |
| audit_logs    | actor_user_id, action, created_at       | Compliance reports        |

### Slow Query Monitoring

- Enable PostgreSQL `log_min_duration_statement = 1000` (queries > 1s)
- Monitor via Datadog APM
- Set up automated alerting for queries > 500ms

---

## Encryption & Security

### Fields Requiring Encryption

| Field                 | Encryption       | Storage                             |
| --------------------- | ---------------- | ----------------------------------- |
| `bvn_hash`            | Salted SHA256    | Database                            |
| `nin_hash`            | Salted SHA256    | Database                            |
| `bank_account_number` | AES-256          | Database                            |
| `biometric_token`     | AES-256 + hash   | Database (never retrieve plaintext) |
| `password_hash`       | bcrypt 12 rounds | Database                            |

### Key Rotation Strategy

- Store active encryption key in AWS Secrets Manager
- Rotate keys quarterly
- Maintain decryption capability for old keys (for audit)
- Never log or transmit unencrypted BVN/NIN

---

## Performance Targets

- User registration: < 2s (KYC lookup included)
- Contribution creation: < 500ms
- Ledger reconciliation: < 5s (daily batch job)
- Payout processing: < 3s per transaction
- Report generation: < 10s (1,000+ transactions)

---

## Related Documents

- [API Contracts](contracts/api.md) - REST endpoints for each entity
- [Quickstart Guide](quickstart.md) - Database setup instructions
- [Security Checklist](contracts/security.md) - Encryption & compliance
