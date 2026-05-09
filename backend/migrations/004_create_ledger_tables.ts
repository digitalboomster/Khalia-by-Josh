import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create ledger table (immutable double-entry accounting)
  await knex.schema.createTable('ledger', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Double-Entry Pair
    table.enum('debit_credit_type', ['debit', 'credit']).notNullable();
    table.integer('amount_naira').notNullable().comment('Always positive; debit/credit type determines sign');

    // Account Context
    table
      .enum('account_type', ['wallet', 'escrow', 'group_holding', 'expense', 'revenue', 'suspense'])
      .notNullable();
    table.uuid('user_id').nullable().references('id').inTable('users');
    table.uuid('group_id').nullable().references('id').inTable('groups');

    // Reference to Original Transaction
    table.uuid('transaction_id').nullable().references('id').inTable('transactions');
    table.uuid('contribution_id').nullable().references('id').inTable('contributions');
    table.string('reference_type', 50).nullable();
    table.string('reference_id', 255).nullable();

    // Reconciliation
    table.uuid('reconciliation_batch_id').nullable();

    // Immutability - never modify after creation
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by_user_id').nullable().references('id').inTable('users');

    // Indexes
    table.index(['account_type', 'user_id', 'group_id']);
    table.index('transaction_id');
    table.index('created_at');
    table.index('reconciliation_batch_id');
  });

  // Create escrow table (holds funds during contribution cycle)
  await knex.schema.createTable('escrow', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Relationship
    table.uuid('group_id').notNullable().references('id').inTable('groups');
    table.uuid('contribution_id').notNullable().references('id').inTable('contributions');
    table.uuid('user_id').notNullable().references('id').inTable('users');

    // Amount
    table.integer('amount_naira').notNullable();
    table.enum('status', ['held', 'released', 'refunded', 'cancelled']).notNullable().defaultTo('held');

    // Release Conditions
    table
      .enum('release_reason', ['payout_executed', 'contribution_cancelled', 'manual_override'])
      .nullable();

    // Dates
    table.timestamp('held_at').defaultTo(knex.fn.now());
    table.timestamp('released_at').nullable();

    // Indexes
    table.index('group_id');
    table.index('user_id');
    table.index('status');
  });

  // Create payout_cycles table
  await knex.schema.createTable('payout_cycles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').notNullable().references('id').inTable('groups');
    table.uuid('recipient_user_id').notNullable().references('id').inTable('users');

    // Amount & Status
    table.integer('amount_naira').notNullable();
    table.integer('payout_sequence').notNullable().comment('First payout = 1, second = 2, etc.');

    // State Machine
    table
      .enum('status', [
        'pending_approval',
        'approved',
        'processing',
        'settled',
        'failed',
        'cancelled',
      ])
      .notNullable()
      .defaultTo('pending_approval');

    // Admin Approval
    table.uuid('approved_by_user_id').nullable().references('id').inTable('users');
    table.timestamp('approved_at').nullable();
    table.text('approval_notes').nullable();

    // Settlement
    table
      .enum('settlement_method', ['bank_transfer', 'wallet_credit', 'check', 'cash'])
      .notNullable();
    table.string('settlement_reference', 255).nullable();
    table.timestamp('settled_at').nullable();

    // Dates
    table.date('scheduled_date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('group_id');
    table.index('recipient_user_id');
    table.index('status');
    table.index('scheduled_date');
  });

  // Create ledger_reconciliation table (daily verification snapshots)
  await knex.schema.createTable('ledger_reconciliation', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.date('reconciliation_date').notNullable().unique();

    // Totals
    table.bigint('total_debits').notNullable();
    table.bigint('total_credits').notNullable();

    // Verification
    table.boolean('is_balanced').notNullable();
    table.integer('discrepancies_found').notNullable().defaultTo(0);
    table.text('discrepancy_notes').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('verified_by_user_id').nullable().references('id').inTable('users');

    // Indexes
    table.index('reconciliation_date');
    table.index('is_balanced');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ledger_reconciliation');
  await knex.schema.dropTableIfExists('payout_cycles');
  await knex.schema.dropTableIfExists('escrow');
  await knex.schema.dropTableIfExists('ledger');
}
