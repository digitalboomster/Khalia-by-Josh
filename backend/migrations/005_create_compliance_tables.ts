import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create notifications table
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users');

    // Content
    table
      .enum('type', [
        'contribution_due',
        'contribution_paid',
        'payout_ready',
        'member_joined',
        'group_created',
        'kyc_progress',
        'alert',
      ])
      .notNullable();
    table.string('title', 255).notNullable();
    table.text('message').notNullable();

    // Action
    table.string('action_url', 500).nullable();
    table.string('action_type', 50).nullable();

    // Channels
    table.boolean('email_sent').defaultTo(false);
    table.timestamp('email_sent_at').nullable();
    table.boolean('sms_sent').defaultTo(false);
    table.timestamp('sms_sent_at').nullable();

    // Status
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('type');
    table.index('is_read');
  });

  // Create audit_logs table (immutable compliance trail, 7-year retention)
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Action & Actor
    table
      .enum('action', [
        'user_login',
        'user_registered',
        'kyc_verified',
        'contribution_paid',
        'payout_executed',
        'group_created',
        'member_approved',
        'admin_action',
        'system_action',
      ])
      .notNullable();
    table.uuid('actor_user_id').nullable().references('id').inTable('users');
    table.enum('actor_type', ['user', 'admin', 'system', 'external']).notNullable();

    // Resource
    table.string('resource_type', 100).nullable();
    table.string('resource_id', 255).nullable();

    // Details (JSON)
    table.jsonb('before_state').nullable();
    table.jsonb('after_state').nullable();

    // Context
    table.string('ip_address', 45).nullable();
    table.text('user_agent').nullable();

    // Immutable - never modify after creation
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('actor_user_id');
    table.index('action');
    table.index(['resource_type', 'resource_id']);
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('notifications');
}
