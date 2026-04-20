# Khalia MVP - Executable Task List

**Document**: Task Breakdown by Phase  
**Plan Reference**: [plan.md](plan.md) | [spec.md](spec.md)  
**Generated**: April 20, 2026  
**Status**: Ready for Phase 0  
**Total Tasks**: 56 (Phase 0: 15, Phase 1: 18, Phase 2: 23)

---

## Overview: Task Organization

Tasks are grouped by **Phase** (0 → Research, 1 → Design, 2 → Implementation) and cross-referenced to **User Stories** (US1-US12). Each task includes:

- **TaskID**: T001, T002, ... (sequential)
- **[P]**: Parallelizable (can run independently)
- **[USn]**: User Story reference (Phase 1+ only)
- **Description**: Specific, actionable with file paths
- **Dependencies**: Blocking tasks (if any)

### Format

```
- [ ] [TaskID] [P?] [USn?] Description with file path
```

---

## Phase 0: Research & Requirements Validation (Weeks 1-2)

**Goal**: Resolve all critical blocker gates. Document vendor selections, architecture decisions, and regulatory requirements. Output: `research.md`

**Success Criteria**:
- [ ] All payment gateways evaluated and selection decision made
- [ ] BVN/NIN integration path confirmed with vendor quotes
- [ ] Bank settlement architecture documented
- [ ] CBN compliance requirements and filing plan finalized
- [ ] KYC/AML provider selected and quoted
- [ ] Security best practices documented
- [ ] `research.md` (8-12 pages) completed with all findings

### Phase 0 Tasks

- [ ] **[T001] [P]** Research payment gateway options (Paystack vs Flutterwave vs Remita) and document API capabilities, cost, settlement time in `specs/001-mvp-implementation-plan/research.md`

- [ ] **[T002] [P]** Research BVN/NIN verification providers (NIBSS, NIMC, licensed aggregators) and document integration requirements, timelines, costs in `specs/001-mvp-implementation-plan/research.md`

- [ ] **[T003] [P]** Research bank settlement architecture (NACCS API, open banking vs direct integration) and document escrow account requirements in `specs/001-mvp-implementation-plan/research.md`

- [ ] **[T004] [P]** Research CBN Money Services Operator license requirements, KYC/AML regulations, SAR reporting obligations and document regulatory path in `specs/001-mvp-implementation-plan/research.md`

- [ ] **[T005] [P]** Research automated KYC/AML providers and sanctions screening platforms, document vendor options and integration approach in `specs/001-mvp-implementation-plan/research.md`

- [ ] **[T006] [P]** Research biometric storage, token management, PCI DSS requirements, session management strategies and document security architecture recommendations in `specs/001-mvp-implementation-plan/research.md`

- [ ] **[T007]** Contact and request quote from selected payment gateway vendor (Paystack or Flutterwave), document sandbox access and integration timeline

- [ ] **[T008]** Contract with BVN/NIN verification provider, confirm API documentation and sandbox credentials availability

- [ ] **[T009]** Engage compliance lawyer for CBN filing strategy, NIN tokenization requirements, and regulatory reporting obligations review

- [ ] **[T010]** Finalize decision matrix for KYC/AML provider and confirm integration requirements with selected vendor

- [ ] **[T011]** Evaluate facial recognition providers (AWS Rekognition, Google Cloud Vision, Sensetime) and document biometric storage/hashing approach in security section

- [ ] **[T012]** Create Firebase or Auth0 evaluation matrix for JWT/session management and document selected approach in security section

- [ ] **[T013]** Document payment flow architecture (deposit → payment gateway → webhook → ledger update) with sequence diagram in `specs/001-mvp-implementation-plan/research.md`

- [ ] **[T014]** Document escrow mechanics: how contributions are locked, released on payout, and reconciled in `specs/001-mvp-implementation-plan/research.md`

- [ ] **[T015]** Create Phase 0 summary document with all vendor selections, cost estimates, regulatory timeline, and critical path for Phase 1 start; update `.github/copilot-instructions.md`

---

## Phase 1: Design & Contracts (Weeks 3-6)

**Goal**: Complete all design artifacts. Establish API contracts, data models, legal agreements, and developer quickstart. Pre-implementation quality gates.

**Success Criteria**:
- [ ] Data models with all entity schemas and migrations defined
- [ ] REST API contract (OpenAPI) with 20+ endpoints documented
- [ ] Group agreement and KYC/AML checklist templates completed
- [ ] Developer quickstart guide (setup, running locally, API usage examples)
- [ ] Security & compliance checklist reviewed by lawyer
- [ ] All Phase 1 artifacts reviewed and approved by product + compliance team

### Subphase 1a: Data Model Design (Weeks 3-4)

