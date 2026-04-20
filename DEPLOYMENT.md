# Khalia MVP - Production Deployment Guide

## Deployment Architecture

```
┌─ Frontend (React / Vite) ─┐         ┌─ Backend (Express.js) ─┐
│  - Static HTML/CSS/JS      │         │  - REST API            │
│  - Hosted on: Vercel       │────────→│  - Hosted on: Railway  │
│  - Domain: khalia.app      │         │  - Domain: api.khalia  │
└────────────────────────────┘         └────────────────────────┘
         ↓ HTTPS                                ↓ HTTPS
    ├─ Cached                          ├─ JWT Auth
    ├─ CDN                             ├─ Rate Limiting
    └─ Auto-deploys on git push        └─ Audit Logs
                                            ↓
                                       ┌──────────────────┐
                                       │ PostgreSQL (AWS) │
                                       │ Redis (AWS)      │
                                       └──────────────────┘
```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing: `npm test`
- [ ] No console errors/warnings
- [ ] TypeScript strict mode enabled
- [ ] Environment variables documented
- [ ] API version in URL (`/api/v1`)
- [ ] Secrets NOT in code (use .env files)

### Security
- [ ] All passwords hashed with bcrypt
- [ ] JWT secrets are 32+ characters
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers
- [ ] HTTPS enforced
- [ ] SQL injection prevention verified
- [ ] Sensitive data encrypted at rest

### Performance
- [ ] Database indexes created
- [ ] No N+1 queries
- [ ] API response time < 500ms
- [ ] Image optimization
- [ ] Code splitting enabled
- [ ] Caching headers set
- [ ] Minification enabled

### Compliance
- [ ] Privacy policy written
- [ ] Terms of service written
- [ ] GDPR compliance checklist
- [ ] Data retention policy documented
- [ ] Audit logs format verified

## Infrastructure Setup

### Option 1: AWS Deployment (Recommended)

#### 1. Create AWS Account
```bash
# Sign up at: https://aws.amazon.com
# Create IAM user with programmatic access
# Get Access Key ID and Secret Access Key
```

#### 2. Database Setup (RDS - PostgreSQL)

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier khalia-prod-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password '<strong-password>' \
  --allocated-storage 20 \
  --publicly-accessible false

# Get database endpoint
aws rds describe-db-instances \
  --db-instance-identifier khalia-prod-db \
  --query 'DBInstances[0].Endpoint.Address'
```

**Database Details:**
- Engine: PostgreSQL 14+
- Instance Type: db.t3.micro (free tier eligible)
- Storage: 20GB (auto-scaling enabled)
- Backup: Daily snapshots, 30-day retention
- Multi-AZ: Enabled for high availability
- Security Group: Allow traffic from EC2 instances only

#### 3. Redis Cache Setup (ElastiCache)

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id khalia-prod-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1

# Get Redis endpoint
aws elasticache describe-cache-clusters \
  --cache-cluster-id khalia-prod-redis \
  --show-cache-node-info
```

**Redis Details:**
- Engine: Redis 7.0+
- Node Type: cache.t3.micro
- Parameter Group: Default (snapshotting enabled)
- Backup: Daily snapshots
- Security Group: Allow traffic from EC2 only

#### 4. Backend Server (EC2)

```bash
# Create security group
aws ec2 create-security-group \
  --group-name khalia-backend-sg \
  --description "Khalia Backend"

# Add inbound rules
aws ec2 authorize-security-group-ingress \
  --group-name khalia-backend-sg \
  --protocol tcp --port 3000 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name khalia-backend-sg \
  --protocol tcp --port 22 --cidr <your-ip>/32

# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name khalia-prod \
  --security-groups khalia-backend-sg
```

**EC2 Details:**
- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.micro (free tier eligible)
- Storage: 30GB EBS (gp3)
- Security Group: SSH (22) + HTTP (3000)

#### 5. Frontend Deployment (CloudFront + S3)

```bash
# Create S3 bucket for frontend
aws s3 mb s3://khalia-app-prod

# Enable static website hosting
aws s3 website s3://khalia-app-prod \
  --index-document index.html \
  --error-document index.html

# Create CloudFront distribution
# - Origin: S3 bucket URL
# - CNAME: khalia.app
# - SSL Certificate: Request from ACM
# - Default Root Object: index.html
# - 404 → index.html for SPA routing
```

### Option 2: Vercel + Railway (Simpler Alternative)

#### Frontend on Vercel
```bash
# Login to Vercel
npm i -g vercel
vercel login

# Deploy
vercel --prod

# Configure environment
vercel env add REACT_APP_API_URL https://api.khalia.app
```

#### Backend on Railway
```bash
# Sign up: https://railway.app
# Connect GitHub repository
# Create PostgreSQL and Redis plugins
# Deploy from GitHub with auto-deploys
```

## Environment Variables

### Backend Production (.env)

