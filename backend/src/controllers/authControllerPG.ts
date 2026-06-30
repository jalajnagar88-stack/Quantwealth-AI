import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { getPool } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, phoneNumber } = req.body;
    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check phone number if provided
    if (phoneNumber) {
      const existingPhone = await pool.query(
        'SELECT id FROM users WHERE phone_number = $1',
        [phoneNumber]
      );
      
      if (existingPhone.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone_number, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, email, first_name, last_name, is_email_verified, is_phone_verified`,
      [email.toLowerCase(), hashedPassword, firstName, lastName, phoneNumber]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to QuantWealth AI.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified,
          profile: user.profile,
          kycStatus: user.kyc_status
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, is_email_verified, is_phone_verified, profile, kyc_status, connected_brokers FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isEmailVerified: user.is_email_verified,
        isPhoneVerified: user.is_phone_verified,
        profile: user.profile,
        kycStatus: user.kyc_status,
        connectedBrokers: user.connected_brokers
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const pool = getPool();
    
    if (!pool) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed'
      });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'phoneNumber', 'profile'
    ];
    
    const updates: any = {};
    const values: any[] = [];
    let paramCount = 1;

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        const dbKey = key === 'firstName' ? 'first_name' : 
                      key === 'lastName' ? 'last_name' : 
                      key === 'phoneNumber' ? 'phone_number' : key;
        updates[dbKey] = req.body[key];
        values.push(req.body[key]);
        paramCount++;
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isEmailVerified: user.is_email_verified,
        isPhoneVerified: user.is_phone_verified,
        profile: user.profile,
        kycStatus: user.kyc_status
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Logout endpoint
export const logout = async (req: Request, res: Response) => {
  try {
    // For now, just return success - client-side token clearing is sufficient
    // TODO: Implement token blocklist with Redis for multi-instance support
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Placeholder for other auth functions
export const verifyOTP = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'OTP verification not implemented in PostgreSQL version' });
};

export const resendOTP = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'OTP resend not implemented in PostgreSQL version' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Forgot password not implemented in PostgreSQL version' });
};

export const resetPassword = async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Reset password not implemented in PostgreSQL version' });
};