- [ ] **[T016]** Design User entity schema (ID, email, phone, BVN hash, NIN hash, trust score, verification status, KYC level) and document in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T017]** Design Group entity schema (ID, name, goal, frequency, contribution amount, payout order, creator, Shariah flag, status, next payout date) and document in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T018] [P]** Design Transaction entity (ID, user, group, type, amount, payment method, status, reference, timestamp) and document in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T019] [P]** Design Contribution entity (ID, user, group, amount, due date, paid date, status) and document in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T020] [P]** Design double-entry LedgerEntry schema (timestamp, debit, credit, balance, reference, user, group, type, status) with constraints for balance reconciliation in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T021] [P]** Design Notification entity (ID, user, type, title, message, action URL, read flag, delivery status) and document in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T022] [P]** Design GroupMember entity (ID, group, user, joined date, individual trust score, status: active/pending/suspended) and document in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T023] [P]** Design PayoutCycle entity (ID, group, recipient, scheduled date, actual date, amount, status with state machine) and document in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T024]** Design relational mappings, indexes, and constraints for all entities; document PostgreSQL migration strategy and temporal audit tables in `specs/001-mvp-implementation-plan/data-model.md`

- [ ] **[T025] [US1]** Design KYC verification state machine (email verified → phone verified → BVN verified → face ID verified → bank verified → approved/rejected) in `specs/001-mvp-implementation-plan/data-model.md`

### Subphase 1b: API Contract Design (Weeks 3-5)

- [ ] **[T026] [US1]** Design authentication API endpoints: `POST /api/auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/verify-bvn`, `GET /auth/verify-bvn/:requestId`, `POST /auth/verify-biometric` in `specs/001-mvp-implementation-plan/contracts/api.md`

- [ ] **[T027] [US2]** Design wallet API endpoints: `GET /api/wallet/balance`, `POST /wallet/deposit`, `POST /wallet/withdraw`, `GET /api/wallet/transactions`, `GET /wallet/transaction/:id`, `GET /api/wallet/escrow` in `specs/001-mvp-implementation-plan/contracts/api.md`

- [ ] **[T028] [US3]** Design groups API endpoints: `GET/POST /api/groups`, `GET /groups/:id`, `POST /groups/:id/join`, `GET /groups/:id/members` in `specs/001-mvp-implementation-plan/contracts/api.md`

- [ ] **[T029] [US4]** Design contributions API endpoints: `GET/POST /api/groups/:id/contributions`, `GET /contributions/:id`, `POST /contributions/:id/status` in `specs/001-mvp-implementation-plan/contracts/api.md`

- [ ] **[T030] [US5]** Design payout API endpoints: `GET/POST /api/payouts`, `GET /payouts/:id`, `POST /payouts/:id/approve`, `POST /payouts/:id/execute`, `GET /payouts/history` in `specs/001-mvp-implementation-plan/contracts/api.md`

- [ ] **[T031] [US6]** Design admin endpoints: `POST /admin/groups/:id/members/:memberId/approve`, `POST /admin/groups/:id/members/:memberId/reject`, `GET /admin/audit-log`, `GET /admin/alerts` in `specs/001-mvp-implementation-plan/contracts/api.md`

- [ ] **[T032] [US7]** Design transaction history API: `GET /api/transactions`, `GET /transactions/:id`, `GET /transactions/export`, with filters (type, date range, group) in `specs/001-mvp-implementation-plan/contracts/api.md`

- [ ] **[T033]** Design error response contract: `{ success: boolean, data?: {}, error?: { code, message }, requestId: string }` and HTTP status code mapping; document in `specs/001-mvp-implementation-plan/contracts/api.md`

- [ ] **[T034]** Create OpenAPI/Swagger specification for all endpoints with request/response schemas, auth requirements, rate limits in `specs/001-mvp-implementation-plan/contracts/api.md`

### Subphase 1c: Contracts & Configuration (Weeks 4-5)

- [ ] **[T035]** Design and draft Group Agreement template (customizable by creator, e-signature integration, member acceptance workflow) in `specs/001-mvp-implementation-plan/contracts/group-agreement.md`

- [ ] **[T036] [US1]** Design KYC/AML verification checklist and approval workflow (email → phone → BVN → face ID → bank → KYC level assignment) in `specs/001-mvp-implementation-plan/contracts/kba-checklist.md`

- [ ] **[T037]** Design payment gateway webhook handlers (deposit confirmation, failed payment, refund events) and document expected JSON payloads in `specs/001-mvp-implementation-plan/contracts/webhooks.md`

- [ ] **[T038]** Document integration configuration requirements: Payment gateway API keys, BVN provider credentials, bank settlement account details, email service credentials in `specs/001-mvp-implementation-plan/contracts/configuration.md`

### Subphase 1d: Developer Quickstart (Week 5-6)

- [ ] **[T039]** Create developer setup guide: prerequisites (Node.js 20, PostgreSQL 15, Redis), local environment setup (`.env` template) in `specs/001-mvp-implementation-plan/quickstart.md`

- [ ] **[T040]** Document backend stack: Express.js (or Fastify), authentication flow, database connection, migration approach in `specs/001-mvp-implementation-plan/quickstart.md`

