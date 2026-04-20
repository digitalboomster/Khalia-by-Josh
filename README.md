
# Khalia - Community-Based Microfinance Platform

## 📋 Overview

Khalia is a **Shariah-compliant, community-driven microfinance platform** that enables Africans to save, contribute, and access capital through digitized rotating savings and credit associations (ROSCAs).

**Mission**: Provide accessible, regulated, and affordable financial services to underbanked communities.

### Key Features

✅ **Digital KYC & Verification** - Multi-level identity verification with BVN, biometrics, and bank account
✅ **Group Management** - Create and manage contribution cycles with flexible strategies
✅ **Smart Wallet** - Secure deposit/withdrawal with multiple payment methods
✅ **Trust Scoring** - AI-powered risk assessment based on payment history
✅ **Payout Automation** - Intelligent member selection (round-robin/lottery/need-based)
✅ **Audit Trails** - 7-year immutable transaction logs for compliance
✅ **Mobile-First** - Responsive design optimized for mobile and desktop
✅ **Shariah Compliance** - Riba-free operations with halal financing models

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0+
- **PostgreSQL** 14.0+
- **Redis** 6.0+
- **npm** 9.0.0+

### 5-Minute Setup (Linux/macOS)

```bash
# Clone repository
git clone https://github.com/your-org/Khalia-by-Josh.git
cd Khalia-by-Josh

# Make startup script executable
chmod +x startup.sh

# Run startup script
./startup.sh

# Open in browser
open http://localhost:5173
```

