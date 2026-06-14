"""
Real NSE data fetcher using yfinance.
Yahoo Finance uses the .NS suffix for NSE stocks (e.g. TCS.NS, INFY.NS).
"""

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import logging
import asyncio

logger = logging.getLogger(__name__)

# Symbols that need a different Yahoo Finance suffix
SYMBOL_OVERRIDES = {
    "M&M": "M%26M.NS",  # URL-encoded ampersand
}


def _nse_ticker(symbol: str) -> str:
    if symbol in SYMBOL_OVERRIDES:
        return SYMBOL_OVERRIDES[symbol]
    return f"{symbol}.NS"


async def fetch_ohlcv(symbol: str, years: int) -> pd.DataFrame | None:
    """
    Fetch daily OHLCV data for an NSE stock via Yahoo Finance.
    Returns a DataFrame with columns: Open, High, Low, Close, Volume
    Index: DatetimeIndex (UTC)
    """
    ticker = _nse_ticker(symbol)
    end   = datetime.now()
    start = end - timedelta(days=years * 365 + 30)  # extra buffer

    try:
        logger.info(f"Fetching {ticker} from {start.date()} to {end.date()}")
        # yfinance is synchronous — run in thread pool so we don't block FastAPI
        loop = asyncio.get_event_loop()
        df = await loop.run_in_executor(
            None,
            lambda: yf.download(ticker, start=start, end=end, progress=False, auto_adjust=True)
        )

        if df is None or df.empty:
            logger.warning(f"No data returned for {ticker}")
            return None

        # Flatten multi-level columns if present (yfinance sometimes returns them)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        df = df[["Open", "High", "Low", "Close", "Volume"]].dropna()
        df.index = pd.to_datetime(df.index)

        logger.info(f"Fetched {len(df)} candles for {symbol}")
        return df

    except Exception as e:
        logger.error(f"Error fetching {ticker}: {e}")
        return None
