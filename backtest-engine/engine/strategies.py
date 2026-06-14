"""
Strategy engine — generates BUY/SELL signals from OHLCV data
and simulates trades with realistic transaction costs.

Transaction costs (realistic for Indian retail):
  - Brokerage: 0.03% per leg (Zerodha flat ₹20 capped)
  - STT: 0.1% on sell side
  - Exchange + SEBI: ~0.003%
  - Total round-trip: ~0.2%
"""

import pandas as pd
import numpy as np
from engine.indicators import rsi, macd, sma, ema, donchian_channel, atr

TRANSACTION_COST_PCT = 0.002  # 0.2% round-trip


def _apply_costs(price: float, qty: int, side: str) -> float:
    """Return net cash flow after transaction costs."""
    gross = price * qty
    cost  = gross * TRANSACTION_COST_PCT / 2  # half per leg
    return gross - cost if side == "sell" else gross + cost


def run_strategy(df: pd.DataFrame, strategy: str, initial_capital: float) -> list:
    """
    Dispatch to the correct strategy and return a list of completed trades.
    Each trade dict: entry_date, exit_date, entry_price, exit_price,
                     shares, pnl, pnl_pct, side
    """
    strategy_map = {
        "RSI":         _rsi_strategy,
        "MACD":        _macd_strategy,
        "MA_CROSSOVER": _ma_crossover_strategy,
        "BREAKOUT":    _breakout_strategy,
    }
    fn = strategy_map.get(strategy)
    if fn is None:
        raise ValueError(f"Unknown strategy: {strategy}")
    return fn(df, initial_capital)


def _rsi_strategy(df: pd.DataFrame, capital: float) -> list:
    """
    Classic RSI mean-reversion:
      BUY  when RSI crosses below 30 (oversold)
      SELL when RSI crosses above 70 (overbought) or RSI > 65 after entry
    """
    close  = df["Close"]
    rs     = rsi(close, period=14)
    trades = []
    position = None

    for i in range(1, len(df)):
        price = float(close.iloc[i])
        date  = df.index[i]

        if position is None:
            # Entry: RSI crosses below 30
            if rs.iloc[i - 1] >= 30 and rs.iloc[i] < 30:
                shares = int(capital * 0.95 / price)
                if shares > 0:
                    position = {"entry_date": date, "entry_price": price, "shares": shares}
        else:
            # Exit: RSI crosses above 70, or stop-loss -5%
            stop_loss = position["entry_price"] * 0.95
            take_profit_rsi = rs.iloc[i] >= 70
            stop_hit = price <= stop_loss

            if take_profit_rsi or stop_hit:
                pnl = (price - position["entry_price"]) * position["shares"]
                pnl -= abs(position["entry_price"] * position["shares"] * TRANSACTION_COST_PCT)
                trades.append({
                    "entry_date":  position["entry_date"].strftime("%Y-%m-%d"),
                    "exit_date":   date.strftime("%Y-%m-%d"),
                    "entry_price": round(position["entry_price"], 2),
                    "exit_price":  round(price, 2),
                    "shares":      position["shares"],
                    "pnl":         round(pnl, 2),
                    "pnl_pct":     round((price / position["entry_price"] - 1) * 100, 2),
                    "exit_reason": "RSI_OVERBOUGHT" if take_profit_rsi else "STOP_LOSS",
                })
                position = None

    return trades


def _macd_strategy(df: pd.DataFrame, capital: float) -> list:
    """
    MACD crossover:
      BUY  when MACD line crosses above signal line (bullish crossover)
      SELL when MACD line crosses below signal line (bearish crossover)
    """
    close = df["Close"]
    macd_line, signal_line, _ = macd(close)
    trades = []
    position = None

    for i in range(1, len(df)):
        price = float(close.iloc[i])
        date  = df.index[i]

        bullish_cross = macd_line.iloc[i - 1] < signal_line.iloc[i - 1] and macd_line.iloc[i] >= signal_line.iloc[i]
        bearish_cross = macd_line.iloc[i - 1] > signal_line.iloc[i - 1] and macd_line.iloc[i] <= signal_line.iloc[i]

        if position is None and bullish_cross:
            shares = int(capital * 0.95 / price)
            if shares > 0:
                position = {"entry_date": date, "entry_price": price, "shares": shares}

        elif position is not None and (bearish_cross or price <= position["entry_price"] * 0.93):
            pnl = (price - position["entry_price"]) * position["shares"]
            pnl -= abs(position["entry_price"] * position["shares"] * TRANSACTION_COST_PCT)
            trades.append({
                "entry_date":  position["entry_date"].strftime("%Y-%m-%d"),
                "exit_date":   date.strftime("%Y-%m-%d"),
                "entry_price": round(position["entry_price"], 2),
                "exit_price":  round(price, 2),
                "shares":      position["shares"],
                "pnl":         round(pnl, 2),
                "pnl_pct":     round((price / position["entry_price"] - 1) * 100, 2),
                "exit_reason": "MACD_CROSS" if bearish_cross else "STOP_LOSS",
            })
            position = None

    return trades


