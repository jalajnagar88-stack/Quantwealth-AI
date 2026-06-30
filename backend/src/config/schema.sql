-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  otp_code VARCHAR(10),
  otp_expires_at TIMESTAMP,
  otp_type VARCHAR(10) CHECK (otp_type IN ('email', 'phone')),
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_progress', 'verified', 'rejected')),
  profile JSONB DEFAULT '{}',
  connected_brokers JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HACD Launch Specs table
CREATE TABLE IF NOT EXISTS hacd_launch_specs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  project_description TEXT,
  category VARCHAR(100),
  team_info JSONB DEFAULT '{}',
  asset_type VARCHAR(20) CHECK (asset_type IN ('FT', 'NFT', 'SFT', 'HYBRID')),
  total_supply BIGINT,
  token_name VARCHAR(100),
  token_symbol VARCHAR(20),
  stack_cost DECIMAL(10, 2),
  total_hacd_lots INTEGER,
  units_per_hacd_lot INTEGER,
  phase_model VARCHAR(20) CHECK (phase_model IN ('public', 'allowlist', 'designated')),
  removal_effect VARCHAR(50),
  designated_address VARCHAR(255),
  network_fee_required BOOLEAN DEFAULT FALSE,
  launchpad_url VARCHAR(500),
  short_description TEXT,
  long_description TEXT,
  marketing_copy TEXT,
  documents JSONB DEFAULT '{}',
  validation_result JSONB DEFAULT '{}',
  project_score JSONB DEFAULT '{}',
  roast_result JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'validated', 'submitted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_hacd_specs_user_id ON hacd_launch_specs(user_id);
CREATE INDEX IF NOT EXISTS idx_hacd_specs_status ON hacd_launch_specs(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  holdings JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Paper trading portfolios table
CREATE TABLE IF NOT EXISTS paper_portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cash DECIMAL(15, 2) DEFAULT 100000,
  initial_capital DECIMAL(15, 2) DEFAULT 100000,
  total_value DECIMAL(15, 2) DEFAULT 100000,
  total_pnl DECIMAL(15, 2) DEFAULT 0,
  total_pnl_percent DECIMAL(10, 2) DEFAULT 0,
  trade_count INTEGER DEFAULT 0,
  win_count INTEGER DEFAULT 0,
  loss_count INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  best_trade JSONB,
  worst_trade JSONB,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Paper trading holdings table
CREATE TABLE IF NOT EXISTS paper_holdings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL,
  avg_price DECIMAL(15, 2) NOT NULL,
  total_invested DECIMAL(15, 2) NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, symbol)
);

-- Paper trading transactions table
CREATE TABLE IF NOT EXISTS paper_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  pnl DECIMAL(15, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_portfolios_user_id ON paper_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_holdings_user_id ON paper_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_holdings_user_symbol ON paper_holdings(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_paper_transactions_user_id ON paper_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_transactions_timestamp ON paper_transactions(timestamp DESC);

-- Triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hacd_launch_specs_updated_at ON hacd_launch_specs;
CREATE TRIGGER update_hacd_launch_specs_updated_at BEFORE UPDATE ON hacd_launch_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_watchlists_updated_at ON watchlists;
CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_paper_portfolios_updated_at ON paper_portfolios;
CREATE TRIGGER update_paper_portfolios_updated_at BEFORE UPDATE ON paper_portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_paper_holdings_updated_at ON paper_holdings;
CREATE TRIGGER update_paper_holdings_updated_at BEFORE UPDATE ON paper_holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
