# Khalia Backend API Documentation

## Overview

Khalia is a Shariah-compliant fintech platform for savings groups in Nigeria. This backend provides REST APIs for user management, KYC verification, wallet operations, group management, and financial transactions with immutable ledger tracking.

## Base URL

```
https://api.khalia.ng/api/v1
http://localhost:3000/api/v1 (development)
```

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained from the `/auth/login` endpoint and are valid for 15 minutes. Use the `/auth/refresh` endpoint to get a new access token using your 30-day refresh token.

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { /* response payload */ },
  "error": null,
  "requestId": "uuid"
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "requestId": "uuid"
}
```

## API Endpoints

### Authentication (T057-T058)

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone_number": "08012345678",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "kyc_level": 1,
    "kyc_status": "email_verified",
    "trust_score": 20
  },
  "access_token": "jwt_token",
  "refresh_token": "refresh_jwt_token",
  "expires_in": 900
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200
{
  "user": { /* user object */ },
  "access_token": "jwt_token",
  "refresh_token": "refresh_jwt_token"
}
```

#### Refresh Token
```
POST /auth/refresh
Authorization: Bearer <refresh_token>

Response: 200
{
  "access_token": "new_jwt_token",
  "expires_in": 900
}
```

#### Get Profile
```
GET /auth/me
Authorization: Bearer <access_token>

Response: 200
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "phone_number": "08012345678",
    "kyc_level": 5,
    "trust_score": 85,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### KYC Verification (T059-T063)

#### Verify BVN
```
POST /kyc/verify-bvn
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bvn": "12345678901"
}

Response: 200
{
  "verification_id": "bvn_req_1234567890",
  "status": "confirmed",
  "kyc_status": "bvn_verified",
  "kyc_level": 3,
  "details": {
    "name": "John Doe",
    "date_of_birth": "1990-01-01",
    "account_number": "0123456789"
  }
}
```

#### Verify Biometric (Facial Recognition)
```
POST /kyc/verify-biometric
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "biometric_image_base64": "data:image/jpeg;base64,..."
}

Response: 200
{
  "status": "verified",
  "kyc_status": "biometric_verified",
  "kyc_level": 4,
  "confidence_score": 0.99
}
```

#### Verify Bank Account
```
POST /kyc/verify-bank
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "account_number": "0123456789",
  "account_name": "John Doe",
  "bank_code": "033"
}

Response: 200
{
  "status": "verified",
  "kyc_status": "bank_verified",
  "kyc_level": 5,
  "bank_account": "****6789"
}
```

#### Get KYC Status
```
GET /kyc/status
Authorization: Bearer <access_token>

Response: 200
{
  "kyc_status": "bank_verified",
  "kyc_level": 5,
  "completion_percentage": 100,
  "next_step": "KYC Complete",
  "requirements": {
    "email_verified": true,
    "phone_verified": true,
    "bvn_verified": true,
    "biometric_verified": true,
    "bank_verified": true
  },
  "aml_risk_level": "low"
}
```

### Wallet Operations (T070-T076)

#### Create Deposit Link
```
POST /wallet/deposit
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount_naira": 50000
}

Response: 200
{
  "transaction_id": "uuid",
  "amount_naira": 50000,
  "payment_url": "https://checkout.paystack.com/...",
  "expires_at": "2024-01-15T11:00:00Z",
  "gateway": "paystack"
}
```

#### Get Wallet Balance
```
GET /wallet/balance
Authorization: Bearer <access_token>

Response: 200
{
  "available_balance": 250000,
  "pending_transactions": 2,
  "held_amount": 50000,
  "currency": "NGN"
}
```

#### Request Withdrawal
```
POST /wallet/withdraw
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "amount_naira": 100000
}

Response: 200
{
  "transaction_id": "uuid",
  "amount_naira": 100000,
  "status": "pending_approval",
  "estimated_delivery": "2-3 business days"
}
```

#### List Transactions
```
GET /wallet/transactions?limit=20&offset=0
Authorization: Bearer <access_token>

Response: 200
{
  "transactions": [
    {
      "id": "uuid",
      "type": "deposit",
      "amount_naira": 50000,
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": "2024-01-15T10:35:00Z"
    }
  ],
  "count": 5
}
```

#### Get Transaction Details
```
GET /wallet/transactions/{transaction_id}
Authorization: Bearer <access_token>

Response: 200
{
  "transaction": {
    "id": "uuid",
    "type": "deposit",
    "amount_naira": 50000,
    "status": "completed",
    "gateway_reference": "ref_123456",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:35:00Z",
    "payment_gateway": "paystack"
  }
}
```

### Groups & Contributions (T077-T085)

#### Create Group
```
POST /groups
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Monthly Savings Circle",
  "description": "A group for monthly savings",
  "contribution_amount_naira": 50000,
  "frequency": "monthly",
  "max_members": 10,
  "payout_order": "round_robin",
  "is_shariah_compliant": true
}

Response: 201
{
  "group_id": "uuid",
  "name": "Monthly Savings Circle",
  "status": "active",
  "members": 1,
  "member_role": "creator"
}
```

#### Get Group Details
```
GET /groups/{group_id}
Authorization: Bearer <access_token>

