import yahooFinance from 'yahoo-finance2';
import { getPool } from '../config/database';

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
export async function initializePortfolio(userId: number) {
  const pool = getPool();
  const existing = await pool.query(
    'SELECT * FROM paper_portfolios WHERE user_id = $1',
    [userId]
  );
  
  if (existing.rows.length > 0) return existing.rows[0];

  const result = await pool.query(
    `INSERT INTO paper_portfolios (user_id, cash, initial_capital, total_value, total_pnl, total_pnl_percent, trade_count, win_count, loss_count, win_rate)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [userId, INITIAL_CAPITAL, INITIAL_CAPITAL, INITIAL_CAPITAL, 0, 0, 0, 0, 0, 0]
  );
  
  return result.rows[0];
}

// Execute BUY trade
export async function executeBuy(userId: number, symbol: string, quantity: number) {
  const price = await getStockPrice(symbol);
  if (!price) throw new Error(`Could not fetch price for ${symbol}`);

  const total = price * quantity;
  const pool = getPool();
  
  const portfolioResult = await pool.query(
    'SELECT * FROM paper_portfolios WHERE user_id = $1',
    [userId]
  );
  
  const portfolio = portfolioResult.rows[0];
  if (!portfolio) throw new Error('Portfolio not found');

  if (portfolio.cash < total) {
    throw new Error(`Insufficient funds. Need ₹${total.toFixed(0)}, have ₹${portfolio.cash.toFixed(0)}`);
  }

  // Update portfolio
  await pool.query(
    `UPDATE paper_portfolios 
     SET cash = cash - $1, trade_count = trade_count + 1, last_updated = CURRENT_TIMESTAMP
     WHERE user_id = $2`,
    [total, userId]
  );

  // Update or create holding
  const holdingResult = await pool.query(
    'SELECT * FROM paper_holdings WHERE user_id = $1 AND symbol = $2',
    [userId, symbol]
  );
  
  if (holdingResult.rows.length > 0) {
    const holding = holdingResult.rows[0];
    const newTotalQty = holding.quantity + quantity;
    const newTotalInvested = holding.total_invested + total;
    const newAvgPrice = newTotalInvested / newTotalQty;
    
    await pool.query(
      `UPDATE paper_holdings 
       SET quantity = $1, avg_price = $2, total_invested = $3, last_updated = CURRENT_TIMESTAMP
       WHERE user_id = $4 AND symbol = $5`,
      [newTotalQty, newAvgPrice, newTotalInvested, userId, symbol]
    );
  } else {
    await pool.query(
      `INSERT INTO paper_holdings (user_id, symbol, quantity, avg_price, total_invested)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, symbol, quantity, price, total]
    );
  }

  // Record transaction
  await pool.query(
    `INSERT INTO paper_transactions (user_id, symbol, type, quantity, price, total)
     VALUES ($1, $2, 'BUY', $3, $4, $5)`,
    [userId, symbol, quantity, price, total]
  );

  const updatedPortfolio = await pool.query(
    'SELECT * FROM paper_portfolios WHERE user_id = $1',
    [userId]
  );

  return { success: true, symbol, quantity, price, total, cashRemaining: updatedPortfolio.rows[0].cash };
}

// Execute SELL trade
export async function executeSell(userId: number, symbol: string, quantity: number) {
  const price = await getStockPrice(symbol);
  if (!price) throw new Error(`Could not fetch price for ${symbol}`);

  const pool = getPool();
  
  const holdingResult = await pool.query(
    'SELECT * FROM paper_holdings WHERE user_id = $1 AND symbol = $2',
    [userId, symbol]
  );
  
  const holding = holdingResult.rows[0];
  if (!holding || holding.quantity < quantity) {
    throw new Error(`Insufficient shares. You own ${holding?.quantity || 0} shares of ${symbol}`);
  }

  const total = price * quantity;
  const costBasis = holding.avg_price * quantity;
  const pnl = total - costBasis;
  const pnlPercent = (pnl / costBasis) * 100;

  // Update portfolio
  await pool.query(
    `UPDATE paper_portfolios 
     SET cash = cash + $1, total_pnl = total_pnl + $2, trade_count = trade_count + 1, last_updated = CURRENT_TIMESTAMP
     WHERE user_id = $3`,
    [total, pnl, userId]
  );

  // Update win/loss stats
  if (pnl > 0) {
    await pool.query(
      `UPDATE paper_portfolios 
       SET win_count = win_count + 1, 
           best_trade = CASE 
             WHEN best_trade IS NULL OR $1 > (best_trade->>'pnl')::numeric 
             THEN jsonb_build_object('symbol', $2, 'pnl', $1, 'percent', $3)
             ELSE best_trade
           END,
           last_updated = CURRENT_TIMESTAMP
       WHERE user_id = $4`,
      [pnl, symbol, pnlPercent, userId]
    );
  } else {
    await pool.query(
      `UPDATE paper_portfolios 
       SET loss_count = loss_count + 1,
           worst_trade = CASE 
             WHEN worst_trade IS NULL OR $1 < (worst_trade->>'pnl')::numeric 
             THEN jsonb_build_object('symbol', $2, 'pnl', $1, 'percent', $3)
             ELSE worst_trade
           END,
           last_updated = CURRENT_TIMESTAMP
       WHERE user_id = $4`,
      [pnl, symbol, pnlPercent, userId]
    );
  }

  // Update win rate
  await pool.query(
    `UPDATE paper_portfolios 
     SET win_rate = CASE 
       WHEN (win_count + loss_count) = 0 THEN 0
       ELSE (win_count::numeric / (win_count + loss_count)) * 100
     END,
     last_updated = CURRENT_TIMESTAMP
     WHERE user_id = $1`,
    [userId]
  );

  // Update holding
  const newQuantity = holding.quantity - quantity;
  const newTotalInvested = holding.avg_price * newQuantity;
  
  if (newQuantity === 0) {
    await pool.query(
      'DELETE FROM paper_holdings WHERE user_id = $1 AND symbol = $2',
      [userId, symbol]
    );
  } else {
    await pool.query(
      `UPDATE paper_holdings 
       SET quantity = $1, total_invested = $2, last_updated = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND symbol = $4`,
      [newQuantity, newTotalInvested, userId, symbol]
    );
  }

  // Record transaction
  await pool.query(
    `INSERT INTO paper_transactions (user_id, symbol, type, quantity, price, total, pnl)
     VALUES ($1, $2, 'SELL', $3, $4, $5, $6)`,
    [userId, symbol, quantity, price, total, pnl]
  );

  const updatedPortfolio = await pool.query(
    'SELECT * FROM paper_portfolios WHERE user_id = $1',
    [userId]
  );

  return {
    success: true,
    symbol,
    quantity,
    price,
    total,
    pnl,
    pnlPercent,
    cashRemaining: updatedPortfolio.rows[0].cash,
  };
}

