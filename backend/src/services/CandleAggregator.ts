import Candle from '../models/Candle';
import MarketData from '../models/MarketData';

export class CandleAggregator {
  private timeframeMinutes = {
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '1d': 1440
  };

  // Get or create candle for given timeframe
  async aggregateCandle(
    symbol: string,
    price: number,
    volume: number,
    timeframe: '5m' | '15m' | '30m' | '1h' | '1d' = '5m',
    timestamp: Date = new Date()
  ) {
    const minutes = this.timeframeMinutes[timeframe];
    
    // Calculate candle open time
    const candleOpenTime = new Date(timestamp);
    candleOpenTime.setMinutes(
      Math.floor(candleOpenTime.getMinutes() / minutes) * minutes
    );
    candleOpenTime.setSeconds(0);
    candleOpenTime.setMilliseconds(0);

    const candleCloseTime = new Date(candleOpenTime);
    candleCloseTime.setMinutes(candleCloseTime.getMinutes() + minutes);

    try {
      // Try to find existing candle
      let candle = await Candle.findOne({
        symbol,
        timeframe,
        openTime: candleOpenTime
      });

      if (candle) {
        // Update existing candle
        candle.high = Math.max(candle.high, price);
        candle.low = Math.min(candle.low, price);
        candle.close = price;
        candle.volume += volume;
        candle.complete = new Date() >= candleCloseTime;
        await candle.save();
      } else {
        // Create new candle
        candle = new Candle({
          symbol,
          timeframe,
          open: price,
          high: price,
          low: price,
          close: price,
          volume,
          openTime: candleOpenTime,
          closeTime: candleCloseTime,
          complete: false
        });
        await candle.save();
      }

      return candle;
    } catch (error) {
      console.error('Error aggregating candle:', error);
      throw error;
    }
  }

  // Get recent candles for technical analysis
  async getCandles(
    symbol: string,
    timeframe: '5m' | '15m' | '30m' | '1h' | '1d' = '5m',
    limit: number = 50
  ) {
    try {
      const candles = await Candle.find({
        symbol,
        timeframe,
        complete: true
      })
        .sort({ openTime: -1 })
        .limit(limit)
        .lean();

      return candles.reverse(); // Return oldest to newest
    } catch (error) {
      console.error('Error fetching candles:', error);
      throw error;
    }
  }

  // Get closes array for indicator calculation
  async getCloses(
    symbol: string,
    timeframe: '5m' | '15m' | '30m' | '1h' | '1d' = '5m',
    limit: number = 100
  ): Promise<number[]> {
    const candles = await this.getCandles(symbol, timeframe, limit);
    return candles.map(c => c.close);
  }

  // Get volumes array
  async getVolumes(
    symbol: string,
    timeframe: '5m' | '15m' | '30m' | '1h' | '1d' = '5m',
    limit: number = 100
  ): Promise<number[]> {
    const candles = await this.getCandles(symbol, timeframe, limit);
    return candles.map(c => c.volume);
  }

  // Get current candle (incomplete)
  async getCurrentCandle(
    symbol: string,
    timeframe: '5m' | '15m' | '30m' | '1h' | '1d' = '5m'
  ) {
    try {
      const candle = await Candle.findOne({
        symbol,
        timeframe,
        complete: false
      }).sort({ openTime: -1 });

      return candle;
    } catch (error) {
      console.error('Error fetching current candle:', error);
      throw error;
    }
  }

  // Bulk aggregate for multiple timeframes at once
  async aggregateAllTimeframes(
    symbol: string,
    price: number,
    volume: number,
    timestamp: Date = new Date()
  ) {
    const timeframes: Array<'5m' | '15m' | '30m' | '1h' | '1d'> = ['5m', '15m', '30m', '1h', '1d'];
    
    const results = await Promise.all(
      timeframes.map(tf => this.aggregateCandle(symbol, price, volume, tf, timestamp))
    );

    return results;
  }
}
