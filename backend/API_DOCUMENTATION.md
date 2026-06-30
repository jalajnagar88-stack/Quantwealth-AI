# QuantWealth AI Backend API Documentation

## Base URL
- **Local**: `http://localhost:3000`
- **Railway**: `https://hacd-production.up.railway.app` (after deployment)

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication (`/api/auth`)

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phoneNumber": "+1234567890" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Welcome to QuantWealth AI.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "isPhoneVerified": false
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "profile": {},
      "kycStatus": "pending"
    }
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "profile": {
    "investmentExperience": "intermediate",
    "riskTolerance": "moderate"
  }
}
```

### HACD Analysis (`/api/hacd-analysis`)

#### Market Overview
```http
GET /api/hacd-analysis/market
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hacd": {
      "currentPrice": 8.04,
      "priceChange24h": 9.8,
      "volume24h": 2646.23,
      "exchanges": []
    },
    "hac": {
      "currentPrice": 0.05,
      "priceChange24h": 2.5,
      "volume24h": 15000
    },
    "stackTokens": {
      "carat": {
        "price": 0.00000048,
        "marketCap": 8.05,
        "totalSupply": 16777216
      }
    },
    "timestamp": 1782745151883
  }
}
```

#### Rarity Calculator
```http
POST /api/hacd-analysis/rarity
Authorization: Bearer <token>
Content-Type: application/json

{
  "hacdName": "STACK"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 50,
    "tier": "Rare",
    "factors": ["All unique letters", "Meaningful word"]
  }
}
```

#### Stack Cost Prediction
```http
POST /api/hacd-analysis/predict-stack-cost
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectCategory": "meme",
  "hacdName": "STACK",
  "targetSupply": 1000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendedCost": 26,
    "confidence": 70,
    "reasoning": "Based on current market conditions...",
    "factors": {
      "marketCondition": "Neutral",
      "hacdPrice": 8.04,
      "hacPrice": 0.05,
      "rarityScore": 50,
      "category": "meme"
    },
    "alternatives": [
      {
        "cost": 10,
        "strategy": "Aggressive Growth",
        "expectedParticipation": "High volume, lower entry barrier"
      },
      {
        "cost": 26,
        "strategy": "Balanced",
        "expectedParticipation": "Moderate volume, sustainable growth"
      },
      {
        "cost": 56,
        "strategy": "Premium Positioning",
        "expectedParticipation": "Lower volume, higher perceived value"
      }
    ]
  }
}
```

#### Backtesting
```http
POST /api/hacd-analysis/backtest
Authorization: Bearer <token>
Content-Type: application/json

{
  "stackCost": 50,
  "totalLots": 100,
  "unitsPerLot": 10000,
  "phaseModel": "public"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "strategy": "50 HAC/HACD Stack Cost",
    "config": {
      "stackCost": 50,
      "totalLots": 100,
      "unitsPerLot": 10000,
      "phaseModel": "public"
    },
    "metrics": {
      "totalFormationCost": 5000,
      "totalSupply": 1000000,
      "costPerToken": 0.005,
      "projectedMarketCap": 974767.91,
      "expectedROI": 45,
      "participationRate": 90,
      "formationTime": "5-10 minutes"
    },
    "performance": {
      "winRate": 80,
      "avgReturn": 37,
      "maxDrawdown": 31,
      "sharpeRatio": 1.4
    },
    "riskAnalysis": {
      "riskLevel": "Medium",
      "riskFactors": [
        "Market volatility during formation",
        "HACD price fluctuations affect formation cost"
      ],
      "mitigationStrategies": [
        "Set formation window during stable market conditions",
        "Provide cost stability mechanisms"
      ]
    },
    "comparison": {
      "vsCaratProtocol": "50% lower than Carat Protocol",
      "vsMarketAverage": "Below market average (50-100 HAC range)"
    }
  }
}
```

### HACD Issuance (`/api/hacd-issuance`)

#### Create Launch Spec
```http
POST /api/hacd-issuance/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "project": {
    "name": "QuantWealth Token",
    "description": "AI-powered trading platform",
    "category": "DeFi",
    "team": {
      "name": "QuantWealth Team",
      "experience": "5+ years in crypto"
    }
  },
  "asset": {
    "type": "FT",
    "totalSupply": 1000000,
    "tokenName": "QuantWealth",
    "tokenSymbol": "QWT"
  },
  "stack": {
    "stackCost": 26,
    "totalHacdLots": 100,
    "unitsPerHacdLot": 10000,
    "phaseModel": "public",
    "removalEffect": "gradual"
  },
  "launch": {
    "designatedAddress": "0x123...",
    "networkFeeRequired": true,
    "launchpadUrl": "https://launchpad.hacd.io"
  },
  "copy": {
    "shortDescription": "AI-powered trading platform for HACD ecosystem",
    "longDescription": "Full description here...",
    "marketingCopy": "Marketing copy here..."
  }
}
```

#### List Launch Specs
```http
GET /api/hacd-issuance/list
Authorization: Bearer <token>
```

#### Get Launch Spec
```http
GET /api/hacd-issuance/:id
Authorization: Bearer <token>
```

#### Update Launch Spec
```http
PUT /api/hacd-issuance/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "project": {
    "name": "Updated Name"
  }
}
```

#### Delete Launch Spec
```http
DELETE /api/hacd-issuance/:id
Authorization: Bearer <token>
```

#### Generate All Documents
```http
POST /api/hacd-issuance/:id/generate-all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "issuer_intake_form.md": "...",
    "incubator_fit_review.md": "...",
    "project_profile.md": "...",
    "stack_design.md": "...",
    "launch_spec.json": "...",
    "launchpad_copy.md": "...",
    "issuer_faq.md": "...",
    "x_announcement.md": "..."
  }
}
```

#### Validate Launch Spec
```http
POST /api/hacd-issuance/:id/validate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "passed": true,
    "errors": [],
    "warnings": [],
    "score": 95
  }
}
```

#### Score Project
```http
POST /api/hacd-issuance/:id/score
Authorization: Bearer <token>
```

#### Roast Mode
```http
POST /api/hacd-issuance/:id/roast
Authorization: Bearer <token>
```

#### Export Launch Spec
```http
GET /api/hacd-issuance/:id/export
Authorization: Bearer <token>
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "✅ QuantWealth AI Backend is running",
  "timestamp": "2026-06-29T15:00:00.000Z",
  "uptime": 3600
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Testing Examples

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test12345"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345"}'
```

**HACD Market Overview:**
```bash
curl -X GET http://localhost:3000/api/hacd-analysis/market \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**HACD Rarity:**
```bash
curl -X POST http://localhost:3000/api/hacd-analysis/rarity \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"hacdName":"STACK"}'
```

### Using JavaScript/Fetch

```javascript
// Register
const register = async () => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Test12345'
    })
  });
  const data = await response.json();
  console.log(data);
};

// HACD Analysis
const getMarketOverview = async (token) => {
  const response = await fetch('http://localhost:3000/api/hacd-analysis/market', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log(data);
};
```

## Database

The backend uses PostgreSQL with the following tables:
- `users` - User accounts and profiles
- `hacd_launch_specs` - HACD launch specifications

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `VIRTUALS_API_KEY` - Virtuals API key for AI features
- `VIRTUALS_BASE_URL` - Virtuals API base URL
- `VIRTUALS_MODEL` - Virtuals AI model name

## Rate Limiting

- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Backtest endpoints: 10 requests per hour
