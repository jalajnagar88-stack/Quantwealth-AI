import express, { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/authPG';
import { BacktestService } from '../services/BacktestService';

const router: Router = express.Router();
const backtestService = new BacktestService();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const runBacktestValidation = [
  body('symbol')
    .notEmpty()
    .withMessage('Stock symbol is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Symbol must be between 1 and 20 characters'),
  body('strategy')
    .notEmpty()
    .withMessage('Strategy is required')
    .isIn(['RSI', 'MACD', 'MOVING_AVG', 'BREAKOUT'])
    .withMessage('Invalid strategy'),
  body('years')
    .notEmpty()
    .withMessage('Years is required')
    .isInt({ min: 1, max: 20 })
    .withMessage('Years must be between 1 and 20'),
  body('initialCapital')
    .notEmpty()
    .withMessage('Initial capital is required')
    .isInt({ min: 10000 })
    .withMessage('Initial capital must be at least 10000'),
  body('stockName')
    .optional()
    .isString()
    .withMessage('Stock name must be a string')
];

// Mock backtest run endpoint (bypasses database ObjectId issues)
router.post('/run', runBacktestValidation, async (req: Request, res: Response) => {
  try {
    const { symbol, strategy, years, initialCapital } = req.body;
    
    // Run backtest using service
    const results = await backtestService.runBacktest(symbol, years, strategy, initialCapital);
    
    const netProfit = results.totalProfit - results.totalLoss;
    const roi = ((netProfit / initialCapital) * 100);
    const profitFactor = results.totalLoss > 0 ? results.totalProfit / results.totalLoss : 0;
    const avgProfitPerTrade = results.totalTrades > 0 ? netProfit / results.totalTrades : 0;
    const finalCapital = initialCapital + netProfit;

    res.status(200).json({
      success: true,
      message: 'Backtest completed successfully',
      data: {
        ...results,
        netProfit,
        roi,
        profitFactor,
        avgProfitPerTrade,
        finalCapital,
        backtestId: null, // Database save disabled
        engineUsed: 'mock',
        dataSource: 'Simulated (mock)'
      }
    });
  } catch (error) {
    console.error('Run backtest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run backtest',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mock endpoints for other backtest operations
router.get('/history', async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      backtests: [],
      pagination: {
        total: 0,
        page: 1,
        pages: 0,
        limit: 20
      }
    },
    message: 'Backtest history temporarily disabled for submission'
  });
});

router.get('/stats', async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      overall: {
        totalBacktests: 0,
        avgRoi: 0,
        avgWinRate: 0,
        totalTrades: 0,
        totalProfit: 0
      },
      byStrategy: []
    },
    message: 'Backtest stats temporarily disabled for submission'
  });
});

router.get('/:id', async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: null,
    message: 'Backtest details temporarily disabled for submission'
  });
});

router.delete('/:id', async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Backtest deletion temporarily disabled for submission'
  });
});

export default router;
