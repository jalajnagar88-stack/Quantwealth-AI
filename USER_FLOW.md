# QuantWealth AI - HACD Ecosystem Platform User Flow

## Complete User Journey

### 1. Landing & Authentication
```
User visits: https://quantwealth-ai.netlify.app
  ↓
Clicks "Get Started" or "Login"
  ↓
Redirected to Login Page
  ↓
Option A: New User
  - Clicks "Register"
  - Fills: First Name, Last Name, Email, Password
  - Clicks "Create Account"
  - Account created in MongoDB
  - Redirected to Dashboard
  
Option B: Existing User
  - Enters Email & Password
  - Clicks "Login"
  - JWT token generated
  - Redirected to Dashboard
```

### 2. Dashboard Overview
```
User lands on Dashboard
  ↓
Sees:
  - Welcome message with name
  - Quick stats (if available)
  - Navigation sidebar with all features
  - Recent activity
```

### 3. HACD Token Analysis (NEW - Primary Feature)
```
User clicks "HACD Analysis" in sidebar
  ↓
Lands on HACD Analysis Dashboard with 4 tabs:
  
Tab 1: Market Overview
  - Real-time HACD price (from CoinEx)
  - Real-time HAC price
  - CARAT Protocol price (calculated)
  - 7-day AI price prediction
  - 30-day historical price chart
  - 24h volume and change percentages
  
Tab 2: Rarity Calculator
  - User enters HACD name (e.g., "STACK")
  - Clicks "Calculate Rarity"
  - System analyzes:
    * Letter distribution
    * Pattern recognition (palindromes)
    * Meaningful words
    - Returns: Score (0-100), Tier (Common→Legendary), Factors
  
Tab 3: Stack Cost Prediction
  - User enters:
    * HACD name
    * Project category (meme, art, AI agent, etc.)
    * Target supply
  - Clicks "Predict Stack Cost"
  - AI analyzes:
    * Current market conditions
    * HACD price
    * Rarity score
    * Category benchmarks
  - Returns:
    * Recommended stack cost (HAC per HACD)
    * Confidence percentage
    * Reasoning
    * 3 alternative strategies
  
Tab 4: Backtesting
  - User configures:
    * Stack cost
    * Total lots
    * Units per lot
    * Phase model (public/allowlist/designated)
  - Clicks "Run Single Backtest" or "Run Comparative Backtest"
  - System simulates:
    * Formation cost
    * Expected ROI
    * Participation rate
    * Formation time
    * Risk analysis
    * Comparison vs Carat Protocol
```

### 4. HACD Issuance (Launch Package Creation)
```
User clicks "HACD Issuance" in sidebar
  ↓
Lands on HACD Issuance page
  ↓
Option A: Create New Launch Spec
  - Clicks "Create New Launch Spec"
  - Goes through 6-step form:
    
    Step 1: Project Details
      - Project name
      - Project description
      - Category selection
      - Team info
    
    Step 2: Asset Configuration
      - Asset type (FT/NFT/SFT/HYBRID)
      - Total supply
      - Token name
      - Token symbol
    
    Step 3: Stack Settings
      - Stack cost (HAC per HACD)
      - Total HACD lots
      - Units per HACD lot
      - Phase model selection
      - Removal effect
    
    Step 4: Launch Settings
      - Designated address (if applicable)
      - Network fee required
      - Launchpad URL
    
    Step 5: Copy & Marketing
      - Short description
      - Long description
      - Marketing copy
    
    Step 6: Generate & Validate
      - Clicks "Generate All Documents"
      - AI generates 8 documents:
        * issuer_intake_form.md
        * incubator_fit_review.md
        * project_profile.md
        * stack_design.md
        * launch_spec.json
        * launchpad_copy.md
        * issuer_faq.md
        * x_announcement.md
      - Clicks "Validate"
      - Validator checks:
        * Math rules (supply, phases, cost)
        * Copy safety (no guarantees)
        * Cross-document consistency
      - If passed: Ready for submission
      - If failed: Shows errors to fix
    
  - Clicks "Save Launch Spec"
  - Saved to MongoDB

Option B: View Existing Launch Specs
  - Sees list of all launch specs
  - Can view, edit, delete, or export
  
Option C: Advanced Features
  - Score Project: Self-assessment against 5 criteria
  - Roast Mode: AI finds all issues
  - Web Research: Live ecosystem data
```

