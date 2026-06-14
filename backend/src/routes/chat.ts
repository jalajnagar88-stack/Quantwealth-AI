import express, { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();
router.use(authMiddleware);

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      return res.status(200).json({
        success: true,
        data: {
          reply: `I'm QuantWealth AI. To enable real AI responses, add your **Google Gemini API key** to \`backend/.env\`:\n\n\`GEMINI_API_KEY=your-key-here\`\n\nGet a free key at: https://aistudio.google.com/apikey`,
          model: 'fallback'
        }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build Gemini chat history (max last 10 turns, exclude the current message)
    const chatHistory = history.slice(-10).map((h: { role: string; content: string }) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.status(200).json({
      success: true,
      data: { reply, model: 'gemini-1.5-flash' }
    });
  } catch (error: any) {
    console.error('Chat error:', error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to get AI response'
    });
  }
});

export default router;
