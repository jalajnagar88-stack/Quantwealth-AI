import { IHacdLaunchSpec, IStackConfig, IAssetInfo } from '../models/HacdLaunchSpec';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

// Supply math validator — enforces HACD math invariants
export function validateSupplyMath(spec: IHacdLaunchSpec): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { stack, asset } = spec;

  // Rule 1: total_supply = total_hacd_lots × units_per_hacd_lot
  const calculatedSupply = stack.total_hacd_lots * stack.units_per_hacd_lot;
  if (asset.total_supply !== calculatedSupply) {
    errors.push(
      `Supply mismatch: total_supply (${asset.total_supply}) != ` +
      `total_hacd_lots (${stack.total_hacd_lots}) × units_per_hacd_lot (${stack.units_per_hacd_lot}) = ${calculatedSupply}`
    );
  }

  // Rule 2: formation_cost_hac = total_hacd_lots × stack_cost_hac_per_hacd
  const formationCost = stack.total_hacd_lots * stack.stack_cost_hac_per_hacd;
  warnings.push(
    `Formation cost: ${formationCost} HAC (${stack.total_hacd_lots} lots × ${stack.stack_cost_hac_per_hacd} HAC/HACD)`
  );

  // Rule 3: phase lots must sum to total
  const phaseSum = stack.first_phase_hacd_lots + stack.public_phase_hacd_lots;
  if (phaseSum !== stack.total_hacd_lots) {
    errors.push(
      `Phase lot sum mismatch: first_phase (${stack.first_phase_hacd_lots}) + ` +
      `public_phase (${stack.public_phase_hacd_lots}) = ${phaseSum} != total_hacd_lots (${stack.total_hacd_lots})`
    );
  }

  // Validation: stack cost benchmarks (from ECOSYSTEM.md)
  if (stack.stack_cost_hac_per_hacd < 10) {
    warnings.push('Stack cost below 10 HAC — ensure this is intentional for high-participation tier');
  }
  if (stack.stack_cost_hac_per_hacd > 500) {
    warnings.push('Stack cost above 500 HAC — ensure this is intentional for premium/exclusive tier');
  }

  // Validation: reasonable ranges
  if (stack.total_hacd_lots < 1) {
    errors.push('total_hacd_lots must be at least 1');
  }
  if (stack.units_per_hacd_lot < 1) {
    errors.push('units_per_hacd_lot must be at least 1');
  }
  if (asset.decimals < 0 || asset.decimals > 18) {
    errors.push('decimals must be between 0 and 18');
  }

  // Validation: HACD per lot (usually 1 for standard Stack)
  if (stack.hacd_per_lot !== 1) {
    warnings.push(`hacd_per_lot is ${stack.hacd_per_lot} — standard is 1 HACD per lot`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// Copy safety linter — flags unsafe promo language
export function validateCopySafety(spec: IHacdLaunchSpec): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const unsafePatterns = [
    /\bguaranteed\s+(return|profit|gain|yield|liquidity)\b/i,
    /\bwill\s+(increase|rise|go\s+up|moon|pump)\b/i,
    /\bprice\s+(target|prediction|forecast)\b/i,
    /\b(investment|invest)\s+(advice|recommendation)\b/i,
    /\b(risk-free|no\s+risk|safe\s+investment)\b/i,
    /\b(100%|certain|sure\s+thing)\b/i,
  ];

  const checkText = (text: string, fieldName: string) => {
    for (const pattern of unsafePatterns) {
      if (pattern.test(text)) {
        warnings.push(
          `${fieldName}: Potentially unsafe language detected: "${text.match(pattern)?.[0]}" — ` +
          'avoid price guarantees, investment advice, or risk-free claims'
        );
      }
    }
  };

  // Check all copy fields
  checkText(spec.copy.headline, 'headline');
  checkText(spec.copy.subheadline, 'subheadline');
  checkText(spec.copy.short_description, 'short_description');

  // Ensure risk disclosure exists and is substantive
  if (!spec.copy.risk_disclosure || spec.copy.risk_disclosure.length < 50) {
    errors.push('risk_disclosure must be substantive (at least 50 characters)');
  }

  // Check for required risk keywords
  const riskKeywords = ['risk', 'loss', 'volatility', 'uncertain'];
  const hasRiskKeyword = riskKeywords.some(kw => 
    spec.copy.risk_disclosure.toLowerCase().includes(kw)
  );
  if (!hasRiskKeyword) {
    warnings.push('risk_disclosure should explicitly mention risk, loss, or volatility');
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// Cross-document consistency validator
export function validateCrossDocConsistency(spec: IHacdLaunchSpec): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if generated docs contain numbers matching the spec
  const checkDocConsistency = (doc: string | undefined, fieldName: string, expectedValue: number | string) => {
    if (!doc) return;
    const strValue = String(expectedValue);
    if (!doc.includes(strValue)) {
      warnings.push(
        `${fieldName}: Generated document may not contain expected value "${strValue}" — verify manually`
      );
    }
  };

  // Check key numbers in generated docs
  if (spec.generated_docs.stack_design) {
    checkDocConsistency(spec.generated_docs.stack_design, 'stack_design', spec.stack.total_hacd_lots);
    checkDocConsistency(spec.generated_docs.stack_design, 'stack_design', spec.asset.total_supply);
  }

  if (spec.generated_docs.launchpad_copy) {
    checkDocConsistency(spec.generated_docs.launchpad_copy, 'launchpad_copy', spec.project.ticker);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// Full validator — runs all checks
export function validateLaunchSpec(spec: IHacdLaunchSpec): ValidationResult {
  const supplyResult = validateSupplyMath(spec);
  const copyResult = validateCopySafety(spec);
  const consistencyResult = validateCrossDocConsistency(spec);

  const allErrors = [
    ...supplyResult.errors,
    ...copyResult.errors,
    ...consistencyResult.errors,
  ];

  const allWarnings = [
    ...supplyResult.warnings,
    ...copyResult.warnings,
    ...consistencyResult.warnings,
  ];

  return {
    passed: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
