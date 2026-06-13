import { Router, Request, Response } from 'express';
import { BacktestService } from '../services/BacktestService';

const router = Router();

router.post('/run', async (req: Request, res: Response) => {
  try {
    const { symbol, years } = req.body;
    
    const backtest = new BacktestService();
    const results = await backtest.runBacktest(symbol, years);
    
    res.json(results);
  } catch (error) {
    console.error('Backtest error:', error);
    res.status(500).json({ error: 'Backtest failed' });
  }
});

export default router;
