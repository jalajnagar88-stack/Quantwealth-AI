import { Pool } from 'pg';
import { connectDB, getPool } from '../config/database';

const TEST_USER_EMAIL = 'test@vercel.com';

async function seedDemoData() {
  await connectDB();
  const pool = getPool();
  
  try {
    console.log('🌱 Starting demo data seed...');
    
    // Get test user ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [TEST_USER_EMAIL]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`❌ Test user ${TEST_USER_EMAIL} not found`);
      process.exit(1);
    }
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Found test user with ID: ${userId}`);
    
    // Seed portfolio holdings
    console.log('📊 Seeding portfolio holdings...');
    const portfolioHoldings = [
      { symbol: 'TCS', qty: 10, avgPrice: 3500 },
      { symbol: 'RELIANCE', qty: 25, avgPrice: 2400 },
      { symbol: 'INFY', qty: 50, avgPrice: 1450 },
      { symbol: 'HDFCBANK', qty: 30, avgPrice: 1600 },
      { symbol: 'ICICIBANK', qty: 40, avgPrice: 950 },
    ];
    
    const holdingsJson = portfolioHoldings.map(h => ({
      symbol: h.symbol,
      qty: h.qty,
      avgPrice: h.avgPrice,
      addedAt: new Date()
    }));
    
    await pool.query(
      `INSERT INTO portfolios (user_id, holdings) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET holdings = $2, updated_at = CURRENT_TIMESTAMP`,
      [userId, JSON.stringify(holdingsJson)]
    );
    console.log(`✅ Seeded ${portfolioHoldings.length} portfolio holdings`);
    
    // Seed watchlist
    console.log('⭐ Seeding watchlist...');
    const watchlistSymbols = ['TATAMOTORS', 'BAJFINANCE', 'MARUTI', 'WIPRO', 'SUNPHARMA', 'LT', 'TITAN', 'KOTAKBANK', 'AXISBANK', 'BHARTIARTL'];
    
    const watchlistItems = watchlistSymbols.map(symbol => ({
      symbol,
      addedAt: new Date()
    }));
    
    await pool.query(
      `INSERT INTO watchlists (user_id, items) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET items = $2, updated_at = CURRENT_TIMESTAMP`,
      [userId, JSON.stringify(watchlistItems)]
    );
    console.log(`✅ Seeded ${watchlistSymbols.length} watchlist items`);
    
    // Seed paper trading portfolio
    console.log('💰 Seeding paper trading portfolio...');
    await pool.query(
      `INSERT INTO paper_portfolios (user_id, cash, initial_capital, total_value, total_pnl, total_pnl_percent, trade_count, win_count, loss_count, win_rate)
       VALUES ($1, 75000, 100000, 100000, 0, 0, 5, 3, 2, 60)
       ON CONFLICT (user_id) 
       DO UPDATE SET cash = 75000, trade_count = 5, win_count = 3, loss_count = 2, win_rate = 60`,
      [userId]
    );
    
    // Seed paper trading holdings
    const paperHoldings = [
      { symbol: 'TCS', quantity: 10, avg_price: 3450, total_invested: 34500 },
      { symbol: 'RELIANCE', quantity: 15, avg_price: 2380, total_invested: 35700 },
    ];
    
    for (const holding of paperHoldings) {
      await pool.query(
        `INSERT INTO paper_holdings (user_id, symbol, quantity, avg_price, total_invested)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, symbol)
         DO UPDATE SET quantity = $3, avg_price = $4, total_invested = $5, last_updated = CURRENT_TIMESTAMP`,
        [userId, holding.symbol, holding.quantity, holding.avg_price, holding.total_invested]
      );
    }
    console.log(`✅ Seeded ${paperHoldings.length} paper trading holdings`);
    
    // Seed paper trading transactions
    const paperTransactions = [
      { symbol: 'TCS', type: 'BUY', quantity: 10, price: 3450, total: 34500 },
      { symbol: 'RELIANCE', type: 'BUY', quantity: 15, price: 2380, total: 35700 },
      { symbol: 'INFY', type: 'BUY', quantity: 20, price: 1420, total: 28400 },
      { symbol: 'INFY', type: 'SELL', quantity: 20, price: 1480, total: 29600, pnl: 1200 },
      { symbol: 'HDFCBANK', type: 'BUY', quantity: 10, price: 1580, total: 15800 },
    ];
    
    for (const tx of paperTransactions) {
      await pool.query(
        `INSERT INTO paper_transactions (user_id, symbol, type, quantity, price, total, pnl, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, tx.symbol, tx.type, tx.quantity, tx.price, tx.total, tx.pnl || null, new Date()]
      );
    }
    console.log(`✅ Seeded ${paperTransactions.length} paper trading transactions`);
    
    console.log('🎉 Demo data seeded successfully!');
    console.log('');
    console.log('Test user credentials:');
    console.log(`  Email: ${TEST_USER_EMAIL}`);
    console.log(`  Password: Test12345`);
    console.log('');
    console.log('Seeded data:');
    console.log(`  - Portfolio: ${portfolioHoldings.length} holdings`);
    console.log(`  - Watchlist: ${watchlistSymbols.length} symbols`);
    console.log(`  - Paper Trading: ${paperHoldings.length} holdings, ${paperTransactions.length} transactions`);
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

seedDemoData();
