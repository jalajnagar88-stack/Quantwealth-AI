import express, { Router, Request, Response } from 'express';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();
router.use(authMiddleware);

const PYTHON_ENGINE = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

async function buildGeminiReasoning(setup: any, mode: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    return `${setup.setup_name} detected on ${setup.symbol}. Entry zone ₹${setup.entry}, stop loss ₹${setup.stop_loss}, target ₹${setup.target}. Historical win rate: ${setup.win_rate}% across ${setup.sample_trades} similar setups.`;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a professional Indian stock market analyst. Write a concise, confident 3-4 sentence trade reasoning for this setup. Be specific about the technical pattern and why it's worth trading. Do NOT use disclaimers. Write as if briefing a busy trader.

Stock: ${setup.symbol}
Setup: ${setup.setup_name}
Mode: ${mode} trade
Last Close: ₹${setup.last_close}
Entry Zone: ₹${setup.entry}
Stop Loss: ₹${setup.stop_loss} (risk: ₹${(setup.entry - setup.stop_loss).toFixed(0)}/share)
Target: ₹${setup.target} (reward: ₹${(setup.target - setup.entry).toFixed(0)}/share)
R:R Ratio: 1:${setup.rr_ratio}
Historical Win Rate: ${setup.win_rate}% over ${setup.sample_trades} trades
Technical data: ${JSON.stringify(setup.reasoning_data)}

Write the reasoning now (3-4 sentences max):`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `${setup.setup_name} on ${setup.symbol} — entry at ₹${setup.entry}, SL at ₹${setup.stop_loss}, target ₹${setup.target}. Win rate ${setup.win_rate}% over ${setup.sample_trades} historical setups.`;
  }
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      capital = 100000,
      max_risk_pct = 5,
      mode = 'swing',
    } = req.body;

    // 1. Call Python scanner
    const pyRes = await axios.post(`${PYTHON_ENGINE}/trade-brief`, {
      capital,
      max_risk_pct,
      mode,
      top_n: 3,
    }, { timeout: 120000 });

    const { setups, setups_found } = pyRes.data;

    if (!setups_found || setups.length === 0) {
      return res.json({
        success: true,
        data: {
          mode,
          capital,
          max_risk_pct,
          setups: [],
          message: 'No high-conviction setups found in current market conditions. Try again tomorrow or switch mode.',
        }
      });
    }

    // 2. Enrich each setup with Gemini AI reasoning (parallel)
    const enriched = await Promise.all(
      setups.map(async (setup: any) => {
        const reasoning = await buildGeminiReasoning(setup, mode);
        return { ...setup, ai_reasoning: reasoning };
      })
    );

    res.json({
      success: true,
      data: {
        mode,
        capital,
        max_risk_pct,
        setups_found,
        setups: enriched,
        generated_at: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    const isPythonDown = error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT';
    res.status(isPythonDown ? 503 : 500).json({
      success: false,
      message: isPythonDown
        ? 'Scanner engine is offline. Please try again in a moment.'
        : error?.response?.data?.detail || error?.message || 'Failed to generate trade brief',
    });
  }
});

export default router;
