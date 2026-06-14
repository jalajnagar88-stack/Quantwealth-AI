"""
Trade Brief Scanner
Scans a watchlist of NSE stocks and finds high-conviction setups.
Returns entry zone, SL, target, position sizing, and conviction data.
"""
import asyncio
from typing import List, Dict, Any
import numpy as np
import pandas as pd
from .data_fetcher import fetch_ohlcv
from .indicators import rsi as compute_rsi, macd as compute_macd, atr as compute_atr, sma as compute_sma, donchian_channel

NIFTY50_WATCHLIST = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
    "HINDUNILVR", "ITC", "SBIN", "BHARTIARTL", "KOTAKBANK",
    "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "TITAN",
    "SUNPHARMA", "ULTRACEMCO", "BAJFINANCE", "WIPRO", "ONGC",
    "NTPC", "POWERGRID", "TATAMOTORS", "TATASTEEL", "JSWSTEEL",
    "ADANIENT", "ADANIPORTS", "TECHM", "HCLTECH", "M&M",
    "BAJAJFINSV", "NESTLEIND", "DRREDDY", "DIVISLAB", "CIPLA",
    "EICHERMOT", "HEROMOTOCO", "BPCL", "COALINDIA", "GRASIM",
    "HINDALCO", "INDUSINDBK", "BRITANNIA", "APOLLOHOSP", "TATACONSUM",
    "LTIM", "SBILIFE", "HDFCLIFE", "UPL", "VEDL"
]


def _detect_setup(df: pd.DataFrame, mode: str) -> Dict[str, Any] | None:
    """
    Returns setup dict if a tradeable pattern is detected, else None.
    mode: 'intraday' | 'swing'
    """
    if len(df) < 50:
        return None

    close = df["Close"]
    high  = df["High"]
    low   = df["Low"]

    rsi_s        = compute_rsi(close, 14)
    macd_line, signal_line, _ = compute_macd(close)
    atr_s        = compute_atr(high, low, close, 14)
    sma50        = compute_sma(close, 50)
    sma20        = compute_sma(close, 20)
    dc_upper, _, dc_lower = donchian_channel(high, low, 20)

    rsi   = rsi_s.values
    macd_line   = macd_line.values
    signal_line = signal_line.values
    atr   = atr_s.values
    sma50 = sma50.values
    sma20 = sma20.values
    dc_upper = dc_upper.values
    dc_lower = dc_lower.values

    close = close.values

    last_close = close[-1]
    last_rsi   = rsi[-1]
    last_atr   = atr[-1]
    if np.isnan(last_rsi) or np.isnan(last_atr) or np.isnan(sma50[-1]):
        return None

    setups = []

    # ── Setup 1: RSI Oversold Bounce ──────────────────────────────
    if last_rsi < 35 and last_close > sma50[-1] * 0.95:
        # Count historical occurrences for win rate
        hits = np.sum(rsi[:-1] < 35)
        wins = 0
        for i in range(14, len(rsi) - 5):
            if rsi[i] < 35:
                future_return = (close[i + 5] - close[i]) / close[i]
                if future_return > 0:
                    wins += 1
        win_rate = (wins / hits * 100) if hits > 0 else 55.0

        entry  = round(last_close * 1.002, 1)
        sl     = round(last_close - 1.5 * last_atr, 1)
        target = round(last_close + 2.5 * last_atr, 1) if mode == "swing" else round(last_close + 1.2 * last_atr, 1)
        rr     = round((target - entry) / max(entry - sl, 0.01), 2)

        if rr >= 1.5:
            setups.append({
                "setup_name": "RSI Oversold Bounce",
                "conviction": "HIGH" if last_rsi < 28 else "MEDIUM",
                "entry": entry,
                "stop_loss": sl,
                "target": target,
                "rr_ratio": rr,
                "win_rate": round(win_rate, 1),
                "sample_trades": int(hits),
                "rsi": round(float(last_rsi), 1),
                "atr": round(float(last_atr), 1),
                "reasoning_data": {
                    "rsi": round(float(last_rsi), 1),
                    "sma50_distance_pct": round((last_close / sma50[-1] - 1) * 100, 2),
                    "atr": round(float(last_atr), 2),
                    "setup": "RSI oversold",
                }
            })

    # ── Setup 2: MACD Bullish Crossover ───────────────────────────
    if (macd_line[-2] < signal_line[-2] and macd_line[-1] > signal_line[-1]
            and macd_line[-1] < 0):
        hits = 0
        wins = 0
        for i in range(1, len(macd_line) - 8):
            if macd_line[i-1] < signal_line[i-1] and macd_line[i] > signal_line[i] and macd_line[i] < 0:
                hits += 1
                horizon = 8 if mode == "swing" else 2
                future_return = (close[i + horizon] - close[i]) / close[i]
                if future_return > 0:
                    wins += 1
        win_rate = (wins / hits * 100) if hits > 0 else 52.0

        entry  = round(last_close * 1.003, 1)
        sl     = round(last_close - 1.2 * last_atr, 1)
        target = round(last_close + 2.2 * last_atr, 1) if mode == "swing" else round(last_close + 1.0 * last_atr, 1)
        rr     = round((target - entry) / max(entry - sl, 0.01), 2)

        if rr >= 1.5:
            setups.append({
                "setup_name": "MACD Bullish Crossover",
                "conviction": "HIGH" if macd_line[-1] > -0.5 else "MEDIUM",
                "entry": entry,
                "stop_loss": sl,
                "target": target,
                "rr_ratio": rr,
                "win_rate": round(win_rate, 1),
                "sample_trades": int(hits),
                "rsi": round(float(last_rsi), 1),
                "atr": round(float(last_atr), 1),
                "reasoning_data": {
                    "macd": round(float(macd_line[-1]), 3),
                    "signal": round(float(signal_line[-1]), 3),
                    "rsi": round(float(last_rsi), 1),
                    "setup": "MACD bullish crossover below zero line",
                }
            })

    # ── Setup 3: Donchian Breakout ─────────────────────────────────
    if last_close > dc_upper[-2] and last_rsi < 70:
        hits = 0
        wins = 0
        for i in range(20, len(close) - 8):
            if close[i] > dc_upper[i-1]:
                hits += 1
                horizon = 10 if mode == "swing" else 1
                future_return = (close[min(i + horizon, len(close)-1)] - close[i]) / close[i]
                if future_return > 0:
                    wins += 1
        win_rate = (wins / hits * 100) if hits > 0 else 54.0

        entry  = round(last_close * 1.001, 1)
        sl     = round(dc_upper[-2] * 0.99, 1)
        target = round(last_close + 3.0 * last_atr, 1) if mode == "swing" else round(last_close + 1.5 * last_atr, 1)
        rr     = round((target - entry) / max(entry - sl, 0.01), 2)

        if rr >= 1.5:
            setups.append({
                "setup_name": "Donchian Breakout",
                "conviction": "HIGH",
                "entry": entry,
                "stop_loss": sl,
                "target": target,
                "rr_ratio": rr,
                "win_rate": round(win_rate, 1),
                "sample_trades": int(hits),
                "rsi": round(float(last_rsi), 1),
                "atr": round(float(last_atr), 1),
                "reasoning_data": {
                    "breakout_level": round(float(dc_upper[-2]), 1),
                    "rsi": round(float(last_rsi), 1),
                    "atr": round(float(last_atr), 2),
                    "setup": "20-day Donchian channel breakout",
                }
            })

    if not setups:
        return None

    # Return highest R:R setup
    best = max(setups, key=lambda s: s["rr_ratio"])
    best["last_close"] = round(float(last_close), 1)
    return best