def _ma_crossover_strategy(df: pd.DataFrame, capital: float) -> list:
    """
    Golden/Death Cross:
      BUY  when 50-day SMA crosses above 200-day SMA (Golden Cross)
      SELL when 50-day SMA crosses below 200-day SMA (Death Cross)
    """
    close  = df["Close"]
    ma50   = sma(close, 50)
    ma200  = sma(close, 200)
    trades = []
    position = None

    for i in range(1, len(df)):
        price = float(close.iloc[i])
        date  = df.index[i]

        if pd.isna(ma200.iloc[i]):
            continue

        golden_cross = ma50.iloc[i - 1] < ma200.iloc[i - 1] and ma50.iloc[i] >= ma200.iloc[i]
        death_cross  = ma50.iloc[i - 1] > ma200.iloc[i - 1] and ma50.iloc[i] <= ma200.iloc[i]

        if position is None and golden_cross:
            shares = int(capital * 0.95 / price)
            if shares > 0:
                position = {"entry_date": date, "entry_price": price, "shares": shares}

        elif position is not None and death_cross:
            pnl = (price - position["entry_price"]) * position["shares"]
            pnl -= abs(position["entry_price"] * position["shares"] * TRANSACTION_COST_PCT)
            trades.append({
                "entry_date":  position["entry_date"].strftime("%Y-%m-%d"),
                "exit_date":   date.strftime("%Y-%m-%d"),
                "entry_price": round(position["entry_price"], 2),
                "exit_price":  round(price, 2),
                "shares":      position["shares"],
                "pnl":         round(pnl, 2),
                "pnl_pct":     round((price / position["entry_price"] - 1) * 100, 2),
                "exit_reason": "DEATH_CROSS",
            })
            position = None

    return trades


def _breakout_strategy(df: pd.DataFrame, capital: float) -> list:
    """
    Donchian Channel Breakout (turtle trading):
      BUY  when price breaks above 20-day high
      SELL when price drops below 10-day low (exit channel)
    ATR-based position sizing for risk management.
    """
    close   = df["Close"]
    high    = df["High"]
    low     = df["Low"]
    dc_u, _, dc_l = donchian_channel(high, low, period=20)
    dc_exit, _, _ = donchian_channel(high, low, period=10)
    at = atr(high, low, close, period=14)
    trades  = []
    position = None

    for i in range(1, len(df)):
        price = float(close.iloc[i])
        date  = df.index[i]

        if pd.isna(dc_u.iloc[i]) or pd.isna(at.iloc[i]):
            continue

        breakout_up   = price > float(dc_u.iloc[i - 1])
        breakdown_low = price < float(dc_exit.iloc[i - 1])

        if position is None and breakout_up:
            # ATR-based position sizing: risk 1% of capital per trade
            risk_per_share = float(at.iloc[i]) * 2
            if risk_per_share > 0:
                shares = int((capital * 0.01) / risk_per_share)
                shares = min(shares, int(capital * 0.95 / price))
            else:
                shares = int(capital * 0.95 / price)

            if shares > 0:
                position = {
                    "entry_date":  date,
                    "entry_price": price,
                    "shares":      shares,
                    "stop_loss":   price - 2 * float(at.iloc[i])
                }

        elif position is not None and (breakdown_low or price <= position["stop_loss"]):
            pnl = (price - position["entry_price"]) * position["shares"]
            pnl -= abs(position["entry_price"] * position["shares"] * TRANSACTION_COST_PCT)
            trades.append({
                "entry_date":  position["entry_date"].strftime("%Y-%m-%d"),
                "exit_date":   date.strftime("%Y-%m-%d"),
                "entry_price": round(position["entry_price"], 2),
                "exit_price":  round(price, 2),
                "shares":      position["shares"],
                "pnl":         round(pnl, 2),
                "pnl_pct":     round((price / position["entry_price"] - 1) * 100, 2),
                "exit_reason": "DONCHIAN_EXIT" if breakdown_low else "STOP_LOSS",
            })
            position = None

    return trades
