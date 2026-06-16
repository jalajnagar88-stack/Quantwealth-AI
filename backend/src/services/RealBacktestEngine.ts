import yahooFinance from 'yahoo-finance2';

interface Candle {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  date: Date;
  type: 'BUY' | 'SELL';
  price: number;
  pnl: number;
  pnlPercent?: number;
  quantity: number;
}

interface BacktestResult {
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  totalTrades: number;
  sharpeRatio: number;
  maxDrawdown: number;
  equityCurve: number[];
  trades: Trade[];
  finalCapital: number;
  dataSource: string;
  candlesUsed: number;
}

// Map symbols to Yahoo Finance NSE tickers
function toYahooSymbol(symbol: string): string {
  // Already has .NS or .BO suffix
  if (symbol.includes('.')) return symbol;
  return `${symbol}.NS`;
}

// Fetch real historical data from Yahoo Finance
async function fetchHistoricalData(symbol: string, years: number): Promise<Candle[]> {
  const yahooSymbol = toYahooSymbol(symbol);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);

  const result: any = await yahooFinance.chart(yahooSymbol, {
    period1: startDate,
    period2: endDate,
    interval: '1d',
  });

  if (!result?.quotes || result.quotes.length === 0) {
    throw new Error(`No data found for ${yahooSymbol}`);
  }

  return result.quotes
    .filter((q: any) => q.close != null && q.open != null)
    .map((q: any) => ({
      date: new Date(q.date),
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume || 0,
    }));
}

// Technical Indicators
function calculateRSI(candles: Candle[], index: number, period: number = 14): number {
  if (index < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = index - period + 1; i <= index; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

function calculateEMA(candles: Candle[], index: number, period: number): number {
  if (index < period) return candles[index].close;
  const k = 2 / (period + 1);
  let ema = candles[0].close;
  for (let i = 1; i <= index; i++) {
    ema = candles[i].close * k + ema * (1 - k);
  }
  return ema;
}

function calculateSMA(candles: Candle[], index: number, period: number): number {
  if (index < period) return candles[index].close;
  let sum = 0;
  for (let i = index - period + 1; i <= index; i++) {
    sum += candles[i].close;
  }
  return sum / period;
}

function calculateChannelHigh(candles: Candle[], index: number, period: number): number {
  let high = -Infinity;
  const start = Math.max(0, index - period + 1);
  for (let i = start; i <= index; i++) {
    if (candles[i].high > high) high = candles[i].high;
  }
  return high;
}

function calculateChannelLow(candles: Candle[], index: number, period: number): number {
  let low = Infinity;
  const start = Math.max(0, index - period + 1);
  for (let i = start; i <= index; i++) {
    if (candles[i].low < low) low = candles[i].low;
  }
  return low;
}

// Strategy execution
function executeStrategy(candles: Candle[], strategy: string): Trade[] {
  const trades: Trade[] = [];
  let inPosition = false;
  let entryPrice = 0;
  const startIdx = 50; // Need enough data for indicators

  for (let i = startIdx; i < candles.length; i++) {
    let shouldBuy = false;
    let shouldSell = false;

    switch (strategy) {
      case 'RSI': {
        const rsi = calculateRSI(candles, i, 14);
        shouldBuy = rsi < 30 && !inPosition;
        shouldSell = rsi > 70 && inPosition;
        break;
      }
      case 'MACD': {
        const ema12 = calculateEMA(candles, i, 12);
        const ema26 = calculateEMA(candles, i, 26);
        const macd = ema12 - ema26;
        const prevEma12 = calculateEMA(candles, i - 1, 12);
        const prevEma26 = calculateEMA(candles, i - 1, 26);
        const prevMacd = prevEma12 - prevEma26;
        // Signal line approximation using 9-period EMA of MACD
        const signal = macd * 0.2 + prevMacd * 0.8; // simplified
        shouldBuy = macd > signal && prevMacd <= signal && !inPosition;
        shouldSell = macd < signal && prevMacd >= signal && inPosition;
        break;
      }
      case 'MA_CROSSOVER':
      case 'MOVING_AVG': {
        const sma50 = calculateSMA(candles, i, 50);
        const sma200 = calculateSMA(candles, i, 200);
        const prevSma50 = calculateSMA(candles, i - 1, 50);
        const prevSma200 = calculateSMA(candles, i - 1, 200);
        shouldBuy = sma50 > sma200 && prevSma50 <= prevSma200 && !inPosition;
        shouldSell = sma50 < sma200 && prevSma50 >= prevSma200 && inPosition;
        break;
      }
      case 'BREAKOUT': {
        if (i < 21) break;
        const high20 = calculateChannelHigh(candles, i - 1, 20);
        const low10 = calculateChannelLow(candles, i - 1, 10);
        shouldBuy = candles[i].close > high20 && !inPosition;
        shouldSell = candles[i].close < low10 && inPosition;
        break;
      }
      default: {
        const rsi = calculateRSI(candles, i, 14);
        shouldBuy = rsi < 30 && !inPosition;
        shouldSell = rsi > 70 && inPosition;
      }
    }

    if (shouldBuy) {
      inPosition = true;
      entryPrice = candles[i].close;
      trades.push({ date: candles[i].date, type: 'BUY', price: entryPrice, pnl: 0, quantity: 1 });
    }

    if (shouldSell) {
      inPosition = false;
      const pnl = ((candles[i].close - entryPrice) / entryPrice) * 100;
      trades.push({ date: candles[i].date, type: 'SELL', price: candles[i].close, pnl, pnlPercent: pnl, quantity: 1 });
    }
  }

  return trades;
}

// Calculate performance metrics
function calculateMetrics(trades: Trade[], initialCapital: number): Omit<BacktestResult, 'dataSource' | 'candlesUsed'> {
  const sells = trades.filter(t => t.type === 'SELL');
  let equity = initialCapital;
  const equityCurve = [equity];
  const tradeReturns: number[] = [];
  let totalProfitINR = 0;
  let totalLossINR = 0;
  let winCount = 0;

  sells.forEach(sell => {
    const tradeReturn = sell.pnl / 100;
    const pnlINR = equity * tradeReturn;
    // 0.1% brokerage + taxes
    const costINR = equity * 0.001;
    const netPnlINR = pnlINR - costINR;
    equity += netPnlINR;
    equityCurve.push(Math.max(equity, 0));
    tradeReturns.push(tradeReturn);
    if (netPnlINR > 0) { totalProfitINR += netPnlINR; winCount++; }
    else { totalLossINR += Math.abs(netPnlINR); }
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

  // Annualised Sharpe (risk-free = 6.5% India)
  let sharpeRatio = 0;
  if (tradeReturns.length > 1) {
    const avgReturn = tradeReturns.reduce((a, b) => a + b, 0) / tradeReturns.length;
    const variance = tradeReturns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / tradeReturns.length;
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
    trades: sells,
    finalCapital: parseFloat(equity.toFixed(0)),
  };
}

// Main entry point
export async function runRealBacktest(
  symbol: string,
  years: number,
  strategy: string,
  initialCapital: number
): Promise<BacktestResult> {
  const candles = await fetchHistoricalData(symbol, years);
  const trades = executeStrategy(candles, strategy);
  const metrics = calculateMetrics(trades, initialCapital);

  return {
    ...metrics,
    dataSource: `Yahoo Finance (NSE)`,
    candlesUsed: candles.length,
  };
}
