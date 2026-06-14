import axios from 'axios';
import cron from 'node-cron';

// Cache for news articles
let newsCache: NewsArticle[] = [];
let lastUpdated: Date = new Date();

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: Date;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  relatedStocks: string[];
  imageUrl?: string;
}

// NewsAPI free tier: 100 req/day — single combined query to preserve quota
const COMBINED_QUERY = 'Sensex OR Nifty OR NSE OR RBI OR Reliance OR TCS OR Infosys OR HDFC';

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

class NewsService {
  constructor() {
    this.scheduleNewsRefresh();
    // Delay initial fetch so server fully starts before hitting API
    setTimeout(() => this.fetchAllNews(), 3000);
  }

  private scheduleNewsRefresh() {
    cron.schedule('0 */6 * * *', async () => {
      console.log('🔄 Refreshing news...');
      await this.fetchAllNews();
    });
  }

  async fetchAllNews(): Promise<NewsArticle[]> {
    try {
      const articles = await this.fetchFromNewsAPI(COMBINED_QUERY);
      const uniqueArticles = this.removeDuplicates(
        articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      );
      newsCache = uniqueArticles.slice(0, 60);
      lastUpdated = new Date();
      console.log(`✅ News cache updated: ${newsCache.length} articles`);
      return newsCache;
    } catch (error) {
      console.error('Error fetching news:', error);
      return newsCache;
    }
  }

  private async fetchFromNewsAPI(query: string): Promise<NewsArticle[]> {
    if (!NEWS_API_KEY) {
      console.log('⚠️  NEWS_API_KEY not set — skipping news fetch');
      return [];
    }

    try {
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // last 7 days
      const response = await axios.get(NEWS_API_URL, {
        params: { q: query, language: 'en', sortBy: 'publishedAt', pageSize: 50, apiKey: NEWS_API_KEY, from },
        timeout: 12000
      });

      if (response.data.status !== 'ok') {
        throw new Error(response.data.message || 'NewsAPI error');
      }

      return response.data.articles
        .filter((a: any) => a.title && a.title !== '[Removed]')
        .map((article: any, index: number) => this.transformArticle(article, `na-${index}`));
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      console.error('NewsAPI error:', msg);
      return [];
    }
  }

  private transformArticle(article: any, id: string): NewsArticle {
    // Analyze sentiment based on title keywords
    const sentiment = this.analyzeSentiment(article.title + ' ' + article.description);
    
    // Determine category
    const category = this.categorizeArticle(article.title);
    
    // Extract related stocks
    const relatedStocks = this.extractStockSymbols(article.title + ' ' + article.description);

    return {
      id,
      title: article.title,
      description: article.description || '',
      source: article.source?.name || 'Unknown',
      publishedAt: new Date(article.publishedAt),
      url: article.url,
      sentiment,
      category,
      relatedStocks,
      imageUrl: article.urlToImage
    };
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['surge', 'jump', 'rise', 'gain', 'rally', 'bull', 'up', 'growth', 'profit', 'record', 'high', 'boost', 'strong'];
    const negativeWords = ['fall', 'drop', 'decline', 'crash', 'bear', 'down', 'loss', 'low', 'weak', 'plunge', 'tumble', 'sink'];
    
    const lowerText = text.toLowerCase();
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  private categorizeArticle(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('ipo') || lowerTitle.includes('public issue')) return 'IPO';
    if (lowerTitle.includes('result') || lowerTitle.includes('earnings') || lowerTitle.includes('profit')) return 'Earnings';
    if (lowerTitle.includes('rbi') || lowerTitle.includes('policy') || lowerTitle.includes('rate')) return 'Policy';
    if (lowerTitle.includes('fii') || lowerTitle.includes('dii') || lowerTitle.includes('foreign')) return 'FII/FPI';
    if (lowerTitle.includes('sensex') || lowerTitle.includes('nifty') || lowerTitle.includes('market')) return 'Market Update';
    if (lowerTitle.includes('merger') || lowerTitle.includes('acquisition')) return 'M&A';
    if (lowerTitle.includes('dividend') || lowerTitle.includes('bonus') || lowerTitle.includes('split')) return 'Corporate Action';
    
    return 'General';
  }

  private extractStockSymbols(text: string): string[] {
    const commonStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'KOTAKBANK', 'LT', 'ITC'];
    const found: string[] = [];
    
    commonStocks.forEach(stock => {
      if (text.toUpperCase().includes(stock)) {
        found.push(stock);
      }
    });
    
    return found;
  }

  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const normalized = article.title.toLowerCase().trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  // Public methods
  getCachedNews(): NewsArticle[] {
    return newsCache;
  }

  getLastUpdated(): Date {
    return lastUpdated;
  }

  async getNewsByCategory(category: string): Promise<NewsArticle[]> {
    return newsCache.filter(article => article.category === category);
  }

  async getNewsByStock(symbol: string): Promise<NewsArticle[]> {
    return newsCache.filter(article => 
      article.relatedStocks.includes(symbol.toUpperCase())
    );
  }

  async searchNews(query: string): Promise<NewsArticle[]> {
    const lowerQuery = query.toLowerCase();
    return newsCache.filter(article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// Singleton instance
export const newsService = new NewsService();
export default newsService;
