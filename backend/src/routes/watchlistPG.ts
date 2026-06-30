import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/authPG';
import { getPool } from '../config/database';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const pool = getPool();
    
    const result = await pool.query(
      'SELECT items FROM watchlists WHERE user_id = $1',
      [userId]
    );
    
    const items = result.rows[0]?.items || [];
    res.json({ items });
  } catch (err) {
    console.error('Failed to fetch watchlist:', err);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const symbol = (req.body.symbol || '').toUpperCase().trim();
    
    if (!symbol) {
      return res.status(400).json({ error: 'symbol required' });
    }

    const pool = getPool();
    
    // Check if watchlist exists
    const existing = await pool.query(
      'SELECT items FROM watchlists WHERE user_id = $1',
      [userId]
    );
    
    let items = existing.rows[0]?.items || [];
    
    // Check if symbol already exists
    const exists = items.some((i: any) => i.symbol === symbol);
    if (exists) {
      return res.status(409).json({ error: 'Already in watchlist' });
    }
    
    // Add new item
    items.push({ symbol, addedAt: new Date() });
    
    // Update or insert watchlist
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE watchlists SET items = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [JSON.stringify(items), userId]
      );
    } else {
      await pool.query(
        'INSERT INTO watchlists (user_id, items) VALUES ($1, $2)',
        [userId, JSON.stringify(items)]
      );
    }
    
    res.json({ items });
  } catch (err) {
    console.error('Failed to add to watchlist:', err);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

router.delete('/:symbol', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const symbol = req.params.symbol.toUpperCase();
    const pool = getPool();
    
    const existing = await pool.query(
      'SELECT items FROM watchlists WHERE user_id = $1',
      [userId]
    );
    
    if (!existing.rows[0]) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }
    
    const items = existing.rows[0].items.filter((i: any) => i.symbol !== symbol);
    
    await pool.query(
      'UPDATE watchlists SET items = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [JSON.stringify(items), userId]
    );
    
    res.json({ items });
  } catch (err) {
    console.error('Failed to remove from watchlist:', err);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

export default router;
