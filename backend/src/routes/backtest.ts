import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  runBacktest,
  getBacktestHistory,
  getBacktestDetails,
  deleteBacktest,
  getBacktestStats
} from '../controllers/backtestController';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Validation rules
const runBacktestValidation = [
  body('symbol')
    .notEmpty()
    .withMessage('Stock symbol is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Symbol must be between 1 and 20 characters'),
  body('strategy')
    .notEmpty()
    .withMessage('Strategy is required')
    .isIn(['RSI', 'MACD', 'MOVING_AVG', 'BREAKOUT'])
    .withMessage('Invalid strategy'),
  body('years')
    .notEmpty()
    .withMessage('Years is required')
    .isInt({ min: 1, max: 20 })
    .withMessage('Years must be between 1 and 20'),
  body('initialCapital')
    .notEmpty()
    .withMessage('Initial capital is required')
    .isInt({ min: 10000 })
    .withMessage('Initial capital must be at least 10000'),
  body('stockName')
    .optional()
    .isString()
    .withMessage('Stock name must be a string')
];

// Routes
router.post('/run', runBacktestValidation, runBacktest);
router.get('/history', getBacktestHistory);
router.get('/stats', getBacktestStats);
router.get('/:id', getBacktestDetails);
router.delete('/:id', deleteBacktest);

export default router;