```env
# Database
DATABASE_URL=postgresql://admin:password@khalia-prod-db.xxx.rds.amazonaws.com:5432/khalia

# Redis
REDIS_URL=redis://khalia-prod-redis.xxx.cache.amazonaws.com:6379

# JWT Auth
JWT_SECRET=your-256-bit-secret-here-min-32-chars-CHANGEME
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-min-32-chars-CHANGEME
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# API Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Frontend
FRONTEND_URL=https://khalia.app
CORS_ORIGIN=https://khalia.app

# Payment Gateway
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

# Email Service
SENDGRID_API_KEY=SG.xxxxx
SENDER_EMAIL=noreply@khalia.app

# File Storage (AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET=khalia-prod-files

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOG_LEVEL=info
LOG_FORMAT=json

# Compliance
DATA_RETENTION_DAYS=2555  # 7 years
PII_ENCRYPTION_KEY=your-32-char-encryption-key

# Security
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Production (.env.production)

```env
REACT_APP_API_URL=https://api.khalia.app
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

## Database Migration to Production

### Step 1: Pre-Migration Backup

```bash
# Backup current database
pg_dump -h khalia-prod-db.xxx.rds.amazonaws.com \
  -U admin -d khalia > backup-$(date +%Y%m%d).sql

# Store backup in S3
aws s3 cp backup-$(date +%Y%m%d).sql \
  s3://khalia-backups/
```

### Step 2: Run Migrations

```bash
cd backend

# Set database connection
export DATABASE_URL=postgresql://admin:password@khalia-prod-db.xxx.rds.amazonaws.com:5432/khalia

# Run migrations
npm run migrate:latest

# Verify schema
npm run migrate:status
```

### Step 3: Create Indexes

```bash
npx knex seed:run --env production
```

### Step 4: Verify Data Integrity

```bash
# Connect to production database
psql $DATABASE_URL << 'EOF'
-- Verify tables created
\dt

-- Verify indexes
\d users

-- Count records
SELECT COUNT(*) FROM users;
EOF
```

## Application Deployment

### Backend Deployment

#### Using AWS EC2

```bash
# SSH into instance
ssh -i khalia-prod.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install -y nodejs npm git

# Clone repository
git clone <your-repo-url>
cd Khalia-by-Josh/backend

# Install packages
npm ci --production  # Use npm ci for production

# Create systemd service
sudo tee /etc/systemd/system/khalia-backend.service > /dev/null << 'EOF'
[Unit]
Description=Khalia Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Khalia-by-Josh/backend
EnvironmentFile=/home/ubuntu/.env
ExecStart=/usr/bin/node dist/app.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable khalia-backend
sudo systemctl start khalia-backend

# Check logs
sudo journalctl -u khalia-backend -f
```

#### Using Docker (Recommended)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source code
COPY dist ./dist
COPY migrations ./migrations

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/app.js"]
```

```bash
# Build image
docker build -t khalia-backend:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name khalia-backend \
  khalia-backend:latest

# Check logs
docker logs -f khalia-backend
```

### Frontend Deployment

#### Build for Production

```bash
npm run build

# Output in /dist directory
# Test production build locally
npm run preview
```

#### Deploy to Vercel

```bash
vercel deploy --prod
```

#### Deploy to S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist s3://khalia-app-prod \
  --delete \
  --cache-control max-age=31536000

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id XXXXX \
  --paths "/*"
```

## SSL/TLS Certificates

### Using AWS Certificate Manager (ACM)

```bash
# Request certificate
aws acm request-certificate \
  --domain-name khalia.app \
  --subject-alternative-names "*.khalia.app" \
  --validation-method DNS

# Verify certificate in Route53
# CloudFront will automatically use it
```

### Using Let's Encrypt (Self-managed)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Request certificate
sudo certbot certonly --standalone \
  -d khalia.app \
  -d api.khalia.app

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring & Logging

### CloudWatch Monitoring

```bash
# Backend logs collection
aws logs create-log-group --log-group-name /aws/ec2/khalia-backend

# Create metric dashboard
aws cloudwatch put-dashboard --dashboard-name Khalia \
  --dashboard-body file://dashboard-config.json
```

### Application Monitoring (Sentry)

```bash
# Sign up: https://sentry.io
# Add to backend

import Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### API Monitoring (New Relic Alternative: Datadog)

```bash
# Sign up: https://www.datadoghq.com

# Add to backend
npm install --save dd-trace

# Import at app start
require('dd-trace').init();

# Key metrics tracked:
# - Request latency
# - Error rates
# - Database query time
# - Memory usage
```

## Alerts & Notifications

### CloudWatch Alarms

```bash
# CPU > 80%
aws cloudwatch put-metric-alarm \
  --alarm-name khalia-high-cpu \
  --alarm-actions arn:aws:sns:xxx:alarm-sns

# Database connections > 80
aws cloudwatch put-metric-alarm \
  --alarm-name khalia-db-connection-high \
  --alarm-actions arn:aws:sns:xxx:alarm-sns

# API errors > 5%
aws cloudwatch put-metric-alarm \
  --alarm-name khalia-api-error-rate \
  --alarm-actions arn:aws:sns:xxx:alarm-sns