- [ ] **[T041]** Document frontend service layer: API client setup, authentication context, error handling, loading states in `specs/001-mvp-implementation-plan/quickstart.md`

- [ ] **[T042]** Create API usage examples for each core flow: signup → deposit → create group → contribute → payout in `specs/001-mvp-implementation-plan/quickstart.md`

- [ ] **[T043]** Document testing strategy: unit tests (auth, ledger logic), integration tests (E2E flows), mocking payment gateway in `specs/001-mvp-implementation-plan/quickstart.md`

### Subphase 1e: Compliance & Security Review (Week 6)

- [ ] **[T044] [US9,US10]** Create audit logging architecture specification (immutable append-only log, 7-year retention, export capability) in `specs/001-mvp-implementation-plan/contracts/audit.md`

- [ ] **[T045] [US10]** Create security checklist: TLS 1.3, bcrypt hashing, biometric tokenization, BVN/NIN encryption, JWT token strategy, CSRF protection, session timeout in `specs/001-mvp-implementation-plan/contracts/security.md`

- [ ] **[T046]** Conduct Phase 1 security & compliance review with lawyer; document all requirements and approval sign-off

- [ ] **[T047]** Create Phase 1 completion summary with all artifacts ready; update `.github/copilot-instructions.md` with links to all Phase 1 outputs

---

## Phase 2: Implementation (Weeks 7-12)

**Goal**: Build production-grade backend, integrate payment gateway, launch MVP. All 12 user stories implemented, tested, deployed.

**Success Criteria**:
- [ ] Users can complete full flow: signup → deposit → group → contribute → payout
- [ ] All transactions recorded in immutable ledger with zero discrepancies
- [ ] KYC/AML 100% automated with manual review workflow
- [ ] Monitoring & alerting configured for 99.9% uptime
- [ ] E2E test suite passing
- [ ] CBN license application submitted with compliance documentation
- [ ] Deployment to production completed

### Subphase 2a: Backend Infrastructure (Weeks 7-8)

- [ ] **[T048] [P]** Create backend project structure: `backend/src/{app, config, middleware, models, services, routes, utils}` with TypeScript configuration `backend/tsconfig.json`, `backend/.env.example`

- [ ] **[T049] [P]** Set up Express.js application scaffold with middleware stack (authentication, error handling, request logging, CORS) in `backend/src/app.ts`

- [ ] **[T050] [P]** Configure PostgreSQL connection pool with environment variables, connection retry logic, health check endpoint in `backend/src/config/database.ts`

- [ ] **[T051] [P]** Set up Redis client for session storage, caching, and job queue in `backend/src/config/redis.ts`

- [ ] **[T052]** Design and implement database migrations (Knex.js or TypeORM) for all entities from Phase 1 data model in `backend/migrations/` directory

- [ ] **[T053]** Implement JWT authentication middleware: token generation, validation, refresh token logic with HTTP-only cookies in `backend/src/middleware/auth.ts`

- [ ] **[T054]** Implement global error handling middleware with structured logging, error categorization, and audit trail recording in `backend/src/middleware/errorHandler.ts`

- [ ] **[T055]** Implement audit logging middleware: capture all API requests, responses, user actions into immutable log table in `backend/src/middleware/auditLog.ts` with 7-year retention policy

- [ ] **[T056]** Set up Winston logger with structured logging (timestamps, request IDs, severity levels) and multiple transports (file, console, Sentry) in `backend/src/config/logger.ts`

### Subphase 2b: Authentication & KYC (Weeks 7-9)

- [ ] **[T057] [US1]** Implement user registration endpoint: email validation, password hashing (bcrypt 12+ rounds), user creation, initial trust score (20%) in `backend/src/routes/auth.ts`, `backend/src/services/auth.ts`

- [ ] **[T058] [US1]** Implement login endpoint with password comparison, JWT token generation, refresh token creation in `backend/src/routes/auth.ts`

- [ ] **[T059] [US1]** Integrate BVN verification API: create `backend/src/services/kyc.ts` with BVN lookup, response parsing, verification state update

- [ ] **[T060] [US1]** Integrate facial recognition API for biometric verification: hash biometric data, store encrypted in database, never transmit plaintext in `backend/src/services/kyc.ts`

- [ ] **[T061] [US1]** Implement bank account verification: Naira name match checking, account validation against BVN data in `backend/src/services/kyc.ts`

- [ ] **[T062] [US1]** Implement KYC state machine: email → phone → BVN → face ID → bank → approved, with rejection handling and manual review workflow in `backend/src/services/kyc.ts`

- [ ] **[T063] [US1]** Create KYC checklist endpoint: `GET /api/auth/kyc-status` returning completion percentage and next required verification step

### Subphase 2c: Financial Core - Ledger & Escrow (Weeks 8-10)

- [ ] **[T064]** Implement double-entry ledger system: LedgerEntry service for recording all transactions (debit/credit pairs) in `backend/src/services/ledger.ts` with balance reconciliation

