import axios from 'axios';

// Cache for news articles
let newsCache: NewsArticle[] = [];
let lastUpdated: Date = new Date(0);

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

// Free RSS feeds from Indian financial news — no API key required
const RSS_FEEDS = [
  { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', source: 'Economic Times' },
  { url: 'https://www.moneycontrol.com/rss/MCtopnews.xml', source: 'MoneyControl' },
  { url: 'https://www.livemint.com/rss/markets', source: 'LiveMint' },
  { url: 'https://feeds.feedburner.com/ndtvprofit-latest', source: 'NDTV Profit' },
];

class NewsService {
  constructor() {}

  async fetchAllNews(): Promise<NewsArticle[]> {
    try {
      const allArticles: NewsArticle[] = [];
      await Promise.allSettled(
        RSS_FEEDS.map(async (feed, feedIndex) => {
          try {
            const articles = await this.fetchRSS(feed.url, feed.source, feedIndex);
            allArticles.push(...articles);
          } catch (e) {
            console.warn(`RSS fetch failed for ${feed.source}`);
          }
        })
      );

      if (allArticles.length === 0) {
        console.warn('⚠️  All RSS feeds failed — returning cached news');
        return newsCache;
      }

      const uniqueArticles = this.removeDuplicates(
        allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
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

  private async fetchRSS(url: string, source: string, feedIndex: number): Promise<NewsArticle[]> {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; QuantWealthBot/1.0)' }
    });
    const xml = response.data as string;
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    return items.slice(0, 15).map((item, i) => {
      const title = this.extractXML(item, 'title');
      const description = this.extractXML(item, 'description').replace(/<[^>]*>/g, '').trim();
      const link = this.extractXML(item, 'link');
      const pubDate = this.extractXML(item, 'pubDate');
      const imageMatch = item.match(/url="([^"]+\.(jpg|jpeg|png|webp))"/i);

      return {
        id: `${feedIndex}-${i}`,
        title,
        description: description.slice(0, 300),
        source,
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
        url: link,
        sentiment: this.analyzeSentiment(title + ' ' + description),
        category: this.categorizeArticle(title),
        relatedStocks: this.extractStockSymbols(title + ' ' + description),
        imageUrl: imageMatch?.[1],
      };
    }).filter(a => a.title && a.title.length > 5);
  }

  private extractXML(xml: string, tag: string): string {
    const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
    return match?.[1]?.trim() || '';
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
