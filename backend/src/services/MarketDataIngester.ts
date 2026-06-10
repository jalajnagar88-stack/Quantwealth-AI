import MarketData from '../models/MarketData';
import { CandleAggregator } from './CandleAggregator';
import { TechnicalAnalyzer } from './TechnicalAnalyzer';

const candleAggregator = new CandleAggregator();
const technicalAnalyzer = new TechnicalAnalyzer();

export class MarketDataIngester {
  // Mock market data (replace with real Zerodha/Shoonya API later)
  private mockPrices: { [key: string]: number } = {
    'RELIANCE': 2850,
    'TCS': 3420,
    'INFY': 1890,
    'WIPRO': 410,
    'BAJAJFINSV': 1580,
    'MARUTI': 9200,
    'HDFC': 2650,
    'AXISBANK': 1040,
    'ICICIBANK': 925,
    'LT': 3180
  };

  private mockVolumes: { [key: string]: number } = {
    'RELIANCE': 1500000,
    'TCS': 800000,
    'INFY': 1200000,
    'WIPRO': 2000000,
    'BAJAJFINSV': 500000,
    'MARUTI': 400000,
    'HDFC': 600000,
    'AXISBANK': 1100000,
    'ICICIBANK': 1800000,
    'LT': 700000
  };

  // Ingest live market data
  async ingestMarketData(symbol: string, price?: number, volume?: number) {
    try {
      // Get mock data if not provided
      const currentPrice = price || this.getMockPrice(symbol);
      const currentVolume = volume || this.getMockVolume(symbol);

      // Save market data
      const marketData = new MarketData({
        symbol: symbol.toUpperCase(),
        price: currentPrice,
        bid: currentPrice - 0.05,
        ask: currentPrice + 0.05,
        volume: currentVolume,
        timestamp: new Date(),
        open24h: currentPrice * 0.98,
        high24h: currentPrice * 1.03,
        low24h: currentPrice * 0.97,
        change24h: currentPrice * 0.02,
        changePercent24h: 0.7
      });

      await marketData.save();

      // Aggregate candles for all timeframes
      await candleAggregator.aggregateAllTimeframes(
        symbol,
        currentPrice,
        currentVolume,
        new Date()
      );

      return {
        success: true,
        symbol,
        price: currentPrice,
        volume: currentVolume,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error ingesting market data:', error);
      throw error;
    }
  }

  // Get current market snapshot with technical indicators
  async getMarketSnapshot(symbol: string, timeframe: '5m' | '15m' | '30m' | '1h' | '1d' = '5m') {
    try {
      // Get latest market data
      const latestData = await MarketData.findOne({ symbol })
        .sort({ timestamp: -1 })
        .lean();

      if (!latestData) {
        throw new Error(`No market data found for ${symbol}`);
      }

      // Get candles for analysis
      const closes = await candleAggregator.getCloses(symbol, timeframe, 100);
      const volumes = await candleAggregator.getVolumes(symbol, timeframe, 100);

      if (closes.length === 0) {
        throw new Error(`No candle data available for ${symbol}`);
      }

      // Calculate technical indicators
      const technicalData = technicalAnalyzer.analyze(closes, volumes);

      return {
        symbol,
        currentPrice: latestData.price,
        bid: latestData.bid,
        ask: latestData.ask,
        volume: latestData.volume,
        change24h: latestData.change24h,
        changePercent24h: latestData.changePercent24h,
        timestamp: latestData.timestamp.toISOString(),
        technical: {
          timeframe,
          rsi: technicalData.rsi,
          macd: technicalData.macd,
          bollingerBands: technicalData.bollingerBands,
          volumeAnomalyScore: technicalData.volumeAnomalyScore,
          priceChange24h: technicalData.priceChange24h,
          candleCount: closes.length
        }
      };
    } catch (error) {
      console.error('Error getting market snapshot:', error);
      throw error;
    }
  }

  // Get market data history
  async getMarketHistory(symbol: string, hours: number = 24) {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      const history = await MarketData.find({
        symbol,
        timestamp: { $gte: cutoffTime }
      })
        .sort({ timestamp: -1 })
        .limit(1000)
        .lean();

      return history.reverse();
    } catch (error) {
      console.error('Error fetching market history:', error);
      throw error;
    }
  }

  // Mock price generator (simulate price movement)
  private getMockPrice(symbol: string): number {
    let basePrice = this.mockPrices[symbol] || 1000;
    
    // Random walk: ±0.5% movement
    const movement = (Math.random() - 0.5) * basePrice * 0.01;
    const newPrice = basePrice + movement;
    
    this.mockPrices[symbol] = newPrice;
    return Math.round(newPrice * 100) / 100;
  }

  // Mock volume generator
  private getMockVolume(symbol: string): number {
    const baseVolume = this.mockVolumes[symbol] || 1000000;
    
    // Random volume variation ±30%
    const variation = (Math.random() - 0.5) * baseVolume * 0.6;
    return Math.round(baseVolume + variation);
  }
}
