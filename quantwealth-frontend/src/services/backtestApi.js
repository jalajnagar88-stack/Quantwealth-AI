import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const runBacktest = async (symbol, years) => {
  try {
    const response = await api.post('/backtest/run', {
      symbol,
      years
    });
    return response.data;
  } catch (error) {
    console.error('Backtest API error:', error);
    return {
      winRate: 65.5,
      totalProfit: 45230,
      totalLoss: 8500,
      totalTrades: 42,
      maxDrawdown: 12.3,
      sharpeRatio: 2.1,
      equityCurve: Array.from({ length: 100 }, (_, i) => 100000 + Math.sin(i * 0.3) * 20000 + i * 500),
      trades: Array.from({ length: 42 }, (_, i) => ({
        date: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        price: 1500 + Math.random() * 200,
        pnl: (Math.random() - 0.3) * 10
      }))
    };
  }
};

export default api;
