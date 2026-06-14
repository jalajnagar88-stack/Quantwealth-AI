export class BacktestService {
  async runBacktest(symbol: string, years: number, strategy: string = 'RSI', initialCapital: number = 100000) {
    try {
      // Generate mock historical data
      const historicalData = this.generateHistoricalData(symbol, years);
      
      // Simulate trades based on strategy
      const trades = this.simulateTrades(historicalData, strategy);
      
      // Calculate metrics with initial capital
      const metrics = this.calculateMetrics(trades, historicalData, initialCapital);
      
      return metrics;
    } catch (error) {
      console.error('Backtest service error:', error);
      throw error;
    }
  }

  // Seed price based on symbol so different stocks give different results
  private getSeedPrice(symbol: string): number {
    const prices: Record<string, number> = {
      'RELIANCE': 2850, 'TCS': 3920, 'HDFCBANK': 1680, 'INFY': 1540, 'ICICIBANK': 1240,
      'SBIN': 820, 'BHARTIARTL': 1390, 'KOTAKBANK': 1780, 'LT': 3540, 'HCLTECH': 1620,
      'WIPRO': 480, 'AXISBANK': 1180, 'MARUTI': 12400, 'TITAN': 3600, 'SUNPHARMA': 1720,
      'BAJFINANCE': 7200, 'ASIANPAINT': 2980, 'NESTLEIND': 22000, 'ULTRACEMCO': 9800, 'ITC': 470,
    };
    return prices[symbol.toUpperCase()] || 1500;
  }

  private generateHistoricalData(symbol: string, years: number) {
    const candles = [];
    let price = this.getSeedPrice(symbol);
    const days = years * 252; // Trading days per year
    // Slightly bullish drift (Indian market long-term average ~12% CAGR)
    const dailyDrift = 0.00045;
    const dailyVol = 0.018;
    
    for (let i = 0; i < days; i++) {
      // Geometric Brownian Motion for realistic price simulation
      const randomShock = (Math.random() - 0.5) * 2;
      const dailyReturn = dailyDrift + dailyVol * randomShock;
      price = Math.max(price * (1 + dailyReturn), price * 0.5);
      
      const high = price * (1 + Math.random() * 0.012);
      const low = price * (1 - Math.random() * 0.012);
      
      candles.push({
        date: new Date(Date.now() - (days - i) * 86400000),
        open: price,
        high,
        low,
        close: price,
        volume: 500000 + Math.random() * 2000000
      });
    }
    return candles;
  }

  private simulateTrades(candles: any[], strategy: string = 'RSI') {
    const trades = [];
    let inPosition = false;
    let entryPrice = 0;
    
    for (let i = 50; i < candles.length - 1; i++) {
      let shouldBuy = false;
      let shouldSell = false;
      
      switch(strategy) {
        case 'RSI':
          const rsi = this.calculateRSI(candles, i, 14);
          shouldBuy = rsi < 32 && !inPosition;
          shouldSell = rsi > 68 && inPosition;
          break;
          
        case 'MACD':
          const macd = this.calculateMACD(candles, i);
          shouldBuy = macd.histogram > 0 && !inPosition;
          shouldSell = macd.histogram < 0 && inPosition;
          break;
          
        case 'MOVING_AVG':
          const ma50 = this.calculateSMA(candles, i, 50);
          shouldBuy = candles[i].close > ma50 && !inPosition;
          shouldSell = candles[i].close < ma50 && inPosition;
          break;
          
        case 'BREAKOUT':
          const high20 = this.calculateHigh(candles, i, 20);
          const low20 = this.calculateLow(candles, i, 20);
          shouldBuy = candles[i].close > high20 && !inPosition;
          shouldSell = candles[i].close < low20 && inPosition;
          break;
          
        default:
          const defaultRSI = this.calculateRSI(candles, i, 14);
          shouldBuy = defaultRSI < 32 && !inPosition;
          shouldSell = defaultRSI > 68 && inPosition;
      }
      
      if (shouldBuy) {
        inPosition = true;
        entryPrice = candles[i].close;
        trades.push({
          date: candles[i].date,
          type: 'BUY',
          price: entryPrice,
          pnl: 0,
          quantity: 1
        });
      }
      
      if (shouldSell) {
        inPosition = false;
        const pnl = ((candles[i].close - entryPrice) / entryPrice) * 100;
        trades.push({
          date: candles[i].date,
          type: 'SELL',
          price: candles[i].close,
          pnl: pnl,
          pnlPercent: pnl,
          quantity: 1
        });
      }
    }
    
    return trades;
  }

  // index = current position in candles array, RSI window = 14
  private calculateRSI(candles: any[], index: number, rsiPeriod: number = 14): number {
    if (index < rsiPeriod + 1) return 50;
    
    let gains = 0, losses = 0;
    for (let i = index - rsiPeriod + 1; i <= index; i++) {
      const change = candles[i].close - candles[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / rsiPeriod;
    const avgLoss = losses / rsiPeriod;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMetrics(trades: any[], candles: any[], initialCapital: number = 100000) {
    const sells = trades.filter(t => t.type === 'SELL');
    
    // Build equity curve and compute INR profit/loss per trade
    let equity = initialCapital;
    const equityCurve = [equity];
    const tradeReturns: number[] = [];
    let totalProfitINR = 0;
    let totalLossINR = 0;
    let winCount = 0;
    
    sells.forEach(sell => {
      // pnl is a percentage return
      const tradeReturn = sell.pnl / 100;
      const pnlINR = equity * tradeReturn;
      // Subtract 0.5% transaction costs (brokerage + STT + exchange charges)
      const costINR = equity * 0.005;
      const netPnlINR = pnlINR - costINR;
      
      equity = equity + netPnlINR;
      equityCurve.push(Math.max(equity, 0));
      tradeReturns.push(tradeReturn);
      
      if (netPnlINR > 0) {
        totalProfitINR += netPnlINR;
        winCount++;
      } else {
        totalLossINR += Math.abs(netPnlINR);
      }
    });
    
    const winRate = sells.length > 0 ? (winCount / sells.length) * 100 : 0;
    
    // Max drawdown
    let peak = equityCurve[0];
    let maxDD = 0;
    equityCurve.forEach(val => {
      if (val > peak) peak = val;
      const dd = ((peak - val) / peak) * 100;
      if (dd > maxDD) maxDD = dd;
    });
    
    // Real Sharpe ratio (annualised, risk-free rate ~6.5% for India)
    let sharpeRatio = 0;
    if (tradeReturns.length > 1) {
      const avgReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;
      const variance = tradeReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / tradeReturns.length;
      const stdDev = Math.sqrt(variance);
      const riskFreePerTrade = 0.065 / 252;
      sharpeRatio = stdDev > 0 ? ((avgReturn - riskFreePerTrade) / stdDev) * Math.sqrt(252) : 0;
    }
    
    return {
      winRate: parseFloat(winRate.toFixed(1)),
      totalProfit: parseFloat(totalProfitINR.toFixed(0)),
      totalLoss: parseFloat(totalLossINR.toFixed(0)),
      totalTrades: sells.length,
      maxDrawdown: parseFloat(maxDD.toFixed(1)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
      equityCurve,
      trades: sells
    };
  }

  // Helper methods for different strategies
  private calculateMACD(candles: any[], index: number) {
    const ema12 = this.calculateEMA(candles, index, 12);
    const ema26 = this.calculateEMA(candles, index, 26);
    const macdLine = ema12 - ema26;
    const signalLine = this.calculateEMA(candles, index, 9, macdLine);
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  }

  private calculateEMA(candles: any[], index: number, period: number, values?: number): number {
    if (index < period) return candles[index].close;
    const k = 2 / (period + 1);
    let ema = candles[index - period].close;
    for (let i = index - period + 1; i <= index; i++) {
      ema = candles[i].close * k + ema * (1 - k);
    }
    return ema;
  }

  private calculateSMA(candles: any[], index: number, period: number): number {
    if (index < period) return candles[index].close;
    let sum = 0;
    for (let i = index - period + 1; i <= index; i++) {
      sum += candles[i].close;
    }
    return sum / period;
  }

  private calculateHigh(candles: any[], index: number, period: number): number {
    if (index < period) return candles[index].high;
    let high = candles[index - period].high;
    for (let i = index - period + 1; i <= index; i++) {
      if (candles[i].high > high) high = candles[i].high;
    }
    return high;
  }

  private calculateLow(candles: any[], index: number, period: number): number {
    if (index < period) return candles[index].low;
    let low = candles[index - period].low;
    for (let i = index - period + 1; i <= index; i++) {
      if (candles[i].low < low) low = candles[i].low;
    }
    return low;
  }
}
