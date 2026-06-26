import axios from 'axios';

const VIRTUALS_BASE_URL = process.env.VIRTUALS_BASE_URL || 'https://compute.virtuals.io/v1';
const VIRTUALS_API_KEY = process.env.VIRTUALS_API_KEY || '';
const VIRTUALS_MODEL = process.env.VIRTUALS_MODEL || 'gemini-3-flash-preview';

// Google Form answers (9 fields) → Full 40-field intake form
export interface GoogleFormAnswers {
  project_name: string;
  project_ticker: string;
  project_category: string;
  project_description: string;
  team_background: string;
  utility_at_launch: string;
  utility_roadmap: string;
  target_audience: string;
  risk_factors: string;
}

export interface IntakeForm {
  project: {
    name: string;
    ticker: string;
    category: string;
    description: string;
    website: string;
    x: string;
    discord: string;
    telegram: string;
    contact: string;
  };
  team: {
    founder_name: string;
    founder_background: string;
    team_size: number;
    team_composition: string;
    team_location: string;
    prior_experience: string;
    github_link: string;
    linkedin_link: string;
  };
  asset: {
    type: string;
    total_supply: number;
    decimals: number;
    unit_name: string;
    utility_summary: string;
    utility_at_launch: string;
    utility_roadmap: string;
  };
  stack: {
    total_hacd_lots: number;
    hacd_per_lot: number;
    units_per_hacd_lot: number;
    stack_cost_hac_per_hacd: number;
    first_phase_hacd_lots: number;
    public_phase_hacd_lots: number;
    removal_effect: string;
  };
  launch: {
    target_date_utc: string;
    phase_model: string;
    min_hacd_per_participant: number;
    max_hacd_per_participant: number | null;
  };
  market: {
    target_audience: string;
    competitive_landscape: string;
    differentiation: string;
    go_to_market: string;
  };
  risk: {
    risk_factors: string;
    mitigation_strategies: string;
    legal_considerations: string;
  };
  legal: {
    jurisdiction: string;
    legal_review_required: boolean;
    compliance_notes: string;
  };
}

export async function expandGoogleFormToIntake(answers: GoogleFormAnswers): Promise<IntakeForm> {
  if (!VIRTUALS_API_KEY) {
    throw new Error('VIRTUALS_API_KEY not set');
  }

  const prompt = `
You are a HACD Stack Token issuance expert. Expand these 9 Google Form answers into a complete 40-field intake form.

Google Form Answers:
1. Project Name: ${answers.project_name}
2. Project Ticker: ${answers.project_ticker}
3. Project Category: ${answers.project_category}
4. Project Description: ${answers.project_description}
5. Team Background: ${answers.team_background}
6. Utility at Launch: ${answers.utility_at_launch}
7. Utility Roadmap: ${answers.utility_roadmap}
8. Target Audience: ${answers.target_audience}
9. Risk Factors: ${answers.risk_factors}

Generate a complete intake form with these sections:
- Project (name, ticker, category, description, website, X, Discord, Telegram, contact)
- Team (founder name, background, team size, composition, location, prior experience, GitHub, LinkedIn)
- Asset (type, total supply, decimals, unit name, utility summary, utility at launch, utility roadmap)
- Stack (total HACD lots, HACD per lot, units per lot, stack cost, phase lots, removal effect)
- Launch (target date, phase model, min/max HACD per participant)
- Market (target audience, competitive landscape, differentiation, go-to-market)
- Risk (risk factors, mitigation strategies, legal considerations)
- Legal (jurisdiction, legal review required, compliance notes)

Return as JSON with the exact structure of IntakeForm interface.
`;

  const response = await axios.post(
    `${VIRTUALS_BASE_URL}/chat/completions`,
    {
      model: VIRTUALS_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a HACD Stack Token issuance expert. Return valid JSON only, no markdown.',
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

  const content = response.data?.choices?.[0]?.message?.content || '';
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from AI response');
  }

  return JSON.parse(jsonMatch[0]);
}
