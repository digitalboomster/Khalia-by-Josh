# API Contracts: Khalia MVP Backend

**Document**: REST API Specification (OpenAPI/Swagger)
**Date**: April 20, 2026
**Status**: Phase 1 Complete
**Base URL**: `https://api.khalia.ng/api/v1` (production) | `http://localhost:3000/api/v1` (local)
**Auth**: JWT Bearer token (HTTP-only cookie or Authorization header)

---

## Overview

**Total Endpoints**: 25+  
**Authentication**: JWT with 15-min access token, 30-day refresh token  
**Error Format**: All errors return `{ success: false, error: { code, message }, requestId }`  
**Rate Limiting**: 100 requests/min per user  
**Response Timeout**: 30 seconds  

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response payload */ },
  "requestId": "req_abc123"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Contribution amount must be positive",
    "details": {}
  },
  "requestId": "req_abc123"
}
```

### HTTP Status Codes

| Status | Use Case |
|--------|----------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Resource created (POST) |
| 204 | No content (DELETE) |
| 400 | Validation error (bad request) |
| 401 | Unauthenticated (no token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, state violation) |
| 429 | Rate limited |
| 500 | Server error |

---

## Authentication APIs

### POST /auth/register

**Purpose**: Register new user with email and password

**OAuth**: None (public endpoint)

**Request Body**:
```json
{
  "email": "user@example.com",
  "phone_number": "+234901234567",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Request Validation**:
- `email`: Valid email format, unique in DB
- `phone_number`: Valid Nigerian phone (0801-0999), unique in DB
- `password`: Min 12 chars, uppercase, lowercase, number, special char
- `first_name`, `last_name`: 2-50 chars, only letters/hyphens

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "kyc_status": "not_started",
    "kyc_level": 1,
    "trust_score": 20,
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here"
  }
}
```

**Error Cases**:
- 400: Email/phone already exists
- 400: Password doesn't meet requirements
- 400: Invalid email/phone format

**Side Effects**:
- Send verification email (OTP)
- Create audit log entry: `user_registered`
- Initialize wallet with 0 balance

---

### POST /auth/login

**Purpose**: Authenticate user, return JWT tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "user@example.com",
    "kyc_status": "email_verified",
    "kyc_level": 2,
    "access_token": "jwt_...",
    "refresh_token": "refresh_...",
    "expires_in": 900
  }
}
```

**Error Cases**:
- 401: Invalid email or password
- 403: Account locked (too many failed attempts)

**Side Effects**:
- Create audit log: `user_login`
- Set HTTP-only cookie: `refresh_token`

---

### POST /auth/refresh

**Purpose**: Refresh expired access token using refresh token

**Headers**:
```
Authorization: Bearer <refresh_token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token",
    "expires_in": 900
  }
}
```

**Error Cases**:
- 401: Refresh token invalid/expired
- 401: Refresh token revoked

---

### POST /auth/logout

**Purpose**: Revoke tokens, clear session

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

**Side Effects**:
- Add token to blacklist (Redis, 30-day TTL)
- Create audit log: `user_logout`
- Clear refresh_token cookie

---

### POST /auth/verify-email

**Purpose**: Verify email with OTP

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "kyc_status": "email_verified",
    "kyc_level": 2
  }
}
```

**Error Cases**:
- 400: Invalid or expired OTP
- 404: User not found
- 409: Email already verified

---

### POST /auth/verify-phone

**Purpose**: Verify phone with SMS OTP

**Request Body**:
```json
{
  "phone_number": "+234901234567",
  "otp_code": "123456"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "kyc_status": "phone_verified",
    "kyc_level": 2
  }
}
```

---

### POST /auth/verify-bvn

**Purpose**: Initiate BVN verification (lookup against NIBSS)

**Request Body**:
```json
{
  "bvn": "22000000001"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "verification_id": "bvn_req_123",
    "status": "pending",
    "message": "Check your email for BVN details confirmation"
  }
}
```

**Error Cases**:
- 400: Invalid BVN format
- 400: BVN lookup failed (invalid BVN)

**Side Effects**:
- Call BVN provider API (NIBSS/aggregator)
- Store encrypted BVN hash in DB
- Send email with details to confirm

---

### GET /auth/verify-bvn/:requestId

**Purpose**: Poll BVN verification status

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "verification_id": "bvn_req_123",
    "status": "confirmed",
    "kyc_status": "bvn_verified",
    "kyc_level": 3,
    "details": {
      "name": "John Doe",
      "date_of_birth": "1990-01-01",
      "account_number": "0123456789"
    }
  }
}
```

