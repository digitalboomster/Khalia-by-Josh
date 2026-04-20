import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

// Middleware imports
import requestLoggingMiddleware from '@middleware/requestLogging';
import errorHandlerMiddleware from '@middleware/errorHandler';
import authMiddleware from '@middleware/auth';
import auditLoggingMiddleware from '@middleware/auditLog';

// Routes (to be implemented)
import authRoutes from '@routes/auth';
// import walletRoutes from '@routes/wallet';
// import groupRoutes from '@routes/groups';
// import contributionRoutes from '@routes/contributions';
// import payoutRoutes from '@routes/payouts';
// import adminRoutes from '@routes/admin';
// import webhookRoutes from '@routes/webhooks';

// Types
interface RequestWithId extends Request {
  id: string;
  user?: any;
}

const app: Express = express();

/**
 * Security & Performance Middleware
 */

// Helmet: Set security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS: Enable cross-origin requests (configure for production)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://khalia.ng', 'https://www.khalia.ng']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

/**
 * Body & Request Parsing
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Request ID & Logging
 */
app.use((req: RequestWithId, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use(requestLoggingMiddleware);

/**
 * Rate Limiting
 */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

/**
 * Health Check Endpoint
 */
app.get('/health', (req: RequestWithId, res: Response) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

/**
 * API Routes
 */

// Public auth routes (no auth required)
app.use('/api/v1/auth', authRoutes);

// Protected routes (require auth token)
app.use('/api/v1/', authMiddleware);

// TODO: Mount protected routes
// app.use('/api/v1/wallet', walletRoutes);
// app.use('/api/v1/groups', groupRoutes);
// app.use('/api/v1', contributionRoutes);
// app.use('/api/v1', payoutRoutes);
// app.use('/api/v1/admin', adminRoutes);

// Webhooks (public, but signature-verified)
// app.use('/webhooks', webhookRoutes);

/**
 * 404 Handler
 */
app.use((req: RequestWithId, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
    },
    requestId: req.id,
  });
});

/**
 * Global Error Handler (must be last)
 */
app.use(errorHandlerMiddleware);

/**
 * CORS Preflight
 */
app.options('*', cors());

export default app;
