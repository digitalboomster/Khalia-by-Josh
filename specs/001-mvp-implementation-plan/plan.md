# Implementation Plan: Khalia MVP - Fintech Savings Groups Platform

**Branch**: `001-mvp-implementation-plan` | **Date**: April 20, 2026 | **Spec**: [CONSTITUTION.md](../../CONSTITUTION.md)
**Input**: Feature specification from [CONSTITUTION.md](../../CONSTITUTION.md) + [LEGITIMACY_ROADMAP.md](../../LEGITIMACY_ROADMAP.md)

**Note**: This plan transforms Khalia from UI prototype (85% complete) into production-grade fintech. Spans 12 weeks across 5 phases.

## Summary

**Feature**: Build backend infrastructure, legal framework, and compliance systems to enable real financial transactions for Khalia—a Shariah-compliant, community-driven savings platform.

**Primary Requirement**: Enable users to deposit real money → create/join groups → make contributions → receive payouts, all while maintaining full KYC/AML compliance with Nigerian CBN requirements.

**Technical Approach**:
1. **Phase 0 (Weeks 1-2)**: Research payment gateways, banking APIs, KYC providers, CBN requirements
2. **Phase 1 (Weeks 3-6)**: Design data models, contracts, and quickstart for core financial flows
3. **Phase 2 (Weeks 7-12)**: Implement backend (auth, ledger, escrow, payout), legal agreements, monitoring

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+, React 18.3+  
**Frontend**: React 18 + Vite 6.3.5 + Tailwind CSS 4 + Radix UI  
**Backend**: Node.js Express/Fastify (to be determined) + PostgreSQL 15+  
**Storage**: PostgreSQL (primary), Redis (sessions/caching)  
**Testing**: Jest + React Testing Library (frontend), Mocha/Jest (backend)  
**Target Platform**: Web (browser) → Mobile (Phase 3)  
**Project Type**: Full-stack fintech SaaS application (Web + Backend API)  
**Performance Goals**:
  - Dashboard load: <2s
  - API response: <500ms (p95)
  - Payment gateway integration: <3s
  - Uptime: 99.9% (max 43 min/month downtime)
**Constraints**:
  - <500ms latency for financial transactions
  - Immutable audit trail (7-year retention)
  - TLS 1.3 encryption in transit, AES-256 at rest
  - Zero discrepancies in ledger (double-entry accounting)
**Scale/Scope**:
  - MVP: 1,000 users, ~100 groups (10 members avg)
  - ~54 UI screens already built (85% complete)
  - 10 core modules, 7 critical data models
  - ~50 Radix UI components implemented
  - 0 backend services (all mock data currently)
**Compliance Requirements**:
  - CBN Money Services Operator License (in progress)
  - KYC/AML (BVN, NIN, facial verification)
  - NDPR (Nigeria Data Protection Regulation)
  - PCI DSS (for payment processing)

## Constitution Check

*GATE: All critical gates must pass before Phase 0 research. Re-check after Phase 1 design.*

### Design Principles Alignment ✅

| Principle | Status | Notes |
|-----------|--------|-------|
| **Trust-First Design** | ✅ PASS | KYC/AML framework → Phase 0 research |
| **Shariah Compliance** | ✅ PASS | No interest-based lending, Sadaqah module planned |
| **Cooperative Ownership** | ✅ PASS | Group governance + member voting built into data model |
| **AI-Guided Autonomy** | ✅ PASS | ShuraBot UI 90% complete, backend LLM integration Phase 2 |
| **Financial Inclusion** | ✅ PASS | Multi-channel payments (bank, USSD, card, wallet) planned |

### Module Readiness Gates

| Module | MVP Required | Status | Blocker |
|--------|---|--------|--------|
| Onboarding & Verification | 🔴 CRITICAL | ❌ 15% | 🚨 GATE: BVN/NIN integration must be researched & contracted |
| Dashboard | 🔴 CRITICAL | ✅ 85% | ✓ PASS (wiring work only) |
| Groups (Marketplace) | 🔴 CRITICAL | ✅ 80% | ✓ PASS (backend + filtering refinement) |
| Group Detail | 🔴 CRITICAL | ✅ 75% | ✓ PASS (real-time integration Phase 2) |
| Wallet & Transactions | 🔴 CRITICAL | ✅ 70% | 🚨 GATE: Payment gateway integration must be contracted |
| ShuraBot | 🟢 Core | ✅ 90% | ✓ PASS (LLM backend Phase 2) |
| Profile & Trust Score | 🔴 CRITICAL | ✅ 80% | ✓ PASS (trust score algorithm implementation needed) |
| Activity Feed | ⚠️ Important | ⚠️ 50% | ✓ PASS (real-time service Phase 2) |
| Admin & Governance | ⚠️ Important | ❌ 20% | ✓ PASS (Phase 2 feature) |
| Sadaqah & Impact | ⚠️ Important | ❌ 0% | ✓ PASS (Phase 2 feature) |