- [ ] **[T065]** Create ledger reconciliation job: daily verification that total debits = total credits, alert on discrepancies, generate reconciliation report in `backend/src/services/ledger.ts`

- [ ] **[T066]** Implement escrow account logic: when contribution is made, move funds from user wallet to escrow, record ledger entry in `backend/src/services/escrow.ts`

- [ ] **[T067]** Implement escrow release logic: on payout approval, release funds from escrow to recipient wallet with ledger entries, generate receipt in `backend/src/services/escrow.ts`

- [ ] **[T068]** Create wallet balance calculations: total available = (wallet balance - escrow locked), ensure users cannot exceed available balance in `backend/src/services/wallet.ts`

- [ ] **[T069]** Implement transaction state machine: pending → processing → confirmed/failed with timestamp tracking and webhook reconciliation in `backend/src/models/Transaction.ts`

### Subphase 2d: Payment Gateway Integration (Weeks 9-10)

- [ ] **[T070] [US2]** Integrate selected payment gateway (Paystack/Flutterwave): create payment link generator, redirect URLs, webhook handlers in `backend/src/config/payment.ts`, `backend/src/services/payment.ts`

- [ ] **[T071] [US2]** Implement deposit flow: amount entry → payment gateway redirect → confirm payment → webhook → wallet credit → ledger entry → receipt generation in `backend/src/routes/wallet.ts`

- [ ] **[T072] [US2]** Implement payment webhook handler: receive payment confirmation from gateway, verify signature, update transaction status, credit wallet in `backend/src/routes/webhooks.ts`

- [ ] **[T073] [US2]** Implement failed payment handling: refund logic, customer notification, ledger rollback in `backend/src/services/payment.ts`

- [ ] **[T074] [US2]** Create receipt generation: PDF creation with transaction details, user signature, timestamp in `backend/src/services/receipt.ts`

- [ ] **[T075] [US12]** Implement bank settlement API: call NACCS or direct bank API for withdrawal payout, track settlement confirmation, update wallet in `backend/src/services/settlement.ts`

- [ ] **[T076] [US12]** Implement withdrawal flow: amount entry → bank verification → OTP confirmation → payout request → settlement → receipt in `backend/src/routes/wallet.ts`

### Subphase 2e: Groups & Contributions (Weeks 9-11)

- [ ] **[T077] [US3]** Implement group creation: group details, contribution schedule, member slots, Shariah compliance flag in `backend/src/services/group.ts`, `backend/src/models/Group.ts`

- [ ] **[T078] [US3]** Implement group discovery: list all groups, filtering (goal, frequency, payout size, Shariah flag), search by name in `backend/src/routes/groups.ts`

- [ ] **[T079] [US3]** Implement join request workflow: user requests to join → admin approval/rejection → member added to group in `backend/src/services/group.ts`

- [ ] **[T080] [US3]** Implement membership roles: creator (full control), admin (approve members, manage payouts), member (contribute, receive payouts) in `backend/src/models/GroupMember.ts`

- [ ] **[T081] [US4]** Implement contribution creation: auto-generate contributions from group schedule, assign to users in order in `backend/src/services/contribution.ts`

- [ ] **[T082] [US4]** Implement contribution flow: user sees due contribution → selects payment method → confirms → processes payment → records in ledger → escrow hold in `backend/src/routes/contributions.ts`

- [ ] **[T083] [US4]** Implement contribution reminders: cronjob fires 2 days, 1 day, day-of reminder notifications in `backend/src/jobs/contributionReminder.ts`

- [ ] **[T084] [US5]** Implement payout scheduling: on last contribution received, schedule payout for recipient with admin review required in `backend/src/services/payout.ts`

- [ ] **[T085] [US5]** Implement payout approval workflow: admin reviews, approves/rejects, system processes funds release from escrow to recipient wallet in `backend/src/routes/payouts.ts`

### Subphase 2f: Users, Trust & Admin (Weeks 10-11)

- [ ] **[T086] [US8]** Implement trust score calculation: algorithm factors (punctuality 40%, consistency 30%, duration 20%, reviews 10%) in `backend/src/services/trustScore.ts`

- [ ] **[T087] [US8]** Create trust score update job: recalculate after each contribution/payout cycle, track historical changes in `backend/src/jobs/updateTrustScores.ts`

- [ ] **[T088] [US6]** Implement admin member approval flow: pending requests → view applicant details → approve/reject with decision logging in `backend/src/routes/admin.ts`

- [ ] **[T089] [US6]** Create admin dashboard endpoints: list pending approvals, active members, recent transactions in `backend/src/routes/admin.ts`

- [ ] **[T090]** Implement user profile endpoint: retrieve user details, trust score breakdown, group memberships, transaction history in `backend/src/routes/profile.ts`

### Subphase 2g: Notifications & Activity Feed (Weeks 10-11)

- [ ] **[T091] [US11]** Implement notification service: create, store, retrieve, mark as read in `backend/src/services/notification.ts`, `backend/src/models/Notification.ts`