**Polling**: Client polls every 2-3 seconds, max 60 second timeout

---

### POST /auth/verify-biometric

**Purpose**: Submit facial recognition for verification

**Request Body**:
```json
{
  "biometric_image_base64": "iVBORw0KGgoAAAANS...",
  "image_type": "jpg"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "status": "verified",
    "kyc_status": "biometric_verified",
    "kyc_level": 4,
    "confidence_score": 0.99
  }
}
```

**Side Effects**:
- Call facial recognition API (AWS Rekognition/Google Vision)
- Store encrypted biometric template hash
- Update KYC status
- Never store or log image itself

---

## Wallet & Financial APIs

### GET /wallet/balance

**Purpose**: Get current wallet balance and breakdown

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "total_balance_naira": 150000,
    "available_balance_naira": 100000,
    "locked_in_escrow_naira": 50000,
    "currency": "NGN",
    "last_updated_at": "2026-04-20T10:30:00Z"
  }
}
```

---

### POST /wallet/deposit

**Purpose**: Initiate deposit (returns payment link)

**Request Body**:
```json
{
  "amount_naira": 50000,
  "payment_method": "card"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_abc123",
    "payment_link": "https://paystack.co/pay/...",
    "amount_naira": 50000,
    "status": "pending",
    "expires_at": "2026-04-20T10:45:00Z"
  }
}
```

**Error Cases**:
- 400: Amount must be > 100 naira
- 403: User KYC incomplete (requires level 2+)
- 409: Pending deposit already exists

---

### POST /wallet/withdraw

**Purpose**: Initiate withdrawal to bank account

**Request Body**:
```json
{
  "amount_naira": 25000
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_def456",
    "amount_naira": 25000,
    "bank_account": "****6789",
    "status": "processing",
    "expected_settlement": "2026-04-22T14:00:00Z"
  }
}
```

**Error Cases**:
- 400: Insufficient balance
- 403: User KYC incomplete (requires level 3+)
- 409: Locked in escrow, cannot withdraw

---

### GET /wallet/transactions

**Purpose**: List wallet transactions with filtering

**Query Params**:
```
?type=deposit,withdrawal,payout
&status=completed,pending
&date_from=2026-04-01
&date_to=2026-04-30
&limit=20
&offset=0
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_abc123",
        "type": "deposit",
        "amount_naira": 50000,
        "status": "completed",
        "created_at": "2026-04-20T10:30:00Z",
        "reference": "ref_paystack_123"
      }
    ],
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

---

### GET /wallet/escrow

**Purpose**: View funds locked in escrow (contributions)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "total_locked_naira": 50000,
    "contributions": [
      {
        "id": "contrib_123",
        "group_name": "Business Group",
        "amount_naira": 25000,
        "due_date": "2026-04-25",
        "status": "pending"
      },
      {
        "id": "contrib_124",
        "group_name": "Business Group",
        "amount_naira": 25000,
        "due_date": "2026-05-02",
        "status": "pending"
      }
    ]
  }
}
```

---

## Group Management APIs

### GET /groups

**Purpose**: Discover all groups (with filters)

**Query Params**:
```
?contribution_frequency=monthly
&min_goal=50000
&max_contribution=50000
&is_shariah_compliant=true
&search=business
&limit=20
&offset=0
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "grp_abc123",
        "name": "Business Owners Savings",
        "description": "Monthly savings group for business owners",
        "goal": "Equipment fund",
        "contribution_amount_naira": 50000,
        "contribution_frequency": "monthly",
        "current_members": 8,
        "max_members": 10,
        "is_shariah_compliant": true,
        "creator_name": "Musa Ahmed",
        "creator_trust_score": 85,
        "payout_order": "round_robin"
      }
    ],
    "total": 124,
    "limit": 20,
    "offset": 0
  }
}
```

---

### POST /groups

**Purpose**: Create new group

**Request Body**:
```json
{
  "name": "Business Owners Savings",
  "description": "Monthly savings group",
  "goal": "Equipment fund",
  "contribution_amount_naira": 50000,
  "contribution_frequency": "monthly",
  "contribution_due_day": 1,
  "max_members": 10,
  "payout_order": "round_robin",
  "is_shariah_compliant": true,
  "requires_approval": true
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "grp_abc123",
    "name": "Business Owners Savings",
    "creator_id": "user_123",
    "status": "active",
    "created_at": "2026-04-20T10:30:00Z"
  }
}
```

---

### GET /groups/:groupId

**Purpose**: Get group details, members, contribution schedule

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "grp_abc123",
    "name": "Business Owners Savings",
    "description": "...",
    "goal": "Equipment fund",
    "contribution_amount_naira": 50000,
    "contribution_frequency": "monthly",
    "current_members": 8,
    "max_members": 10,
    "payout_order": "round_robin",
    "is_shariah_compliant": true,
    "creator": {
      "id": "user_123",
      "name": "Musa Ahmed",
      "trust_score": 85,
      "kyc_level": 3
    },
    "members": [
      {
        "user_id": "user_456",
        "name": "Aisha Ibrahim",
        "role": "member",
        "status": "active",
        "trust_score": 75,
        "payout_sequence": 2,
        "joined_at": "2026-03-15T08:00:00Z"
      }
    ],
    "next_contribution_due": "2026-04-30",
    "next_payout_recipient": "Aisha Ibrahim",
    "next_payout_date": "2026-05-15",
    "status": "active"
  }
}
```