### Critical MVP Gates (Must Resolve in Phase 0)

| Gate | Current State | Action Required | Timeline |
|------|---|---|---|
| **Payment Gateway** | ❌ None | Select (Paystack/Flutterwave), contract, sandbox test | Week 1-2 |
| **BVN/NIN Verification** | ❌ Mock only | Contract BVN provider (NIBSS or licensed), integrate API | Week 1-2 |
| **Bank Settlement** | ❌ None | Research NACCS API, open banking vs. direct integration | Week 1-2 |
| **Escrow Mechanics** | ✅ Designed | Implement double-entry ledger, reconciliation logic | Week 3-4 |
| **CBN License Path** | ⚠️ Drafted | Finalize docs with compliance lawyer, submit application | Week 1-4 |
| **Legal Agreements** | ✅ Drafted | Finalize ToS, Privacy Policy, Group Agreement, e-signature | Week 2-3 |
| **Authentication** | ❌ Hardcoded | Design JWT architecture, session management, implement | Week 3-4 |

**Gate Outcome**: ✅ **PASS** - All gates either resolved or have clear Phase 0 research plan

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-implementation-plan/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (payment gateways, KYC, banking APIs)
├── data-model.md        # Phase 1 output (User, Group, Transaction, Contribution, Ledger)
├── contracts/           # Phase 1 output (API contracts, group agreement template)
│   ├── api.md           # REST API endpoints
│   ├── group-agreement.md # Digital group contract
│   └── kba-checklist.md # KYC/AML verification checklist
└── quickstart.md        # Phase 1 output (setup guide for developers)
```

### Source Code (repository root)

**Option Selected: 2 - Full-stack web application**

```text
Khalia/
├── frontend/                    # React 18 + Vite (existing, 85% complete)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── routes.ts
│   │   │   ├── pages/           # 13 pages (Dashboard, Groups, Wallet, Profile, etc.)
│   │   │   ├── components/
│   │   │   │   ├── ui/          # 50+ Radix UI components
│   │   │   │   ├── features/    # Feature-specific components (new)
│   │   │   │   │   ├── onboarding/
│   │   │   │   │   ├── wallet/
│   │   │   │   │   ├── notifications/
│   │   │   │   │   └── admin/
│   │   │   │   └── RootLayout.tsx
│   │   │   ├── data/
│   │   │   │   ├── types.ts     # TypeScript interfaces (shared)
│   │   │   │   └── constants.ts
│   │   │   └── services/        # API service layer (new)
│   │   │       ├── auth.ts
│   │   │       ├── payments.ts
│   │   │       ├── groups.ts
│   │   │       ├── wallet.ts
│   │   │       └── notifications.ts
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json

├── backend/                     # Node.js + Express/Fastify (new)
│   ├── src/
│   │   ├── app.ts              # Express/Fastify app setup
│   │   ├── index.ts            # Server entry
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── payment.ts
│   │   │   └── kycProvider.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT verification
│   │   │   ├── errorHandler.ts
│   │   │   └── auditLog.ts
│   │   ├── models/             # Data models (User, Group, Transaction, etc.)
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── payment.ts
│   │   │   ├── kyc.ts
│   │   │   ├── ledger.ts       # Double-entry accounting
│   │   │   ├── group.ts
│   │   │   └── notification.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── wallet.ts
│   │   │   ├── groups.ts
│   │   │   ├── contributions.ts
│   │   │   └── admin.ts
│   │   └── utils/
│   │       ├── crypto.ts       # Encryption utilities
│   │       ├── validation.ts
│   │       └── auditLog.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   └── tsconfig.json

├── shared/                      # Shared types & constants
│   ├── types.ts
│   ├── constants.ts
│   └── validation-schemas.ts

├── docs/                        # Project documentation
│   ├── CONSTITUTION.md          # Product vision & requirements ✅
│   ├── LEGITIMACY_ROADMAP.md    # What makes fintech "legit" ✅
│   ├── IMPLEMENTATION_ANALYSIS.md # Current state assessment ✅
│   ├── API.md                   # API documentation (generated)
│   ├── SETUP.md                 # Developer onboarding
│   └── SECURITY.md              # Security & compliance checklist

