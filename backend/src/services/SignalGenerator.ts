// MOCK CLAUDE API - Replace with real API when you get credits
// Just change: const response = await client.messages.create(...)

interface SignalResult {
  signal: 'BUY' | 'SELL' | 'SKIP';
  confidence: number;
  reasoning: string;
}

export class SignalGenerator {
  async generateSignal(
    symbol: string,
    currentPrice: number,
    technicalData: {
      rsi?: number;
      macd?: number;
      bollingerBands?: { upper: number; middle: number; lower: number };
      volumeAnomalyScore?: number;
      priceChange24h?: number;
    },
    sentimentScore: number,
    recentHistory: Array<{ close: number; volume: number }>
  ): Promise<SignalResult> {
    try {
      // MOCK RESPONSE - Replace with real Claude API when available
      const mockSignals = this.generateMockSignal(symbol, technicalData, sentimentScore);
      
      return mockSignals;
    } catch (error) {
      console.error('Error generating signal:', error);
      throw error;
    }
  }

  private generateMockSignal(
    symbol: string,
    technicalData: any,
    sentimentScore: number
  ): SignalResult {
    const rsi = technicalData.rsi || 50;
    const macd = technicalData.macd || 0;
    const volumeScore = technicalData.volumeAnomalyScore || 0;

    let signal: 'BUY' | 'SELL' | 'SKIP' = 'SKIP';
    let confidence = 0;
    let reasoning = '';

    // BUY Logic: RSI < 30 (oversold) + high sentiment + volume spike
    if (rsi < 30 && sentimentScore > 65 && volumeScore > 7) {
      signal = 'BUY';
      confidence = 85;
      reasoning = `RSI=${rsi} indicates oversold condition. Sentiment score ${sentimentScore}/100 is strong. Volume spike detected (${volumeScore}/10). MACD=${macd} showing potential reversal. Entry point: Near Bollinger lower band. Risk/Reward: 5% TP / 0.5% SL.`;
    }
    // SELL Logic: RSI > 70 (overbought) + low sentiment
    else if (rsi > 70 && sentimentScore < 40 && volumeScore > 6) {
      signal = 'SELL';
      confidence = 78;
      reasoning = `RSI=${rsi} indicates overbought condition. Sentiment score ${sentimentScore}/100 is weak. Volume anomaly present (${volumeScore}/10). Price near Bollinger upper band. Exit opportunity: Take profits. Risk: Stop loss above recent high.`;
    }
    // BUY on MACD bullish crossover + good sentiment
    else if (macd > 0 && sentimentScore > 70 && rsi < 50) {
      signal = 'BUY';
      confidence = 72;
      reasoning = `MACD bullish momentum detected (${macd}). Sentiment strong at ${sentimentScore}/100. RSI=${rsi} has room to move up. Momentum indicators align. Confidence: Moderate. Entry: Current level or slight dip.`;
    }
    // SELL on MACD bearish crossover
    else if (macd < -0.005 && sentimentScore < 50 && rsi > 50) {
      signal = 'SELL';
      confidence = 68;
      reasoning = `MACD bearish divergence (${macd}). Sentiment weak at ${sentimentScore}/100. RSI=${rsi} showing weakness. Downtrend forming. Exit: Consider taking profits or reducing exposure.`;
    }
    // Default: Hold/Skip
    else {
      signal = 'SKIP';
      confidence = 55;
      reasoning = `Mixed signals detected. RSI=${rsi}, Sentiment=${sentimentScore}, MACD=${macd}. Indicators not aligned for strong conviction. Action: Wait for clearer signals. Current risk/reward unfavorable.`;
    }

    return {
      signal,
      confidence,
      reasoning
    };
  }

  async batchGenerateSignals(
    stocks: Array<{
      symbol: string;
      currentPrice: number;
      technicalData: any;
      sentimentScore: number;
    }>
  ): Promise<Array<{ symbol: string } & SignalResult>> {
    const signals = await Promise.all(
      stocks.map(async (stock) => ({
        symbol: stock.symbol,
        ...(await this.generateSignal(stock.symbol, stock.currentPrice, stock.technicalData, stock.sentimentScore, []))
      }))
    );

    return signals;
  }
}
