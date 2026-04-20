# Khalia MVP - Setup & Testing Guide

## System Requirements

- **Node.js**: 18.0.0+
- **npm**: 9.0.0+
- **PostgreSQL**: 14.0+
- **Redis**: 6.0+
- **Git**: 2.30.0+

## Project Structure

```
Khalia-by-Josh/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, logging
│   │   └── app.ts        # Express app
│   ├── migrations/       # Database migrations
│   ├── tests/            # Integration tests
│   └── package.json
├── src/                  # React frontend
│   ├── app/
│   │   ├── services/     # API client
│   │   ├── context/      # Auth state
│   │   ├── pages/        # Routes
│   │   └── components/   # UI components
│   ├── main.tsx
│   └── package.json
└── specs/                # Project documentation
```

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Khalia-by-Josh
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `backend/.env`:**

```env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/khalia_dev

# Auth
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# Redis
REDIS_URL=redis://localhost:6379

# Payment Gateway (optional for MVP)
PAYSTACK_SECRET_KEY=pk_test_xxxxx

# Email Provider (optional)
SENDGRID_API_KEY=SG.xxxxx

# Environment
NODE_ENV=development
PORT=3000
```

### Step 3: Database Setup

**Prerequisites:** PostgreSQL must be running locally

```bash
# Create database
createdb khalia_dev

# Run migrations
npm run migrate:latest

# Seed database (optional - creates test data)
npm run seed
```

### Step 4: Start Backend

```bash
# From backend/ directory
npm run dev

# Backend will start on http://localhost:3000
# API available at http://localhost:3000/api/v1
```

**Verify backend is running:**

```bash
curl http://localhost:3000/health
```

### Step 5: Frontend Setup

```bash
cd ../  # Back to root

# Install dependencies
npm install

# Create .env.local
cat > src/.env.local << 'EOF'
REACT_APP_API_URL=http://localhost:3000/api/v1
EOF
```

### Step 6: Start Frontend

```bash
npm run dev

# Frontend will start on http://localhost:5173
```

### Step 7: Manual Testing

Open `http://localhost:5173` in your browser

## User Flow Testing

### 1. Authentication

```
URL: http://localhost:5173/auth/register

1. Sign up with:
   - Email: test@khalia.com
   - Password: Test1234!
   - Phone: +2348012345678
   - First Name: Test
   - Last Name: User

2. You'll be redirected to /onboarding
```

### 2. Onboarding (KYC)

```
URL: http://localhost:5173/onboarding

Step 1 - BVN Verification:
- Enter: 12345678901 (dummy BVN)
- Click "Verify BVN"

Step 2 - Facial Recognition:
- Upload any image file
- Click "Verify Biometric"

Step 3 - Bank Account:
- Bank Code: 033 (GTBank)
- Account Number: 0123456789
- Account Name: Test User
- Click "Verify Bank Account"

Step 4 - Complete:
- Click "Go to Dashboard"
```

### 3. Dashboard

```
URL: http://localhost:5173/dashboard

Verify you can see:
✓ Wallet Balance (fetched from backend)
✓ KYC Status (completion percentage)
✓ Active Groups (user's group memberships)
✓ Performance chart
✓ Responsive navigation (mobile-friendly)
```

### 4. Wallet

```
URL: http://localhost:5173/wallet

1. Try "Deposit":
   - Amount: 50,000 NGN
   - You'll get a Paystack payment URL (mock)

2. View "Transaction History"
   - Should show any created transactions

3. Check "Wallet Balance"
   - Should update in real-time
```

### 5. Groups

```
URL: http://localhost:5173/groups

1. Try "Create Group":
   - Name: My Test Group
   - Contribution Amount: 50,000 NGN
   - Frequency: Monthly
   - Max Members: 10

2. View Group Details
   - See members and contributions

3. Join a Group:
   - Click "Join" on any available group
```

### 6. Profile

```
URL: http://localhost:5173/profile

Verify:
✓ User information displayed
✓ KYC level shown
✓ Trust score breakdown
✓ Recent transactions
```

## Testing With API Clients

### Using cURL