def _calc_position_size(capital: float, max_risk: float, entry: float, sl: float) -> Dict:
    risk_per_share = max(entry - sl, 0.01)
    max_loss_rupees = capital * (max_risk / 100)
    qty = int(max_loss_rupees / risk_per_share)
    qty = max(qty, 1)
    capital_used = round(qty * entry, 2)
    actual_risk  = round(qty * risk_per_share, 2)
    potential_profit = 0  # filled by caller
    return {
        "qty": qty,
        "capital_used": capital_used,
        "capital_used_pct": round(capital_used / capital * 100, 1),
        "risk_amount": actual_risk,
        "risk_pct": round(actual_risk / capital * 100, 2),
    }


async def scan_stocks(
    capital: float,
    max_risk_pct: float,
    mode: str,
    years: int = 2,
    top_n: int = 3,
) -> List[Dict]:
    """
    Scan NIFTY50_WATCHLIST concurrently, detect setups, return top_n by conviction + R:R.
    """
    async def _process(symbol: str):
        try:
            df = await fetch_ohlcv(symbol, years)
            if df is None or len(df) < 60:
                return None
            setup = _detect_setup(df, mode)
            if setup is None:
                return None
            sizing = _calc_position_size(capital, max_risk_pct, setup["entry"], setup["stop_loss"])
            setup["symbol"] = symbol
            setup["sizing"] = sizing
            setup["potential_profit"] = round(
                sizing["qty"] * (setup["target"] - setup["entry"]), 2
            )
            return setup
        except Exception:
            return None

    tasks = [_process(sym) for sym in NIFTY50_WATCHLIST]
    results = await asyncio.gather(*tasks)

    found = [r for r in results if r is not None]

    # Sort: HIGH conviction first, then by R:R
    conviction_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    found.sort(key=lambda s: (conviction_order.get(s["conviction"], 2), -s["rr_ratio"]))

    return found[:top_n]
