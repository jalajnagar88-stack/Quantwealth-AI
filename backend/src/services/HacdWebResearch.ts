import axios from 'axios';
import { HACD_PROMPTS } from '../constants/HacdPrompts';

export interface ResearchResult {
  query: string;
  findings: string;
  sources: string[];
  timestamp: string;
}

// Web research mode for live HACD ecosystem data
export async function performWebResearch(query: string): Promise<ResearchResult> {
  const VIRTUALS_BASE_URL = process.env.VIRTUALS_BASE_URL || 'https://compute.virtuals.io/v1';
  const VIRTUALS_API_KEY = process.env.VIRTUALS_API_KEY || '';
  const VIRTUALS_MODEL = process.env.VIRTUALS_MODEL || 'gemini-3-flash-preview';
  
  if (!VIRTUALS_API_KEY) {
    throw new Error('VIRTUALS_API_KEY not set');
  }

  const prompt = HACD_PROMPTS.webResearch(query);

  const response = await axios.post(
    `${VIRTUALS_BASE_URL}/chat/completions`,
    {
      model: VIRTUALS_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a HACD ecosystem researcher. Use web search to find current data. Return findings with sources and dates.',
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

  return {
    query,
    findings: content,
    sources: [],
    timestamp: new Date().toISOString(),
  };
}

// Quick research helpers for common queries
export async function researchHACPrice(): Promise<ResearchResult> {
  return performWebResearch('current HAC price and market data');
}

export async function researchRecentLaunches(): Promise<ResearchResult> {
  return performWebResearch('recent HACD Stack Token launches on hacd.it/launchpad');
}

export async function researchCommunitySentiment(): Promise<ResearchResult> {
  return performWebResearch('Hacash community sentiment and recent discussions');
}
