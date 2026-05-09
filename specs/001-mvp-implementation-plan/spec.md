# Feature Specification: Khalia MVP - Production-Grade Fintech

**Feature ID**: 001-mvp-implementation-plan  
**Status**: In Planning  
**Phase**: MVP (12 weeks)  
**Priority**: 🔴 Critical

---

## Feature Summary

Transform Khalia from a UI prototype (85% complete) into a production-grade fintech platform for community-driven savings groups (ROSCA/Esusu). Enable real financial transactions, KYC/AML compliance, and regulatory-ready operations in Nigeria.

---

## User Stories (Priority-Ordered)

### Story 1: User Onboarding & KYC (P1 - CRITICAL)

**As a** new user signing up for Khalia  
**I want to** verify my identity through BVN/NIN, link my bank account, and set up biometric access  
**So that** I can be a trusted member of the platform and access all financial features

**Acceptance Criteria**:

- [ ] User signs up with email, phone, password
- [ ] BVN/NIN verification completes (government DB lookup)
- [ ] Bank account linked and verified (Naira name match)
- [ ] Face ID or fingerprint registered
- [ ] KYC checklist shows 100% completion
- [ ] User reaches Dashboard with verified status badge
- [ ] Trust score initialized at 20%

**Component**: Onboarding & Verification Module  
**Technical**: Auth backend, BVN API integration, facial recognition, database schema

---

### Story 2: Wallet & Deposits (P1 - CRITICAL)

**As a** verified user  
**I want to** deposit money via bank transfer, card, or USSD  
**So that** I have funds available to contribute to savings groups

**Acceptance Criteria**:

- [ ] User sees wallet balance and deposit button
- [ ] Deposit flow: amount entry → payment method selection → authorization
- [ ] Payment gateway (Paystack/Flutterwave) successfully processes payment
- [ ] Wallet balance updates in real-time after deposit confirms
- [ ] Receipt generated and downloadable as PDF
- [ ] Transaction tracked in immutable ledger
- [ ] All deposits logged for audit compliance

**Component**: Wallet & Transactions Module  
**Technical**: Payment gateway integration, transaction ledger, receipt generation

---

### Story 3: Group Discovery & Joining (P1 - CRITICAL)

**As a** user with funded wallet  
**I want to** browse available savings groups, filter by criteria, and request to join  
**So that** I can participate in a community savings pool

**Acceptance Criteria**:

- [ ] Groups page shows list of open groups (50+ fixture data)
- [ ] Filtering works: goal, payout size, frequency, Shariah compliance
- [ ] Search functional by group name or creator
- [ ] Group detail shows: goal, contribution schedule, member list, next payout
- [ ] User can request to join with optional message
- [ ] Join request status tracked (pending/approved/declined)
- [ ] Approved user added to group member list
- [ ] Group appears in user dashboard

**Component**: Groups (Marketplace) Module  
**Technical**: Group database, filtering logic, member management, notifications

---

### Story 4: Contribution & Escrow (P1 - CRITICAL)

**As a** group member  
**I want to** make my required contributions on schedule, with funds held in escrow  
**So that** my money is secure until payout date

**Acceptance Criteria**:

- [ ] Dashboard shows contribution reminder (e.g., "Due: ₦50K on Apr 25")
- [ ] Contribution flow: amount (pre-filled from schedule) → payment method → confirm
- [ ] Payment processed (real transaction or mock for MVP testing)
- [ ] Contribution recorded with escrow lock
- [ ] Group progress wheel updates
- [ ] Receipt generated
- [ ] User notified of confirmation
- [ ] Double-entry ledger entry created

**Component**: Group Detail & Management Module  
**Technical**: Escrow logic, ledger entries, notifications, contribution tracking

---

### Story 5: Payout (P1 - CRITICAL)

**As a** designated next recipient in a group  
**I want to** receive my group payout when the contribution round completes  
**So that** I have access to the pooled savings

**Acceptance Criteria**:

- [ ] Scheduled payout date arrives
- [ ] Admin receives approval notification
- [ ] Admin approves payout (or auto-approve if conditions met)
- [ ] Funds released from escrow to recipient's bank account (or wallet)
- [ ] Recipient notified of payout
- [ ] All group members notified of payout event
- [ ] Group progress wheel resets
- [ ] Next payout date countdown begins
- [ ] Payout recorded in transaction history + audit log

