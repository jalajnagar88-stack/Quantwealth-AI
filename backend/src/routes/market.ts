import express, { Router, Request, Response } from 'express';
import { MarketDataIngester } from '../services/MarketDataIngester';
import { CandleAggregator } from '../services/CandleAggregator';

const router: Router = express.Router();
const ingester = new MarketDataIngester();
const aggregator = new CandleAggregator();

// Ingest market data for a symbol
router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const { symbol, price, volume } = req.body;

    if (!symbol) {
      return res.status(400).json({
        error: 'Missing required field: symbol'
      });
    }

    const result = await ingester.ingestMarketData(symbol, price, volume);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to ingest market data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get current market snapshot with technical indicators
router.get('/snapshot/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '5m' } = req.query;

    const snapshot = await ingester.getMarketSnapshot(
      symbol,
      (timeframe as '5m' | '15m' | '30m' | '1h' | '1d') || '5m'
    );

    res.status(200).json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get market snapshot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get market data history
router.get('/history/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { hours = 24 } = req.query;

    const history = await ingester.getMarketHistory(symbol, parseInt(hours as string) || 24);

    res.status(200).json({
      success: true,
      symbol,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get market history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get candles for technical analysis
router.get('/candles/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '5m', limit = 50 } = req.query;

    const candles = await aggregator.getCandles(
      symbol,
      (timeframe as '5m' | '15m' | '30m' | '1h' | '1d') || '5m',
      parseInt(limit as string) || 50
    );

    res.status(200).json({
      success: true,
      symbol,
      timeframe,
      count: candles.length,
      data: candles
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get candles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Bulk ingest for multiple symbols
router.post('/ingest-bulk', async (req: Request, res: Response) => {
  try {
    const { stocks } = req.body;

    if (!Array.isArray(stocks)) {
      return res.status(400).json({
        error: 'stocks must be an array'
      });
    }

    const results = await Promise.all(
      stocks.map(s => ingester.ingestMarketData(s.symbol, s.price, s.volume))
    );

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to ingest bulk market data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
