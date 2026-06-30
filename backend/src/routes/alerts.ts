import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/authPG';
import Alert from '../models/Alert';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
    res.json({ alerts });
  } catch { res.status(500).json({ error: 'Failed to fetch alerts' }); }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { symbol, targetPrice, condition, note } = req.body;
    if (!symbol || !targetPrice || !condition)
      return res.status(400).json({ error: 'symbol, targetPrice, condition required' });

    const alert = await Alert.create({ userId, symbol: symbol.toUpperCase(), targetPrice, condition, note });
    res.status(201).json({ alert });
  } catch { res.status(500).json({ error: 'Failed to create alert' }); }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    await Alert.deleteOne({ _id: req.params.id, userId });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete alert' }); }
});

export default router;