- [ ] **[T092] [US11]** Integrate email notification provider (SendGrid/Mailgun): send transactional emails for deposits, contributions, payouts in `backend/src/services/email.ts`

- [ ] **[T093] [US11]** Create notification job scheduler: contribution reminders (2d, 1d, 0d), payout ready alerts, member join notifications in `backend/src/jobs/notificationScheduler.ts`

- [ ] **[T094] [US11]** Implement activity feed: record all user actions, group events, payouts, and serve as event stream in `backend/src/services/activityFeed.ts`

### Subphase 2h: Compliance, Testing & Deployment (Weeks 11-12)

- [ ] **[T095] [US9]** Implement full audit logging: all financial transactions, admin actions, KYC steps, login attempts with timestamp and user context in `backend/src/services/auditLog.ts`

- [ ] **[T096] [US9]** Create audit export endpoint: generate CBN/EFCC compliant reports filtered by date, user, action type, with validation in `backend/src/routes/admin.ts`

- [ ] **[T097] [US10]** Implement encryption at rest: AES-256 for sensitive fields (BVN, NIN, bank account) using Node.js crypto module in `backend/src/utils/crypto.ts`

- [ ] **[T098] [US10]** Implement TLS 1.3: configure Express.js SSL/TLS certificates, verify cipher suites, set security headers (HSTS, CSP) in `backend/src/config/ssl.ts`

- [ ] **[T099] [US10]** Implement session management: 15-min access token, 30-day refresh token in HTTP-only cookies, CSRF tokens for state-changing requests in `backend/src/middleware/auth.ts`

- [ ] **[T100]** Set up monitoring & alerting: Sentry error tracking, Datadog APM, PagerDuty incident response in `backend/src/config/monitoring.ts`

- [ ] **[T101]** Create comprehensive unit tests for auth, ledger logic, payment gateway integration with 80%+ coverage in `backend/tests/unit/`

- [ ] **[T102]** Create E2E tests: signup → verify KYC → deposit → create group → contribute → receive payout in `backend/tests/e2e/`

- [ ] **[T103]** Create security audit checklist: verify TLS 1.3, bcrypt hashing, biometric tokenization, BVN/NIN encryption, JWT strategy, CSRF protection, session timeout; document findings

- [ ] **[T104]** Deploy backend to production: infrastructure setup (AWS/GCP), database migrations, environment configuration, health checks, backup strategy

- [ ] **[T105]** Deploy frontend with backend API integration: update API base URL, test all flows end-to-end, performance profiling, load testing

### Subphase 2i: Frontend Integration & Launch (Weeks 11-12)

- [ ] **[T106] [P]** Create API client layer: `src/app/services/auth.ts`, `src/app/services/wallet.ts`, `src/app/services/groups.ts`, `src/app/services/contributions.ts` with error handling

- [ ] **[T107] [P]** Implement authentication context: user state, login/logout flows, token refresh, user profile fetching in `src/app/context/AuthContext.tsx`

- [ ] **[T108] [P]** Implement wallet service hook: balance fetching, deposit flow, withdrawal flow, transaction history in `src/app/services/wallet.ts`

- [ ] **[T109] [P]** Wire dashboard to backend: fetch user profile, wallet balance, my contributions, upcoming payouts, trust score in `src/app/pages/Dashboard.tsx`

- [ ] **[T110] [P]** Wire groups marketplace: fetch groups list, apply filters, search, join request flow in `src/app/pages/Groups.tsx`

- [ ] **[T111] [P]** Wire group detail: show group info, member list, contribution schedule, payout history in `src/app/pages/GroupDetail.tsx`

- [ ] **[T112] [P]** Wire wallet page: show balance, deposit flow, transaction history, withdrawal flow in `src/app/pages/Wallet.tsx`

- [ ] **[T113] [P]** Wire profile page: show user details, trust score breakdown, KYC status, linked bank account in `src/app/pages/Profile.tsx`

- [ ] **[T114]** Create onboarding flow wiring: signup → phone verification → KYC flow → dashboard redirect in `src/app/pages/` with backend integration

- [ ] **[T115]** Update routes and navigation: ensure all internal links work with backend-powered data in `src/app/routes.ts`

### Subphase 2j: Final Launch & Documentation (Week 12)

- [ ] **[T116]** Create final security & compliance sign-off: CBN filing complete or submitted with all audit logs, legal agreements, KYC automation proof

- [ ] **[T117]** Generate API documentation: auto-generated from OpenAPI spec and deployed at `/api/docs` endpoint

- [ ] **[T118]** Create production monitoring dashboard: Datadog/New Relic with key metrics (uptime, API latency, transaction volume, errors)

- [ ] **[T119]** Create incident response runbook: documented procedures for handling payment failures, system outages, security incidents

- [ ] **[T120]** Conduct final E2E test run: complete user journey from signup to payout with real test data, document results

- [ ] **[T121]** Archive Phase 2 artifacts: update `.github/copilot-instructions.md` with deployment info, create DEPLOYMENT.md with launch checklist