```bash
# 1. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@khalia.com",
    "password": "Test1234!",
    "phone": "+2348012345678"
  }'

# Response includes access_token
# Save this token: TOKEN=<your_token>

# 2. Get Profile (requires auth)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Get Wallet Balance
curl -X GET http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer $TOKEN"

# 4. List Groups
curl -X GET http://localhost:3000/api/v1/groups \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Import the API collection: `backend/API.md`
2. Create environment variables:
   ```
   - base_url: http://localhost:3000/api/v1
   - token: <your_access_token_from_login>
   ```
3. Test endpoints in sequence following the documented flow

## Testing Backend

### Run Integration Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- integration.test.ts

# Run with coverage
npm run test:coverage

# Watch mode (rerun on changes)
npm run test:watch
```

**Expected output:**

```
✓ Auth tests (register, login)
✓ KYC tests (BVN, biometric, bank)
✓ Wallet tests (deposit, balance)
✓ Groups tests (create, join)
✓ Trust score tests
✓ Notification tests
✓ Admin tests
```

### Database Inspection

```bash
# Connect to PostgreSQL
psql khalia_dev

# List tables
\dt

# Query users
SELECT id, email, kyc_level, trust_score FROM users LIMIT 5;

# Query transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

# Query ledger entries
SELECT * FROM ledger_entries LIMIT 20;

# Exit
\q
```

## Common Issues & Troubleshooting

### Backend won't start

**Issue:** "Connection refused" when starting backend

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Check if Redis is running
redis-cli ping

# If either fails, install and start:
# macOS:
brew services start postgresql
brew services start redis

# Linux:
sudo systemctl start postgresql
sudo systemctl start redis-server

# Windows (Docker recommended):
docker run -d -p 5432:5432 postgres:14
docker run -d -p 6379:6379 redis:7
```

**Issue:** "Database khalia_dev does not exist"

```bash
# Create database
createdb khalia_dev

# Run migrations
cd backend && npm run migrate:latest
```

### Frontend won't start

**Issue:** Port 5173 already in use

```bash
# Kill process on port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Authentication not working

**Issue:** "401 Unauthorized" errors

1. Check `.env` JWT_SECRET is set
2. Verify access token is being saved in localStorage:
   - Open DevTools → Application → LocalStorage
   - Should have `accessToken` key

**Issue:** Token expired

```bash
# Refresh token endpoint
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "<your_refresh_token>"
  }'
```

### POST requests fail with CORS error

**Solution:** Ensure backend .env has correct CORS setting:

```env
CORS_ORIGIN=http://localhost:5173
```

## Performance Benchmarks

**Expected Response Times:**

- Authentication: < 200ms
- Wallet Balance: < 100ms
- Groups List: < 150ms
- KYC Verification: < 500ms (external API calls)

**Database Indexes:**

```
✓ users.email (unique)
✓ transactions.user_id
✓ transactions.created_at
✓ groups.created_at
✓ ledger_entries.transaction_id
```

## Security Checklist for Testing

- [ ] Password hashing works (bcrypt 12 rounds)
- [ ] JWT tokens expire correctly (15m access, 30d refresh)
- [ ] Sensitive data encrypted in database (BVN, bank account)
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (React auto-escapes)
- [ ] CSRF protection (SameSite cookies)
- [ ] Rate limiting works (100 req/min per user)
- [ ] Audit logs created for financial operations

## What NOT to Do in Testing

❌ Don't use production database/API keys
❌ Don't commit `.env` files
❌ Don't test with real bank account details
❌ Don't expose JWT_SECRET in logs
❌ Don't leave debug mode enabled

## Next Steps After Manual Testing

1. **Fix any bugs** found during testing
2. **Performance optimization** if needed
3. **Security audit** with team
4. **Production deployment** (see DEPLOYMENT.md)
5. **Monitoring setup** (see DEPLOYMENT.md)
6. **Go-live preparation**

## Support & Documentation

- **API Docs**: `backend/API.md`
- **Database Schema**: `backend/migrations/`
- **Component Library**: Shadcn/ui components
- **State Management**: React Context API

## Success Criteria ✓

When manual testing is complete, you should be able to:

✓ Create a new user account
✓ Complete full KYC flow
✓ View dashboard with real data from API
✓ Create and join groups
✓ Perform wallet operations
✓ View transaction history
✓ See trust score breakdown
✓ Navigate on mobile and desktop
✓ Log out successfully
✓ All API responses are < 500ms
