import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create contributions table
  await knex.schema.createTable('contributions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').notNullable().references('id').inTable('groups');
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.uuid('group_member_id').notNullable().references('id').inTable('group_members');

    // Amount & Status
    table.integer('amount_naira').notNullable();
    table
      .enum('status', ['pending', 'paid', 'overdue', 'waived', 'refunded'])
      .notNullable()
      .defaultTo('pending');

    // Payment Tracking
    table
      .enum('payment_method', ['card', 'bank_transfer', 'wallet', 'ussd', 'cash'])
      .nullable();
    table.string('payment_reference', 255).nullable();

    // Dates
    table.date('due_date').notNullable();
    table.timestamp('paid_at').nullable();

    // Indexes
    table.index(['group_id', 'user_id', 'due_date']);
    table.index('status');
    table.index('due_date');
  });

  // Create transactions table
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Type & Amount
    table
      .enum('type', ['deposit', 'withdrawal', 'contribution', 'payout', 'transfer', 'reversal'])
      .notNullable();
    table.integer('amount_naira').notNullable();

    // Actor & Context
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.uuid('group_id').nullable().references('id').inTable('groups');
    table.boolean('initiated_by_user').notNullable().defaultTo(true);

    // Payment Gateway
    table
      .enum('payment_gateway', ['paystack', 'flutterwave', 'remita', 'manual', 'bank'])
      .nullable();
    table.string('payment_reference', 255).nullable();
    table
      .enum('payment_status', ['pending', 'processing', 'confirmed', 'failed', 'reversed'])
      .defaultTo('pending');

    // Status & Audit
    table
      .enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])
      .notNullable()
      .defaultTo('pending');
    table.text('failure_reason').nullable();

    // Idempotency Key
    table.string('idempotency_key', 255).nullable().unique();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('confirmed_at').nullable();
    table.timestamp('failed_at').nullable();

    // Indexes
    table.index(['user_id', 'type']);
    table.index('status');
    table.index('payment_reference');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('contributions');
}
