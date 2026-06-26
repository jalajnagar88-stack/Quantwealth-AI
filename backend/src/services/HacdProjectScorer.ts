import { IHacdLaunchSpec } from '../models/HacdLaunchSpec';

export interface ScoreResult {
  overall_score: number;
  criteria: {
    pow_fit: { score: number; reasoning: string };
    supply_logic: { score: number; reasoning: string };
    utility_clarity: { score: number; reasoning: string };
    copy_safety: { score: number; reasoning: string };
    team_credibility: { score: number; reasoning: string };
  };
  recommendations: string[];
}

// Project scorer — 5 criteria from CAMPAIGN.md
export function scoreProject(spec: IHacdLaunchSpec): ScoreResult {
  const scores = {
    pow_fit: scorePowFit(spec),
    supply_logic: scoreSupplyLogic(spec),
    utility_clarity: scoreUtilityClarity(spec),
    copy_safety: scoreCopySafety(spec),
    team_credibility: scoreTeamCredibility(spec),
  };

  const overall_score = Math.round(
    (scores.pow_fit.score +
     scores.supply_logic.score +
     scores.utility_clarity.score +
     scores.copy_safety.score +
     scores.team_credibility.score) / 5
  );

  const recommendations = generateRecommendations(scores);

  return {
    overall_score,
    criteria: scores,
    recommendations,
  };
}

// 1. PoW fit — does this genuinely need HACD or could it be a plain token?
function scorePowFit(spec: IHacdLaunchSpec): { score: number; reasoning: string } {
  let score = 5;
  const reasons: string[] = [];

  // Check if project category suggests PoW fit
  const powFriendlyCategories = ['rwa', 'ai_agent', 'art', 'community'];
  if (powFriendlyCategories.includes(spec.project.category)) {
    score += 2;
    reasons.push('Category aligns with PoW asset formation');
  } else {
    reasons.push('Category may not strongly justify PoW structure');
  }

  // Check if utility mentions on-chain formation
  if (spec.asset.utility_summary.toLowerCase().includes('on-chain') ||
      spec.asset.utility_summary.toLowerCase().includes('formation')) {
    score += 2;
    reasons.push('Utility mentions on-chain formation');
  }

  // Check if description mentions PoW or mining
  if (spec.project.description.toLowerCase().includes('pow') ||
      spec.project.description.toLowerCase().includes('mining')) {
    score += 1;
    reasons.push('Project acknowledges PoW nature');
  }

  // Check for HYBRID structure (better PoW fit)
  if (spec.asset.type === 'HYBRID') {
    score += 1;
    reasons.push('HYBRID structure leverages HACD container benefits');
  }

  // Cap at 10
  score = Math.min(10, score);

  return {
    score,
    reasoning: reasons.join('. ') || 'No clear PoW justification found',
  };
}

// 2. Supply logic — is the math clean, consistent, and verifiable?
function scoreSupplyLogic(spec: IHacdLaunchSpec): { score: number; reasoning: string } {
  let score = 5;
  const reasons: string[] = [];

  // Check supply equation: total_supply = total_hacd_lots × units_per_hacd_lot
  const calculatedSupply = spec.stack.total_hacd_lots * spec.stack.units_per_hacd_lot;
  if (spec.asset.total_supply === calculatedSupply) {
    score += 3;
    reasons.push('Supply equation is correct');
  } else {
    score -= 3;
    reasons.push(`Supply mismatch: ${spec.asset.total_supply} vs calculated ${calculatedSupply}`);
  }

  // Check phase sum: first_phase + public_phase = total_hacd_lots
  const phaseSum = spec.stack.first_phase_hacd_lots + spec.stack.public_phase_hacd_lots;
  if (phaseSum === spec.stack.total_hacd_lots) {
    score += 2;
    reasons.push('Phase lots sum correctly');
  } else {
    score -= 2;
    reasons.push(`Phase sum mismatch: ${phaseSum} vs total ${spec.stack.total_hacd_lots}`);
  }

  // Check stack cost is reasonable
  if (spec.stack.stack_cost_hac_per_hacd >= 10 && spec.stack.stack_cost_hac_per_hacd <= 500) {
    score += 1;
    reasons.push('Stack cost within benchmark range');
  } else {
    reasons.push('Stack cost outside benchmark range (10-500 HAC)');
  }

  // Check decimals are reasonable
  if (spec.asset.decimals >= 0 && spec.asset.decimals <= 18) {
    score += 1;
    reasons.push('Decimals within standard range');
  }

  // Cap at 10
  score = Math.min(10, Math.max(0, score));

  return {
    score,
    reasoning: reasons.join('. '),
  };
}