**Component**: Group Management + Wallet Module  
**Technical**: Payout scheduling, bank settlement, notifications, audit trails

---

### Story 6: Admin Member Approval (P1 - IMPORTANT FOR INTEGRITY)

**As a** group creator/admin  
**I want to** approve or reject members requesting to join  
**So that** I can control group membership and trust

**Acceptance Criteria**:

- [ ] Admin sees pending member requests with trust scores
- [ ] Admin can view member details (BVN verified, bank verified, contribution history)
- [ ] Admin can approve (member added) or reject (member removed from pending)
- [ ] Approved/rejected member notified
- [ ] Admin actions logged for audit trail
- [ ] Group member count updated

**Component**: Admin & Governance Tools Module  
**Technical**: Admin dashboard, member status workflow, notifications

---

### Story 7: Transaction History & Receipts (P1 - IMPORTANT)

**As a** user  
**I want to** view all my transactions (deposits, contributions, payouts, withdrawals) with receipts  
**So that** I have a clear financial record

**Acceptance Criteria**:

- [ ] Transaction history page lists all user transactions
- [ ] Filterable by: type (deposit, contribution, payout), date range, group
- [ ] Each transaction shows: date, type, amount, recipient, status
- [ ] Receipt downloadable as PDF per transaction
- [ ] Transaction detail shows: payment method, reference code, confirmation
- [ ] Data persists and is searchable

**Component**: Wallet & Transactions Module  
**Technical**: Transaction database queries, PDF generation, filtering logic

---

### Story 8: Trust Score Calculation (P1 - IMPORTANT)

**As a** user  
**I want to** see how my trust score is calculated and how to improve it  
**So that** I understand my platform reputation

**Acceptance Criteria**:

- [ ] Profile page displays trust score (0-100)
- [ ] Breakdown shows factors: punctuality (40%), consistency (30%), duration (20%), reviews (10%)
- [ ] Historical trend graph (monthly)
- [ ] User understands how to improve (contribute on time, join groups, stay active)
- [ ] Trust score affects: group join approvals, contribution limits, payout priority

**Component**: Profile & Trust Score Module  
**Technical**: Trust score algorithm, historical tracking, dashboard visualization

---

### Story 9: Audit Logging & Compliance (P1 - COMPLIANCE CRITICAL)

**As a** compliance officer  
**I want to** view immutable audit logs of all financial transactions and admin actions  
**So that** Khalia meets regulatory requirements

**Acceptance Criteria**:

- [ ] Every transaction creates an audit log entry: timestamp, user, action, before/after state
- [ ] Logs cannot be modified or deleted (immutable append-only)
- [ ] Retention: minimum 7 years
- [ ] Admin can export audit reports (filtered by date, user, action)
- [ ] CBN and EFCC reports can be generated from audit data
- [ ] All KYC/AML verification steps logged

**Component**: Platform Infrastructure (Global)  
**Technical**: Audit log service, database archiving, export logic, compliance reporting

---

### Story 10: Security & Encryption (P1 - COMPLIANCE CRITICAL)

**As a** user  
**I want to** be confident my data is encrypted, my sessions are secure, and my biometric data is safe  
**So that** I trust Khalia with sensitive information

**Acceptance Criteria**:

- [ ] All communication encrypted with TLS 1.3
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] Biometric data (face ID hash) stored encrypted, never transmitted in plaintext
- [ ] BVN/NIN tokenized (encrypted reference, not raw value)
- [ ] Bank account numbers encrypted at rest
- [ ] JWT tokens: 15-min access, 30-day refresh (HTTP-only cookies)
- [ ] Session timeout at 30 min inactivity
- [ ] CSRF protection via token-based validation

**Component**: Platform Infrastructure (Global)  
**Technical**: Encryption layer, auth middleware, token management

---

### Story 11: Notifications (P2 - IMPORTANT)

**As a** user  
**I want to** receive real-time notifications for contribution reminders, payout events, and group updates  
**So that** I stay informed and don't miss deadlines