---

### POST /groups/:groupId/join

**Purpose**: Request to join group

**Request Body**:
```json
{
  "message": "I'm interested in joining"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "request_id": "req_123",
    "status": "pending_approval",
    "message": "Join request submitted, awaiting group admin approval"
  }
}
```

**Error Cases**:
- 404: Group not found
- 409: Already member or pending
- 409: Group is full

---

### GET /groups/:groupId/members

**Purpose**: List all group members

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "user_id": "user_456",
        "name": "Aisha Ibrahim",
        "email": "aisha@example.com",
        "role": "member",
        "status": "active",
        "individual_trust_score": 75,
        "payout_sequence": 2,
        "joined_at": "2026-03-15T08:00:00Z",
        "contributions_paid": 2,
        "contributions_failed": 0
      }
    ]
  }
}
```

---

## Contribution APIs

### GET /groups/:groupId/contributions

**Purpose**: Get all contributions for a group

**Query Params**:
```
?status=pending,paid,overdue
&user_id=user_456
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "contributions": [
      {
        "id": "contrib_123",
        "user_id": "user_456",
        "user_name": "Aisha Ibrahim",
        "amount_naira": 50000,
        "status": "paid",
        "due_date": "2026-03-31",
        "paid_at": "2026-03-30T14:25:00Z",
        "payment_method": "card",
        "payment_reference": "ref_paystack_abc"
      }
    ]
  }
}
```

---

### POST /groups/:groupId/contributions/:contributionId/pay

**Purpose**: Make a contribution payment

**Request Body**:
```json
{
  "payment_method": "card"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_xyz789",
    "payment_link": "https://paystack.co/pay/...",
    "amount_naira": 50000,
    "expires_at": "2026-04-20T11:00:00Z"
  }
}
```

---

## Payout & Settlement APIs

### GET /payouts

**Purpose**: List payouts (created, awaiting approval, settled)

**Query Params**:
```
?status=pending_approval,approved,settled,failed
&group_id=grp_abc123
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "payout_123",
        "group_id": "grp_abc123",
        "group_name": "Business Owners Savings",
        "recipient_user_id": "user_456",
        "recipient_name": "Aisha Ibrahim",
        "amount_naira": 400000,
        "payout_sequence": 2,
        "status": "pending_approval",
        "scheduled_date": "2026-04-25",
        "settlement_method": "bank_transfer",
        "created_at": "2026-04-20T10:00:00Z"
      }
    ]
  }
}
```

---

### POST /payouts/:payoutId/approve

**Purpose**: Approve payout for settlement (admin only)

**Headers**:
```
Authorization: Bearer <admin_access_token>
```

**Request Body**:
```json
{
  "approval_notes": "Verified all contributions paid"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "payout_id": "payout_123",
    "status": "approved",
    "approved_at": "2026-04-20T10:30:00Z",
    "next_step": "Settlement processing will begin within 24 hours"
  }
}
```

---

### POST /payouts/:payoutId/execute

**Purpose**: Execute settlement (transfer funds to recipient)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "payout_id": "payout_123",
    "status": "processing",
    "settlement_reference": "BT20260420001",
    "expected_delivery": "2026-04-22T14:00:00Z"
  }
}
```

---

## Admin APIs

### POST /admin/members/:memberId/approve

**Purpose**: Approve pending group member join request

**Headers**:
```
Authorization: Bearer <admin_access_token>
```

**Request Body**:
```json
{
  "payout_sequence": 3,
  "approval_notes": "Approved based on trust score"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "member_id": "member_123",
    "status": "active",
    "payout_sequence": 3,
    "approved_at": "2026-04-20T10:30:00Z"
  }
}
```

---

