import axios from 'axios';
import { IHacdLaunchSpec, AssetType, ProjectCategory } from '../models/HacdLaunchSpec';

const VIRTUALS_BASE_URL = process.env.VIRTUALS_BASE_URL || 'https://compute.virtuals.io/v1';
const VIRTUALS_API_KEY = process.env.VIRTUALS_API_KEY || '';
const VIRTUALS_MODEL = process.env.VIRTUALS_MODEL || 'gemini-3-flash-preview';

// HACD Ecosystem knowledge — from ECOSYSTEM.md
const HACD_ECOSYSTEM_CONTEXT = `
# Hacash Ecosystem — Canonical Facts

## The Three PoW Coins
- HAC — primary currency, divisible to 10^248, used for Stack costs and network fees
- HACD — PoW NFT/asset container, 16^6 = 16,777,216 possible combinations, indivisible
- BTC — one-way transferable from Bitcoin to Hacash with HAC compensation

## HACD Stack Protocol Mechanics
- 1 HACD = 1 Stack lot (standard)
- Stack cost paid in HAC per HACD
- Removing Stack releases HACD but burns/disables the asset
- Formation confirms on Hacash mainnet (~5 minutes)
- Up to 200 HACD names per Launchpad transaction

## Math Rules (enforced by validator)
total_supply = total_hacd_lots × units_per_hacd_lot
formation_cost_hac = total_hacd_lots × stack_cost_hac_per_hacd
phase lots = first_phase_hacd_lots + public_phase_hacd_lots == total_hacd_lots

## Stack Cost Benchmarks
- Low/high participation: 10–50 HAC per HACD
- Mid/community: 50–100 HAC per HACD (Carat sits at 100)
- Premium/art/limited: 100–500 HAC per HACD

## Asset Types
FT (Fungible Token) · NFT (Non-Fungible Token) · SFT (Semi-Fungible Token) · HYBRID (combined)

## Live Reference: Carat Protocol (CARAT)
- Stack 1 HACD → receive 16,777,216 CARAT
- Stack cost: 100 HAC per HACD
- Links: hacd.it/collection/carat · caratprotocol.com/launchpad

## Official Links
- Launchpad: hacd.it/launchpad
- Incubator: hacd.it/incubator
- Wallet: wallet.hacash.org
- Explorer: explorer.hacash.org
- White Paper: hacd.it/hacash_diamond.pdf

## Thesis
Bitcoin proved PoW for money. HACD brings PoW to assets. Stack Assets are *formed*, not merely *deployed*.
`;

