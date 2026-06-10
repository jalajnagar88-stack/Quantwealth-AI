import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetchMarketData = async (symbols = []) => {
  try {
    const requests = symbols.map(symbol =>
      api.get(`/market/snapshot/${symbol}`).catch(() => ({ data: { symbol, price: 0 } }))
    );
    const responses = await Promise.all(requests);
    return responses.map(r => r.data);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return [];
  }
};

export const fetchSignals = async () => {
  try {
    const response = await api.get('/signals/history/RELIANCE', { params: { limit: 10 } });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching signals:', error);
    return [];
  }
};

export default api;