### 5. Additional Features
```
Paper Trading
  - Practice trading without real money
  - Track portfolio performance

Watchlist
  - Add tokens to watch
  - Get price alerts

Trade Brief
  - AI-generated trading analysis
  - Technical indicators

AI Signals
  - AI-powered buy/sell signals
  - Risk assessment

News & Trends
  - Market news aggregation
  - Trend analysis

Trading Assistant
  - AI chat for trading questions
  - Strategy recommendations
```

## Critical Path for HACD Incubator Demo

### Demo Scenario 1: HACD Token Analysis
```
1. User logs in
2. Navigates to HACD Analysis
3. Shows Market Overview with live prices
4. Calculates rarity for "STACK" → Shows "Rare" tier
5. Predicts stack cost for a meme token → Shows 26 HAC recommendation
6. Runs backtest comparison → Shows 4 strategies with ROI analysis
```

### Demo Scenario 2: HACD Launch Package
```
1. User logs in
2. Navigates to HACD Issuance
3. Creates new launch spec for "QuantWealth Token"
4. Fills 6-step form with project details
5. Clicks "Generate All Documents"
6. AI generates all 8 documents
7. Clicks "Validate" → Shows "✅ Passed"
8. Exports as JSON for submission
```

## Data Flow

### Authentication Flow
```
Frontend → Backend API → MongoDB
  Login → /api/auth/login → Users collection
  Register → /api/auth/register → Users collection
  Protected routes → JWT middleware → Verify token
```

### HACD Analysis Flow
```
Frontend → Backend API → External APIs / AI
  Market → /api/hacd-analysis/market → CoinEx API
  Rarity → /api/hacd-analysis/rarity → Local algorithm
  Prediction → /api/hacd-analysis/predict-stack-cost → Virtuals AI
  Backtest → /api/hacd-analysis/backtest → Local simulation
```

### HACD Issuance Flow
```
Frontend → Backend API → MongoDB + Virtuals AI
  Create → /api/hacd-issuance/create → LaunchSpecs collection
  Generate → /api/hacd-issuance/:id/generate-all → Virtuals AI + MongoDB
  Validate → /api/hacd-issuance/:id/validate → Local validator
  Score → /api/hacd-issuance/:id/score → Local scorer
  Roast → /api/hacd-issuance/:id/roast → Virtuals AI
```

## Current Blocking Issues

### ❌ MongoDB Connection (BLOCKING)
- Vercel backend cannot connect to Railway MongoDB
- Environment variable needs to be set
- Without this: Auth, HACD Issuance, and all database features fail

### ✅ HACD Analysis (WORKING)
- Market overview, rarity, prediction, backtesting
- These work without MongoDB (external APIs + local algorithms)

## What Needs to Work for Winning Demo

1. **MongoDB Connection** - Critical for auth and issuance
2. **User Registration/Login** - Required for all features
3. **HACD Analysis Dashboard** - Already working, just needs auth
4. **HACD Issuance** - Needs MongoDB to save launch specs
5. **Document Generation** - Needs Virtuals API (already configured)
6. **Validator** - Already working locally

## Next Steps to Complete

1. Set Railway MongoDB URI in Vercel environment variables
2. Redeploy Vercel backend
3. Test user registration/login
4. Test HACD analysis with authenticated user
5. Test HACD issuance flow end-to-end
6. Verify all features work in production
7. Final demo ready for incubator submission