├── .github/
│   ├── workflows/               # CI/CD pipelines
│   │   ├── test.yml
│   │   ├── lint.yml
│   │   └── deploy.yml
│   └── copilot-instructions.md  # Agent context ✅

├── .specify/                    # Spec Kit configuration
├── package.json                 # Root workspace config
├── docker-compose.yml           # Local dev environment
└── README.md
```

**Structure Decision**: 
- **Frontend**: Existing React app (minimal changes, API integration layer only)
- **Backend**: New Node.js Express API (handles all financial logic, auth, KYC, payments)
- **Shared**: TypeScript types shared between frontend & backend
- **Docs**: All planning, API, and security docs centralized in `/docs` or root

This maintains clear separation of concerns while leveraging existing frontend work.

## Phase 0: Research & Requirements Resolution (Weeks 1-2)

**Goal**: Resolve all "NEEDS CLARIFICATION" items. Document decisions. Establish vendor contracts.

### Research Tasks

1. **Payment Gateway Selection** 🏦
   - Research: Paystack vs. Flutterwave vs. Remita
   - Evaluate: API design, dashboard, settlement speed, dispute handling
   - Decision Matrix: Cost, integration complexity, NGN specialization
   - Output: `research.md` section on payment gateway choice + API docs

2. **BVN/NIN Verification Integration** 🆔
   - Research: NIBSS BVN API requirements, NIMC NIN integration, facial recognition providers
   - Options: NIBSS direct, licensed BVN aggregators, NIMC partnership
   - Cost & timeline analysis
   - Output: `research.md` with vendor recommendations + integration timeline

3. **Bank Settlement Architecture** 🏧
   - Research: NACCS API, open banking vs. direct bank APIs
   - Settlement cycle analysis (real-time vs. batched)
   - Escrow account requirements (CBN registration)
   - Output: `research.md` with settlement flow design

4. **CBN Compliance Requirements** ⚖️
   - Research: Money Services Operator licensing, KYC/AML regulations, SAR reporting
   - Application process & timeline
   - Regulatory reporting obligations
   - Output: `research.md` + lawyer engagement summary

5. **KYC/AML Provider Selection** 🔍
   - Research: Automated KYC providers, SAR platforms, sanctions screening
   - Integration with BVN verification
   - Output: `research.md` with vendor selection + cost estimates

6. **Security & Encryption Best Practices** 🔐
   - Research: Biometric storage, token management, PCI DSS requirements
   - Session management strategies
   - Audit logging frameworks
   - Output: `research.md` with architecture recommendations

### Outcome: `research.md` (5-10 pages)

Document all decisions, vendor selections, cost estimates, and integration timelines.

---

## Phase 1: Design & Contracts (Weeks 3-6)

**Goal**: Complete data models, API contracts, and developer quickstart. Pre-implementation quality gates.

### Design Tasks

#### 1. Data Model Design → `data-model.md`

**Core Entities**:
- **User**: ID, email, phone, firstName, lastName, trustScore, verificationStatus, wallet (balance, escrow), createdAt
- **Group**: ID, name, goal, currentPool, frequency, contributionAmount, payoutOrder, members, creator, shariatCompliant, status, nextPayoutDate  
- **Transaction**: ID, userId, groupId, type, amount, paymentMethod, status, reference, createdAt
- **Contribution**: ID, userId, groupId, amount, dueDate, paidDate, status
- **LedgerEntry**: timestamp, debit, credit, balance, reference, userId, groupId, type, status (double-entry accounting)
- **Notification**: ID, userId, type, title, message, actionUrl, read, deliveryStatus, createdAt
- **GroupMember**: ID, groupId, userId, joinedDate, trustScore, status (active, pending, suspended)
- **PayoutCycle**: ID, groupId, recipientId, scheduledDate, actualDate, amount, status

**Relationships**: User ↔ Groups (many-to-many), Group → Contributions, User → Ledger entries, Payout cycles

**Migrations**: PostgreSQL schema with indexes, soft deletes, temporal tables for audit

#### 2. API Contract Design → `contracts/api.md`

**Core Endpoints** (RESTful):

**Authentication**:
- `POST /api/auth/register`, `/login`, `/refresh`, `/logout`
- `POST /api/auth/verify-bvn`, `GET /verify-bvn/:requestId`
- `POST /api/auth/verify-biometric`

**Wallet**:
- `GET /api/wallet/balance`, `POST /wallet/deposit`, `POST /wallet/withdraw`
- `GET /api/wallet/transactions`, `GET /wallet/transaction/:id`
- `GET /api/wallet/escrow`

**Groups**:
- `GET/POST /api/groups`, `GET /groups/:id`
- `POST /groups/:id/join`, `GET /groups/:id/members`
- `GET/POST /groups/:id/contributions`

**Payouts**:
- `GET/POST /api/payouts`, `POST /payouts/:id/approve`, `POST /payouts/:id/execute`

**Admin**:
- `POST /admin/member/:id/approve`, `GET /admin/audit-log`, `GET /admin/alerts`

**Response Format**: `{ success: bool, data: {}, error: null, requestId: string }`

#### 3. Contracts

- **Group Agreement Template**: Digital contract, customizable by creator, e-signature by all members
- **KYC/AML Checklist**: Verification workflow (email → phone → BVN → face ID → bank → approved)

### Outcome

- **`data-model.md`** (3-5 pages): Entity schemas, relationships, migrations
- **`contracts/api.md`** (8-10 pages): OpenAPI specification
- **`contracts/group-agreement.md`** (2-3 pages): Legal template  
- **`contracts/kba-checklist.md`** (1-2 pages): Verification workflow
- **`quickstart.md`** (5-10 pages): Developer setup guide

---

## Phase 2: Implementation (Weeks 7-12)

**Goal**: Build backend services, integrate payment gateway, launch MVP.

### Implementation Phases

#### Week 7-8: Backend Foundation
- PostgreSQL setup + migrations
- Express.js API scaffold
- JWT authentication + session management
- Middleware (auth, error handling, audit logging)
- Database models (User, Group, Transaction, Ledger)

#### Week 9-10: Financial Core
- Payment gateway integration (Paystack/Flutterwave)
- Deposit flow (payment link → confirmation → wallet update)
- Withdrawal flow (bank settlement, receipt generation)
- Double-entry ledger implementation
- Escrow logic (funds lock on contribution, release on payout)

#### Week 11-12: Compliance & Operations
- BVN/NIN verification integration
- KYC/AML automation + manual review workflow
- Audit logging (immutable trail, 7-year retention)
- Monitoring & alerting (Sentry, Datadog)
- Backup & disaster recovery setup
- E2E testing (signup → contribute → payout flow)

### Integration Points (Frontend ↔ Backend)

**Services Layer** (new in `src/app/services/`):
```typescript
// Example: wallet.ts connects React components to backend APIs
import{ getBalance, deposit, withdraw } from '@/services/wallet'