// Get portfolio with live prices
export async function getPortfolio(userId: number) {
  const pool = getPool();
  const portfolioResult = await pool.query(
    'SELECT * FROM paper_portfolios WHERE user_id = $1',
    [userId]
  );
  
  let portfolio = portfolioResult.rows[0];
  if (!portfolio) {
    portfolio = await initializePortfolio(userId);
  }

  const holdingsResult = await pool.query(
    'SELECT * FROM paper_holdings WHERE user_id = $1',
    [userId]
  );
  
  const holdings = holdingsResult.rows;

  // Calculate live values
  let holdingsValue = 0;
  const holdingsWithLivePrice = await Promise.all(
    holdings.map(async (h) => {
      const livePrice = await getStockPrice(h.symbol);
      const currentValue = (livePrice || h.avg_price) * h.quantity;
      const pnl = currentValue - h.total_invested;
      const pnlPercent = (pnl / h.total_invested) * 100;
      holdingsValue += currentValue;

      return {
        symbol: h.symbol,
        quantity: h.quantity,
        avgPrice: h.avg_price,
        totalInvested: h.total_invested,
        livePrice: livePrice || h.avg_price,
        currentValue,
        pnl,
        pnlPercent,
        lastUpdated: h.last_updated,
      };
    })
  );

  const totalValue = portfolio.cash + holdingsValue;
  const totalPnL = totalValue - portfolio.initial_capital;
  const totalPnLPercent = (totalPnL / portfolio.initial_capital) * 100;

  return {
    cash: portfolio.cash,
    holdingsValue,
    totalValue,
    initialCapital: portfolio.initial_capital,
    totalPnL,
    totalPnLPercent,
    tradeCount: portfolio.trade_count,
    winCount: portfolio.win_count,
    lossCount: portfolio.loss_count,
    winRate: portfolio.win_rate,
    bestTrade: portfolio.best_trade,
    worstTrade: portfolio.worst_trade,
    holdings: holdingsWithLivePrice,
  };
}

// Get transaction history
export async function getTransactions(userId: number, limit = 50) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT * FROM paper_transactions 
     WHERE user_id = $1 
     ORDER BY timestamp DESC 
     LIMIT $2`,
    [userId, limit]
  );
  
  return result.rows;
}

// Get leaderboard (top traders)
export async function getLeaderboard(limit = 10) {
  const pool = getPool();
  const portfoliosResult = await pool.query(
    `SELECT user_id, total_pnl, trade_count, win_rate 
     FROM paper_portfolios 
     ORDER BY total_pnl DESC 
     LIMIT $1`,
    [limit]
  );

  const portfolios = portfoliosResult.rows;

  return Promise.all(
    portfolios.map(async (p, index) => {
      const portfolioData = await getPortfolio(p.user_id);
      return {
        rank: index + 1,
        userId: p.user_id,
        totalValue: portfolioData.totalValue,
        totalPnL: portfolioData.totalPnL,
        totalPnLPercent: portfolioData.totalPnLPercent,
        tradeCount: p.trade_count,
        winRate: p.win_rate,
      };
    })
  );
}

// Reset portfolio (start over)
export async function resetPortfolio(userId: number) {
  const pool = getPool();
  
  await pool.query('DELETE FROM paper_holdings WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM paper_transactions WHERE user_id = $1', [userId]);
  await pool.query('DELETE FROM paper_portfolios WHERE user_id = $1', [userId]);
  
  return initializePortfolio(userId);
}
