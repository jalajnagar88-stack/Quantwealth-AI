import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Target, Zap, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://hacd-production.up.railway.app/api';

const HacdAnalysis = () => {
  const [marketData, setMarketData] = useState(null);
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [rarityResult, setRarityResult] = useState(null);
  const [stackPrediction, setStackPrediction] = useState(null);
  const [backtestResults, setBacktestResults] = useState([]);
  const [pricePrediction, setPricePrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('market');
  
  // Form states
  const [hacdName, setHacdName] = useState('');
  const [projectCategory, setProjectCategory] = useState('meme');
  const [targetSupply, setTargetSupply] = useState(1000000);
  const [backtestConfig, setBacktestConfig] = useState({
    stackCost: 50,
    totalLots: 100,
    unitsPerLot: 10000,
    phaseModel: 'public',
  });

  useEffect(() => {
    fetchMarketData();
    fetchHistoricalPrices();
    fetchPricePrediction();
  }, []);

  const fetchMarketData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/hacd-analysis/market`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarketData(response.data.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchHistoricalPrices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/hacd-analysis/historical?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistoricalPrices(response.data.data);
    } catch (error) {
      console.error('Error fetching historical prices:', error);
    }
  };

  const fetchPricePrediction = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/hacd-analysis/price-prediction?days=7`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPricePrediction(response.data.data);
    } catch (error) {
      console.error('Error fetching price prediction:', error);
    }
  };

  const calculateRarity = async () => {
    if (!hacdName) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/hacd-analysis/rarity`,
        { hacdName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRarityResult(response.data.data);
    } catch (error) {
      console.error('Error calculating rarity:', error);
    }
    setLoading(false);
  };

  const predictStackCost = async () => {
    if (!hacdName || !targetSupply) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/hacd-analysis/predict-stack-cost`,
        { projectCategory, hacdName, targetSupply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStackPrediction(response.data.data);
    } catch (error) {
      console.error('Error predicting stack cost:', error);
    }
    setLoading(false);
  };

  const runBacktest = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/hacd-analysis/backtest`,
        backtestConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBacktestResults([response.data.data]);
    } catch (error) {
      console.error('Error running backtest:', error);
    }
    setLoading(false);
  };

  const runComparativeBacktest = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/hacd-analysis/comparative-backtest`,
        { totalLots: backtestConfig.totalLots, unitsPerLot: backtestConfig.unitsPerLot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBacktestResults(response.data.data.results);
    } catch (error) {
      console.error('Error running comparative backtest:', error);
    }
    setLoading(false);
  };

  const getTierColor = (tier) => {
    const colors = {
      Common: 'bg-gray-100 text-gray-800',
      Uncommon: 'bg-green-100 text-green-800',
      Rare: 'bg-blue-100 text-blue-800',
      Epic: 'bg-purple-100 text-purple-800',
      Legendary: 'bg-yellow-100 text-yellow-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HACD Token Analysis</h1>
        <p className="text-gray-600">Advanced analytics for HACD ecosystem tokens and stack protocol optimization</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        {['market', 'rarity', 'prediction', 'backtest'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Market Overview Tab */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {marketData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">HACD Price</h3>
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  ${marketData.hacd.currentPrice.toFixed(4)}
                </div>
                <div className={`flex items-center ${marketData.hacd.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketData.hacd.priceChange24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {marketData.hacd.priceChange24h.toFixed(2)}% (24h)
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Volume: ${marketData.hacd.volume24h.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">HAC Price</h3>
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  ${marketData.hac.currentPrice.toFixed(4)}
                </div>
                <div className={`flex items-center ${marketData.hac.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketData.hac.priceChange24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {marketData.hac.priceChange24h.toFixed(2)}% (24h)
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Volume: ${marketData.hac.volume24h.toLocaleString()}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">CARAT Protocol</h3>
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  ${marketData.stackTokens.carat.price.toFixed(8)}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Market Cap: ${marketData.stackTokens.carat.marketCap.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Total Supply: {marketData.stackTokens.carat.totalSupply.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {pricePrediction && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                7-Day Price Prediction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Current Price</div>
                  <div className="text-2xl font-bold">${pricePrediction.currentPrice.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Predicted Price</div>
                  <div className="text-2xl font-bold">${pricePrediction.predictedPrice.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Expected Change</div>
                  <div className={`text-2xl font-bold ${pricePrediction.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pricePrediction.changePercent >= 0 ? '+' : ''}{pricePrediction.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-600">Confidence: {pricePrediction.confidence}%</div>
                <div className="mt-2 space-y-1">
                  {pricePrediction.factors.map((factor, idx) => (
                    <div key={idx} className="text-sm text-gray-700">• {factor}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {historicalPrices.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">30-Day Price History</h3>
              <div className="h-64 flex items-end space-x-1">
                {historicalPrices.map((price, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{
                      height: `${(price.price / Math.max(...historicalPrices.map(p => p.price))) * 100}%`,
                    }}
                    title={`${price.date}: $${price.price.toFixed(4)}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rarity Analysis Tab */}
      {activeTab === 'rarity' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">HACD Rarity Calculator</h3>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={hacdName}
                onChange={(e) => setHacdName(e.target.value.toUpperCase())}
                placeholder="Enter HACD name (e.g., STACK)"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
              <button
                onClick={calculateRarity}
                disabled={loading || !hacdName}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {loading ? 'Calculating...' : 'Calculate Rarity'}
              </button>
            </div>
          </div>

          {rarityResult && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Rarity Score: {rarityResult.score}/100</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(rarityResult.tier)}`}>
                  {rarityResult.tier}
                </span>
              </div>
              <div className="space-y-2">
                {rarityResult.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stack Cost Prediction Tab */}
      {activeTab === 'prediction' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Stack Cost Prediction</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HACD Name</label>
                <input
                  type="text"
                  value={hacdName}
                  onChange={(e) => setHacdName(e.target.value.toUpperCase())}
                  placeholder="STACK"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Category</label>
                <select
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meme">Meme</option>
                  <option value="ai_agent">AI Agent</option>
                  <option value="art">Art</option>
                  <option value="rwa">RWA</option>
                  <option value="community">Community</option>
                  <option value="utility">Utility</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Supply</label>
                <input
                  type="number"
                  value={targetSupply}
                  onChange={(e) => setTargetSupply(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={predictStackCost}
              disabled={loading || !hacdName || !targetSupply}
              className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              {loading ? 'Predicting...' : 'Predict Stack Cost'}
            </button>
          </div>

          {stackPrediction && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recommended Stack Cost</h3>
                <span className="text-3xl font-bold text-blue-600">{stackPrediction.recommendedCost} HAC</span>
              </div>
              <div className="mb-4">
                <div className="text-sm text-gray-600">Confidence: {stackPrediction.confidence}%</div>
                <div className="mt-2 text-gray-700">{stackPrediction.reasoning}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Market Condition</div>
                  <div className="font-semibold">{stackPrediction.factors.marketCondition}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">HACD Price</div>
                  <div className="font-semibold">${stackPrediction.factors.hacdPrice.toFixed(4)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">HAC Price</div>
                  <div className="font-semibold">${stackPrediction.factors.hacPrice.toFixed(4)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Rarity Score</div>
                  <div className="font-semibold">{stackPrediction.factors.rarityScore}/100</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Alternative Strategies</h4>
                <div className="space-y-2">
                  {stackPrediction.alternatives.map((alt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{alt.strategy}</div>
                        <div className="text-sm text-gray-600">{alt.expectedParticipation}</div>
                      </div>
                      <div className="text-lg font-bold">{alt.cost} HAC</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backtesting Tab */}
      {activeTab === 'backtest' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Stack Strategy Backtest</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stack Cost (HAC)</label>
                <input
                  type="number"
                  value={backtestConfig.stackCost}
                  onChange={(e) => setBacktestConfig({ ...backtestConfig, stackCost: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Lots</label>
                <input
                  type="number"
                  value={backtestConfig.totalLots}
                  onChange={(e) => setBacktestConfig({ ...backtestConfig, totalLots: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units per Lot</label>
                <input
                  type="number"
                  value={backtestConfig.unitsPerLot}
                  onChange={(e) => setBacktestConfig({ ...backtestConfig, unitsPerLot: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phase Model</label>
                <select
                  value={backtestConfig.phaseModel}
                  onChange={(e) => setBacktestConfig({ ...backtestConfig, phaseModel: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="allowlist">Allowlist</option>
                  <option value="designated_first">Designated First</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={runBacktest}
                disabled={loading}
                className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                {loading ? 'Running...' : 'Run Single Backtest'}
              </button>
              <button
                onClick={runComparativeBacktest}
                disabled={loading}
                className="flex-1 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300"
              >
                {loading ? 'Running...' : 'Run Comparative Backtest'}
              </button>
            </div>
          </div>

          {backtestResults.length > 0 && (
            <div className="space-y-4">
              {backtestResults.map((result, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{result.strategy}</h3>
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Formation Cost</div>
                      <div className="font-semibold">{result.metrics.totalFormationCost.toLocaleString()} HAC</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Expected ROI</div>
                      <div className="font-semibold text-green-600">{result.metrics.expectedROI}%</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Participation Rate</div>
                      <div className="font-semibold">{result.metrics.participationRate}%</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Formation Time</div>
                      <div className="font-semibold flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {result.metrics.formationTime}
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Risk Level</div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.riskAnalysis.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                      result.riskAnalysis.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.riskAnalysis.riskLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Risk Factors</div>
                      <ul className="space-y-1">
                        {result.riskAnalysis.riskFactors.map((factor, fidx) => (
                          <li key={fidx} className="text-sm text-red-600">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Mitigation Strategies</div>
                      <ul className="space-y-1">
                        {result.riskAnalysis.mitigationStrategies.map((strategy, sidx) => (
                          <li key={sidx} className="text-sm text-green-600">• {strategy}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">vs Carat Protocol: {result.comparison.vsCaratProtocol}</div>
                    <div className="text-sm text-gray-600">vs Market Average: {result.comparison.vsMarketAverage}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HacdAnalysis;
