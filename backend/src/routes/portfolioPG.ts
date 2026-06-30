import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/authPG';
import { getPool } from '../config/database';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const pool = getPool();
    
    const result = await pool.query(
      'SELECT holdings FROM portfolios WHERE user_id = $1',
      [userId]
    );
    
    const holdings = result.rows[0]?.holdings || [];
    res.json({ holdings });
  } catch (err) {
    console.error('Failed to fetch portfolio:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

router.post('/holding', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { symbol, qty, avgPrice } = req.body;
    
    if (!symbol || !qty || !avgPrice) {
      return res.status(400).json({ error: 'symbol, qty, avgPrice required' });
    }

    const pool = getPool();
    
    // Check if portfolio exists
    const existing = await pool.query(
      'SELECT holdings FROM portfolios WHERE user_id = $1',
      [userId]
    );
    
    let holdings = existing.rows[0]?.holdings || [];
    
    // Find existing holding
    const existingIndex = holdings.findIndex((h: any) => h.symbol === symbol.toUpperCase());
    
    if (existingIndex >= 0) {
      // Update existing holding
      const existingHolding = holdings[existingIndex];
      const totalQty = existingHolding.qty + qty;
      existingHolding.avgPrice = ((existingHolding.avgPrice * existingHolding.qty) + (avgPrice * qty)) / totalQty;
      existingHolding.qty = totalQty;
      holdings[existingIndex] = existingHolding;
    } else {
      // Add new holding
      holdings.push({ symbol: symbol.toUpperCase(), qty, avgPrice, addedAt: new Date() });
    }
    
    // Update or insert portfolio
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE portfolios SET holdings = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [JSON.stringify(holdings), userId]
      );
    } else {
      await pool.query(
        'INSERT INTO portfolios (user_id, holdings) VALUES ($1, $2)',
        [userId, JSON.stringify(holdings)]
      );
    }
    
    res.json({ holdings });
  } catch (err) {
    console.error('Failed to add holding:', err);
    res.status(500).json({ error: 'Failed to add holding' });
  }
});

router.delete('/holding/:symbol', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const symbol = req.params.symbol.toUpperCase();
    const pool = getPool();
    
    const existing = await pool.query(
      'SELECT holdings FROM portfolios WHERE user_id = $1',
      [userId]
    );
    
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    const holdings = existing.rows[0].holdings.filter((h: any) => h.symbol !== symbol);
    
    await pool.query(
      'UPDATE portfolios SET holdings = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [JSON.stringify(holdings), userId]
    );
    
    res.json({ holdings });
  } catch (err) {
    console.error('Failed to remove holding:', err);
    res.status(500).json({ error: 'Failed to remove holding' });
  }
});

export default router;
