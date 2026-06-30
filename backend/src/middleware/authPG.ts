import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  userId: number;
  email?: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user still exists in PostgreSQL
    const pool = getPool();
    if (!pool) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }

    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.'
      });
    }

    const user = result.rows[0];

    // Attach user to request
    (req as any).user = {
      userId: decoded.userId,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Optional auth middleware - doesn't require auth but attaches user if token exists
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      const pool = getPool();
      if (pool) {
        const result = await pool.query(
          'SELECT id, email FROM users WHERE id = $1',
          [decoded.userId]
        );
        
        if (result.rows.length > 0) {
          const user = result.rows[0];
          (req as any).user = {
            userId: decoded.userId,
            email: user.email
          };
        }
      }
    }

    next();
  } catch (error) {
    // Continue without user
    next();
  }
};
