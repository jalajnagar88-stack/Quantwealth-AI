import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import Portfolio from '../models/Portfolio';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const p = await Portfolio.findOne({ userId });
    res.json({ holdings: p?.holdings || [] });
  } catch { res.status(500).json({ error: 'Failed to fetch portfolio' }); }
});

router.post('/holding', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { symbol, qty, avgPrice } = req.body;
    if (!symbol || !qty || !avgPrice)
      return res.status(400).json({ error: 'symbol, qty, avgPrice required' });

    let p = await Portfolio.findOne({ userId });
    if (!p) p = new Portfolio({ userId, holdings: [] });

    const existing = p.holdings.find(h => h.symbol === symbol.toUpperCase());
    if (existing) {
      const totalQty = existing.qty + qty;
      existing.avgPrice = ((existing.avgPrice * existing.qty) + (avgPrice * qty)) / totalQty;
      existing.qty = totalQty;
    } else {
      p.holdings.push({ symbol: symbol.toUpperCase(), qty, avgPrice, addedAt: new Date() });
    }
    await p.save();
    res.json({ holdings: p.holdings });
  } catch { res.status(500).json({ error: 'Failed to add holding' }); }
});

router.delete('/holding/:symbol', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const symbol = req.params.symbol.toUpperCase();
    const p = await Portfolio.findOne({ userId });
    if (!p) return res.status(404).json({ error: 'Portfolio not found' });
    p.holdings = p.holdings.filter(h => h.symbol !== symbol);
    await p.save();
    res.json({ holdings: p.holdings });
  } catch { res.status(500).json({ error: 'Failed to remove holding' }); }
});

export default router;