**For Windows**: Follow [detailed setup guide](#windows-setup) below

### Manual Setup

```bash
# Backend
cd backend
cp .env.example .env          # Edit with your database credentials
npm install
npm run migrate:latest
npm run dev                   # Starts on port 3000

# Frontend (new terminal)
cd ../
npm install
cat > .env.local << 'EOF'
REACT_APP_API_URL=http://localhost:3000/api/v1
EOF
npm run dev                   # Starts on port 5173
```

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [TESTING.md](./TESTING.md) | Complete local development & testing guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment to AWS/Vercel/Railway |
| [backend/API.md](./backend/API.md) | REST API endpoint documentation |
| [specs/001-mvp-implementation-plan/](./specs/001-mvp-implementation-plan/) | Architecture & technical specification |

## 🏗️ Project Structure

```
Khalia-by-Josh/
├── backend/                    # Express.js REST API
│   ├── src/
│   │   ├── app.ts             # Express app setup
│   │   ├── routes/api.ts      # 30+ API endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── auth.ts        # Authentication
│   │   │   ├── kyc.ts         # KYC verification
│   │   │   ├── wallet.ts      # Wallet operations
│   │   │   ├── groups.ts      # Group management
│   │   │   ├── ledger.ts      # Financial ledger
│   │   │   ├── trust-and-admin.ts
│   │   │   └── notifications.ts
│   │   ├── middleware/        # Auth, validation, logging
│   │   └── types/             # TypeScript interfaces
│   ├── migrations/            # Database schema
│   ├── tests/                 # 50+ integration tests
│   ├── API.md                 # API documentation
│   └── package.json
│
├── src/                       # React frontend
│   ├── app/
│   │   ├── pages/            # Route components
│   │   │   ├── Auth/         # Login/Register
│   │   │   ├── Dashboard/
│   │   │   ├── Groups/
│   │   │   ├── Wallet/
│   │   │   └── ...
│   │   ├── components/       # Reusable UI
│   │   │   ├── RootLayout.tsx # Navigation
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ui/           # Shadcn/ui components
│   │   │   └── figma/        # Design system
│   │   ├── services/         # API client layer
│   │   │   ├── api-client.ts # Axios with interceptors
│   │   │   ├── auth.ts
│   │   │   ├── wallet.ts
│   │   │   ├── groups.ts
│   │   │   ├── kyc.ts
│   │   │   ├── notifications.ts
│   │   │   └── user.ts
│   │   ├── context/          # React Context
│   │   │   └── AuthContext.tsx
│   │   ├── data/             # Mock data
│   │   └── App.tsx
│   ├── main.tsx
│   ├── styles/               # Global styles
│   └── package.json
│
├── specs/                    # Documentation
│   └── 001-mvp-implementation-plan/
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Architecture & design
│       ├── tasks.md         # 56-task implementation breakdown
│       ├── data-model.md    # Database schema
│       └── API.md           # API contracts
│
├── TESTING.md               # Local testing guide
├── DEPLOYMENT.md            # Production deployment
├── startup.sh               # Quick start script
└── README.md               # This file
```

## 🔑 Core Concepts

### User Flows

#### 1. Authentication & Onboarding
```
Sign Up → Email Verification → KYC (5 steps) → Dashboard Access
```

#### 2. Group Lifecycle
```
Create Group → Invite Members → Start Contribution Cycle → Pay Contributors → Repeat
```

#### 3. Group Contribution
```
Join Group → Receive Payment Notification → Contribute Funds → Track Status → Receive Payout
```

### Database Schema

**Core Tables:**
- `users` - User accounts with KYC levels
- `groups` - Rotating savings groups
- `group_members` - User memberships
- `contributions` - Monthly/weekly contributions
- `transactions` - Wallet deposits/withdrawals
- `ledger_entries` - Double-entry accounting (immutable)
- `escrow_holds` - Pending payouts
- `users_payout_list` - Payout queue
- `audit_logs` - Compliance trail (7-year retention)

*See [backend/migrations/](./backend/migrations/) for full schema*

## 🔐 Security Architecture

### Authentication
- **JWT Tokens**: 15-minute access + 30-day refresh
- **Password Hashing**: bcryptjs with 12 rounds
- **Token Refresh**: Automatic refresh on 401 response

### Data Encryption
- **At-Rest**: AES-256 encryption for BVN, bank account details
- **In-Transit**: HTTPS TLS 1.3
- **Secrets Management**: Environment variables, never in code

### Financial Integrity
- **Double-Entry Accounting**: Every transaction creates balanced ledger entry
- **Immutable Ledger**: Append-only transaction history
- **Reconciliation**: Daily ledger balance verification
- **Audit Trail**: 7-year compliance logging

### Compliance
- **KYC Levels**: 
  - Level 0: Email only
  - Level 3: BVN verified
  - Level 4: Biometric verified
  - Level 5: Bank account verified → Can transact
- **Rate Limiting**: 100 requests/minute per user
- **Shariah Check**: No interest/riba operations

## 💻 Technology Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express.js** | REST API framework |
| **TypeScript** | Type-safe implementations |
| **PostgreSQL** | Primary database |
| **Redis** | Session caching |
| **JWT** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Winston** | Structured logging |
| **Joi** | Input validation |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool (3x faster) |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/ui** | Component library |
| **Axios** | HTTP client |
| **React Context** | State management |

### Dev Tools
| Tool | Purpose |
|-----|---------|
| **Supertest** | API testing |
| **Jest** | Unit testing |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Vitest** | Frontend testing (optional) |

## 🧪 Testing

### Backend Integration Tests
```bash
cd backend
npm test                      # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

**Test Coverage:**
- ✅ Authentication (register, login, refresh)
- ✅ KYC verification (BVN, biometric, bank)
- ✅ Wallet operations (deposit, balance, withdrawal)
- ✅ Group management (create, join, contribute)
- ✅ Trust score calculation
- ✅ Notification delivery
- ✅ Admin analytics

### Manual Testing
See [TESTING.md](./TESTING.md) for complete testing guide

```bash
# Quick manual test
1. Open http://localhost:5173
2. Sign up with test@khalia.com / Test1234!
3. Complete 5-step onboarding
4. Explore dashboard
```

## 📊 API Endpoints (30+)

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT tokens
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Clear tokens

### KYC Verification
- `POST /kyc/verify-bvn` - BVN verification
- `POST /kyc/verify-biometric` - Facial recognition
- `POST /kyc/verify-bank` - Bank account verification
- `GET /kyc/status` - Current KYC status

### Wallet
- `POST /wallet/deposit` - Create deposit link
- `POST /wallet/withdraw` - Request withdrawal
- `GET /wallet/balance` - Account balance
- `GET /wallet/transactions` - Transaction history
- `GET /wallet/transactions/:id` - Transaction details

### Groups
- `POST /groups` - Create group
- `GET /groups` - List user's groups
- `GET /groups/:id` - Group details
- `POST /groups/:id/join` - Join group
- `POST /groups/:id/leave` - Leave group
- `POST /groups/:id/start-cycle` - Begin contribution cycle
- `POST /groups/:id/contribute` - Record contribution
- `GET /groups/:id/payout-info` - Payout information

### User Profile
- `GET /trust-score` - Trust score breakdown
- `GET /auth/me` - User profile
- `PUT /auth/me` - Update profile

### Admin
- `GET /admin/analytics` - System analytics
- `POST /admin/users/:id/kyc` - Manage KYC
- `POST /admin/payouts/:id` - Manage payouts

*Full API docs: [backend/API.md](./backend/API.md)*

## 🌍 Running in Production

### Deployment Options

**Option 1: Vercel + Railway (Easiest)**
```bash
vercel --prod              # Frontend
# + Railway PostgreSQL + Redis via UI
```

**Option 2: AWS (Most Control)**
- RDS PostgreSQL + ElastiCache Redis
- EC2 for backend API
- CloudFront + S3 for frontend
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for details

**Option 3: Docker Compose**
```bash
docker-compose up -d       # All services locally
```

### Environment Variables

**Backend Production:**
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<32+ char secret>
NODE_ENV=production
```

See [DEPLOYMENT.md](./DEPLOYMENT.md#environment-variables) for complete list

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9      # Frontend
lsof -ti:3000 | xargs kill -9      # Backend
```

### Database Connection Error
```bash
# Check PostgreSQL running
psql -U postgres -c "SELECT 1"

# Create database
createdb khalia_dev

# Run migrations
cd backend && npm run migrate:latest
```

### Authentication Issues
```bash
# Clear tokens and try again
# DevTools → Application → Local Storage → Remove accessToken

# Verify JWT_SECRET is set in .env
cat backend/.env | grep JWT_SECRET
```

### API Not Responding
```bash
# Check backend logs
tail -f /tmp/khalia-backend.log

# Test health endpoint
curl http://localhost:3000/health
```

See [TESTING.md#troubleshooting](./TESTING.md#common-issues--troubleshooting) for more

## 📈 Performance

**Expected Response Times:**
- Auth requests: < 200ms
- Balance queries: < 100ms
- Group operations: < 150ms
- KYC verification: < 500ms

**Database Indexes:**
- `users.email` (unique)
- `transactions.user_id`
- `transactions.created_at`
- `groups.creator_id`
- `ledger_entries.user_id`

## ✅ MVP Completion Status

| Phase | Tasks | Status |
|-------|-------|--------|
| Planning | 47 | ✅ Complete |
| Backend Services | 54 | ✅ Complete |
| Frontend Integration | 9 | ✅ Complete |
| Deployment & Launch | 8 | 📋 Ready |
| **Total** | **56** | **91%** |

### What's Included

✅ Full-stack implementation (backend + frontend)
✅ All 30+ API endpoints
✅ Complete user flows (signup → KYC → groups → payouts)
✅ 50+ integration tests
✅ Production-ready code
✅ Comprehensive documentation
✅ Mobile-responsive UI
✅ Real-time state management

### What's Next

After testing:
1. Deploy to staging environment
2. Run load testing (1000+ concurrent users)
3. Security audit
4. Go-live to production

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: [docs/](./docs/) directory
- **API Docs**: [backend/API.md](./backend/API.md)
- **Deployment Help**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📄 License

Proprietary - © 2024 Khalia. All rights reserved.

## 👥 Contributing

Contributions welcome! Please:

1. Create feature branch: `git checkout -b feature/description`
2. Commit changes: `git commit -m "feat: description"`
3. Push to GitHub: `git push origin feature/description`
4. Open Pull Request
5. Tag: `@josh` for review

## 🎉 We're Live!

**Ready to test?**

```bash
# Option 1: Quick start (macOS/Linux)
chmod +x startup.sh && ./startup.sh

# Option 2: Manual setup
# See "Quick Start" section above
```

Then open: **[http://localhost:5173](http://localhost:5173)**

Welcome to Khalia! 🚀

  