**Acceptance Criteria**:

- [ ] Contribution due reminder (2 days before, 1 day before, day-of)
- [ ] Payout ready notification
- [ ] Member joined group notification
- [ ] Group milestone notifications
- [ ] All notifications in-app + email + (future: SMS/push)
- [ ] User can customize notification preferences
- [ ] Notification history visible to user

**Component**: Activity Feed & Notifications Module  
**Technical**: Notification service, job scheduler for reminders, email service

---

### Story 12: Withdrawal & Bank Settlement (P2 - IMPORTANT)

**As a** user  
**I want to** withdraw funds from my wallet to my linked bank account  
**So that** I can access my money whenever needed

**Acceptance Criteria**:

- [ ] Withdrawal flow: amount entry → confirm → OTP verification
- [ ] Available balance shown (total - locked in escrow)
- [ ] Payout reaches bank account within 1-2 hours
- [ ] Withdrawal receipt generated
- [ ] Transaction recorded in ledger + history
- [ ] Bank settlement confirmed before wallet balance reduced

**Component**: Wallet & Transactions Module  
**Technical**: Bank settlement API, payout scheduling, reconciliation

---

## Features Backlog (Phase 2+)

- **Story 13**: ShuraBot AI recommendations & scenario analysis
- **Story 14**: Sadaqah tracking & impact reporting
- **Story 15**: Group communication hub (chat, polls, announcements)
- **Story 16**: Admin governance tools (payout rules, contribution enforcement)
- **Story 17**: Micro-investments for idle balance

---

## Technical Acceptance Criteria (Cross-Cutting)

### Performance

- [ ] Dashboard load < 2s
- [ ] API response < 500ms (p95)
- [ ] Payment flow < 3s
- [ ] 99.9% uptime

### Security & Compliance

- [ ] CBN Money Services Operator license app filed
- [ ] KYC/AML framework 100% automated
- [ ] Audit trail complete and immutable
- [ ] PCI DSS compliant (payment processing)
- [ ] NDPR compliant (data protection)

### Testing

- [ ] Unit tests: 80%+ coverage (backend)
- [ ] E2E test: Full flow (signup → deposit → group → contribute → payout)
- [ ] Security audit passed
- [ ] Accessibility (WCAG 2.1 AA) verified

### Operations

- [ ] Monitoring & alerting set up (99.9% uptime)
- [ ] Incident response plan documented
- [ ] Data backup & disaster recovery tested
- [ ] Support infrastructure ready (tickets, FAQ)

---

## Dependencies & Constraints

### External Dependencies

- **Payment Gateway**: Paystack or Flutterwave (to be selected in Phase 0)
- **BVN Provider**: NIBSS or licensed aggregator (to be contracted in Phase 0)
- **Bank Settlement**: NACCS API or direct bank integration (to be determined)
- **Compliance Lawyer**: CBN filing, legal agreement templates
- **Facial Recognition**: Third-party provider (to be selected)

### Constraints

- **Timeline**: 12 weeks to MVP (non-negotiable for market window)
- **Budget**: (TBD - depends on vendor selections)
- **Team**: ~5 FTE (product, backend, frontend, QA, compliance)
- **Regulatory**: Must follow CBN requirements (blocking constraint)

---

## Success Metrics

| Metric                     | MVP Target | Long-Term Target |
| -------------------------- | ---------- | ---------------- |
| Active users               | 1,000      | 100,000          |
| Groups active              | 100        | 10,000+          |
| Monthly transaction volume | ₦5M        | ₦500M+           |
| Contribution on-time rate  | >85%       | >95%             |
| Zero fraud incidents       | 0          | <0.01%           |
| System uptime              | 99.9%      | 99.99%           |

---

## Phase Breakdown

### Phase 0: Research (Weeks 1-2)

Vendor selection, architecture decisions, contract negotiations

### Phase 1: Design (Weeks 3-6)

Data models, API contracts, legal templates, quickstart guide

### Phase 2: Implementation (Weeks 7-12)

Backend build, payment integration, compliance setup, testing, launch prep

---

**Spec Version**: 1.0  
**Created**: April 20, 2026  
**Status**: Ready for Task Generation
