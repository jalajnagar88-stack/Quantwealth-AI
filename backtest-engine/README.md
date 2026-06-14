# QuantWealth Backtest Engine (Python)

Real NSE data backtest microservice using FastAPI + yfinance + pandas.

## Setup

```bash
cd backtest-engine
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/backtest` | POST | Run a backtest |
| `/symbols` | GET | List supported NSE symbols |

### Backtest Request

```json
{
  "symbol": "TCS",
  "years": 3,
  "strategy": "RSI",
  "initial_capital": 100000
}
```

**Strategies:** `RSI` | `MACD` | `MA_CROSSOVER` | `BREAKOUT`

## Data Source

- Yahoo Finance (`.NS` suffix for NSE stocks)
- Free, no API key required
- ~10 years of daily OHLCV data available

## Architecture Notes

- `engine/data_fetcher.py` — async yfinance wrapper (replace with Zerodha Kite API for production)
- `engine/indicators.py` — pure numpy/pandas indicators (C++ migration targets for Phase 3)
- `engine/strategies.py` — strategy signal generation + trade simulation
- `engine/metrics.py` — Sharpe ratio, max drawdown, equity curve

## Connecting to Node.js

Set in `backend/.env`:
```
PYTHON_ENGINE_URL=http://localhost:8000
```

Node.js automatically tries the Python engine first and falls back to the mock engine if unavailable.
