import pg from 'pg';

const config = {
  host: '127.0.0.1',
  port: 5434,
  database: 'khalia_dev',
  user: 'postgres',
  // No password - trust authentication should handle this
  family: 4, // Force IPv4
};

const client = new pg.Client(config);

(async () => {
  try {
    console.log('Connecting to database...');
    console.log('Config:', { host: config.host, port: config.port, database: config.database, user: config.user, password: '***' });
    await client.connect();
    console.log('✅ Connected successfully!');
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0]);
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
})();