// Generate a single document using Virtuals API
async function generateDocument(prompt: string): Promise<string> {
  if (!VIRTUALS_API_KEY) {
    throw new Error('VIRTUALS_API_KEY not set');
  }

  const response = await axios.post(
    `${VIRTUALS_BASE_URL}/chat/completions`,
    {
      model: VIRTUALS_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a HACD Stack Token issuance expert. You know the full Hacash ecosystem, the correct terminology, the supply math rules, and every safety check required before a project can go live on the Launchpad.

${HACD_ECOSYSTEM_CONTEXT}

Your output must be:
- Factually accurate per the ecosystem context above
- Mathematically precise (supply equations must be correct)
- Copy-safe (no price guarantees, investment advice, or risk-free claims)
- Professional and concise
- In Markdown format`,
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${VIRTUALS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data?.choices?.[0]?.message?.content || '';
}

// Generate all 8 documents for a launch spec
export async function generateAllDocuments(spec: IHacdLaunchSpec): Promise<Record<string, string>> {
  const docs: Record<string, string> = {};

  // 1. issuer_intake_form.md
  docs.issuer_intake_form = await generateDocument(`
Generate the issuer_intake_form.md for this Stack Token project:

Project: ${spec.project.name} (${spec.project.ticker})
Category: ${spec.project.category}
Description: ${spec.project.description}
Website: ${spec.project.website}
X: ${spec.project.x}
Contact: ${spec.project.contact}

Asset Type: ${spec.asset.type}
Total Supply: ${spec.asset.total_supply}
Utility: ${spec.asset.utility_summary}

Stack Configuration:
- Total HACD Lots: ${spec.stack.total_hacd_lots}
- HACD per Lot: ${spec.stack.hacd_per_lot}
- Units per HACD Lot: ${spec.stack.units_per_hacd_lot}
- Stack Cost: ${spec.stack.stack_cost_hac_per_hacd} HAC per HACD
- First Phase Lots: ${spec.stack.first_phase_hacd_lots}
- Public Phase Lots: ${spec.stack.public_phase_hacd_lots}
- Removal Effect: ${spec.stack.removal_effect}

Launch Details:
- Target Date: ${spec.launch.target_date_utc}
- Phase Model: ${spec.launch.phase_model}
- Min HACD per Participant: ${spec.launch.min_hacd_per_participant}
- Max HACD per Participant: ${spec.launch.max_hacd_per_participant}

Generate a complete issuer intake form with all 40+ fields filled based on this information. Include sections for:
1. Project Overview
2. Team Information
3. Asset Details
4. Stack Configuration
5. Launch Plan
6. Utility Roadmap
7. Risk Factors
8. Legal/Compliance
`);

  // 2. incubator_fit_review.md
  docs.incubator_fit_review = await generateDocument(`
Generate the incubator_fit_review.md for this project:

${spec.project.name} (${spec.project.ticker}) — ${spec.project.category}

Evaluate this project against the HACD Incubator Cohort 2 criteria:
1. PoW fit — does this genuinely need HACD or could it be a plain token?
2. Supply logic — is the math clean, consistent, and verifiable?
3. Utility clarity — is utility at launch honest and clearly separated from roadmap?
4. Copy safety — does all public copy avoid unsafe promises?
5. Team credibility — is the team identifiable and committed?

Provide a detailed review with scores (1-10) for each criterion, overall assessment, and recommendations.
`);

  // 3. project_profile.md
  docs.project_profile = await generateDocument(`
Generate the project_profile.md for ${spec.project.name} (${spec.project.ticker}).

Include:
- Executive summary
- Problem statement
- Solution
- Why HACD (PoW fit)
- Target audience
- Competitive landscape
- Team background
- Milestones
- References
`);

  // 4. stack_design.md
  docs.stack_design = await generateDocument(`
Generate the stack_design.md for ${spec.project.name} (${spec.project.ticker}).

Asset Type: ${spec.asset.type}
Total Supply: ${spec.asset.total_supply}
Decimals: ${spec.asset.decimals}
Unit Name: ${spec.asset.unit_name}

Stack Configuration:
- Total HACD Lots: ${spec.stack.total_hacd_lots}
- HACD per Lot: ${spec.stack.hacd_per_lot}
- Units per HACD Lot: ${spec.stack.units_per_hacd_lot}
- Stack Cost: ${spec.stack.stack_cost_hac_per_hacd} HAC per HACD
- Network Fee Required: ${spec.stack.network_fee_required}
- Designated Address: ${spec.stack.designated_address || 'N/A'}
- First Phase Lots: ${spec.stack.first_phase_hacd_lots}
- Public Phase Lots: ${spec.stack.public_phase_hacd_lots}
- Removal Effect: ${spec.stack.removal_effect}

Include:
- Tokenomics breakdown
- Supply equation verification
- Phase distribution rationale
- Formation cost calculation
- Removal mechanism explanation
- Any HYBRID structure details
`);

  // 5. launchpad_copy.md
  docs.launchpad_copy = await generateDocument(`
Generate the launchpad_copy.md for ${spec.project.name} (${spec.project.ticker}).

Headline: ${spec.copy.headline}
Subheadline: ${spec.copy.subheadline}
Short Description: ${spec.copy.short_description}
Risk Disclosure: ${spec.copy.risk_disclosure}

Generate complete Launchpad page copy including:
- Hero section
- About section
- Tokenomics section
- Utility section
- How to participate
- FAQ
- All copy must be copy-safe (no price guarantees or investment advice)
`);

  // 6. issuer_faq.md
  docs.issuer_faq = await generateDocument(`
Generate the issuer_faq.md for ${spec.project.name} (${spec.project.ticker}).

Include 10-15 common questions with answers:
- What is this project?
- Why HACD?
- How do I participate?
- What are the risks?
- What happens after launch?
- Team and roadmap questions
- Technical questions
- Legal/compliance questions
`);

  // 7. x_announcement.md
  docs.x_announcement = await generateDocument(`
Generate the x_announcement.md (Twitter/X thread) for ${spec.project.name} (${spec.project.ticker}).

Create a compelling 10-15 tweet thread announcing the launch:
- Hook tweet
- Problem/solution
- Why HACD matters
- Tokenomics highlight
- How to participate
- Call to action
- Hashtags: #HACD #Hacash #StackToken #${spec.project.ticker}
- Keep it under 280 chars per tweet
- No price guarantees or investment advice
`);

  // 8. review_checklist.md
  docs.review_checklist = await generateDocument(`
Generate the review_checklist.md for ${spec.project.name} (${spec.project.ticker}).

Create a comprehensive checklist covering:
- [ ] All 8 documents generated
- [ ] Supply math verified (total_supply = lots × units)
- [ ] Phase lots sum to total
- [ ] Formation cost calculated correctly
- [ ] All copy is copy-safe (no unsafe promises)
- [ ] Risk disclosure is substantive
- [ ] All numbers match across documents
- [ ] HACD ecosystem facts are accurate
- [ ] Team information complete
- [ ] Launchpad parameters verified
- [ ] Validator passes with no errors
`);

  return docs;
}

// Generate a single document on-demand
export async function generateSingleDocument(
  docType: string,
  spec: IHacdLaunchSpec
): Promise<string> {
  const prompts: Record<string, string> = {
    issuer_intake_form: `Generate issuer_intake_form.md for ${spec.project.name} (${spec.project.ticker})`,
    incubator_fit_review: `Generate incubator_fit_review.md for ${spec.project.name} (${spec.project.ticker})`,
    project_profile: `Generate project_profile.md for ${spec.project.name} (${spec.project.ticker})`,
    stack_design: `Generate stack_design.md for ${spec.project.name} (${spec.project.ticker})`,
    launchpad_copy: `Generate launchpad_copy.md for ${spec.project.name} (${spec.project.ticker})`,
    issuer_faq: `Generate issuer_faq.md for ${spec.project.name} (${spec.project.ticker})`,
    x_announcement: `Generate x_announcement.md for ${spec.project.name} (${spec.project.ticker})`,
    review_checklist: `Generate review_checklist.md for ${spec.project.name} (${spec.project.ticker})`,
  };

  const prompt = prompts[docType];
  if (!prompt) {
    throw new Error(`Unknown document type: ${docType}`);
  }

  return generateDocument(prompt);
}
