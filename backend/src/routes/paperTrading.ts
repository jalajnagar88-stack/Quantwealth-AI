import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/authPG';
import {
  initializePortfolio,
  executeBuy,
  executeSell,
  getPortfolio,
  getTransactions,
  getLeaderboard,
  resetPortfolio,
  getStockPrice,
} from '../services/PaperTradingService';

const router: Router = express.Router();
router.use(authMiddleware);

// Get or initialize portfolio
router.get('/portfolio', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const portfolio = await getPortfolio(userId);
    res.json({ success: true, data: portfolio });
  } catch (error: any) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get portfolio' });
  }
});

// Execute BUY
router.post('/buy', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { symbol, quantity } = req.body;
    if (!symbol || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Symbol and quantity required' });
    }

    const result = await executeBuy(userId, symbol.toUpperCase(), parseInt(quantity));
    res.json(result);
  } catch (error: any) {
    console.error('Buy error:', error);
    res.status(400).json({ success: false, message: error.message || 'Buy failed' });
  }
});

// Execute SELL
router.post('/sell', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { symbol, quantity } = req.body;
    if (!symbol || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Symbol and quantity required' });
    }

    const result = await executeSell(userId, symbol.toUpperCase(), parseInt(quantity));
    res.json(result);
  } catch (error: any) {
    console.error('Sell error:', error);
    res.status(400).json({ success: false, message: error.message || 'Sell failed' });
  }
});

// Get current stock price
router.get('/price/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const price = await getStockPrice(symbol.toUpperCase());
    if (!price) {
      return res.status(404).json({ success: false, message: `Price not found for ${symbol}` });
    }
    res.json({ success: true, data: { symbol: symbol.toUpperCase(), price } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get price' });
  }
});

// Get transaction history
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await getTransactions(userId, limit);
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get transactions' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await getLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get leaderboard' });
  }
});

// Reset portfolio
router.post('/reset', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const portfolio = await resetPortfolio(userId);
    res.json({ success: true, message: 'Portfolio reset successfully', data: portfolio });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Reset failed' });
  }
});

export default router;
