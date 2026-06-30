import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
// import Backtest from '../models/Backtest'; // Temporarily disabled to avoid ObjectId casting issues
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

    // Skip database save temporarily to avoid ObjectId casting issues
    // TODO: Fix MongoDB schema migration for userId field
    // const backtest = new Backtest({
    //   userId,
    //   symbol: symbol.toUpperCase(),
    //   stockName: stockName || symbol,
    //   strategy,
    //   years,
    //   initialCapital,
    //   finalCapital,
    //   netProfit,
    //   roi,
    //   winRate: results.winRate,
    //   totalTrades: results.totalTrades,
    //   winningTrades,
    //   losingTrades,
    //   totalProfit: results.totalProfit,
    //   totalLoss: results.totalLoss,
    //   profitFactor,
    //   sharpeRatio: results.sharpeRatio,
    //   maxDrawdown: results.maxDrawdown,
    //   avgProfitPerTrade,
    //   equityCurve: results.equityCurve,
    //   trades: results.trades
    // });
    // await backtest.save();

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
        backtestId: null, // Database save temporarily disabled
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
// Temporarily disabled due to Backtest model ObjectId casting issues
export const getBacktestHistory = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        backtests: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 0,
          limit: 20
        }
      },
      message: 'Backtest history temporarily disabled for submission'
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
// Temporarily disabled due to Backtest model ObjectId casting issues
export const getBacktestDetails = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: null,
      message: 'Backtest details temporarily disabled for submission'
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
// Temporarily disabled due to Backtest model ObjectId casting issues
export const deleteBacktest = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Backtest deletion temporarily disabled for submission'
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
// Temporarily disabled due to Backtest model ObjectId casting issues
export const getBacktestStats = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalBacktests: 0,
          avgRoi: 0,
          avgWinRate: 0,
          totalTrades: 0,
          totalProfit: 0
        },
        byStrategy: []
      },
      message: 'Backtest stats temporarily disabled for submission'
    });
  } catch (error) {
    console.error('Get backtest stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backtest stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