```

### Email Alerts

```bash
# Create SNS topic
aws sns create-topic --name khalia-alarms

# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:xxx:khalia-alarms \
  --protocol email \
  --notification-endpoint ops@khalia.app
```

## Backup & Disaster Recovery

### Automated Backups

```bash
# RDS automatic backups (enabled by default)
# - Daily snapshots
# - 30-day retention
# - Automatic failover enabled

# Manual backup
aws rds create-db-snapshot \
  --db-instance-identifier khalia-prod-db \
  --db-snapshot-identifier khalia-backup-$(date +%Y%m%d)
```

### Restore Procedure

```bash
# Create new database from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier khalia-prod-db-restored \
  --db-snapshot-identifier khalia-backup-20240101

# Test connection
psql -h khalia-prod-db-restored.xxx.rds.amazonaws.com \
  -U admin -d khalia
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_transactions_user_id ON transactions(user_id);
CREATE INDEX CONCURRENTLY idx_transactions_created_at ON transactions(created_at);
CREATE INDEX CONCURRENTLY idx_groups_creator_id ON groups(creator_id);
CREATE INDEX CONCURRENTLY idx_ledger_entries_user_id ON ledger_entries(user_id);

-- Analyze tables
ANALYZE users;
ANALYZE transactions;
ANALYZE ledger_entries;

-- View query plans
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@khalia.com';
```

### Redis Caching

```typescript
// Cache user profiles (5 minutes)
const user = await redis.get(`user:${userId}`);
if (!user) {
  const userData = await getUserFromDB(userId);
  await redis.setex(`user:${userId}`, 300, JSON.stringify(userData));
}

// Cache KYC status (30 minutes)
await redis.setex(`kyc:${userId}`, 1800, JSON.stringify(kycStatus));

// Monitor cache hit ratio
redis.info('stats');  // hits vs misses
```

### CDN Configuration

```bash
# CloudFront settings
# - Compress: Enable Gzip/Brotli
# - Cache behavior: 
#   * Static assets: 1 year
#   * HTML: 1 hour
#   * API: No cache
# - Root object: index.html
# - Error pages: Custom 404 → index.html
```

## Compliance & Security

### Data Encryption

```bash
# At-rest encryption
# - RDS: Enable encryption (AWS KMS)
# - S3: Enable default encryption
# - Redis: In-transit encryption enabled

aws rds create-db-snapshot \
  --db-instance-identifier khalia-prod-db \
  --storage-encrypted
```

### Access Control

```bash
# IAM roles and policies
# - Application: Read/write to database and S3
# - Backup: Read-only to snapshots
# - Admin: Full access (limited team)

aws iam create-role \
  --role-name KhaliaBackendRole \
  --assume-role-policy-document file://trust-policy.json
```

### Audit Logging

```bash
# Enable RDS audit logging
aws rds modify-db-instance \
  --db-instance-identifier khalia-prod-db \
  --enable-cloudwatch-logs-exports postgresql

# Enable S3 access logging
aws s3api put-bucket-logging \
  --bucket khalia-app-prod \
  --bucket-logging-status file://logging.json

# Verify audit logs
SELECT * FROM pg_stat_statements WHERE query LIKE '%users%';
```

## Post-Deployment Verification

### Health Checks

```bash
# API health
curl https://api.khalia.app/health

# Database connectivity
curl https://api.khalia.app/api/v1/auth/me -H "Authorization: Bearer invalid"
# Should return 401 (not 500)

# Frontend accessibility
curl https://khalia.app/ | head -20
```

### Performance Baseline

```bash
# Response times should be < 500ms
ab -n 1000 https://api.khalia.app/health

# Load test
wrk -t12 -c400 -d30s https://api.khalia.app/api/v1/groups
```

### Security Scan

```bash
# SSL/TLS check
nmap --script ssl-enum-ciphers -p 443 api.khalia.app

# OWASP check
npx snyk test
```

## Rollback Procedure

If deployment fails:

```bash
# 1. Revert code
git revert HEAD

# 2. Rebuild and redeploy
npm run build
vercel deploy --prod

# 3. If database issues, restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier khalia-prod-db-restored \
  --db-snapshot-identifier khalia-backup-20240101

# 4. Verify data integrity
psql $DATABASE_URL << 'EOF'
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM transactions;
EOF

# 5. Switch traffic back
aws route53 change-resource-record-sets ...
```

## Support & Contacts

- **AWS Support**: https://console.aws.amazon.com/support
- **Sentry Support**: support@sentry.io
- **Datadog Support**: support@datadoghq.com
- **On-call Engineer**: ops@khalia.app

## Deployment Checklist

- [ ] All tests passing
- [ ] Secrets secured in .env
- [ ] Database migrated
- [ ] SSL certificates issued
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Disaster recovery tested
- [ ] Load tested (1000+ concurrent users)
- [ ] Security audit passed
- [ ] Team trained on runbooks
- [ ] Status page setup
- [ ] Go/no-go decision made

**Deployment is LIVE when all checks pass ✓**
