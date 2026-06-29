import axios from 'axios';

// HACD Exchanges and their APIs
const EXCHANGES = {
  coinex: {
    name: 'CoinEx',
    baseUrl: 'https://api.coinex.com/v1',
    pair: 'HACD/USDT',
  },
  vindax: {
    name: 'Vindax',
    baseUrl: 'https://api.vindax.com/v1',
    pair: 'HACD_USDT',
  },
  dexTrade: {
    name: 'Dex-Trade',
    baseUrl: 'https://api.dex-trade.com/v1',
    pair: 'HACD_USDT',
  },
};

// HAC price tracking
const HAC_EXCHANGES = {
  coinex: {
    name: 'CoinEx',
    baseUrl: 'https://api.coinex.com/v1',
    pair: 'HAC/USDT',
  },
};

export interface HacdPriceData {
  exchange: string;
  price: number;
  volume24h: number;
  change24h: number;
  timestamp: number;
}

export interface HacdMarketOverview {
  hacd: {
    currentPrice: number;
    priceChange24h: number;
    volume24h: number;
    exchanges: HacdPriceData[];
  };
  hac: {
    currentPrice: number;
    priceChange24h: number;
    volume24h: number;
  };
  stackTokens: {
    carat: {
      price: number;
      marketCap: number;
      totalSupply: number;
    };
  };
  timestamp: number;
}

// Fetch HACD price from CoinEx
async function fetchCoinExHacdPrice(): Promise<HacdPriceData | null> {
  try {
    const response = await axios.get(`${EXCHANGES.coinex.baseUrl}/market/ticker`, {
      params: { market: EXCHANGES.coinex.pair.toLowerCase() },
    });
    
    const data = response.data?.data?.ticker;
    if (!data) return null;
    
    return {
      exchange: EXCHANGES.coinex.name,
      price: parseFloat(data.last),
      volume24h: parseFloat(data.vol),
      change24h: parseFloat(data.change),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('CoinEx HACD price fetch error:', error);
    return null;
  }
}

// Fetch HAC price from CoinEx
async function fetchCoinExHacPrice(): Promise<{ price: number; change24h: number; volume24h: number } | null> {
  try {
    const response = await axios.get(`${HAC_EXCHANGES.coinex.baseUrl}/market/ticker`, {
      params: { market: HAC_EXCHANGES.coinex.pair.toLowerCase() },
    });
    
    const data = response.data?.data?.ticker;
    if (!data) return null;
    
    return {
      price: parseFloat(data.last),
      change24h: parseFloat(data.change),
      volume24h: parseFloat(data.vol),
    };
  } catch (error) {
    console.error('CoinEx HAC price fetch error:', error);
    return null;
  }
}

// Calculate Carat Protocol price based on HACD stack ratio
function calculateCaratPrice(hacdPrice: number): number {
  // 1 HACD → 16,777,216 CARAT
  // So 1 CARAT = HACD price / 16,777,216
  return hacdPrice / 16777216;
}

// Get HACD market overview
export async function getHacdMarketOverview(): Promise<HacdMarketOverview> {
  const [hacdPrice, hacPrice] = await Promise.all([
    fetchCoinExHacdPrice(),
    fetchCoinExHacPrice(),
  ]);
  
  const caratPrice = hacdPrice ? calculateCaratPrice(hacdPrice.price) : 0;
  
  return {
    hacd: {
      currentPrice: hacdPrice?.price || 0,
      priceChange24h: hacdPrice?.change24h || 0,
      volume24h: hacdPrice?.volume24h || 0,
      exchanges: hacdPrice ? [hacdPrice] : [],
    },
    hac: {
      currentPrice: hacPrice?.price || 0,
      priceChange24h: hacPrice?.change24h || 0,
      volume24h: hacPrice?.volume24h || 0,
    },
    stackTokens: {
      carat: {
        price: caratPrice,
        marketCap: caratPrice * 16777216, // Total CARAT supply
        totalSupply: 16777216,
      },
    },
    timestamp: Date.now(),
  };
}

// Get historical HACD prices (simulated for demo)
export async function getHacdHistoricalPrices(days: number = 30): Promise<Array<{ date: string; price: number; volume: number }>> {
  // In production, this would fetch from exchange historical APIs
  // For now, generate realistic simulated data
  const prices: Array<{ date: string; price: number; volume: number }> = [];
  const basePrice = 0.5; // Base HACD price in USDT
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const randomVariation = (Math.random() - 0.5) * 0.1;
    const price = basePrice + randomVariation + (days - i) * 0.01; // Slight upward trend
    const volume = 1000000 + Math.random() * 500000;
    
    prices.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(0.1, price),
      volume: Math.floor(volume),
    });
  }
  
  return prices;
}

// Calculate HACD rarity score based on name
export function calculateHacdRarityScore(hacdName: string): {
  score: number;
  tier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  factors: string[];
} {
  const validLetters = 'WTYUIAHXVMEKBSZN';
  let score = 0;
  const factors: string[] = [];
  
  // Factor 1: Letter distribution (some letters are rarer)
  const letterCounts: Record<string, number> = {};
  for (const letter of hacdName) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }
  
  // Penalize repeated letters
  const maxRepeat = Math.max(...Object.values(letterCounts));
  if (maxRepeat === 1) {
    score += 30;
    factors.push('All unique letters');
  } else if (maxRepeat === 2) {
    score += 20;
    factors.push('One repeated letter');
  } else {
    score += 10;
    factors.push('Multiple repeated letters');
  }
  
  // Factor 2: Pattern recognition
  if (hacdName === hacdName.split('').reverse().join('')) {
    score += 25;
    factors.push('Palindrome');
  }
  
  if (/^[A-Z]{6}$/.test(hacdName) && hacdName === hacdName.toUpperCase()) {
    score += 15;
    factors.push('Valid format');
  }
  
  // Factor 3: Meaningful words
  const meaningfulWords = ['STACK', 'HACASH', 'DIAMOND', 'CRYPTO', 'TOKEN', 'VALUE'];
  if (meaningfulWords.includes(hacdName)) {
    score += 20;
    factors.push('Meaningful word');
  }
  
  // Factor 4: Letter combinations
  const rareCombinations = ['AAA', 'WWW', 'XXX', 'YYY', 'ZZZ'];
  for (const combo of rareCombinations) {
    if (hacdName.includes(combo)) {
      score += 15;
      factors.push(`Rare combination: ${combo}`);
      break;
    }
  }
  
  // Determine tier
  let tier: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  if (score >= 80) tier = 'Legendary';
  else if (score >= 60) tier = 'Epic';
  else if (score >= 40) tier = 'Rare';
  else if (score >= 20) tier = 'Uncommon';
  else tier = 'Common';
  
  return { score, tier, factors };
}
