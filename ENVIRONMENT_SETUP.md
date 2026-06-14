# QuantWealth AI - Environment Setup Guide

## Quick Start Checklist

Before running the application, ensure you have:

- [ ] MongoDB installed locally or MongoDB Atlas account
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git for version control

## Backend Environment Variables

Create a `.env` file in `/backend` directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/quantwealth
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quantwealth?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (SendGrid - Recommended)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@quantwealth.ai
EMAIL_FROM_NAME=QuantWealth AI

# Alternative: Gmail SMTP (for development only)
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-specific-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+91XXXXXXXXXX

# Security
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

## Frontend Environment Variables

Create a `.env` file in `/quantwealth-frontend` directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=QuantWealth AI
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_NEWS=true
VITE_ENABLE_REALTIME_DATA=false

# Analytics (Optional)
# VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXXX
# VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## MongoDB Setup

### Local Installation (Mac/Linux)

```bash
# Using Homebrew (Mac)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify installation
mongosh
# Should open MongoDB shell
```

### MongoDB Atlas (Cloud - Recommended for Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster (Free tier available)
3. Create database user
4. Whitelist your IP address
5. Get connection string and update MONGODB_URI

## External Service Setup

### 1. SendGrid (Email Service)

1. Create account at https://sendgrid.com
2. Verify sender email
3. Create API key with "Mail Send" permissions
4. Update SENDGRID_API_KEY in .env

**Free Tier:** 100 emails/day

### 2. Twilio (SMS Service)

1. Create account at https://www.twilio.com
2. Get Account SID and Auth Token
3. Purchase or verify phone number
4. Update TWILIO_* variables in .env

**Free Tier:** $15.50 trial credit

### 3. Razorpay (Payment Gateway - India)

1. Create account at https://razorpay.com
2. Get API Key ID and Secret
3. Configure webhooks
4. Update .env (for Phase 3)

## Security Checklist

### Production Deployment

- [ ] Change all default secrets
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Configure error monitoring (Sentry)
- [ ] Set up database backups
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits
- [ ] SSL certificate (Let's Encrypt)

### Environment Variables to NEVER Commit

```bash
JWT_SECRET
SENDGRID_API_KEY
TWILIO_AUTH_TOKEN
MONGODB_URI (if contains credentials)
RAZORPAY_KEY_SECRET
AWS_SECRET_ACCESS_KEY
ANY_PASSWORD or SECRET
```

## Development vs Production

### Development Mode

```bash
NODE_ENV=development
LOG_LEVEL=debug
# More verbose logging
# Stack traces in errors
# CORS allows all origins
```

### Production Mode

```bash
NODE_ENV=production
LOG_LEVEL=error
# Minimal logging
# No stack traces in errors
# Strict CORS
# Rate limiting enabled
# Error monitoring active
```

## Testing the Setup

### 1. Backend Health Check

```bash
curl http://localhost:3000/health

# Expected response:
{
  "status": "ok",
  "message": "✅ QuantWealth AI Backend is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45
}
```

### 2. Database Connection

```bash
# Check MongoDB connection
mongosh
use quantwealth
db.users.countDocuments()
```

### 3. Email Configuration

```bash
# Test email (will log to console in development)
# Register a new user and check for OTP email
```

### 4. Frontend Connection

```bash
# Start frontend
cd quantwealth-frontend && npm run dev

# Should connect to backend at localhost:3000
# Check browser console for any CORS errors
```

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community

# Check connection string format
# Local: mongodb://localhost:27017/quantwealth
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/quantwealth
```

### CORS Errors

```bash
# Ensure FRONTEND_URL in backend .env matches frontend URL
# Check browser console for exact error
# Verify CORS middleware is properly configured
```

### Email Not Sending

```bash
# Check email provider credentials
# Verify sender email is verified (SendGrid)
# Check spam folder
# Review backend logs for errors
```

### Rate Limiting Too Aggressive

```bash
# Adjust rate limits in /middleware/rateLimiter.ts
# Or add IP to whitelist for testing
```

## Docker Setup (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/quantwealth
    depends_on:
      - mongo
    env_file:
      - .env

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

Run with: `docker-compose up -d`

## Next Steps

1. ✅ Configure environment variables
2. ✅ Setup MongoDB
3. ✅ Configure email service (SendGrid)
4. ⏳ Configure SMS service (Twilio) - Optional for MVP
5. ⏳ Setup monitoring (Sentry) - Optional
6. ⏳ Configure CI/CD pipeline - Optional
7. ⏳ Production deployment

## Support

For issues or questions:
- Email: support@quantwealth.ai
- Documentation: https://docs.quantwealth.ai
- GitHub Issues: https://github.com/quantwealth/quantwealth-ai/issues
