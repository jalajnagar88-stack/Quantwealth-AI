import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
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
import { apiLimiter, authLimiter, backtestLimiter, publicRouteLimiter } from './middleware/rateLimiter';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

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

// Connect to MongoDB
connectDB();

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

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

// Start server
app.listen(Number(PORT), HOST, () => {
  console.log('\n🚀 QuantWealth AI Backend Started');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n✅ Available Routes:');
  console.log('  AUTH ROUTES:');
  console.log('    POST /api/auth/register - Register new user');
  console.log('    POST /api/auth/login - User login');
  console.log('    POST /api/auth/verify-otp - Verify OTP');
  console.log('    POST /api/auth/resend-otp - Resend OTP');
  console.log('    GET  /api/auth/profile - Get user profile');
  console.log('    PUT  /api/auth/profile - Update profile');
  console.log('  NEWS ROUTES:');
  console.log('    GET  /api/news - Get all news articles');
  console.log('    GET  /api/news/categories - Get news categories');
  console.log('    GET  /api/news/stock/:symbol - Get news for specific stock');
  console.log('    POST /api/news/refresh - Refresh news (admin)');
  console.log('  BACKTEST ROUTES:');
  console.log('    POST /api/backtest/run - Run backtest simulation');
  console.log('    GET  /api/backtest/history - Get backtest history');
  console.log('    GET  /api/backtest/stats - Get backtest statistics');
  console.log('    GET  /api/backtest/:id - Get backtest details');
  console.log('    DELETE /api/backtest/:id - Delete backtest');
  console.log('  SIGNALS ROUTES:');
  console.log('    POST /api/signals/generate - Generate trading signal');
  console.log('    GET  /api/signals/history/:symbol - Signal history');
  console.log('  TRADE BRIEF ROUTES:');
  console.log('    POST /api/trade-brief - Generate AI trade brief');
  console.log('  MARKET ROUTES:');
  console.log('    POST /api/market/ingest - Ingest market data');
  console.log('    GET  /api/market/snapshot/:symbol - Market snapshot');
  console.log('    GET  /api/market/history/:symbol - Market history');
  console.log('    GET  /api/market/candles/:symbol - Candlestick data');
  console.log('\n✅ MongoDB connected successfully\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️ SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
