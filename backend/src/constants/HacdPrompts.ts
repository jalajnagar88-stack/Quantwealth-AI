// HACD Skill Prompts — from https://github.com/Satyam-10124/hacd-incubator-ai-issuance-skill
// These are the canonical prompts for generating HACD Stack Token issuance documents

import { getEcosystemContext } from './HacdEcosystem';

const ECOSYSTEM = getEcosystemContext();

export const HACD_PROMPTS = {
  // 1. Incubator Fit Review
  incubatorFitReview: (spec: any) => `
Review the project for HACD Labs Incubator Cohort 2.

Project: ${spec.project.name} (${spec.project.ticker})
Category: ${spec.project.category}
Description: ${spec.project.description}
Asset Type: ${spec.asset.type}
Utility: ${spec.asset.utility_summary}

${ECOSYSTEM}

Return:
1. Verdict: Strong fit / Potential fit / Weak fit
2. Why it fits HACD
3. What HACD adds
4. Main concerns
5. Required issuer confirmations
6. Recommended next step

Evaluation criteria:
- Does the project benefit from HACD as a PoW-native asset container?
- Does Stack formation make the asset more credible, useful, or understandable?
- Is there a clear user or community reason to participate?
- Is the issuer avoiding profit promises and misleading backing claims?
`,

  // 2. Project Profile
  projectProfile: (spec: any) => `
Write a comprehensive project profile for ${spec.project.name} (${spec.project.ticker}).

Project Details:
- Name: ${spec.project.name}
- Ticker: ${spec.project.ticker}
- Category: ${spec.project.category}
- Description: ${spec.project.description}
- Website: ${spec.project.website}
- X: ${spec.project.x}
- Contact: ${spec.project.contact}

Asset Details:
- Type: ${spec.asset.type}
- Total Supply: ${spec.asset.total_supply}
- Utility: ${spec.asset.utility_summary}

Stack Configuration:
- Total HACD Lots: ${spec.stack.total_hacd_lots}
- Units per HACD Lot: ${spec.stack.units_per_hacd_lot}
- Stack Cost: ${spec.stack.stack_cost_hac_per_hacd} HAC per HACD
- Phase Model: ${spec.launch.phase_model}

${ECOSYSTEM}

Write a professional project profile that:
- Clearly explains what the project does
- Describes the utility of the ${spec.asset.type}
- Explains why HACD Stack Protocol is used
- Includes formation cost and participation details
- Maintains honest, non-promotional language
- Avoids price guarantees or investment advice
`,

  // 3. Stack Design
  stackDesign: (spec: any) => `
Design the Stack Token structure for ${spec.project.name} (${spec.project.ticker}).

Asset Configuration:
- Type: ${spec.asset.type}
- Total Supply: ${spec.asset.total_supply}
- Decimals: ${spec.asset.decimals}
- Unit Name: ${spec.asset.unit_name}

Stack Configuration:
- Total HACD Lots: ${spec.stack.total_hacd_lots}
- HACD per Lot: ${spec.stack.hacd_per_lot}
- Units per HACD Lot: ${spec.stack.units_per_hacd_lot}
- Stack Cost: ${spec.stack.stack_cost_hac_per_hacd} HAC per HACD
- First Phase Lots: ${spec.stack.first_phase_hacd_lots}
- Public Phase Lots: ${spec.stack.public_phase_hacd_lots}
- Removal Effect: ${spec.stack.removal_effect}

Launch Configuration:
- Target Date: ${spec.launch.target_date_utc}
- Phase Model: ${spec.launch.phase_model}
- Min HACD per Participant: ${spec.launch.min_hacd_per_participant}

${ECOSYSTEM}

Write a stack design document that:
- Explains the math: total_supply = total_hacd_lots × units_per_hacd_lot
- Calculates formation_cost_hac = total_hacd_lots × stack_cost_hac_per_hacd
- Describes the phase model and lot distribution
- Explains the removal effect
- Justifies the stack cost against benchmarks
- Includes formation reference (never call it "floor price")
`,

  // 4. Launchpad Copy
  launchpadCopy: (spec: any) => `
Write Launchpad page copy for ${spec.project.name} (${spec.project.ticker}).

Copy Elements:
- Headline: ${spec.copy.headline}
- Subheadline: ${spec.copy.subheadline}
- Short Description: ${spec.copy.short_description}
- Risk Disclosure: ${spec.copy.risk_disclosure}

${ECOSYSTEM}

Expand this into complete Launchpad copy that:
- Is clear, honest, and non-promotional
- Explains the project and utility
- Describes Stack formation and participation
- Includes the risk disclosure prominently
- Avoids price guarantees, investment advice, or "risk-free" claims
- Uses formation reference language, not "floor price"
- Fits within ~500 words
`,

  // 5. Issuer FAQ
  issuerFaq: (spec: any) => `
Write an FAQ for ${spec.project.name} (${spec.project.ticker}) issuers.

Project: ${spec.project.name} (${spec.project.ticker})
Category: ${spec.project.category}
Asset Type: ${spec.asset.type}
Utility: ${spec.asset.utility_summary}

Stack Configuration:
- Total HACD Lots: ${spec.stack.total_hacd_lots}
- Stack Cost: ${spec.stack.stack_cost_hac_per_hacd} HAC per HACD
- Phase Model: ${spec.launch.phase_model}

${ECOSYSTEM}

Write 8-10 FAQ entries covering:
1. What is ${spec.project.name}?
2. What is the utility of ${spec.project.ticker}?
3. Why use HACD Stack Protocol?
4. How do I participate in the Stack formation?
5. What is the formation cost?
6. What happens when I remove my Stack?
7. Is there a guaranteed price? (Answer: No, formation reference only)
8. What are the risks?
9. When does the Stack launch?
10. Where can I learn more?

Keep answers honest, clear, and non-promotional.
`,

  // 6. X Announcement
  xAnnouncement: (spec: any) => `
Write an X (Twitter) announcement for ${spec.project.name} (${spec.project.ticker}) launch.

Project: ${spec.project.name} (${spec.project.ticker})
Headline: ${spec.copy.headline}
Short Description: ${spec.copy.short_description}
Launch Date: ${spec.launch.target_date_utc}
Launchpad: hacd.it/launchpad

${ECOSYSTEM}

Write a 280-character X announcement that:
- Announces the Stack Token launch
- Mentions the date and Launchpad
- Is exciting but honest
- Includes relevant hashtags (#HACD #Hacash #StackToken)
- Avoids price promises or investment advice
`,

  // 7. Review Checklist
  reviewChecklist: (spec: any) => `
Create a pre-launch review checklist for ${spec.project.name} (${spec.project.ticker}).

${ECOSYSTEM}

Create a checklist covering:
1. Supply math verification
2. Phase lot sum verification
3. Stack cost benchmark check
4. Copy safety check (no guarantees, no investment advice)
5. Risk disclosure completeness
6. HACD terminology accuracy
7. Formation reference language (not "floor price")
8. Launchpad URL correctness
9. Contact information validity
10. Legal compliance considerations

For each item, provide:
- The check to perform
- How to verify it
- What to fix if it fails
`,

  // 8. Risk Review
  riskReview: (spec: any) => `
Review the risks for ${spec.project.name} (${spec.project.ticker}).

Project: ${spec.project.name} (${spec.project.ticker})
Category: ${spec.project.category}
Asset Type: ${spec.asset.type}
Risk Factors: ${spec.risk?.risk_factors || 'Not specified'}

${ECOSYSTEM}

Identify and categorize risks:
1. Market risks (price volatility, liquidity)
2. Technical risks (smart contract bugs, formation failures)
3. Regulatory risks (compliance, jurisdiction)
4. Project risks (team, roadmap, adoption)
5. HACD-specific risks (Stack removal, formation cost)

For each risk, provide:
- Risk description
- Likelihood (Low/Medium/High)
- Impact (Low/Medium/High)
- Mitigation strategy
`,

  // 9. Web Research
  webResearch: (query: string) => `
Research the following for HACD ecosystem context: ${query}

${ECOSYSTEM}

Use web search to find:
1. Current HAC price and market data
2. Recent HACD Stack launches
3. Hacash community sentiment
4. Relevant news or developments
5. Competitor projects

Return findings with sources and dates.
`,

  // 10. HAC Cost Calculator
  hacCostCalculator: (spec: any) => `
Calculate HAC costs for ${spec.project.name} (${spec.project.ticker}).

Stack Configuration:
- Total HACD Lots: ${spec.stack.total_hacd_lots}
- Stack Cost: ${spec.stack.stack_cost_hac_per_hacd} HAC per HACD

${ECOSYSTEM}

Calculate:
1. Total formation cost in HAC
2. Formation cost per participant (at min and max HACD)
3. Formation cost in USD (use current HAC price if available)
4. Compare to Carat Protocol benchmark (100 HAC per HACD)
5. Cost tier assessment (Low/Mid/Premium)

Provide formulas and step-by-step calculation.
`,

  // 11. Stack Token Design
  stackTokenDesign: (spec: any) => `
Design the Stack Token structure for ${spec.project.name} (${spec.project.ticker}).

Asset Type: ${spec.asset.type}
Total Supply: ${spec.asset.total_supply}
Utility: ${spec.asset.utility_summary}

${ECOSYSTEM}

Explain:
1. Why this asset type (FT/NFT/SFT/HYBRID) fits the project
2. How the Stack formation enhances the asset
3. The relationship between HACD lots and asset units
4. Any special features (e.g., per-lot identity NFTs for HYBRID)
5. How removal affects the asset
`,

  // 12. X Thread Generator
  xThreadGenerator: (spec: any) => `
Generate an X (Twitter) thread for ${spec.project.name} (${spec.project.ticker}).

Project: ${spec.project.name} (${spec.project.ticker})
Headline: ${spec.copy.headline}
Description: ${spec.copy.short_description}
Launch Date: ${spec.launch.target_date_utc}

${ECOSYSTEM}

Generate a 5-8 tweet thread that:
1. Hooks readers with the project concept
2. Explains the problem being solved
3. Introduces HACD Stack Protocol
4. Describes the utility and participation
5. Provides launch details
6. Includes call-to-action
7. Uses hashtags

Keep each tweet under 280 characters. Number them 1/N.
`,

  // 13. Issuer Intake
  issuerIntake: () => `
Generate a 40-field intake form for HACD Stack Token issuance.

${ECOSYSTEM}

Create intake form sections:
1. Project Basics (name, ticker, category, description, website, X, Discord, Telegram, contact)
2. Team (founder name, background, team size, composition, location, prior experience, GitHub, LinkedIn)
3. Asset (type, total supply, decimals, unit name, utility summary, utility at launch, utility roadmap)
4. Stack (total HACD lots, HACD per lot, units per lot, stack cost, phase lots, removal effect)
5. Launch (target date, phase model, min/max HACD per participant)
6. Market (target audience, competitive landscape, differentiation, go-to-market)
7. Risk (risk factors, mitigation strategies, legal considerations)
8. Legal (jurisdiction, legal review required, compliance notes)

Return as a structured form with field labels and descriptions.
`,
};
