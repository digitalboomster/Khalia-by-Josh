import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create groups table
  await knex.schema.createTable('groups', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('creator_id').notNullable().references('id').inTable('users');

    // Meta
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.string('goal', 255).nullable();
    table.string('logo_url', 500).nullable();

    // Contribution Schedule
    table.integer('contribution_amount_naira').notNullable().comment('Amount in naira (no decimals)');
    table
      .enum('contribution_frequency', ['weekly', 'biweekly', 'monthly'])
      .notNullable();
    table.integer('contribution_due_day').nullable().comment('Day of week (0-6) or month (1-31)');

    // Governance
    table.integer('max_members').notNullable().defaultTo(10);
    table.integer('current_member_count').notNullable().defaultTo(1);
    table
      .enum('payout_order', ['round_robin', 'manual', 'lottery', 'seniority'])
      .notNullable();

    // Compliance
    table.boolean('is_shariah_compliant').defaultTo(true);
    table.boolean('requires_approval').defaultTo(true);

    // Status
    table
      .enum('status', ['active', 'paused', 'completed', 'dissolved'])
      .notNullable()
      .defaultTo('active');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    // Indexes
    table.index('creator_id');
    table.index('status');
    table.index('created_at');
  });

  // Create group_members table
  await knex.schema.createTable('group_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').notNullable().references('id').inTable('groups');
    table.uuid('user_id').notNullable().references('id').inTable('users');

    // Role & Status
    table
      .enum('role', ['creator', 'admin', 'member'])
      .notNullable()
      .defaultTo('member');
    table
      .enum('status', ['pending', 'active', 'suspended', 'removed'])
      .notNullable()
      .defaultTo('pending');

    // Individual Trust
    table.integer('individual_trust_score').defaultTo(0);

    // Payout Info
    table.integer('payout_order').nullable().comment('Position in rotation (1, 2, 3...)');
    table.string('payout_recipient_bank_account', 255).nullable();

    // Timeline
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.timestamp('approved_at').nullable();
    table.timestamp('left_at').nullable();

    // Unique constraint
    table.unique(['group_id', 'user_id']);

    // Indexes
    table.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('group_members');
  await knex.schema.dropTableIfExists('groups');
}