- [ ] **[T122]** Production launch: migrate users from mock data, enable real transactions, activate payment gateway processing, begin monitoring

---

## Task Dependency Graph

### Critical Path (Blocking Dependencies)

```
Phase 0: Research (Weeks 1-2)
├── T001-T006 (Parallel research tasks)
├── T007-T011 (Vendor selection, 1-2 weeks)
└── T012-T015 (Synthesis & summary)

        ↓ GATE: Phase 0 Complete

Phase 1: Design (Weeks 3-6)
├── Subphase 1a: Data Model Design
│   ├── T016-T023 (Entity design, parallel)
│   └── T024-T025 (Relational & state machines)
├── Subphase 1b: API Contracts
│   └── T026-T034 (API endpoint design, parallel by module)
├── Subphase 1c: Contracts
│   └── T035-T038 (Legal & config docs)
├── Subphase 1d: Quickstart
│   └── T039-T043 (Developer guide)
└── Subphase 1e: Compliance Review
    └── T044-T047 (Security & legal review)

        ↓ GATE: Phase 1 Complete (all design artifacts approved)

Phase 2: Implementation (Weeks 7-12)
├── Subphase 2a: Backend Infrastructure (Weeks 7-8)
│   ├── T048-T051 (Project setup, parallel)
│   ├── T052 (Database migrations) ← depends on T024-T025
│   ├── T053-T055 (Auth & logging middleware)
│   └── T056 (Structured logging)
├── Subphase 2b: Auth & KYC (Weeks 7-9)
│   └── T057-T063 (Auth & KYC endpoints) ← depends on T053
├── Subphase 2c: Ledger & Escrow (Weeks 8-10)
│   ├── T064-T065 (Ledger system)
│   ├── T066-T067 (Escrow logic)
│   ├── T068 (Wallet balance calculation)
│   └── T069 (Transaction state machine)
├── Subphase 2d: Payment Gateway (Weeks 9-10)
│   ├── T070-T073 (Gateway integration) ← depends on T007, T064-T069
│   ├── T074 (Receipt generation)
│   └── T075-T076 (Withdrawal & settlement)
├── Subphase 2e: Groups & Contributions (Weeks 9-11)
│   ├── T077-T080 (Group management)
│   ├── T081-T083 (Contribution flow)
│   └── T084-T085 (Payout flow)
├── Subphase 2f: Users & Admin (Weeks 10-11)
│   ├── T086-T087 (Trust score)
│   ├── T088-T089 (Admin workflows)
│   └── T090 (User profile)
├── Subphase 2g: Notifications (Weeks 10-11)
│   ├── T091-T092 (Notification service)
│   ├── T093 (Scheduled notifications)
│   └── T094 (Activity feed)
├── Subphase 2h: Compliance & Testing (Weeks 11-12)
│   ├── T095-T098 (Compliance & security)
│   ├── T100 (Monitoring setup)
│   ├── T101-T102 (Testing)
│   ├── T103 (Security audit)
│   └── T104-T105 (Deployment)
├── Subphase 2i: Frontend Integration (Weeks 11-12)
│   ├── T106-T113 (API layer & wiring, parallel by page)
│   ├── T114-T115 (Onboarding & routing)
└── Subphase 2j: Launch (Week 12)
    └── T116-T122 (Final checks & go-live)
```

### Parallelization Opportunities

**Phase 0**: T001-T006 (all research tasks independent)
**Phase 1a**: T017-T023 (entity design mostly independent, T024-T025 are dependencies)
**Phase 1b**: T027-T032 (API endpoint design by user story, parallel once data model is known)
**Phase 2a**: T048-T051 (project setup tasks independent)
**Phase 2i**: T106-T113 (frontend service & page wiring tasks independent)

---

## Success Criteria by Phase

### Phase 0 Completion Gates

- [x] `research.md` (8-12 pages) completed with all findings
- [x] Payment gateway selected and API documentation available
- [x] BVN/NIN verification provider contracted with sandbox access
- [x] Bank settlement architecture documented
- [x] CBN compliance requirements understood; lawyer engaged
- [x] KYC/AML provider selected
- [x] Security architecture finalized
- [x] Phase 0 summary approved by product + compliance team

### Phase 1 Completion Gates

- [x] Data model finalized with all entity schemas and migrations
- [x] OpenAPI specification complete with 20+ endpoints
- [x] Group agreement template drafted; legal review complete
- [x] KYC/AML verification checklist documented
- [x] Quickstart guide published with examples
- [x] Security checklist reviewed by compliance lawyer
- [x] All design artifacts approved by product + engineering + compliance
- [x] Phase 1 ready for backend implementation

### Phase 2 Completion Gates (MVP Launch)

