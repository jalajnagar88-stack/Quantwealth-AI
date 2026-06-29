import { getHacdHistoricalPrices, getHacdMarketOverview } from './HacdPriceTracker';

export interface BacktestConfig {
  stackCost: number;
  totalLots: number;
  unitsPerLot: number;
  phaseModel: 'public' | 'allowlist' | 'designated_first';
  startDate: string;
  endDate: string;
}

export interface BacktestResult {
  strategy: string;
  config: BacktestConfig;
  metrics: {
    totalFormationCost: number;
    totalSupply: number;
    costPerToken: number;
    projectedMarketCap: number;
    expectedROI: number;
    participationRate: number;
    formationTime: string;
  };
  performance: {
    winRate: number;
    avgReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  riskAnalysis: {
    riskLevel: 'Low' | 'Medium' | 'High';
    riskFactors: string[];
    mitigationStrategies: string[];
  };
  comparison: {
    vsCaratProtocol: string;
    vsMarketAverage: string;
  };
}

// Simulate HACD stack formation backtest
export async function runBacktest(config: BacktestConfig): Promise<BacktestResult> {
  const market = await getHacdMarketOverview();
  const historicalPrices = await getHacdHistoricalPrices(30);
  
  // Calculate formation metrics
  const totalFormationCost = config.totalLots * config.stackCost;
  const totalSupply = config.totalLots * config.unitsPerLot;
  const costPerToken = totalFormationCost / totalSupply;
  
  // Simulate market cap based on historical price trends
  const avgHacdPrice = historicalPrices.reduce((sum, p) => sum + p.price, 0) / historicalPrices.length;
  const projectedMarketCap = totalSupply * avgHacdPrice * 1.5; // Assume 50% premium
  
  // Calculate expected ROI based on stack cost tier
  let expectedROI = 50; // Base ROI
  if (config.stackCost <= 50) expectedROI = 45; // Low cost = lower ROI but higher volume
  else if (config.stackCost <= 100) expectedROI = 65; // Mid cost = balanced
  else expectedROI = 85; // High cost = higher ROI but lower volume
  
  // Simulate participation rate
  let participationRate = 80;
  if (config.stackCost <= 50) participationRate = 90;
  else if (config.stackCost <= 100) participationRate = 75;
  else participationRate = 55;
  
  // Formation time based on phase model
  let formationTime = '5-7 minutes';
  if (config.phaseModel === 'public') formationTime = '5-10 minutes';
  else if (config.phaseModel === 'allowlist') formationTime = '3-5 minutes';
  else formationTime = '2-4 minutes';
  
  // Simulate performance metrics
  const winRate = 65 + Math.random() * 20;
  const avgReturn = expectedROI * (0.8 + Math.random() * 0.4);
  const maxDrawdown = 15 + Math.random() * 20;
  const sharpeRatio = 1.2 + Math.random() * 0.8;
  
  // Risk analysis
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
  const riskFactors: string[] = [];
  const mitigationStrategies: string[] = [];
  
  if (config.stackCost > 200) {
    riskLevel = 'High';
    riskFactors.push('High entry barrier may limit participation');
    riskFactors.push('Longer formation time increases uncertainty');
    mitigationStrategies.push('Consider phased launch with lower initial cost');
    mitigationStrategies.push('Add community incentives for early adopters');
  } else if (config.stackCost < 30) {
    riskLevel = 'Low';
    riskFactors.push('Low cost may attract speculative participants');
    riskFactors.push('Higher competition for HACD lots');
    mitigationStrategies.push('Implement allowlist to ensure committed participants');
    mitigationStrategies.push('Add vesting periods for token distribution');
  } else {
    riskFactors.push('Market volatility during formation');
    riskFactors.push('HACD price fluctuations affect formation cost');
    mitigationStrategies.push('Set formation window during stable market conditions');
    mitigationStrategies.push('Provide cost stability mechanisms');
  }
  
  // Comparison with benchmarks
  const vsCarat = config.stackCost === 100 
    ? 'Matches Carat Protocol benchmark (100 HAC/HACD)'
    : config.stackCost > 100 
      ? `${((config.stackCost - 100) / 100 * 100).toFixed(0)}% higher than Carat Protocol`
      : `${((100 - config.stackCost) / 100 * 100).toFixed(0)}% lower than Carat Protocol`;
  
  const vsMarket = config.stackCost <= 50 
    ? 'Below market average (50-100 HAC range)'
    : config.stackCost >= 100 
      ? 'Above market average'
      : 'Within market average range';
  
  return {
    strategy: `${config.stackCost} HAC/HACD Stack Cost`,
    config,
    metrics: {
      totalFormationCost,
      totalSupply,
      costPerToken,
      projectedMarketCap,
      expectedROI,
      participationRate,
      formationTime,
    },
    performance: {
      winRate: Math.round(winRate),
      avgReturn: Math.round(avgReturn),
      maxDrawdown: Math.round(maxDrawdown),
      sharpeRatio: Math.round(sharpeRatio * 10) / 10,
    },
    riskAnalysis: {
      riskLevel,
      riskFactors,
      mitigationStrategies,
    },
    comparison: {
      vsCaratProtocol: vsCarat,
      vsMarketAverage: vsMarket,
    },
  };
}

// Run multiple backtests with different strategies
export async function runComparativeBacktest(
  baseConfig: Omit<BacktestConfig, 'stackCost'>
): Promise<BacktestResult[]> {
  const strategies = [30, 50, 75, 100, 150, 200]; // Different stack costs to test
  
  const results = await Promise.all(
    strategies.map(async (stackCost) => {
      const config: BacktestConfig = {
        ...baseConfig,
        stackCost,
      };
      return await runBacktest(config);
    })
  );
  
  return results;
}

// Get optimal strategy from backtest results
export function getOptimalStrategy(results: BacktestResult[]): {
  bestROI: BacktestResult;
  bestRiskAdjusted: BacktestResult;
  bestParticipation: BacktestResult;
  recommendation: string;
} {
  const bestROI = results.reduce((best, current) => 
    current.metrics.expectedROI > best.metrics.expectedROI ? current : best
  );
  
  const bestRiskAdjusted = results.reduce((best, current) => 
    current.performance.sharpeRatio > best.performance.sharpeRatio ? current : best
  );
  
  const bestParticipation = results.reduce((best, current) => 
    current.metrics.participationRate > best.metrics.participationRate ? current : best
  );
  
  // Generate recommendation
  let recommendation = '';
  if (bestRiskAdjusted.config.stackCost <= 50) {
    recommendation = 'Recommended: Low-cost strategy for maximum participation and market penetration. Best for community-focused projects.';
  } else if (bestRiskAdjusted.config.stackCost <= 100) {
    recommendation = 'Recommended: Balanced strategy following Carat Protocol benchmark. Optimal for most projects seeking sustainable growth.';
  } else {
    recommendation = 'Recommended: Premium strategy for exclusive positioning. Best for art, NFT, or high-value projects with strong community backing.';
  }
  
  return {
    bestROI,
    bestRiskAdjusted,
    bestParticipation,
    recommendation,
  };
}

// Simulate formation timeline
export function simulateFormationTimeline(
  totalLots: number,
  phaseModel: 'public' | 'allowlist' | 'designated_first'
): {
  phases: Array<{
    name: string;
    lots: number;
    duration: string;
    participants: number;
  }>;
  totalDuration: string;
  completionProbability: number;
} {
  const phases: Array<{
    name: string;
    lots: number;
    duration: string;
    participants: number;
  }> = [];
  
  if (phaseModel === 'public') {
    phases.push({
      name: 'Public Formation',
      lots: totalLots,
      duration: '5-10 minutes',
      participants: Math.floor(totalLots * 1.5),
    });
  } else if (phaseModel === 'allowlist') {
    const firstPhaseLots = Math.floor(totalLots * 0.3);
    const publicPhaseLots = totalLots - firstPhaseLots;
    
    phases.push({
      name: 'Allowlist Phase',
      lots: firstPhaseLots,
      duration: '2-3 minutes',
      participants: firstPhaseLots,
    });
    
    phases.push({
      name: 'Public Phase',
      lots: publicPhaseLots,
      duration: '3-5 minutes',
      participants: Math.floor(publicPhaseLots * 1.2),
    });
  } else {
    const designatedLots = Math.floor(totalLots * 0.2);
    const firstPhaseLots = Math.floor(totalLots * 0.3);
    const publicPhaseLots = totalLots - designatedLots - firstPhaseLots;
    
    phases.push({
      name: 'Designated Address Phase',
      lots: designatedLots,
      duration: '1-2 minutes',
      participants: designatedLots,
    });
    
    phases.push({
      name: 'First Phase',
      lots: firstPhaseLots,
      duration: '2-3 minutes',
      participants: firstPhaseLots,
    });
    
    phases.push({
      name: 'Public Phase',
      lots: publicPhaseLots,
      duration: '3-5 minutes',
      participants: Math.floor(publicPhaseLots * 1.2),
    });
  }
  
  const totalDuration = phases.reduce((sum, phase) => {
    const avgDuration = parseInt(phase.duration.split('-')[1] || phase.duration);
    return sum + avgDuration;
  }, 0);
  
  const completionProbability = phaseModel === 'public' ? 85 : phaseModel === 'allowlist' ? 92 : 95;
  
  return {
    phases,
    totalDuration: `${totalDuration} minutes`,
    completionProbability,
  };
}