// 3. Utility clarity — is utility at launch honest and clearly separated from roadmap?
function scoreUtilityClarity(spec: IHacdLaunchSpec): { score: number; reasoning: string } {
  let score = 5;
  const reasons: string[] = [];

  // Check if utility_summary is substantive
  if (spec.asset.utility_summary.length > 50) {
    score += 2;
    reasons.push('Utility summary is substantive');
  } else {
    reasons.push('Utility summary is too brief');
  }

  // Check for honest language (no promises)
  const unsafePatterns = [/guaranteed/i, /will\s+(increase|rise)/i, /risk-free/i];
  const hasUnsafe = unsafePatterns.some(p => p.test(spec.asset.utility_summary));
  if (!hasUnsafe) {
    score += 2;
    reasons.push('Utility language is honest (no guarantees)');
  } else {
    score -= 2;
    reasons.push('Utility contains potentially unsafe promises');
  }

  // Check if utility mentions launch vs roadmap separation
  if (spec.asset.utility_summary.toLowerCase().includes('launch') ||
      spec.asset.utility_summary.toLowerCase().includes('immediate')) {
    score += 1;
    reasons.push('Utility distinguishes launch utility');
  }

  // Cap at 10
  score = Math.min(10, Math.max(0, score));

  return {
    score,
    reasoning: reasons.join('. '),
  };
}

// 4. Copy safety — does all public copy avoid unsafe promises, price language, and legal risk?
function scoreCopySafety(spec: IHacdLaunchSpec): { score: number; reasoning: string } {
  let score = 5;
  const reasons: string[] = [];

  const unsafePatterns = [
    /\bguaranteed\s+(return|profit|gain|yield|liquidity)\b/i,
    /\bwill\s+(increase|rise|go\s+up|moon|pump)\b/i,
    /\bprice\s+(target|prediction|forecast)\b/i,
    /\b(investment|invest)\s+(advice|recommendation)\b/i,
    /\b(risk-free|no\s+risk|safe\s+investment)\b/i,
  ];

  // Check all copy fields
  const copyFields = [
    spec.copy.headline,
    spec.copy.subheadline,
    spec.copy.short_description,
  ];

  let unsafeCount = 0;
  copyFields.forEach(field => {
    unsafePatterns.forEach(pattern => {
      if (pattern.test(field)) {
        unsafeCount++;
      }
    });
  });

  if (unsafeCount === 0) {
    score += 3;
    reasons.push('No unsafe language detected in copy');
  } else {
    score -= unsafeCount;
    reasons.push(`${unsafeCount} unsafe pattern(s) detected in copy`);
  }

  // Check risk disclosure exists and is substantive
  if (spec.copy.risk_disclosure.length > 50) {
    score += 2;
    reasons.push('Risk disclosure is substantive');
  } else {
    score -= 2;
    reasons.push('Risk disclosure is too brief');
  }

  // Check for risk keywords in disclosure
  const riskKeywords = ['risk', 'loss', 'volatility', 'uncertain'];
  const hasRiskKeyword = riskKeywords.some(kw => 
    spec.copy.risk_disclosure.toLowerCase().includes(kw)
  );
  if (hasRiskKeyword) {
    score += 1;
    reasons.push('Risk disclosure includes risk language');
  }

  // Cap at 10
  score = Math.min(10, Math.max(0, score));

  return {
    score,
    reasoning: reasons.join('. '),
  };
}

// 5. Team credibility — is the team identifiable and committed to launching?
function scoreTeamCredibility(spec: IHacdLaunchSpec): { score: number; reasoning: string } {
  let score = 5;
  const reasons: string[] = [];

  // Check if contact info is provided
  if (spec.project.contact && spec.project.contact.includes('@')) {
    score += 2;
    reasons.push('Contact email provided');
  } else {
    reasons.push('No valid contact email');
  }

  // Check if website is provided
  if (spec.project.website && spec.project.website.startsWith('http')) {
    score += 1;
    reasons.push('Website provided');
  }

  // Check if X (Twitter) is provided
  if (spec.project.x) {
    score += 1;
    reasons.push('X (Twitter) handle provided');
  }

  // Check if description shows commitment
  const commitmentKeywords = ['committed', 'launch', 'build', 'develop'];
  const hasCommitment = commitmentKeywords.some(kw => 
    spec.project.description.toLowerCase().includes(kw)
  );
  if (hasCommitment) {
    score += 1;
    reasons.push('Description shows commitment to launch');
  }

  // Cap at 10
  score = Math.min(10, Math.max(0, score));

  return {
    score,
    reasoning: reasons.join('. '),
  };
}

// Generate recommendations based on scores
function generateRecommendations(scores: any): string[] {
  const recommendations: string[] = [];

  if (scores.pow_fit.score < 7) {
    recommendations.push('Improve PoW fit justification in description and utility');
  }

  if (scores.supply_logic.score < 7) {
    recommendations.push('Fix supply math equation and phase lot sum');
  }

  if (scores.utility_clarity.score < 7) {
    recommendations.push('Clarify utility at launch vs roadmap, avoid promises');
  }

  if (scores.copy_safety.score < 7) {
    recommendations.push('Remove unsafe language, strengthen risk disclosure');
  }

  if (scores.team_credibility.score < 7) {
    recommendations.push('Add more team info (GitHub, LinkedIn, background)');
  }

  if (recommendations.length === 0) {
    recommendations.push('Strong submission ready for HACD Incubator review');
  }

  return recommendations;
}
