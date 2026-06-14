"""
QuantWealth AI — Python Backtest Microservice
Fetches real NSE data via yfinance, runs strategy simulations,
returns structured results to the Node.js API.

Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any
import logging

from engine.data_fetcher import fetch_ohlcv
from engine.strategies import run_strategy
from engine.metrics import compute_metrics
from engine.scanner import scan_stocks

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="QuantWealth Backtest Engine",
    version="1.0.0",
    description="Real NSE data backtest microservice"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class BacktestRequest(BaseModel):
    symbol: str                          # e.g. "TCS" — will be converted to "TCS.NS"
    years: int = 3                       # lookback period
    strategy: str = "RSI"               # RSI | MACD | MA_CROSSOVER | BREAKOUT
    initial_capital: float = 100000.0   # INR


class BacktestResponse(BaseModel):
    symbol: str
    strategy: str
    initial_capital: float
    final_capital: float
    total_return_pct: float
    win_rate: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    max_drawdown: float
    sharpe_ratio: float
    total_profit: float
    total_loss: float
    equity_curve: List[Any]
    trades: List[Any]
    data_source: str
    candles_used: int


@app.get("/health")
def health():
    return {"status": "ok", "service": "backtest-engine", "version": "1.0.0"}


@app.post("/backtest", response_model=BacktestResponse)
async def run_backtest(req: BacktestRequest):
    logger.info(f"Backtest request: {req.symbol} | {req.strategy} | {req.years}yr | ₹{req.initial_capital:,.0f}")

    if req.years < 1 or req.years > 10:
        raise HTTPException(400, "years must be between 1 and 10")
    if req.initial_capital < 10000:
        raise HTTPException(400, "initial_capital must be at least ₹10,000")
    if req.strategy not in ("RSI", "MACD", "MA_CROSSOVER", "BREAKOUT"):
        raise HTTPException(400, f"Unknown strategy: {req.strategy}. Choose from RSI, MACD, MA_CROSSOVER, BREAKOUT")

    # 1. Fetch real OHLCV data from Yahoo Finance (NSE suffix .NS)
    df = await fetch_ohlcv(req.symbol, req.years)
    if df is None or len(df) < 50:
        raise HTTPException(422, f"Insufficient data for {req.symbol}. Check symbol is a valid NSE ticker.")

    # 2. Run strategy — returns list of trade dicts
    trades = run_strategy(df, req.strategy, req.initial_capital)

    # 3. Compute performance metrics
    metrics = compute_metrics(trades, df, req.initial_capital)

    return BacktestResponse(
        symbol=req.symbol,
        strategy=req.strategy,
        initial_capital=req.initial_capital,
        data_source="Yahoo Finance (NSE)",
        candles_used=len(df),
        **metrics
    )


class TradeBriefRequest(BaseModel):
    capital: float = 100000.0
    max_risk_pct: float = 5.0      # % of capital max loss
    mode: str = "swing"            # "intraday" | "swing"
    top_n: int = 3


@app.post("/trade-brief")
async def trade_brief(req: TradeBriefRequest):
    if req.mode not in ("intraday", "swing"):
        raise HTTPException(400, "mode must be 'intraday' or 'swing'")
    if req.capital < 10000:
        raise HTTPException(400, "capital must be at least ₹10,000")
    if not (0.5 <= req.max_risk_pct <= 20):
        raise HTTPException(400, "max_risk_pct must be between 0.5 and 20")

    years = 1 if req.mode == "intraday" else 2
    logger.info(f"Trade brief: ₹{req.capital:,.0f} | risk {req.max_risk_pct}% | {req.mode}")

    setups = await scan_stocks(
        capital=req.capital,
        max_risk_pct=req.max_risk_pct,
        mode=req.mode,
        years=years,
        top_n=req.top_n,
    )

    return {
        "mode": req.mode,
        "capital": req.capital,
        "max_risk_pct": req.max_risk_pct,
        "setups_found": len(setups),
        "setups": setups,
    }


@app.get("/symbols")
async def list_symbols():
    """Return the supported NSE symbols for the frontend dropdown."""
    return {
        "symbols": [
            {"symbol": "TCS",        "name": "Tata Consultancy Services", "sector": "IT"},
            {"symbol": "INFY",       "name": "Infosys",                   "sector": "IT"},
            {"symbol": "WIPRO",      "name": "Wipro",                     "sector": "IT"},
            {"symbol": "HCLTECH",    "name": "HCL Technologies",          "sector": "IT"},
            {"symbol": "RELIANCE",   "name": "Reliance Industries",       "sector": "Energy"},
            {"symbol": "ONGC",       "name": "ONGC",                      "sector": "Energy"},
            {"symbol": "HDFCBANK",   "name": "HDFC Bank",                 "sector": "Banking"},
            {"symbol": "ICICIBANK",  "name": "ICICI Bank",                "sector": "Banking"},
            {"symbol": "SBIN",       "name": "State Bank of India",       "sector": "Banking"},
            {"symbol": "KOTAKBANK",  "name": "Kotak Mahindra Bank",       "sector": "Banking"},
            {"symbol": "AXISBANK",   "name": "Axis Bank",                 "sector": "Banking"},
            {"symbol": "SUNPHARMA",  "name": "Sun Pharmaceutical",        "sector": "Pharma"},
            {"symbol": "DRREDDY",    "name": "Dr. Reddy's",               "sector": "Pharma"},
            {"symbol": "CIPLA",      "name": "Cipla",                     "sector": "Pharma"},
            {"symbol": "TATAMOTORS", "name": "Tata Motors",               "sector": "Auto"},
            {"symbol": "MARUTI",     "name": "Maruti Suzuki",             "sector": "Auto"},
            {"symbol": "M&M",        "name": "Mahindra & Mahindra",       "sector": "Auto"},
            {"symbol": "ITC",        "name": "ITC",                       "sector": "FMCG"},
            {"symbol": "HINDUNILVR", "name": "Hindustan Unilever",        "sector": "FMCG"},
            {"symbol": "NESTLEIND",  "name": "Nestle India",              "sector": "FMCG"},
            {"symbol": "BHARTIARTL","name": "Bharti Airtel",             "sector": "Telecom"},
            {"symbol": "NTPC",       "name": "NTPC",                      "sector": "Power"},
            {"symbol": "POWERGRID",  "name": "Power Grid Corp",           "sector": "Power"},
            {"symbol": "ADANIENT",   "name": "Adani Enterprises",         "sector": "Conglomerate"},
        ]
    }