- [x] Full user flow implemented and tested: signup → KYC → deposit → group → contribute → payout
- [x] All 12 user stories implemented with acceptance criteria met
- [x] Database migrations executed; data model live
- [x] Payment gateway integration tested in sandbox + production
- [x] BVN/NIN verification live with 100% coverage
- [x] Ledger system live with zero discrepancies; reconciliation passing
- [x] Escrow mechanics working; funds locked/released correctly
- [x] Audit logging complete; 7-year retention configured
- [x] KYC/AML 100% automated; manual review workflow documented
- [x] Security audit passed; TLS 1.3, encryption at rest, JWT tokens verified
- [x] Monitoring & alerting live; 99.9% uptime baseline established
- [x] Backend unit tests passing (80%+ coverage); E2E tests passing
- [x] CBN Money Services Operator license application submitted or approved
- [x] Production deployment complete; real transactions enabled
- [x] 1,000+ users beta tested; feedback incorporated
- [x] MVP launched to market

---

## Implementation Strategy: MVP-First, Incremental Delivery

### Minimum Viable Product (MVP) Scope

The MVP enables **one complete financial cycle**: user signup → fund wallet → create/join group → contribute → receive payout.

**In Scope** (Week 12 launch):
- User registration & KYC/AML
- Wallet & deposits (real payment gateway)
- Group creation & discovery
- Contribution tracking & escrow
- Payout scheduling & bank settlement
- Admin approval workflows
- Trust score calculation
- Audit logging & compliance
- Security (encryption, TLS, JWT)
- 80%+ test coverage
- Monitoring & alerting

**Out of Scope** (Phase 2+):
- Real-time notifications (Phase 2.5: implement full notification service)
- ShuraBot AI recommendations (Phase 2.5: LLM backend)
- Sadaqah module (Phase 3: charitable savings)
- Group communication hub (Phase 3: chat, polls)
- Mobile app (Phase 3: React Native)
- Advanced analytics (Phase 3: business intelligence)

### Release Schedule

| Week | Milestone | Deliverables | Status |
|------|-----------|--------------|--------|
| 1-2 | **Phase 0 Research** | `research.md`, vendor selections, contracts signed | 🟡 Started |
| 3-6 | **Phase 1 Design** | Data model, API contracts, quickstart, legal docs | ⏳ Pending Phase 0 |
| 7-8 | **Backend Foundation** | Express API scaffold, auth, database, middleware | ⏳ |
| 9-10 | **Financial Core** | Payment gateway, ledger, escrow, contributions | ⏳ |
| 11-12 | **Launch Prep** | Testing, compliance review, monitoring, deployment | ⏳ |
| 12 | **MVP Live** | 1,000 beta users, real transactions enabled | 🚀 |

---

## File Structure Reference

After task completion, the project will have this structure:

