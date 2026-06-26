import axios from 'axios';
import { IHacdLaunchSpec } from '../models/HacdLaunchSpec';

export interface RoastResult {
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    fix: string;
  }>;
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
}

// Roast mode — self-review that finds every issue
export async function roastLaunchSpec(spec: IHacdLaunchSpec): Promise<RoastResult> {
  const VIRTUALS_BASE_URL = process.env.VIRTUALS_BASE_URL || 'https://compute.virtuals.io/v1';
  const VIRTUALS_API_KEY = process.env.VIRTUALS_API_KEY || '';
  const VIRTUALS_MODEL = process.env.VIRTUALS_MODEL || 'gemini-3-flash-preview';
  
  if (!VIRTUALS_API_KEY) {
    throw new Error('VIRTUALS_API_KEY not set');
  }

  const prompt = `
You are a harsh but fair HACD Stack Token reviewer. Roast this launch spec and find every issue.

Project: ${spec.project.name} (${spec.project.ticker})
Category: ${spec.project.category}
Description: ${spec.project.description}

Asset Type: ${spec.asset.type}
Total Supply: ${spec.asset.total_supply}
Utility: ${spec.asset.utility_summary}

Stack Configuration:
- Total HACD Lots: ${spec.stack.total_hacd_lots}
- Units per HACD Lot: ${spec.stack.units_per_hacd_lot}
- Stack Cost: ${spec.stack.stack_cost_hac_per_hacd} HAC per HACD
- First Phase Lots: ${spec.stack.first_phase_hacd_lots}
- Public Phase Lots: ${spec.stack.public_phase_hacd_lots}
- Removal Effect: ${spec.stack.removal_effect}

Launch Details:
- Target Date: ${spec.launch.target_date_utc}
- Phase Model: ${spec.launch.phase_model}

Copy:
- Headline: ${spec.copy.headline}
- Subheadline: ${spec.copy.subheadline}
- Short Description: ${spec.copy.short_description}
- Risk Disclosure: ${spec.copy.risk_disclosure}

Find issues in these categories:
1. Supply math (equation errors, phase sum errors)
2. Copy safety (price guarantees, investment advice, risk-free claims)
3. Utility clarity (vague utility, promises vs roadmap confusion)
4. PoW fit (could this be a plain token?)
5. Team credibility (missing contact info, no commitment)
6. Legal/compliance (missing risk disclosure, unsafe language)
7. Technical inconsistencies (numbers not matching across docs)

For each issue, provide:
- severity: critical/high/medium/low
- category: the category above
- issue: what's wrong
- fix: how to fix it

Return as JSON with this structure:
{
  "issues": [
    { "severity": "critical", "category": "supply_math", "issue": "...", "fix": "..." }
  ],
  "overall_grade": "A/B/C/D/F",
  "summary": "One sentence summary"
}

Be thorough. Find everything. Don't hold back.
`;

  const response = await axios.post(
    `${VIRTUALS_BASE_URL}/chat/completions`,
    {
      model: VIRTUALS_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a harsh HACD reviewer. Return valid JSON only, no markdown.',
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
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse JSON from AI response');
  }

  return JSON.parse(jsonMatch[0]);
}
