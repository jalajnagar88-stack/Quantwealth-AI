import yahooFinance from 'yahoo-finance2';
import { PaperTransaction, PaperHolding, PaperPortfolio } from '../models/PaperTrade';

const INITIAL_CAPITAL = 100000; // ₹1 Lakh starting capital

// Get real-time stock price from Yahoo Finance
export async function getStockPrice(symbol: string): Promise<number | null> {
  try {
    const quote: any = await yahooFinance.quote(`${symbol}.NS`);
    return quote?.regularMarketPrice || quote?.price || null;
  } catch {
    return null;
  }
}

// Initialize portfolio for new user
export async function initializePortfolio(userId: string) {
  const existing = await PaperPortfolio.findOne({ userId });
  if (existing) return existing;

  return PaperPortfolio.create({
    userId,
    cash: INITIAL_CAPITAL,
    initialCapital: INITIAL_CAPITAL,
    totalValue: INITIAL_CAPITAL,
    totalPnL: 0,
    totalPnLPercent: 0,
    tradeCount: 0,
    winCount: 0,
    lossCount: 0,
    winRate: 0,
  });
}

// Execute BUY trade
export async function executeBuy(userId: string, symbol: string, quantity: number) {
  const price = await getStockPrice(symbol);
  if (!price) throw new Error(`Could not fetch price for ${symbol}`);

  const total = price * quantity;
  const portfolio = await PaperPortfolio.findOne({ userId });
  if (!portfolio) throw new Error('Portfolio not found');

  if (portfolio.cash < total) {
    throw new Error(`Insufficient funds. Need ₹${total.toFixed(0)}, have ₹${portfolio.cash.toFixed(0)}`);
  }

  // Update portfolio
  portfolio.cash -= total;
  portfolio.tradeCount += 1;
  portfolio.lastUpdated = new Date();

  // Update or create holding
  let holding = await PaperHolding.findOne({ userId, symbol });
  if (holding) {
    const newTotalQty = holding.quantity + quantity;
    const newTotalInvested = holding.totalInvested + total;
    holding.quantity = newTotalQty;
    holding.avgPrice = newTotalInvested / newTotalQty;
    holding.totalInvested = newTotalInvested;
    holding.lastUpdated = new Date();
    await holding.save();
  } else {
    await PaperHolding.create({
      userId,
      symbol,
      quantity,
      avgPrice: price,
      totalInvested: total,
    });
  }

  // Record transaction
  await PaperTransaction.create({
    userId,
    symbol,
    type: 'BUY',
    quantity,
    price,
    total,
    timestamp: new Date(),
  });

  await portfolio.save();
  return { success: true, symbol, quantity, price, total, cashRemaining: portfolio.cash };
}

// Execute SELL trade
export async function executeSell(userId: string, symbol: string, quantity: number) {
  const price = await getStockPrice(symbol);
  if (!price) throw new Error(`Could not fetch price for ${symbol}`);

  const holding = await PaperHolding.findOne({ userId, symbol });
  if (!holding || holding.quantity < quantity) {
    throw new Error(`Insufficient shares. You own ${holding?.quantity || 0} shares of ${symbol}`);
  }

  const total = price * quantity;
  const costBasis = holding.avgPrice * quantity;
  const pnl = total - costBasis;
  const pnlPercent = (pnl / costBasis) * 100;

  // Update portfolio
  const portfolio = await PaperPortfolio.findOne({ userId });
  if (!portfolio) throw new Error('Portfolio not found');

  portfolio.cash += total;
  portfolio.totalPnL += pnl;
  portfolio.tradeCount += 1;
  portfolio.lastUpdated = new Date();

  // Update win/loss stats
  if (pnl > 0) {
    portfolio.winCount += 1;
    if (!portfolio.bestTrade || pnl > portfolio.bestTrade.pnl) {
      portfolio.bestTrade = { symbol, pnl, percent: pnlPercent };
    }
  } else {
    portfolio.lossCount += 1;
    if (!portfolio.worstTrade || pnl < portfolio.worstTrade.pnl) {
      portfolio.worstTrade = { symbol, pnl, percent: pnlPercent };
    }
  }

  portfolio.winRate = portfolio.winCount / (portfolio.winCount + portfolio.lossCount) * 100;

  // Update holding
  holding.quantity -= quantity;
  holding.totalInvested = holding.avgPrice * holding.quantity;
  holding.lastUpdated = new Date();

  if (holding.quantity === 0) {
    await PaperHolding.deleteOne({ userId, symbol });
  } else {
    await holding.save();
  }

  // Record transaction
  await PaperTransaction.create({
    userId,
    symbol,
    type: 'SELL',
    quantity,
    price,
    total,
    pnl,
    timestamp: new Date(),
  });

  await portfolio.save();
  return {
    success: true,
    symbol,
    quantity,
    price,
    total,
    pnl,
    pnlPercent,
    cashRemaining: portfolio.cash,
  };
}

// Get portfolio with live prices
export async function getPortfolio(userId: string) {
  const portfolio = await PaperPortfolio.findOne({ userId });
  if (!portfolio) {
    return await initializePortfolio(userId);
  }

  const holdings = await PaperHolding.find({ userId });

  // Calculate live values
  let holdingsValue = 0;
  const holdingsWithLivePrice = await Promise.all(
    holdings.map(async (h) => {
      const livePrice = await getStockPrice(h.symbol);
      const currentValue = (livePrice || h.avgPrice) * h.quantity;
      const pnl = currentValue - h.totalInvested;
      const pnlPercent = (pnl / h.totalInvested) * 100;
      holdingsValue += currentValue;

      return {
        symbol: h.symbol,
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        totalInvested: h.totalInvested,
        livePrice: livePrice || h.avgPrice,
        currentValue,
        pnl,
        pnlPercent,
        lastUpdated: h.lastUpdated,
      };
    })
  );

  const totalValue = portfolio.cash + holdingsValue;
  const totalPnLPercent = ((totalValue - portfolio.initialCapital) / portfolio.initialCapital) * 100;

  return {
    cash: portfolio.cash,
    holdingsValue,
    totalValue,
    initialCapital: portfolio.initialCapital,
    totalPnL: totalValue - portfolio.initialCapital,
    totalPnLPercent,
    tradeCount: portfolio.tradeCount,
    winCount: portfolio.winCount,
    lossCount: portfolio.lossCount,
    winRate: portfolio.winRate,
    bestTrade: portfolio.bestTrade,
    worstTrade: portfolio.worstTrade,
    holdings: holdingsWithLivePrice,
  };
}

// Get transaction history
export async function getTransactions(userId: string, limit = 50) {
  return PaperTransaction.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
}

// Get leaderboard (top traders)
export async function getLeaderboard(limit = 10) {
  const portfolios = await PaperPortfolio.find()
    .sort({ totalPnL: -1 })
    .limit(limit);

  return Promise.all(
    portfolios.map(async (p, index) => {
      const portfolioData = await getPortfolio(p.userId);
      return {
        rank: index + 1,
        userId: p.userId,
        totalValue: portfolioData.totalValue,
        totalPnL: portfolioData.totalPnL,
        totalPnLPercent: portfolioData.totalPnLPercent,
        tradeCount: p.tradeCount,
        winRate: p.winRate,
      };
    })
  );
}

// Reset portfolio (start over)
export async function resetPortfolio(userId: string) {
  await PaperHolding.deleteMany({ userId });
  await PaperTransaction.deleteMany({ userId });
  await PaperPortfolio.deleteOne({ userId });
  return initializePortfolio(userId);
}
