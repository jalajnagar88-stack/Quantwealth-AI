// Comprehensive list of Indian stocks (NSE/BSE)
// Organized by sector for better UX

export const stockCategories = [
  {
    name: 'Nifty 50 - Large Cap',
    stocks: [
      { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', price: 2450 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', price: 3450 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', price: 1450 },
      { symbol: 'INFY', name: 'Infosys', sector: 'IT', price: 1450 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', price: 950 },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', price: 2350 },
      { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', price: 415 },
      { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 650 },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', price: 980 },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', price: 1650 },
      { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure', price: 2450 },
      { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', price: 1250 },
      { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking', price: 950 },
      { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer', price: 2850 },
      { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Auto', price: 9800 },
      { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', price: 1250 },
      { symbol: 'TITAN', name: 'Titan Company', sector: 'Consumer', price: 3150 },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'NBFC', price: 6850 },
      { symbol: 'ADANIENT', name: 'Adani Enterprises', sector: 'Conglomerate', price: 2450 },
      { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Cement', price: 7850 },
    ]
  },
  {
    name: 'Banking & Financial Services',
    stocks: [
      { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', price: 1450 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', price: 950 },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', price: 1650 },
      { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 650 },
      { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking', price: 950 },
      { symbol: 'INDUSINDBK', name: 'IndusInd Bank', sector: 'Banking', price: 1250 },
      { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Banking', price: 215 },
      { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Banking', price: 75 },
      { symbol: 'CANBK', name: 'Canara Bank', sector: 'Banking', price: 335 },
      { symbol: 'UNIONBANK', name: 'Union Bank of India', sector: 'Banking', price: 95 },
      { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'NBFC', price: 6850 },
      { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'NBFC', price: 1580 },
      { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance', sector: 'NBFC', price: 1420 },
      { symbol: 'CHOLAFIN', name: 'Cholamandalam Finance', sector: 'NBFC', price: 1250 },
      { symbol: 'SRTRANSFIN', name: 'Shriram Transport Finance', sector: 'NBFC', price: 2150 },
    ]
  },
  {
    name: 'Information Technology',
    stocks: [
      { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', price: 3450 },
      { symbol: 'INFY', name: 'Infosys', sector: 'IT', price: 1450 },
      { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', price: 1250 },
      { symbol: 'WIPRO', name: 'Wipro', sector: 'IT', price: 285 },
      { symbol: 'TECHM', name: 'Tech Mahindra', sector: 'IT', price: 1150 },
      { symbol: 'LTIM', name: 'LTIMindtree', sector: 'IT', price: 4950 },
      { symbol: 'COFORGE', name: 'Coforge', sector: 'IT', price: 5850 },
      { symbol: 'MPHASIS', name: 'Mphasis', sector: 'IT', price: 2150 },
      { symbol: 'PERSISTENT', name: 'Persistent Systems', sector: 'IT', price: 3850 },
      { symbol: 'OFSS', name: 'Oracle Financial Services', sector: 'IT', price: 4250 },
    ]
  },
  {
    name: 'Auto & Auto Ancillary',
    stocks: [
      { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Auto', price: 9800 },
      { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto', price: 750 },
      { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Auto', price: 2450 },
      { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', sector: 'Auto', price: 6850 },
      { symbol: 'EICHERMOT', name: 'Eicher Motors', sector: 'Auto', price: 3850 },
      { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', sector: 'Auto', price: 4250 },
      { symbol: 'TVSMOTOR', name: 'TVS Motor Company', sector: 'Auto', price: 1850 },
      { symbol: 'ASHOKLEY', name: 'Ashok Leyland', sector: 'Auto', price: 165 },
      { symbol: 'BOSCHLTD', name: 'Bosch India', sector: 'Auto Anc', price: 18500 },
      { symbol: 'MRF', name: 'MRF Limited', sector: 'Auto Anc', price: 118500 },
      { symbol: 'BALKRISIND', name: 'Balkrishna Industries', sector: 'Auto Anc', price: 2150 },
      { symbol: 'APOLLOTYRE', name: 'Apollo Tyres', sector: 'Auto Anc', price: 385 },
      { symbol: 'EXIDEIND', name: 'Exide Industries', sector: 'Auto Anc', price: 285 },
    ]
  },
  {
    name: 'Pharmaceuticals',
    stocks: [
      { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', price: 1250 },
      { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", sector: 'Pharma', price: 5850 },
      { symbol: 'CIPLA', name: 'Cipla', sector: 'Pharma', price: 1185 },
      { symbol: 'DIVISLAB', name: 'Divis Laboratories', sector: 'Pharma', price: 3850 },
      { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma', sector: 'Pharma', price: 985 },
      { symbol: 'BIOCON', name: 'Biocon', sector: 'Pharma', price: 285 },
      { symbol: 'LUPIN', name: 'Lupin', sector: 'Pharma', price: 1685 },
      { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals', sector: 'Pharma', price: 1850 },
      { symbol: 'ZYDUSLIFE', name: 'Zydus Lifesciences', sector: 'Pharma', price: 585 },
      { symbol: 'GLENMARK', name: 'Glenmark Pharmaceuticals', sector: 'Pharma', price: 785 },
      { symbol: 'ALKEM', name: 'Alkem Laboratories', sector: 'Pharma', price: 3850 },
      { symbol: 'SANOFI', name: 'Sanofi India', sector: 'Pharma', price: 6850 },
    ]
  },
  {
    name: 'FMCG & Consumer Goods',
    stocks: [
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', price: 2350 },
      { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', price: 415 },
      { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'FMCG', price: 21850 },
      { symbol: 'TATACONSUM', name: 'Tata Consumer Products', sector: 'FMCG', price: 985 },
      { symbol: 'DABUR', name: 'Dabur India', sector: 'FMCG', price: 515 },
      { symbol: 'BRITANNIA', name: 'Britannia Industries', sector: 'FMCG', price: 4850 },
      { symbol: 'GODREJCP', name: 'Godrej Consumer Products', sector: 'FMCG', price: 1150 },
      { symbol: 'MARICO', name: 'Marico', sector: 'FMCG', price: 535 },
      { symbol: 'COLPAL', name: 'Colgate-Palmolive India', sector: 'FMCG', price: 2150 },
      { symbol: 'PGHH', name: 'Procter & Gamble Health', sector: 'FMCG', price: 14850 },
      { symbol: 'VBL', name: 'Varun Beverages', sector: 'FMCG', price: 485 },
      { symbol: 'UNITDSPR', name: 'United Spirits', sector: 'FMCG', price: 1150 },
    ]
  },
  {
    name: 'Energy & Oil & Gas',
    stocks: [
      { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', price: 2450 },
      { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'Energy', price: 235 },
      { symbol: 'IOC', name: 'Indian Oil Corporation', sector: 'Energy', price: 135 },
      { symbol: 'BPCL', name: 'Bharat Petroleum', sector: 'Energy', price: 285 },
      { symbol: 'HPCL', name: 'Hindustan Petroleum', sector: 'Energy', price: 335 },
      { symbol: 'GAIL', name: 'GAIL India', sector: 'Energy', price: 165 },
      { symbol: 'NTPC', name: 'NTPC Limited', sector: 'Power', price: 285 },
      { symbol: 'POWERGRID', name: 'Power Grid Corporation', sector: 'Power', price: 285 },
      { symbol: 'ADANIGREEN', name: 'Adani Green Energy', sector: 'Power', price: 850 },
      { symbol: 'TATAPOWER', name: 'Tata Power', sector: 'Power', price: 285 },
      { symbol: 'JSWENERGY', name: 'JSW Energy', sector: 'Power', price: 385 },
      { symbol: 'NHPC', name: 'NHPC Limited', sector: 'Power', price: 65 },
    ]
  },
  {
    name: 'Infrastructure & Real Estate',
    stocks: [
      { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure', price: 2450 },
      { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Cement', price: 7850 },
      { symbol: 'GRASIM', name: 'Grasim Industries', sector: 'Cement', price: 2150 },
      { symbol: 'SHREECEM', name: 'Shree Cement', sector: 'Cement', price: 24850 },
      { symbol: 'AMBUJACEM', name: 'Ambuja Cements', sector: 'Cement', price: 485 },
      { symbol: 'ACC', name: 'ACC Limited', sector: 'Cement', price: 2150 },
      { symbol: 'DLF', name: 'DLF Limited', sector: 'Real Estate', price: 685 },
      { symbol: 'GODREJPROP', name: 'Godrej Properties', sector: 'Real Estate', price: 1850 },
      { symbol: 'OBEROIRLTY', name: 'Oberoi Realty', sector: 'Real Estate', price: 1250 },
      { symbol: 'PHOENIXLTD', name: 'The Phoenix Mills', sector: 'Real Estate', price: 1850 },
      { symbol: 'PRESTIGE', name: 'Prestige Estates', sector: 'Real Estate', price: 685 },
      { symbol: 'BRIGADE', name: 'Brigade Enterprises', sector: 'Real Estate', price: 785 },
    ]
  },
  {
    name: 'Metals & Mining',
    stocks: [
      { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Steel', price: 135 },
      { symbol: 'JSWSTEEL', name: 'JSW Steel', sector: 'Steel', price: 785 },
      { symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'Aluminium', price: 485 },
      { symbol: 'VEDL', name: 'Vedanta Limited', sector: 'Mining', price: 435 },
      { symbol: 'COALINDIA', name: 'Coal India', sector: 'Mining', price: 435 },
      { symbol: 'NMDC', name: 'NMDC Limited', sector: 'Mining', price: 235 },
      { symbol: 'SAIL', name: 'Steel Authority of India', sector: 'Steel', price: 105 },
      { symbol: 'APLAPOLLO', name: 'APL Apollo Tubes', sector: 'Steel', price: 1450 },
      { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power', sector: 'Steel', price: 785 },
      { symbol: 'NATIONALUM', name: 'National Aluminium', sector: 'Aluminium', price: 135 },
    ]
  },
  {
    name: 'Telecom & Media',
    stocks: [
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', price: 980 },
      { symbol: 'JIOFIN', name: 'Jio Financial Services', sector: 'Financial', price: 285 },
      { symbol: 'IDEA', name: 'Vodafone Idea', sector: 'Telecom', price: 8.5 },
      { symbol: 'SUNTV', name: 'Sun TV Network', sector: 'Media', price: 585 },
      { symbol: 'ZEEENT', name: 'Zee Entertainment', sector: 'Media', price: 235 },
      { symbol: 'TV18BRDCST', name: 'Network 18 Media', sector: 'Media', price: 65 },
      { symbol: 'PVRINOX', name: 'PVR Inox', sector: 'Entertainment', price: 1250 },
      { symbol: 'SJVN', name: 'SJVN Limited', sector: 'Power', price: 85 },
    ]
  },
  {
    name: 'Mid Cap - Emerging Companies',
    stocks: [
      { symbol: 'IRCTC', name: 'IRCTC Limited', sector: 'Services', price: 685 },
      { symbol: 'ZOMATO', name: 'Zomato Limited', sector: 'Technology', price: 185 },
      { symbol: 'PAYTM', name: 'One 97 Communications', sector: 'Fintech', price: 385 },
      { symbol: 'NYKAA', name: 'FSN E-Commerce (Nykaa)', sector: 'E-Commerce', price: 185 },
      { symbol: 'POLICYBZR', name: 'PB Fintech (PolicyBazaar)', sector: 'Fintech', price: 685 },
      { symbol: 'DELHIVERY', name: 'Delhivery Limited', sector: 'Logistics', price: 385 },
      { symbol: 'NAM-INDIA', name: 'Nippon Life India AMC', sector: 'Financial', price: 485 },
      { symbol: 'CAMS', name: 'Computer Age Management', sector: 'Services', price: 2850 },
      { symbol: 'CDSL', name: 'CDSL Limited', sector: 'Financial', price: 1850 },
      { symbol: 'MCX', name: 'Multi Commodity Exchange', sector: 'Financial', price: 4850 },
    ]
  }
];

// Flatten all stocks for search/autocomplete
export const allStocks = stockCategories.flatMap(category => 
  category.stocks.map(stock => ({
    ...stock,
    category: category.name
  }))
);

// Get stock by symbol
export const getStockBySymbol = (symbol) => {
  return allStocks.find(stock => stock.symbol === symbol);
};

// Search stocks by name or symbol
export const searchStocks = (query) => {
  const lowerQuery = query.toLowerCase();
  return allStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(lowerQuery) ||
    stock.name.toLowerCase().includes(lowerQuery)
  );
};

// Get stocks by sector
export const getStocksBySector = (sector) => {
  return allStocks.filter(stock => stock.sector === sector);
};
