import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});

// Stricter limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later',
      retryAfter: 900
    });
  }
});

// Stricter limiter for backtest (computationally expensive)
export const backtestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 backtests per hour per IP
  message: {
    success: false,
    message: 'Backtest limit reached. Please try again later or upgrade your plan.'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Backtest limit reached for this hour. Please try again later.',
      retryAfter: 3600
    });
  }
});

// Light limiter for public routes
export const publicRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  message: {
    success: false,
    message: 'Rate limit exceeded'
  }
});

// Create custom limiter factory
export const createCustomLimiter = (maxRequests: number, windowMinutes: number) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      message: `Too many requests. Limit: ${maxRequests} per ${windowMinutes} minutes`
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        retryAfter: windowMinutes * 60
      });
    }
  });
};