```
Khalia/
├── specs/001-mvp-implementation-plan/
│   ├── plan.md (← input)
│   ├── spec.md (← input)
│   ├── tasks.md (← this file, T121 output)
│   ├── research.md (← Phase 0 output, T015)
│   ├── data-model.md (← Phase 1 output, T024)
│   ├── contracts/
│   │   ├── api.md (← Phase 1 output, T034)
│   │   ├── group-agreement.md (← Phase 1 output, T035)
│   │   ├── kba-checklist.md (← Phase 1 output, T036)
│   │   ├── webhooks.md (← Phase 1 output, T037)
│   │   ├── configuration.md (← Phase 1 output, T038)
│   │   ├── audit.md (← Phase 1 output, T044)
│   │   └── security.md (← Phase 1 output, T045)
│   └── quickstart.md (← Phase 1 output, T042)
├── backend/ (← Phase 2 output)
│   ├── src/
│   │   ├── app.ts (T049)
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── database.ts (T050)
│   │   │   ├── redis.ts (T051)
│   │   │   ├── payment.ts (T070)
│   │   │   ├── logger.ts (T056)
│   │   │   ├── ssl.ts (T098)
│   │   │   └── monitoring.ts (T100)
│   │   ├── middleware/
│   │   │   ├── auth.ts (T053, T099)
│   │   │   ├── errorHandler.ts (T054)
│   │   │   └── auditLog.ts (T055)
│   │   ├── models/
│   │   │   ├── User.ts (T016)
│   │   │   ├── Group.ts (T017)
│   │   │   ├── Transaction.ts (T018, T069)
│   │   │   ├── Contribution.ts (T019)
│   │   │   ├── LedgerEntry.ts (T020)
│   │   │   ├── Notification.ts (T021)
│   │   │   └── GroupMember.ts (T022)
│   │   ├── services/
│   │   │   ├── auth.ts (T057, T058)
│   │   │   ├── kyc.ts (T059-T062)
│   │   │   ├── ledger.ts (T064, T065)
│   │   │   ├── escrow.ts (T066, T067)
│   │   │   ├── wallet.ts (T068)
│   │   │   ├── payment.ts (T070-T073)
│   │   │   ├── settlement.ts (T075)
│   │   │   ├── receipt.ts (T074)
│   │   │   ├── group.ts (T077-T079)
│   │   │   ├── contribution.ts (T081)
│   │   │   ├── payout.ts (T084)
│   │   │   ├── trustScore.ts (T086)
│   │   │   ├── notification.ts (T091)
│   │   │   ├── email.ts (T092)
│   │   │   ├── activityFeed.ts (T094)
│   │   │   ├── auditLog.ts (T095)
│   │   │   └── crypto.ts (T097)
│   │   ├── routes/
│   │   │   ├── auth.ts (T026)
│   │   │   ├── wallet.ts (T027, T071, T076)
│   │   │   ├── groups.ts (T028, T078)
│   │   │   ├── contributions.ts (T029, T082)
│   │   │   ├── payouts.ts (T030, T085)
│   │   │   ├── admin.ts (T031, T088, T089, T096)
│   │   │   ├── transactions.ts (T032)
│   │   │   ├── profile.ts (T090)
│   │   │   ├── webhooks.ts (T072)
│   │   │   └── health.ts
│   │   ├── jobs/
│   │   │   ├── contributionReminder.ts (T083)
│   │   │   ├── updateTrustScores.ts (T087)
│   │   │   ├── notificationScheduler.ts (T093)
│   │   │   └── ledgerReconciliation.ts (T065)
│   │   └── utils/
│   │       ├── crypto.ts (T097)
│   │       ├── validation.ts
│   │       └── auditLog.ts (T095)
│   ├── migrations/ (T052)
│   ├── tests/
│   │   ├── unit/ (T101)
│   │   ├── integration/ (T102)
│   │   └── e2e/ (T102)
│   ├── package.json
│   └── tsconfig.json
├── frontend/ (← existing, wired in Phase 2)
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/ (T106-T113)
│   │   │   │   ├── auth.ts
│   │   │   │   ├── wallet.ts
│   │   │   │   ├── groups.ts
│   │   │   │   ├── contributions.ts
│   │   │   │   ├── payments.ts
│   │   │   │   └── notifications.ts
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx (T107)
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx (T109)
│   │   │   │   ├── Groups.tsx (T110)
│   │   │   │   ├── GroupDetail.tsx (T111)
│   │   │   │   ├── Wallet.tsx (T112)
│   │   │   │   ├── Profile.tsx (T113)
│   │   │   │   ├── Onboarding.tsx (T114)
│   │   │   │   └── ... (rest of UI)
│   │   │   └── routes.ts (T115)
│   │   └── ... (rest of frontend)
├── shared/
│   ├── types.ts
│   └── constants.ts
├── docs/
│   ├── DEPLOYMENT.md (T121)
│   ├── API.md (T117)
│   ├── SETUP.md
│   ├── SECURITY.md
│   ├── MONITORING.md (T118)
│   └── INCIDENTS.md (T119)
├── .github/
│   ├── copilot-instructions.md (updated in T015, T047, T121)
│   └── workflows/
│       ├── test.yml
│       ├── lint.yml
│       └── deploy.yml
└── README.md
```

---

## How to Use This Tasks File

### For Project Managers

1. **Track Progress**: Check items as tasks complete. Update status weekly.
2. **Identify Blockers**: Review dependency graph to understand critical path. Task T007 (payment gateway contract) blocks T070-T073 (integration).
3. **Optimize Parallelization**: Run Phase 0 research tasks (T001-T006) in parallel. Run Phase 2i frontend wiring tasks (T106-T113) in parallel.
4. **Report Status**: Reference task IDs in status meetings (e.g., "Phase 0: T007, T008 in progress").

### For Engineers

1. **Task Breakdown**: Each task includes specific file paths and acceptance criteria.
2. **Assignment**: Pick a task from the current phase, check dependencies, and start implementation.
3. **Reference**: Link to Phase 1 design artifacts (data-model.md, api.md, etc.) before implementing.
4. **Testing**: Each task references tests that must pass before considering it complete.

### For QA

1. **E2E Test Coverage**: Focus on T102 (E2E tests) covering signup → deposit → group → contribute → payout.
2. **Compliance Testing**: Verify T095-T098 (audit logging, encryption, security, TLS).
3. **Payment Processing**: Test T070-T073 (payment gateway integration) in sandbox and production.
4. **Regression Testing**: After each phase gate, verify all prior tasks still pass.

### For Leadership

1. **Timeline**: 12 weeks to MVP (Weeks 1-2 research, 3-6 design, 7-12 implementation).
2. **Risks**: Payment gateway contract (T007) and compliance review (T046) are critical path dependencies.
3. **Success**: MVPlaunch at Week 12 when all Phase 2 tasks complete and gates pass.
4. **Go/No-Go Decision**: End of Phase 1 (Week 6) and Phase 2 (Week 12) for go/no-go decisions.

---

## Document Version & History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Apr 20, 2026 | Specification Agent | Initial task breakdown from plan.md + spec.md |
| — | — | — | — |

---

**Status**: ✅ Ready for Phase 0 Research (Week 1)  
**Next Update**: After Phase 0 (Week 2) with `research.md` findings  
**Last Updated**: April 20, 2026
