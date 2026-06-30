import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Backtest from '../models/Backtest';
import { BacktestService } from '../services/BacktestService';
import { runRealBacktest } from '../services/RealBacktestEngine';

const backtestService = new BacktestService();

// Run a new backtest
export const runBacktest = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Convert userId (number from PostgreSQL) to string for MongoDB
    const userIdStr = String(userId);

    const { symbol, stockName, strategy, years, initialCapital } = req.body;

    // Try real NSE data engine first, fall back to mock if Yahoo Finance fails
    let results: any;
    let engineUsed = 'mock';
    try {
      results = await runRealBacktest(symbol, years, strategy, initialCapital);
      engineUsed = 'real';
      console.log(`✅ Real engine: ${symbol} ${strategy} (${results.candlesUsed} candles)`);
    } catch (realErr: any) {
      console.warn(`⚠️  Real engine failed (${realErr.message}) — falling back to mock engine`);
      results = await backtestService.runBacktest(symbol, years, strategy, initialCapital);
    }

    // Calculate additional metrics
    const netProfit = results.totalProfit - results.totalLoss;
    const roi = ((netProfit / initialCapital) * 100);
    const profitFactor = results.totalLoss > 0 ? results.totalProfit / results.totalLoss : 0;
    const avgProfitPerTrade = results.totalTrades > 0 ? netProfit / results.totalTrades : 0;
    const finalCapital = initialCapital + netProfit;

    // Count winning/losing trades
    const winningTrades = results.trades.filter((t: any) => t.pnl > 0).length;
    const losingTrades = results.trades.filter((t: any) => t.pnl < 0).length;

    // Save to database
    const backtest = new Backtest({
      userId: userIdStr,
      symbol: symbol.toUpperCase(),
      stockName: stockName || symbol,
      strategy,
      years,
      initialCapital,
      finalCapital,
      netProfit,
      roi,
      winRate: results.winRate,
      totalTrades: results.totalTrades,
      winningTrades,
      losingTrades,
      totalProfit: results.totalProfit,
      totalLoss: results.totalLoss,
      profitFactor,
      sharpeRatio: results.sharpeRatio,
      maxDrawdown: results.maxDrawdown,
      avgProfitPerTrade,
      equityCurve: results.equityCurve,
      trades: results.trades
    });

    await backtest.save();

    res.status(200).json({
      success: true,
      message: 'Backtest completed successfully',
      data: {
        ...results,
        netProfit,
        roi,
        profitFactor,
        avgProfitPerTrade,
        finalCapital,
        winningTrades,
        losingTrades,
        backtestId:  backtest._id,
        engineUsed,
        dataSource:  results.dataSource || 'Simulated (mock)',
      }
    });
  } catch (error) {
    console.error('Run backtest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run backtest',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user's backtest history
export const getBacktestHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Convert userId (number from PostgreSQL) to string for MongoDB
    const userIdStr = String(userId);

    const { limit = 20, page = 1, symbol, strategy } = req.query;

    // Build query
    const query: any = { userId: userIdStr };
    if (symbol) query.symbol = symbol.toString().toUpperCase();
    if (strategy) query.strategy = strategy;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const backtests = await Backtest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .select('-trades -equityCurve'); // Exclude large arrays for list view

    const total = await Backtest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        backtests,
        pagination: {
          total,
          page: parseInt(page as string),
          pages: Math.ceil(total / parseInt(limit as string)),
          limit: parseInt(limit as string)
        }
      }
    });
  } catch (error) {
    console.error('Get backtest history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backtest history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get single backtest details
export const getBacktestDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Convert userId (number from PostgreSQL) to string for MongoDB
    const userIdStr = String(userId);

    const { id } = req.params;

    const backtest = await Backtest.findOne({
      _id: id,
      userId: userIdStr
    });

    if (!backtest) {
      return res.status(404).json({
        success: false,
        message: 'Backtest not found'
      });
    }

    res.status(200).json({
      success: true,
      data: backtest
    });
  } catch (error) {
    console.error('Get backtest details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backtest details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a backtest
export const deleteBacktest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Convert userId (number from PostgreSQL) to string for MongoDB
    const userIdStr = String(userId);

    const { id } = req.params;

    const backtest = await Backtest.findOneAndDelete({
      _id: id,
      userId: userIdStr
    });

    if (!backtest) {
      return res.status(404).json({
        success: false,
        message: 'Backtest not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Backtest deleted successfully'
    });
  } catch (error) {
    console.error('Delete backtest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backtest',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get backtest statistics for user
export const getBacktestStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Convert userId (number from PostgreSQL) to string for MongoDB
    const userIdStr = String(userId);

    const stats = await Backtest.aggregate([
      { $match: { userId: userIdStr } },
      {
        $group: {
          _id: null,
          totalBacktests: { $sum: 1 },
          avgRoi: { $avg: '$roi' },
          avgWinRate: { $avg: '$winRate' },
          totalTrades: { $sum: '$totalTrades' },
          totalProfit: { $sum: '$netProfit' },
          bestStrategy: { $max: '$roi' }
        }
      }
    ]);

    // Get strategy breakdown
    const strategyStats = await Backtest.aggregate([
      { $match: { userId: userIdStr } },
      {
        $group: {
          _id: '$strategy',
          count: { $sum: 1 },
          avgRoi: { $avg: '$roi' },
          avgWinRate: { $avg: '$winRate' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {
          totalBacktests: 0,
          avgRoi: 0,
          avgWinRate: 0,
          totalTrades: 0,
          totalProfit: 0
        },
        byStrategy: strategyStats
      }
    });
  } catch (error) {
    console.error('Get backtest stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backtest statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Import mongoose for ObjectId
import mongoose from 'mongoose';
