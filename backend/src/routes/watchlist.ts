import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import Watchlist from '../models/Watchlist';

const router = Router();

// GET /api/watchlist
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const wl = await Watchlist.findOne({ userId });
    res.json({ items: wl?.items || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// POST /api/watchlist  { symbol }
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const symbol = (req.body.symbol || '').toUpperCase().trim();
    if (!symbol) return res.status(400).json({ error: 'symbol required' });

    let wl = await Watchlist.findOne({ userId });
    if (!wl) wl = new Watchlist({ userId, items: [] });

    const exists = wl.items.some(i => i.symbol === symbol);
    if (exists) return res.status(409).json({ error: 'Already in watchlist' });

    wl.items.push({ symbol, addedAt: new Date() });
    await wl.save();
    res.json({ items: wl.items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// DELETE /api/watchlist/:symbol
router.delete('/:symbol', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const symbol = req.params.symbol.toUpperCase();
    const wl = await Watchlist.findOne({ userId });
    if (!wl) return res.status(404).json({ error: 'Watchlist not found' });

    wl.items = wl.items.filter(i => i.symbol !== symbol);
    await wl.save();
    res.json({ items: wl.items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

export default router;