Response: 200
{
  "group": {
    "id": "uuid",
    "name": "Monthly Savings Circle",
    "contribution_amount_naira": 50000,
    "frequency": "monthly",
    "max_members": 10,
    "current_members": 5,
    "payout_order": "round_robin",
    "status": "active"
  },
  "members": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "role": "creator",
      "individual_trust_score": 85
    }
  ],
  "contributions": [
    {
      "status": "paid",
      "count": 5
    }
  ]
}
```

#### Join Group
```
POST /groups/{group_id}/join
Authorization: Bearer <access_token>

Response: 200
{
  "success": true,
  "group_id": "uuid",
  "role": "member"
}
```

#### Start Contribution Cycle
```
POST /groups/{group_id}/start-cycle
Authorization: Bearer <access_token>

Response: 200
{
  "cycle_id": "uuid",
  "status": "active",
  "due_date": "2024-02-15T23:59:59Z",
  "members_count": 5
}
```

#### Record Contribution
```
POST /groups/{group_id}/contribute
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "cycle_id": "uuid"
}

Response: 200
{
  "contribution_id": "uuid",
  "amount": 50000,
  "status": "paid",
  "transaction_id": "uuid"
}
```

#### Get Payout Info
```
GET /groups/{group_id}/payout-info
Authorization: Bearer <access_token>

Response: 200
{
  "group_id": "uuid",
  "total_collected": 250000,
  "recipients_count": 5,
  "suggested_recipient": {
    "id": "uuid",
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "payout_order": "round_robin"
}
```

### Trust Score (T086-T087)

#### Get Trust Score
```
GET /trust-score
Authorization: Bearer <access_token>

Response: 200
{
  "overall_score": 85,
  "factors": {
    "contributions": {
      "total": 12,
      "on_time": 11,
      "late": 1
    },
    "group_participation": 3
  },
  "score_range": "20-100",
  "risk_level": "low"
}
```

### Notifications (T091-T094)

#### Get Notifications
```
GET /notifications?limit=20&offset=0
Authorization: Bearer <access_token>

Response: 200
{
  "notifications": [
    {
      "id": "uuid",
      "type": "contribution_due",
      "title": "Contribution Due",
      "message": "Your contribution of ₦50,000 is due by 2024-02-15",
      "is_read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "unread_count": 3,
  "total": 5
}
```

#### Mark as Read
```
POST /notifications/{notification_id}/read
Authorization: Bearer <access_token>

Response: 200
{
  "notification_id": "uuid",
  "is_read": true
}
```

#### Mark All as Read
```
POST /notifications/read-all
Authorization: Bearer <access_token>

Response: 200
{
  "marked_as_read": 5
}
```

### Admin Routes (T088-T090)

#### Get System Analytics
```
GET /admin/analytics
Authorization: Bearer <admin_token>

Response: 200
{
  "users": {
    "total_users": 1250,
    "fully_verified": 980,
    "high_risk_users": 12
  },
  "groups": {
    "total_groups": 245,
    "active_creators": 189,
    "avg_group_size": 8
  },
  "financials": {
    "total_volume": 125000000,
    "transaction_count": 5620,
    "avg_transaction": 22255
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Manage User KYC
```
POST /admin/users/{user_id}/kyc
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "approve",
  "reason": "All documents verified"
}

Response: 200
{
  "user_id": "uuid",
  "action": "approve",
  "new_status": "approved"
}
```

#### Manage Payout
```
POST /admin/payouts/{payout_id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "approve",
  "reason": "Verified and ready"
}

Response: 200
{
  "payout_id": "uuid",
  "action": "approve",
  "new_status": "approved"
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing credentials |
| `UNAUTHORIZED` | 401 | Token expired or invalid |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INSUFFICIENT_BALANCE` | 400 | Wallet balance insufficient |
| `KYC_INCOMPLETE` | 400 | KYC verification incomplete |
| `BANK_NOT_VERIFIED` | 400 | Bank account not verified |
| `GROUP_FULL` | 400 | Group is at max capacity |
| `ALREADY_MEMBER` | 400 | User is already a member |
| `PENDING_CONTRIBUTIONS` | 400 | Cannot leave group with pending contributions |
| `SERVER_ERROR` | 500 | Internal server error |

## Rate Limiting

- **Limit**: 100 requests per minute per user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Security

- **Transport**: TLS 1.3 (HTTPS only)
- **Passwords**: Bcrypt with 12 rounds
- **Tokens**: JWT ES256 signature
- **Encryption**: Sensitive data encrypted with AES-256
- **CORS**: Configured for production domains
- **Headers**: Helmet security headers enabled

## Development

### Setup

```bash
cd backend
npm install
npm run migrate:latest
npm run dev
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Build

```bash
npm run build
npm start
```

## Database Schema

See [data-model.md](../data-model.md) for complete schema documentation including:
- Users table (KYC state machine)
- Groups & GroupMembers
- Contributions & Transactions
- Ledger (immutable double-entry)
- Escrow & PayoutCycles
- Notifications & AuditLogs

## Compliance

- **AML/KYC**: Tier-based verification with risk assessment
- **Privacy**: NDPR compliant data handling
- **Audit**: Immutable 7-year retention
- **Financial**: Double-entry ledger, PCI DSS ready
