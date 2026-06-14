# DMAT Account Integration Architecture

## Overview
This document outlines the architecture for connecting Indian brokerage DMAT accounts to enable automated trading through QuantWealth AI.

## Supported Brokers
1. **Zerodha (Kite Connect API)**
2. **Upstox (Upstox API)**
3. **Angel One (Angel Connect API)**
4. **Alice Blue (Alice Blue API)**
5. **5paisa**
6. **Fyers**

## Architecture Overview

### Security First Approach
- **No Storage of Credentials**: API tokens only, no passwords stored
- **Encrypted Tokens**: AES-256 encryption for all tokens at rest
- **Session Management**: Short-lived access tokens (24 hours)
- **OAuth 2.0**: Industry standard authentication flow

### Data Flow
```
User → Frontend → Backend API → Broker API → Exchange
```

## Implementation Roadmap

### Phase 1: Zerodha Integration (Week 1)
Zerodha has the most mature API and largest user base in India.

**Steps:**
1. Apply for Kite Connect Developer Program
2. Implement OAuth flow
3. Create holdings/funds endpoints
4. Implement order placement
5. Add order tracking

### Phase 2: Upstox Integration (Week 2)
Second most popular broker with excellent API documentation.

### Phase 3: Angel One (Week 3)
Growing rapidly, good for options traders.

### Phase 4: Others (Week 4-5)
Alice Blue, 5paisa, Fyers based on user demand.

## Technical Implementation

### Backend Changes Required

#### 1. Broker Connection Model
```typescript
// backend/src/models/BrokerConnection.ts
interface IBrokerConnection {
  userId: string;
  broker: 'zerodha' | 'upstox' | 'angel_one' | 'alice_blue';
  accessToken: string; // Encrypted
  refreshToken: string; // Encrypted
  expiresAt: Date;
  isActive: boolean;
  lastUsed: Date;
  tradingEnabled: boolean;
  permissions: {
    readHoldings: boolean;
    readFunds: boolean;
    placeOrders: boolean;
    modifyOrders: boolean;
  };
}
```

#### 2. Broker Service Factory
```typescript
// backend/src/services/brokers/BrokerFactory.ts
export class BrokerFactory {
  static getBroker(brokerType: string): IBrokerService {
    switch(brokerType) {
      case 'zerodha': return new ZerodhaService();
      case 'upstox': return new UpstoxService();
      case 'angel_one': return new AngelOneService();
      default: throw new Error('Unsupported broker');
    }
  }
}
```

#### 3. Order Management System
```typescript
// backend/src/services/OrderManager.ts
export class OrderManager {
  async placeOrder(userId: string, order: OrderRequest): Promise<OrderResult> {
    // 1. Validate user has connected broker
    // 2. Check trading permissions
    // 3. Risk assessment
    // 4. Place order through broker API
    // 5. Store order in database
    // 6. Return confirmation
  }
}
```

## API Endpoints to Add

### Broker Connection
```
POST /api/brokers/connect - Initiate OAuth flow
POST /api/brokers/callback - OAuth callback
DELETE /api/brokers/disconnect - Remove connection
GET /api/brokers/status - Check connection status
```

### Holdings & Portfolio
```
GET /api/portfolio/holdings - Get current holdings
GET /api/portfolio/funds - Available funds/margins
GET /api/portfolio/positions - Current positions
```

### Orders
```
POST /api/orders/place - Place new order
PUT /api/orders/modify - Modify existing order
DELETE /api/orders/cancel - Cancel order
GET /api/orders/history - Order history
GET /api/orders/:id/status - Order status
```

## Frontend Components

### 1. Broker Connection Modal
- Broker selection dropdown
- OAuth initiation button
- Connection status display
- Permissions management

### 2. Portfolio View
- Real-time holdings display
- P&L tracking
- Asset allocation pie chart
- Sector-wise breakdown

### 3. Order Panel
- Quick order placement
- Order type selection (MIS, CNC, etc.)
- SL/Target settings
- Risk warnings

## Security Considerations

### 1. Token Storage
- Encrypt tokens with user-specific keys
- Store in secure database (not localStorage)
- Regular token rotation

### 2. Order Validation
- Maximum order value limits
- Daily loss limits
- Position size limits
- Require 2FA for large orders

### 3. Audit Trail
- Log all orders with IP, timestamp
- Store order modifications
- Trade confirmation receipts

## Compliance & Regulations

### SEBI Requirements
1. **Disclosure**: Clear disclosure that this is algorithmic trading
2. **Risk Warning**: Mandatory risk warnings on order placement
3. **Consent**: Explicit user consent for automated trading
4. **Audit**: Maintain audit trail for 7 years

### Risk Management
1. **Circuit Breakers**: Automatic trading halt on high losses
2. **Position Limits**: Maximum exposure per stock/sector
3. **Order Limits**: Maximum orders per day
4. **Manual Override**: User can disable auto-trading anytime

## Testing Strategy

### 1. Paper Trading Mode
- Connect to broker's paper trading API
- Test all features without real money
- Validate order placement logic

### 2. Dry Run Mode
- Execute order logic but don't send to broker
- Log what orders would have been placed
- Compare with manual decisions

### 3. Live Trading
- Start with small quantities (1 share)
- Gradually increase as confidence builds
- Monitor slippage and execution quality

## Cost Analysis

### Broker API Costs
- **Zerodha**: ₹2,000/month (Historical data + Live)
- **Upstox**: Free for basic, Premium at ₹499/month
- **Angel One**: Free
- **Alice Blue**: Free

### Infrastructure Costs
- Additional server capacity for order management
- Real-time WebSocket connections
- Database storage for order history

## Timeline

| Week | Task |
|------|------|
| 1 | Zerodha OAuth + Holdings API |
| 2 | Order placement + Portfolio sync |
| 3 | Upstox integration |
| 4 | Angel One + Risk management |
| 5 | Testing + Paper trading mode |
| 6 | Live deployment + Monitoring |

## Next Steps

1. **Apply for Broker APIs**: Start with Zerodha Kite Connect
2. **Legal Review**: Ensure compliance with SEBI regulations
3. **Security Audit**: Third-party security assessment
4. **Beta Testing**: Invite 10-20 users for testing
5. **Gradual Rollout**: Release to select users first

---

**Note**: This is a complex integration requiring legal compliance. Consider partnering with a financial technology consultant for SEBI compliance review.
