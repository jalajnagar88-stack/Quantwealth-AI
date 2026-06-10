export interface TechnicalData {
  rsi: number;
  macd: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volumeAnomalyScore: number;
  priceChange24h: number;
}

export class TechnicalAnalyzer {
  // Calculate RSI (Relative Strength Index)
  calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50; // Neutral if not enough data

    let gains = 0;
    let losses = 0;

    for (let i = closes.length - period; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return Math.round(rsi * 100) / 100;
  }

  // Calculate MACD (Moving Average Convergence Divergence)
  calculateMACD(closes: number[]): number {
    if (closes.length < 26) return 0;

    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macd = ema12 - ema26;

    return Math.round(macd * 10000) / 10000;
  }

  // Helper: Calculate Exponential Moving Average
  private calculateEMA(closes: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = closes.slice(0, period).reduce((a, b) => a + b) / period;

    for (let i = period; i < closes.length; i++) {
      ema = closes[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2): {
    upper: number;
    middle: number;
    lower: number;
  } {
    if (closes.length < period) {
      return { upper: 0, middle: 0, lower: 0 };
    }

    const recent = closes.slice(-period);
    const middle = recent.reduce((a, b) => a + b) / period;
    const variance = recent.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
    const std = Math.sqrt(variance);

    return {
      upper: Math.round((middle + stdDev * std) * 100) / 100,
      middle: Math.round(middle * 100) / 100,
      lower: Math.round((middle - stdDev * std) * 100) / 100
    };
  }

  // Detect volume anomaly (spike)
  calculateVolumeAnomalyScore(volumes: number[]): number {
    if (volumes.length < 5) return 0;

    const recentVolumes = volumes.slice(-5);
    const avgVolume = recentVolumes.reduce((a, b) => a + b) / recentVolumes.length;
    const latestVolume = recentVolumes[recentVolumes.length - 1];
    const anomalyRatio = latestVolume / avgVolume;

    // Score: 0-10 (0 = no anomaly, 10 = extreme spike)
    const score = Math.min(10, (anomalyRatio - 1) * 10);
    return Math.round(score * 100) / 100;
  }

  // Calculate 24h price change percentage
  calculate24hPriceChange(closes: number[]): number {
    if (closes.length < 2) return 0;

    const current = closes[closes.length - 1];
    const dayAgo = closes[Math.max(0, closes.length - 390)]; // ~390 candles in a trading day (15min candles)

    const change = ((current - dayAgo) / dayAgo) * 100;
    return Math.round(change * 100) / 100;
  }

  // Comprehensive analysis
  analyze(closes: number[], volumes: number[]): TechnicalData {
    return {
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes),
      bollingerBands: this.calculateBollingerBands(closes),
      volumeAnomalyScore: this.calculateVolumeAnomalyScore(volumes),
      priceChange24h: this.calculate24hPriceChange(closes)
    };
  }
}
