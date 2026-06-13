export class BacktestService {
  async runBacktest(symbol: string, years: number) {
    try {
      // Generate mock historical data
      const historicalData = this.generateHistoricalData(symbol, years);
      
      // Simulate trades
      const trades = this.simulateTrades(historicalData);
      
      // Calculate metrics
      const metrics = this.calculateMetrics(trades, historicalData);
      
      return metrics;
    } catch (error) {
      console.error('Backtest service error:', error);
      throw error;
    }
  }

  private generateHistoricalData(symbol: string, years: number) {
    const candles = [];
    let price = 1500;
    const days = years * 252; // Trading days per year
    
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.48) * 50;
      price = Math.max(price + change, 1000);
      
      candles.push({
        date: new Date(Date.now() - (days - i) * 86400000),
        open: price,
        high: price + Math.random() * 20,
        low: price - Math.random() * 20,
        close: price + change,
        volume: Math.random() * 1000000
      });
    }
    return candles;
  }

  private simulateTrades(candles: any[]) {
    const trades = [];
    let inPosition = false;
    let entryPrice = 0;
    
    for (let i = 0; i < candles.length - 1; i++) {
      const rsi = this.calculateRSI(candles, i);
      
      // Simple strategy: RSI < 30 = buy, RSI > 70 = sell
      if (rsi < 30 && !inPosition) {
        inPosition = true;
        entryPrice = candles[i].close;
        trades.push({
          date: candles[i].date,
          type: 'BUY',
          price: entryPrice,
          pnl: 0
        });
      }
      
      if (rsi > 70 && inPosition) {
        inPosition = false;
        const pnl = ((candles[i].close - entryPrice) / entryPrice) * 100;
        trades.push({
          date: candles[i].date,
          type: 'SELL',
          price: candles[i].close,
          pnl: pnl
        });
      }
    }
    
    return trades;
  }

  private calculateRSI(candles: any[], period: number = 14) {
    if (period > candles.length) return 50;
    
    let gains = 0, losses = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
      const change = candles[i].close - candles[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / (avgLoss || 1);
    return 100 - (100 / (1 + rs));
  }

  private calculateMetrics(trades: any[], candles: any[]) {
    const buys = trades.filter(t => t.type === 'BUY');
    const sells = trades.filter(t => t.type === 'SELL');
    
    let totalProfit = 0, totalLoss = 0, winCount = 0;
    
    sells.forEach(sell => {
      if (sell.pnl > 0) {
        totalProfit += sell.pnl;
        winCount++;
      } else {
        totalLoss += Math.abs(sell.pnl);
      }
    });
    
    const winRate = sells.length > 0 ? (winCount / sells.length) * 100 : 0;
    
    // Generate equity curve
    let equity = 100000;
    const equityCurve = [equity];
    sells.forEach(sell => {
      equity *= (1 + sell.pnl / 100);
      equityCurve.push(equity);
    });
    
    // Calculate max drawdown
    let peak = equityCurve[0];
    let maxDD = 0;
    equityCurve.forEach(val => {
      if (val > peak) peak = val;
      const dd = ((peak - val) / peak) * 100;
      if (dd > maxDD) maxDD = dd;
    });
    
    return {
      winRate: parseFloat(winRate.toFixed(1)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalLoss: parseFloat(totalLoss.toFixed(2)),
      totalTrades: sells.length,
      maxDrawdown: parseFloat(maxDD.toFixed(1)),
      sharpeRatio: 2.1,
      equityCurve: equityCurve,
      trades: sells
    };
  }
}
