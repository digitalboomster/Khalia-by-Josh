# Khalia - Quick Reference Guide

## 🚀 Getting Started (Choose One)

### Option 1: Automatic Setup (Recommended)
```bash
chmod +x startup.sh && ./startup.sh
# Opens http://localhost:5173 automatically
```

### Option 2: Manual Frontend + Backend
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run migrate:latest
npm run dev

# Terminal 2 - Frontend
npm install  
npm run dev
```

### Option 3: Docker (All Services)
```bash
docker-compose up -d
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# Backend: localhost:3000
# Frontend: localhost:5173
```

---

## 🧪 Testing Quick Commands

### Run Backend Tests
```bash
cd backend
npm test              # All tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### Manual Frontend Test
```
1. Open http://localhost:5173
2. Sign up: test@khalia.com / Test1234!
3. Complete 5-step onboarding
4. View dashboard
```

### Test API with cURL
```bash
# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@khalia.com",
    "password": "Test1234!",
    "phone": "+2348012345678"
  }'

# Save token and test auth endpoint
TOKEN=<copy_access_token_from_response>
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test in Postman
```
1. Import: backend/API.md
2. Set base_url: http://localhost:3000/api/v1
3. Get token from register/login
4. Add to Header: Authorization: Bearer <token>
5. Test endpoints
```

---

## 📝 Development Commands

### Frontend
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview built version
npm run lint         # Check code style
```

### Backend
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Compile TypeScript
npm run start        # Production start
npm run migrate:*    # Database migrations
npm run seed         # Seed test data
```

---

## 🔧 Common Issues & Fixes

### Port Already in Use
```bash
# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9
```

### Database Issues
```bash
# Create database
createdb khalia_dev

# Reset database (CAUTION: Deletes data!)
dropdb khalia_dev
createdb khalia_dev
npm run migrate:latest

# Connect and check
psql khalia_dev
\dt  # List all tables
\q   # Exit
```

### Redis Not Running
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Check if running
redis-cli ping  # Should return PONG
```

### PostgreSQL Not Running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check if running
psql -U postgres -c "SELECT 1"  # Should return 1
```

---

## 🔍 Database Inspection

```bash
# Connect to database
psql khalia_dev

# List all tables
\dt

# View specific table
SELECT * FROM users LIMIT 5;
SELECT * FROM transactions LIMIT 10;
SELECT * FROM ledger_entries LIMIT 5;

# Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM transactions;

# View table structure
\d users

# Exit
\q
```

### Useful Queries

```sql
-- Get user with transactions
SELECT u.id, u.email, COUNT(t.id) as transaction_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id
LIMIT 5;

-- Get wallet balances
SELECT u.email, 
  SUM(CASE WHEN l.entry_type = 'debit' THEN -l.amount ELSE l.amount END) as balance
FROM users u
JOIN ledger_entries l ON u.id = l.user_id
GROUP BY u.id;

-- Get recent transactions
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 20;

-- Find high-value groups
SELECT name, contribution_amount, member_count
FROM groups
WHERE member_count > 5
ORDER BY contribution_amount DESC;
```

---

## 📊 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/khalia_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-min-32-characters-CHANGEME
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-chars
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
```

---

## 📱 Mobile Testing

### Responsive Design
```
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select iPhone/Android
4. Test navigation and forms
```

### Common Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🔐 Security Checklist

- [ ] JWT secrets are 32+ characters
- [ ] Secrets stored in .env (never in code)
- [ ] HTTPS enforced in production
- [ ] Rate limiting enabled (100 req/min)
- [ ] Passwords hashed with bcrypt
- [ ] Sensitive data encrypted at rest
- [ ] CORS restricted to frontend domain
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention (React auto-escapes)

---

## 📈 Performance Tips

### Database Optimization
```bash
# Check slow queries
cd backend
# Add EXPLAIN to queries to see execution plan
psql khalia_dev
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@khalia.com';
```

### Frontend Performance
```bash
# Build analysis
npm run build
# Check bundle size in dist/

# Lighthouse audit
npm run preview
# Open in browser, run Lighthouse (Devtools → Lighthouse)
```

---

## 🚀 Deployment Quick Steps

### to Vercel (Frontend)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### to Railway (Backend)
```bash
# 1. Create account at railway.app
# 2. Connect GitHub repo
# 3. Add PostgreSQL & Redis plugins
# 4. Deploy automatically on git push
```

### to AWS (Complete)
```bash
# See DEPLOYMENT.md for detailed steps
# Summary: RDS + ElastiCache + EC2 + CloudFront
```

---

## 📚 Documentation

| File | Contents |
|------|----------|
| [README.md](./README.md) | Project overview |
| [TESTING.md](./TESTING.md) | Complete testing guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment |
| [backend/API.md](./backend/API.md) | API endpoint docs |
| [specs/](./specs/001-mvp-implementation-plan/) | Architecture docs |

---

## 🎯 Success Metrics

After testing, verify:

✅ User can sign up and complete KYC
✅ Dashboard shows real data from API
✅ Can create/join groups
✅ Wallet operations work
✅ All pages responsive on mobile
✅ API responses < 500ms
✅ All 50+ tests passing
✅ No console errors

---

## 💡 Pro Tips

### Debugging Frontend
```bash
# Enable React DevTools
# Chrome: React Developer Tools extension

# View API calls
# DevTools → Network tab
# DevTools → Application → Local Storage (see tokens)
```

### Debugging Backend
```bash
# View logs in real-time
tail -f /tmp/khalia-backend.log

# Add debug logging
// In code
console.log('DEBUG:', data);

# VS Code Debugging
# Add breakpoints with debugger statement
// debugger;
```

### Fast Testing
```bash
# Use mock data for quick tests
# backend/src/data/mockData.ts

# Skip KYC verification for testing
# Implemented as mock endpoints - just call them

# Use test database
# Separate from production automatically
```

---

## ⚡ Quick Fixes

| Issue | Fix |
|-------|-----|
| "Cannot find module" | `npm install` |
| Port in use | `lsof -ti:<port> \| xargs kill -9` |
| DB connection error | `psql -U postgres -c "SELECT 1"` |
| Token expired | Clear localStorage, login again |
| CORS error | Check CORS_ORIGIN in backend .env |
| Blank dashboard | Check browser console for errors |

---

## 📞 Getting Help

1. **Check error logs**: `tail -f /tmp/khalia-backend.log`
2. **Read docs**: [TESTING.md](./TESTING.md) has troubleshooting section
3. **Check API docs**: [backend/API.md](./backend/API.md)
4. **Search issues**: GitHub Issues tab
5. **Ask team**: ops@khalia.app

---

## 📋 Testing Checklist

- [ ] Start backend: `npm run dev` (backend/)
- [ ] Start frontend: `npm run dev` (root)
- [ ] Open http://localhost:5173
- [ ] Sign up with test@khalia.com / Test1234!
- [ ] Complete 5-step KYC
- [ ] View dashboard metrics
- [ ] Create a test group
- [ ] Check wallet balance
- [ ] View profile
- [ ] Test mobile view
- [ ] Check all tests pass: `npm test` (backend/)
- [ ] Review logs for errors

---

**Need more? Check [TESTING.md](./TESTING.md) for the complete guide!**

Last Updated: 2024-04-20
