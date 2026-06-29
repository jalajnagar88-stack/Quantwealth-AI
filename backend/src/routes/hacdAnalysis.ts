import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getHacdMarketOverview,
  getHacdHistoricalPrices,
  calculateHacdRarityScore,
} from '../services/HacdPriceTracker';
import {
  predictStackCost,
  backtestStackStrategies,
  predictHacdPriceMovement,
} from '../services/HacdStackPredictor';
import {
  runBacktest,
  runComparativeBacktest,
  getOptimalStrategy,
  simulateFormationTimeline,
} from '../services/HacdBacktester';

const router: Router = express.Router();
router.use(authMiddleware);

// Get HACD market overview
router.get('/market', async (req: Request, res: Response) => {
  try {
    const market = await getHacdMarketOverview();
    res.json({ success: true, data: market });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get HACD historical prices
router.get('/historical', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const prices = await getHacdHistoricalPrices(days);
    res.json({ success: true, data: prices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate HACD rarity score
router.post('/rarity', async (req: Request, res: Response) => {
  try {
    const { hacdName } = req.body;
    if (!hacdName) {
      return res.status(400).json({ success: false, message: 'HACD name is required' });
    }
    
    const rarity = calculateHacdRarityScore(hacdName);
    res.json({ success: true, data: rarity });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Predict optimal stack cost
router.post('/predict-stack-cost', async (req: Request, res: Response) => {
  try {
    const { projectCategory, hacdName, targetSupply } = req.body;
    if (!projectCategory || !hacdName || !targetSupply) {
      return res.status(400).json({ 
        success: false, 
        message: 'projectCategory, hacdName, and targetSupply are required' 
      });
    }
    
    const prediction = await predictStackCost(projectCategory, hacdName, targetSupply);
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Backtest stack strategies
router.post('/backtest-strategies', async (req: Request, res: Response) => {
  try {
    const { projectCategory, hacdName, targetSupply } = req.body;
    if (!projectCategory || !hacdName || !targetSupply) {
      return res.status(400).json({ 
        success: false, 
        message: 'projectCategory, hacdName, and targetSupply are required' 
      });
    }
    
    const results = await backtestStackStrategies(projectCategory, hacdName, targetSupply);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Predict HACD price movement
router.get('/price-prediction', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const prediction = await predictHacdPriceMovement(days);
    res.json({ success: true, data: prediction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Run custom backtest
router.post('/backtest', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    if (!config.stackCost || !config.totalLots || !config.unitsPerLot) {
      return res.status(400).json({ 
        success: false, 
        message: 'stackCost, totalLots, and unitsPerLot are required' 
      });
    }
    
    const result = await runBacktest(config);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Run comparative backtest
router.post('/comparative-backtest', async (req: Request, res: Response) => {
  try {
    const baseConfig = req.body;
    if (!baseConfig.totalLots || !baseConfig.unitsPerLot) {
      return res.status(400).json({ 
        success: false, 
        message: 'totalLots and unitsPerLot are required' 
      });
    }
    
    const results = await runComparativeBacktest(baseConfig);
    const optimal = getOptimalStrategy(results);
    
    res.json({ 
      success: true, 
      data: { 
        results, 
        optimal 
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Simulate formation timeline
router.post('/formation-timeline', async (req: Request, res: Response) => {
  try {
    const { totalLots, phaseModel } = req.body;
    if (!totalLots || !phaseModel) {
      return res.status(400).json({ 
        success: false, 
        message: 'totalLots and phaseModel are required' 
      });
    }
    
    const timeline = simulateFormationTimeline(totalLots, phaseModel);
    res.json({ success: true, data: timeline });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
