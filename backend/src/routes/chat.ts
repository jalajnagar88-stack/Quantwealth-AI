import express, { Router, Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();
router.use(authMiddleware);

const VIRTUALS_BASE_URL = process.env.VIRTUALS_BASE_URL || 'https://compute.virtuals.io/v1';
const VIRTUALS_API_KEY = process.env.VIRTUALS_API_KEY || '';
const VIRTUALS_MODEL = process.env.VIRTUALS_MODEL || 'gemini-3-flash-preview';

const SYSTEM_PROMPT = `You are QuantWealth AI, an expert trading assistant specialised in the Indian stock market (NSE/BSE). You have deep knowledge of:
- Indian equities: Nifty 50, Sensex, sectoral indices
- Technical analysis: RSI, MACD, Bollinger Bands, Moving Averages, Volume analysis
- Fundamental analysis: P/E, EV/EBITDA, ROE, debt ratios
- Indian market microstructure: FII/DII flows, SEBI regulations, F&O expiry dynamics
- Macro factors: RBI monetary policy, rupee dynamics, crude oil impact on Indian markets
- Popular Indian stocks: Reliance, TCS, HDFC Bank, Infosys, ICICI Bank, SBI, Bharti Airtel, ITC, etc.

Rules:
- Always add a short SEBI disclaimer when giving specific buy/sell advice
- Format responses with clear sections using **bold** headers when helpful
- Keep responses concise and actionable — max 300 words unless a detailed breakdown is asked
- Use INR (₹) for price references
- When you don't have real-time data, say so and give general analytical frameworks instead`;

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!VIRTUALS_API_KEY) {
      return res.status(200).json({
        success: true,
        data: {
          reply: `I'm QuantWealth AI. To enable AI responses, set **VIRTUALS_API_KEY** in your environment variables.`,
          model: 'fallback'
        }
      });
    }

    // Build OpenAI-compatible messages array
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (max last 10 turns)
    history.slice(-10).forEach((h: { role: string; content: string }) => {
      messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content });
    });

    // Add current user message
    messages.push({ role: 'user', content: message });

    const response = await axios.post(`${VIRTUALS_BASE_URL}/chat/completions`, {
      model: VIRTUALS_MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${VIRTUALS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 25000,
    });

    const reply = response.data?.choices?.[0]?.message?.content || 'No response generated.';

    res.status(200).json({
      success: true,
      data: { reply, model: VIRTUALS_MODEL }
    });
  } catch (error: any) {
    const errMsg = error?.response?.data?.error?.message || error?.message || 'Failed to get AI response';
    console.error('Chat error:', errMsg);
    res.status(500).json({
      success: false,
      message: errMsg
    });
  }
});

export default router;
