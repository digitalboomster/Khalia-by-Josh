import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table with KYC state machine
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Email & Phone
    table.string('email', 255).notNullable().unique();
    table.string('phone_number', 20).notNullable().unique();
    table.string('password_hash', 255).notNullable();

    // KYC/AML State Machine
    table
      .enum('kyc_status', [
        'not_started',
        'email_verified',
        'phone_verified',
        'bvn_verified',
        'biometric_verified',
        'bank_verified',
        'approved',
        'rejected',
      ])
      .notNullable()
      .defaultTo('not_started');

    table.integer('kyc_level').notNullable().defaultTo(1);

    // Verified Identity (encrypted fields)
    table.string('bvn_hash', 255).nullable();
    table.string('nin_hash', 255).nullable();
    table.string('first_name', 100).nullable();
    table.string('last_name', 100).nullable();
    table.date('date_of_birth').nullable();

    // Bank Account (encrypted)
    table.string('bank_account_name', 255).nullable();
    table.string('bank_account_number', 20).nullable();
    table.string('bank_code', 10).nullable();
    table.boolean('bank_account_verified').defaultTo(false);

    // Biometric (tokenized)
    table.string('biometric_token', 255).nullable().comment('Encrypted facial recognition template');

    // Trust & Reputation
    table.integer('trust_score').notNullable().defaultTo(20);
    table.timestamp('trust_score_updated_at').defaultTo(knex.fn.now());

    // Compliance
    table
      .enum('aml_risk_level', ['low', 'medium', 'high', 'blocked'])
      .notNullable()
      .defaultTo('low');
    table.timestamp('aml_checked_at').nullable();
    table.timestamp('sanctions_screened_at').nullable();

    // Contact Preferences
    table.boolean('email_notifications').defaultTo(true);
    table.boolean('sms_notifications').defaultTo(false);

    // Profile
    table.string('profile_picture_url', 500).nullable();
    table.text('bio').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();

    // Indexes
    table.index('email');
    table.index('phone_number');
    table.index('kyc_status');
    table.index('trust_score');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
