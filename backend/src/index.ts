import dotenv from 'dotenv';

// Load environment variables before any imports
dotenv.config({ path: '.env' });

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database';
import signalRoutes from './routes/signals';
import marketRoutes from './routes/market';
import authRoutes from './routes/auth';
import backtestRoutes from './routes/backtest';
import newsRoutes from './routes/news';
import chatRoutes from './routes/chat';
import tradeBriefRoutes from './routes/tradeBrief';
import watchlistRoutes from './routes/watchlist';
import alertRoutes from './routes/alerts';
import portfolioRoutes from './routes/portfolio';
import paperTradingRoutes from './routes/paperTrading';
import hacdIssuanceRoutes from './routes/hacdIssuance';
import { apiLimiter, authLimiter, backtestLimiter } from './middleware/rateLimiter';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://quantwealth-ai.netlify.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json());

// Rate Limiting
app.use('/api/auth/', authLimiter);
app.use('/api/backtest/run', backtestLimiter);
app.use('/api/', apiLimiter);

// Connect to MongoDB on each request (serverless-safe)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: '✅ QuantWealth AI Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/backtest', backtestRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/trade-brief', tradeBriefRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/paper-trading', paperTradingRoutes);
app.use('/api/hacd-issuance', hacdIssuanceRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

// Export app for Vercel serverless
export default app;

// Start server in non-serverless environments
if (process.env.NODE_ENV !== 'production') {
  app.listen(Number(PORT), HOST, () => {
    console.log('\n🚀 QuantWealth AI Backend Started');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});
