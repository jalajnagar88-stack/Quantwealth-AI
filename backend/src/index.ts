import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import signalRoutes from './routes/signals';
import marketRoutes from './routes/market';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

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
app.use('/api/signals', signalRoutes);
app.use('/api/market', marketRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, HOST as any, () => {
  console.log('\n🚀 QuantWealth AI Backend Started');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n✅ Available Routes:');
  console.log('  GET /health - Health check');
  console.log('  POST /api/signals/generate - Generate trading signal');
  console.log('  GET /api/signals/history/:symbol - Signal history');
  console.log('  POST /api/market/ingest - Ingest market data');
  console.log('  GET /api/market/snapshot/:symbol - Market snapshot with indicators');
  console.log('  GET /api/market/history/:symbol - Market history');
  console.log('  GET /api/market/candles/:symbol - Candlestick data');
  console.log('\n✅ MongoDB connected successfully\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️ SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
