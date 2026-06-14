"""
Performance metrics calculator.
Computes all standard quant metrics from a list of completed trades.
"""

import numpy as np
from typing import List, Dict, Any
import pandas as pd

RISK_FREE_RATE = 0.065  # RBI repo rate ~6.5%


def compute_metrics(trades: List[Dict], df: pd.DataFrame, initial_capital: float) -> Dict:
    if not trades:
        return _empty_metrics(initial_capital, df)

    pnls       = [t["pnl"]     for t in trades]
    pnl_pcts   = [t["pnl_pct"] for t in trades]
    wins       = [p for p in pnls if p > 0]
    losses     = [p for p in pnls if p <= 0]

    total_profit = sum(wins)
    total_loss   = abs(sum(losses))
    net_pnl      = sum(pnls)
    final_capital = initial_capital + net_pnl
    total_return_pct = (net_pnl / initial_capital) * 100

    win_rate = len(wins) / len(trades) * 100 if trades else 0

    # Max drawdown — compute from equity curve
    equity_curve = _build_equity_curve(trades, df, initial_capital)
    max_dd = _max_drawdown(equity_curve)

    # Annualised Sharpe ratio
    if len(pnl_pcts) > 1:
        daily_returns = np.array(pnl_pcts) / 100
        excess = daily_returns - (RISK_FREE_RATE / 252)
        sharpe = (np.mean(excess) / (np.std(excess) + 1e-9)) * np.sqrt(252)
        sharpe = round(float(sharpe), 2)
    else:
        sharpe = 0.0

    return {
        "final_capital":    round(final_capital, 2),
        "total_return_pct": round(total_return_pct, 2),
        "win_rate":         round(win_rate, 2),
        "total_trades":     len(trades),
        "winning_trades":   len(wins),
        "losing_trades":    len(losses),
        "max_drawdown":     round(max_dd, 2),
        "sharpe_ratio":     sharpe,
        "total_profit":     round(total_profit, 2),
        "total_loss":       round(total_loss, 2),
        "equity_curve":     equity_curve,
        "trades":           trades,
    }


def _build_equity_curve(trades: List[Dict], df: pd.DataFrame, initial_capital: float) -> List[Dict]:
    """Build an equity curve sampled at each trade exit."""
    curve = [{"date": df.index[0].strftime("%Y-%m-%d"), "value": initial_capital}]
    running = initial_capital
    for t in trades:
        running += t["pnl"]
        curve.append({"date": t["exit_date"], "value": round(running, 2)})
    return curve


def _max_drawdown(equity_curve: List[Dict]) -> float:
    if len(equity_curve) < 2:
        return 0.0
    values  = np.array([p["value"] for p in equity_curve])
    peak    = np.maximum.accumulate(values)
    dd      = (values - peak) / peak * 100
    return abs(float(dd.min()))


def _empty_metrics(initial_capital: float, df: pd.DataFrame) -> Dict:
    return {
        "final_capital":    initial_capital,
        "total_return_pct": 0.0,
        "win_rate":         0.0,
        "total_trades":     0,
        "winning_trades":   0,
        "losing_trades":    0,
        "max_drawdown":     0.0,
        "sharpe_ratio":     0.0,
        "total_profit":     0.0,
        "total_loss":       0.0,
        "equity_curve":     [{"date": df.index[0].strftime("%Y-%m-%d"), "value": initial_capital}],
        "trades":           [],
    }
