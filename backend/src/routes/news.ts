import express, { Router, Request, Response } from 'express';
import newsService from '../services/NewsService';
import { authMiddleware } from '../middleware/authPG';

const router: Router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all news
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, limit = 20 } = req.query;
    
    let news = newsService.getCachedNews();
    // Auto-fetch on cold start if cache is empty
    if (news.length === 0) {
      news = await newsService.fetchAllNews();
    }
    
    // Filter by category
    if (category && category !== 'all') {
      news = news.filter(article => article.category.toLowerCase() === (category as string).toLowerCase());
    }
    
    // Search
    if (search) {
      const searchLower = (search as string).toLowerCase();
      news = news.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Limit results
    news = news.slice(0, parseInt(limit as string));
    
    res.status(200).json({
      success: true,
      data: {
        articles: news,
        total: news.length,
        lastUpdated: newsService.getLastUpdated()
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get news categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const news = newsService.getCachedNews();
    const categories = [...new Set(news.map(article => article.category))];
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get news by stock symbol
router.get('/stock/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const news = await newsService.getNewsByStock(symbol);
    
    res.status(200).json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        articles: news
      }
    });
  } catch (error) {
    console.error('Get stock news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock news',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Refresh news — 15-minute cooldown to protect free-tier API quota
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const lastUpdated = newsService.getLastUpdated();
    const minsSince = (Date.now() - lastUpdated.getTime()) / 60000;
    if (minsSince < 15) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((15 - minsSince) * 60)
      });
    }
    const articles = await newsService.fetchAllNews();
    
    res.status(200).json({
      success: true,
      message: `News refreshed successfully. Fetched ${articles.length} articles.`,
      data: {
        count: articles.length,
        lastUpdated: newsService.getLastUpdated()
      }
    });
  } catch (error) {
    console.error('Refresh news error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh news',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
