import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const runBacktest = async (symbol, years, strategy = 'RSI', initialCapital = 100000) => {
  // Find stock name from indianStocks data
  const stockName = symbol; // will be overridden by caller
  
  const response = await api.post('/backtest/run', {
    symbol,
    stockName: symbol,
    years: parseInt(years),
    strategy,
    initialCapital: parseInt(initialCapital)
  });
  
  // Backend returns { success: true, data: { ...metrics } }
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Backtest failed');
};

export default api;
