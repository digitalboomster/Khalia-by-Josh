import net from 'net';

const socket = net.createConnection({
  host: '127.0.0.1',
  port: 5433,
  timeout: 5000
}, () => {
  console.log('✅ Socket connected to 127.0.0.1:5433');
  socket.destroy();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('❌ Socket error:', err.message);
  process.exit(1);
});

socket.on('timeout', () => {
  console.error('❌ Socket timeout');
  socket.destroy();
  process.exit(1);
});
