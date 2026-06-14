import express, { Router, Request, Response } from 'express';
import { generateSignal, getSignalHistory } from '../controllers/signalController';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();
router.use(authMiddleware);

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { symbol, currentPrice, technicalData, sentimentScore, recentHistory } = req.body;
    
    if (!symbol || !currentPrice) {
      return res.status(400).json({
        error: 'Missing required fields: symbol, currentPrice'
      });
    }

    const signal = await generateSignal(symbol, currentPrice, technicalData, sentimentScore, recentHistory);
    
    res.status(200).json({
      success: true,
      data: signal,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate signal',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/history/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const history = await getSignalHistory(symbol);
    
    res.status(200).json({
      success: true,
      symbol,
      data: history,
      count: history.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get signal history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