### POST /admin/members/:memberId/reject

**Purpose**: Reject pending member join request

**Request Body**:
```json
{
  "rejection_reason": "KYC verification failed"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "member_id": "member_123",
    "status": "rejected",
    "rejected_at": "2026-04-20T10:30:00Z"
  }
}
```

---

### GET /admin/audit-log

**Purpose**: Export audit log for compliance (7-year retention)

**Query Params**:
```
?action=kyc_verified,contribution_paid
&date_from=2026-01-01
&date_to=2026-04-30
&format=json
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "audit_logs": [
      {
        "id": "log_123",
        "timestamp": "2026-04-20T10:30:00Z",
        "action": "contribution_paid",
        "actor_user_id": "user_456",
        "resource_type": "contribution",
        "resource_id": "contrib_123",
        "details": {
          "amount": 50000,
          "payment_method": "card"
        }
      }
    ],
    "total": 5421
  }
}
```

---

### GET /admin/alerts

**Purpose**: View system alerts and anomalies

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert_123",
        "severity": "warning",
        "type": "ledger_discrepancy",
        "message": "Daily reconciliation failed: debits ≠ credits",
        "detected_at": "2026-04-20T02:15:00Z",
        "status": "open"
      }
    ]
  }
}
```

---

## Profile & User APIs

### GET /profile

**Purpose**: Get current user profile

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "user_456",
    "email": "aisha@example.com",
    "phone_number": "+234901234567",
    "first_name": "Aisha",
    "last_name": "Ibrahim",
    "kyc_status": "approved",
    "kyc_level": 3,
    "trust_score": 85,
    "trust_score_breakdown": {
      "punctuality": 90,
      "consistency": 85,
      "duration": 75,
      "reviews": 80
    },
    "profile_picture_url": "https://...",
    "bio": "Business owner, community leader",
    "bank_account": {
      "account_name": "Aisha Ibrahim",
      "account_number": "****6789",
      "bank_name": "Access Bank"
    },
    "aml_risk_level": "low",
    "group_memberships": 3,
    "created_at": "2026-01-15T08:00:00Z"
  }
}
```

---

## Transaction History API

### GET /transactions

**Purpose**: Global transaction history with export

**Query Params**:
```
?type=deposit,withdrawal,contribution,payout
&status=completed
&date_from=2026-04-01
&date_to=2026-04-30
&format=json,csv
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_abc123",
        "type": "deposit",
        "amount_naira": 50000,
        "status": "completed",
        "payment_method": "card",
        "payment_reference": "ref_paystack_...",
        "created_at": "2026-04-20T10:30:00Z",
        "confirmed_at": "2026-04-20T10:35:00Z"
      }
    ],
    "total": 150,
    "limit": 20
  }
}
```

---

## Webhook Handlers

### POST /webhooks/paystack

**Purpose**: Receive payment confirmation from Paystack

**Signature Validation**: 
- Verify request signature using `x-paystack-signature` header
- Secret Key stored in AWS Secrets Manager

**Request Body**:
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ref_paystack_abc123",
    "amount": 5000000,
    "currency": "NGN",
    "status": "success",
    "customer": {
      "email": "aisha@example.com"
    }
  }
}
```

**Process**:
1. Verify signature
2. Find transaction by reference
3. Update transaction status to `confirmed`
4. Post ledger entries (wallet debit, revenue credit)
5. Send confirmation email & in-app notification
6. Return 200 OK

**Response (200)**:
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

## Error Code Reference

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| AUTH_REQUIRED | 401 | Missing or invalid token |
| INSUFFICIENT_PERMISSIONS | 403 | User lacks required role |
| NOT_FOUND | 404 | Resource doesn't exist |
| CONFLICT | 409 | State violation (e.g., duplicate resource) |
| RATE_LIMITED | 429 | Rate limit exceeded |
| KYC_REQUIRED | 403 | KYC not complete for this operation |
| INSUFFICIENT_BALANCE | 400 | Not enough funds |
| ESCROW_LOCKED | 409 | Funds locked in escrow |
| PAYMENT_FAILED | 402 | Payment gateway error |
| LEDGER_ERROR | 500 | Ledger reconciliation failed |
| EXTERNAL_SERVICE_ERROR | 503 | Third-party API unavailable |

---

## OpenAPI/Swagger Spec

Full OpenAPI 3.0 specification available at:
- `GET /api/v1/docs` - Swagger UI
- `GET /api/v1/openapi.json` - OpenAPI spec download

Import into Postman:
```
https://api.khalia.ng/api/v1/openapi.json
```