const Dashboard = () => {
  const { balance } = useWallet() // Custom hook using service
  // ...
}
```

### Testing Requirements

**Unit Tests**: Auth, ledger logic, payment gateway integration (80%+ coverage)
**Integration Tests**: E2E flows (signup → deposit → group → contribute → payout)
**Security Audit**: Encryption, biometric storage, token handling
**Compliance Review**: KYC/AML implementation, audit trails, CBN requirements

### Success Criteria

✅ Users can: Sign up → Deposit funds → Create/join group → Contribute → Receive payout  
✅ All transactions tracked in immutable ledger
✅ Zero KYC/AML gaps  
✅ 99.9% uptime, <500ms p95 latency  
✅ CBN license application submitted (or approved)  
✅ E2E test suite passing

---

## Post-Planning Decisions

### Agent Context Update

After plan completion, update `.github/copilot-instructions.md` to reference:
```markdown
<!-- SPECKIT START -->
Current implementation plan: `/specs/001-mvp-implementation-plan/plan.md`
Research docs: `/specs/001-mvp-implementation-plan/research.md` (after Phase 0)
Data models: `/specs/001-mvp-implementation-plan/data-model.md` (after Phase 1)
<!-- SPECKIT END -->
```

### Next Steps

1. **Immediate** (This week):
   - [ ] Share plan with stakeholders, gather feedback
   - [ ] Assign Phase 0 research ownership
   - [ ] Contract payment gateway vendor
   - [ ] Engage compliance lawyer for CBN filing

2. **Week 2-3**:
   - [ ] Complete `research.md` (vendor selections, architecture decisions)
   - [ ] Begin Phase 1 design work

3. **Week 4**:
   - [ ] Complete `data-model.md`, `contracts/`, `quickstart.md`
   - [ ] Security & compliance review of designs

4. **Week 5+**:
   - [ ] Begin backend implementation
   - [ ] Parallel: Continue frontend wiring to backend APIs

---

**Plan Version**: 1.0  
**Date**: April 20, 2026  
**Status**: Ready for Phase 0 Research  
**Owner**: Product & Engineering Team
