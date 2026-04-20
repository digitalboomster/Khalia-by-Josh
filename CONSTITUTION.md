# KHALIA Constitution

**Version:** 1.0  
**Date:** April 20, 2026  
**Status:** Active Specification & Implementation Guide

---

## Table of Contents
1. [Core Vision & Principles](#core-vision--principles)
2. [Product Architecture](#product-architecture)
3. [Feature Requirements Matrix](#feature-requirements-matrix)
4. [User Flow Specifications](#user-flow-specifications)
5. [Technical Standards](#technical-standards)
6. [Data Model Requirements](#data-model-requirements)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Quality & Compliance Standards](#quality--compliance-standards)

---

## Core Vision & Principles

### Mission
**Khalia is a fintech platform for community-driven savings groups (ROSCA/Esusu), combining cooperative financial management with Shariah-compliant principles, trust-based verification, and AI-guided decision-making.**

### Core Principles

#### 1. **Trust-First Design**
- All features prioritize transparency, verification, and progressive trust evaluation
- Trust scores calculated from contribution history, punctuality, and community reputation
- Biometric & device verification built-in from onboarding
- KYC/AML compliance enforceable at group and platform levels

#### 2. **Shariah Compliance**
- No interest-based lending or Riba
- Transparent Sadaqah (charitable giving) integration
- Halal investment options for idle balances
- Governance rules allow groups to enforce Islamic principles

#### 3. **Cooperative Ownership**
- Groups are member-owned; creators are admins, not controllers
- Democratic decision-making tools (polls, announcements, agreements)
- Fair payout mechanisms (rotating, merit-based, or custom)
- Clear, enforced contribution schedules

#### 4. **AI-Guided Autonomy**
- ShuraBot provides suggestions, not mandates
- Members retain full control over contributions and payouts
- AI learns group dynamics and patterns
- Risk alerts inform, not restrict, member actions

#### 5. **Financial Inclusion**
- Multi-channel payments (bank, USSD, card, wallet)
- Seamless fiat-to-wallet conversions
- Micro-investment options for idle funds
- Impact tracking for community giving

---

## Product Architecture

### 10 Core Modules (Standalone Products)

Each module must function with full user flows and state management, even if integrated with others.

#### **Module 1: Onboarding & Verification** (MVP Critical)
- **Purpose:** Establish identity, access, and trust baseline
- **Components:**
  - Welcome screen with sign-up/sign-in
  - BVN/NIN verification (government ID)
  - Bank account linking (account holder verification)
  - Identity verification (face ID or fingerprint)
  - Device approval and security setup
  - KYC checklist with progress tracking
- **Success Criteria:** User completes all steps → Dashboard accessible with verified status badge
- **Compliance:** Must integrate with national KYC/AML standards
- **Current Status:** ❌ Not Started

#### **Module 2: Dashboard (Home)** (MVP Critical)
- **Purpose:** Central hub for awareness and quick actions
- **Components:**
  - Wallet overview card (balance, escrow, next payout, total group savings)
  - Contribution status & reminders (overdue highlighting)
  - Tasks carousel (Link BVN, Add Funds, Join Group, etc.)
  - Group activity summary (recent transactions, milestones)
  - Community impact overview (groups active, total saved, transparency score)
  - Quick links (Join Group, Create Group, ShuraBot, Wallet)
- **Micro-interactions:**
  - Pull-to-refresh with data updates
  - Sticky active nav bar (Dashboard, ShuraBot, Groups, Sadaqah, Profile)
  - Smooth state transitions
- **Success Criteria:** All sections render with live data; all CTAs accessible
- **Current Status:** ✅ 85% (missing task carousel wiring, impact cards interactivity)

#### **Module 3: Groups (Marketplace)** (MVP Critical)
- **Purpose:** Discover, browse, and join savings groups
- **Components:**
  - Group discovery list/grid
  - Advanced filtering (goal, payout size, frequency, Shariah compliance, member count)
  - Group preview cards (goal, current pool, members, next payout date)
  - Search functionality
  - Group detail view (rules, payout order, member list, governance)
  - Join request flow (application → approval → confirmation)
  - Create group flow
- **Business Rules:**
  - Groups can be public (open to join) or private (invite-only)
  - Shariah compliance flag affects filtering & governance templates
  - Payout order determines who receives funds each round
- **Success Criteria:** User can discover 5+ groups, join one, and see it in dashboard
- **Current Status:** ✅ 80% (missing Shariah toggle refinement, some filtering options)

#### **Module 4: Group Detail & Management** (MVP Critical)
- **Purpose:** Manage ongoing group operations and member interactions
- **Components:**
  - Contribution schedule timeline (visual + calendar)
  - Member list with trust scores, contribution history
  - Group progress wheel (pooled amount vs. goal)
  - Next payout countdown + historical payout records
  - Member detail pages (profile, contribution history, contact)
  - Overdue alerts with notification CTA
  - Communication hub (chat, polls, announcements)
  - Vetting information (if pending approval)
- **Governance:**
  - Admin-only actions: set payout rules, manage member approvals, enforce deadlines
  - Member actions: contribute, view progress, communicate
- **Success Criteria:** Group operations fully visible; contributions traceable; payouts scheduled
- **Current Status:** ✅ 75% (missing real-time chat service, live notifications)

#### **Module 5: ShuraBot (AI Assistant)** (MVP Nice-to-Have, Phase 2 Critical)
- **Purpose:** AI co-planning assistant for financial decisions
- **Components:**
  - Chat interface with greeting & context awareness
  - Scenario analysis (e.g., "What if we increase contributions?")
  - Personalized recommendations based on group performance
  - Risk alerts (members not contributing, payout delays, market conditions)
  - Smart reminders (auto-generated contribution reminders)
  - Financial education (halal investing, Sadaqah impact)
  - Proposal generation (contribution amounts, payout schedules)
- **Integration:**
  - Access group data (members, balance, history)
  - Access user profile (contributions, preferences)
  - Generate insights, **not** make decisions for user
- **Success Criteria:** Bot responds to 5+ intents; suggestions are actionable
- **Current Status:** ✅ 90% (UI complete; needs backend LLM service)

#### **Module 6: Wallet & Transactions** (MVP Critical)
- **Purpose:** Fund management, deposits, withdrawals, and escrow tracking
- **Components:**
  - Wallet balance display (available, escrowed, pending)
  - Deposit flow (input amount, choose payment method, confirmation)
  - Withdrawal flow (input amount, choose destination, confirmation)
  - Transaction history (searchable, filterable by type/date)
  - Receipt generation (PDF download)
  - Escrow status breakdown (locked funds per group, payout dates)
  - Payment method management (bank accounts, cards, USSD)
  - Micro-investment options for idle balance (future)
- **Payment Methods Supported:**
  - Bank transfer (NACCS, Remita)
  - USSD code
  - Debit card
  - Wallet-to-wallet transfers
- **Success Criteria:** User can deposit, see balance update, withdraw to bank
- **Current Status:** ✅ 70% (UI ready; no payment gateway integration)

#### **Module 7: Sadaqah & Impact** (Phase 2)
- **Purpose:** Community giving and impact tracking
- **Components:**
  - Sadaqah portion setter (% of savings set aside)
  - Campaign/beneficiary library
  - Contribution tracking (cumulative giving by user)
  - Impact reports (funds disbursed, beneficiaries helped, metrics)
  - Milestone celebrations (e.g., "You've donated 50,000 NGN!")
  - Certificate generation (Islamic giving record)
- **Success Criteria:** User sets 5% of savings to Sadaqah, sees cumulative impact
- **Current Status:** ❌ 0% (Not Started)

#### **Module 8: Activity Feed & Notifications** (MVP Critical)
- **Purpose:** Real-time awareness of group and personal events
- **Components:**
  - Centralized activity feed (all contributions, payouts, member events)
  - Notification history (contributions due, payout ready, member joined)
  - Real-time notifications (push, in-app)
  - Notification preferences (mutable by user)
  - Event types: contribution confirmed, member joined, payout ready, overdue alert, group milestone
- **Integration:**
  - Activity broadcasts on contribution completion
  - Notifications trigger on payout events
  - Member presence updates
- **Success Criteria:** User receives notification on contribution deadline; sees activity feed
- **Current Status:** ⚠️ 50% (Activity in groups; no dedicated feed or push notifications)

#### **Module 9: Profile & Trust Score** (MVP Critical)
- **Purpose:** Personal identity, verification status, and reputation management
- **Components:**
  - Profile info (name, phone, email, verified status badges)
  - Trust score display (calculated metric, breakdown)
  - Trust score history (monthly trend)
  - Group participation history (groups joined, total contributions, payouts received)
  - Verification status (BVN ✓, Bank ✓, Face ID ✓, Device ✓)
  - Security settings (biometric methods, device approvals, session management)
  - Account settings (notification preferences, language, theme)
  - Edit profile (name, phone, email, photo)
- **Trust Score Algorithm:**
  - Contribution punctuality: 40%
  - Contribution consistency: 30%
  - Group participation duration: 20%
  - Community reviews/ratings: 10%
- **Success Criteria:** User sees trust score, can verify identity, manage devices
- **Current Status:** ✅ 80% (UI complete; trust score calculation not wired)

#### **Module 10: Admin & Governance Tools** (Phase 2)
- **Purpose:** Group creators manage operations and enforce rules
- **Components:**
  - Member approval dashboard (pending members, vetting criteria)
  - Contribution enforcement settings (auto-lock funds, grace period)
  - Payout rule editor (order, schedule, amount variations)
  - Group agreement builder (digital contracts, terms, amendments)
  - Audit log (all member actions, payouts, changes)
  - Member onboarding templates
  - Communication templates (reminders, announcements)
- **Automation:**
  - Auto-lock funds until contribution deadline
  - Auto-generate reminders at configurable intervals
  - Auto-initiate payout when conditions met
  - Auto-enforce Shariah compliance rules (if group requires)
- **Success Criteria:** Admin can set payout rules, approve members, view audit log
- **Current Status:** ❌ 20% (Governance visible but not editable/enforceable)

---

## Feature Requirements Matrix

| Module | Feature | MVP Status | Phase | UI Status | Backend Status | Notes |
|--------|---------|------------|-------|-----------|---|---------|
| 1. Onboarding | BVN/NIN Verification | 🔴 Critical | 1 | ❌ Missing | ❌ Missing | Must integrate gov't DB |
| 1. Onboarding | Bank Account Linking | 🔴 Critical | 1 | ❌ Missing | ❌ Missing | NACCS/Open Banking |
| 1. Onboarding | Face ID/Fingerprint | 🔴 Critical | 1 | ❌ Missing | ❌ Missing | Device-level API |
| 1. Onboarding | KYC Checklist | 🔴 Critical | 1 | ❌ Missing | ❌ Missing | Progress tracking |
| 2. Dashboard | Wallet Card | 🟢 Core | 1 | ✅ 95% | ⚠️ Mock | Real data integration |
| 2. Dashboard | Tasks Carousel | 🟢 Core | 1 | ✅ 90% | ⚠️ Partial | Needs task completion logic |
| 2. Dashboard | Group Progress Pinwheel | 🟢 Core | 1 | ✅ 85% | ⚠️ Partial | Animation polish needed |
| 2. Dashboard | Community Impact Cards | 🟢 Core | 1 | ✅ 80% | ⚠️ Mock | Analytics backend |
| 2. Dashboard | Recent Activity Feed | 🟢 Core | 1 | ✅ 80% | ⚠️ Mock | Real-time updates |
| 3. Groups | Group Discovery | 🟢 Core | 1 | ✅ 85% | ⚠️ Mock | Database search |
| 3. Groups | Advanced Filtering | 🟡 Important | 1 | ✅ 80% | ⚠️ Partial | Shariah toggle needed |
| 3. Groups | Group Creation | 🟢 Core | 1 | ✅ 85% | ⚠️ Mock | Form validation complete |
| 3. Groups | Join Request Flow | 🟢 Core | 1 | ✅ 90% | ⚠️ Partial | Approval logic needed |
| 4. Group Detail | Contribution Schedule | 🟢 Core | 1 | ✅ 85% | ⚠️ Mock | Calendar integration |
| 4. Group Detail | Member List & Trust Scores | 🟢 Core | 1 | ✅ 80% | ⚠️ Mock | Trust score calc needed |
| 4. Group Detail | Group Progress Wheel | 🟢 Core | 1 | ✅ 85% | ⚠️ Mock | Real-time updates |
| 4. Group Detail | Communication Hub | 🟡 Important | 1 | ⚠️ 50% | ❌ Missing | WebSocket/chat service |
| 5. ShuraBot | Chat Interface | 🟡 Important | 1 | ✅ 90% | ❌ Missing | LLM backend (Claude/GPT) |
| 5. ShuraBot | Scenario Analysis | 🟡 Important | 2 | ✅ 85% | ❌ Missing | LLM inference |
| 5. ShuraBot | Risk Alerts | 🟡 Important | 2 | ✅ 80% | ⚠️ Logic needed | Alert logic in backend |
| 6. Wallet | Balance Display | 🟢 Core | 1 | ✅ 95% | ⚠️ Mock | Real balance from backend |
| 6. Wallet | Deposit Flow | 🟢 Core | 1 | ✅ 90% | ❌ Missing | Payment gateway (Paystack/Flutterwave) |
| 6. Wallet | Withdrawal Flow | 🟢 Core | 1 | ✅ 90% | ❌ Missing | Bank settlement API |
| 6. Wallet | Transaction History | 🟢 Core | 1 | ✅ 85% | ⚠️ Mock | Database queries |
| 7. Sadaqah | Portion Setter | 🟡 Important | 2 | ❌ Missing | ❌ Missing | Feature not started |
| 7. Sadaqah | Impact Tracking | 🟡 Important | 2 | ❌ Missing | ❌ Missing | Analytics engine |
| 8. Activity Feed | Centralized Feed | 🟢 Core | 1 | ⚠️ 50% | ⚠️ Partial | Real-time service needed |
| 8. Activity Feed | Push Notifications | 🟢 Core | 1 | ❌ Missing | ❌ Missing | FCM/APNs integration |
| 9. Profile | Trust Score Display | 🟢 Core | 1 | ✅ 85% | ⚠️ Logic missing | Algorithm implementation |
| 9. Profile | Verification Badges | 🟢 Core | 1 | ✅ 90% | ⚠️ Partial | Verification workflow |
| 9. Profile | Security Settings | 🟡 Important | 1 | ✅ 80% | ❌ Missing | Device management |
| 10. Admin Tools | Member Approval | 🟡 Important | 2 | ⚠️ 30% | ⚠️ Logic missing | Admin workflow |
| 10. Admin Tools | Payout Rules | 🟡 Important | 2 | ⚠️ 40% | ⚠️ Logic missing | Rule engine |
| 10. Admin Tools | Audit Log | 🟡 Important | 2 | ❌ Missing | ❌ Missing | Event logging service |

**Legend:**
- 🔴 Critical (Must have in MVP)
- 🟢 Core (Should have in MVP)
- 🟡 Important (Nice-to-have in Phase 1)
- ✅ Complete / ⚠️ Partial / ❌ Missing

---

## User Flow Specifications

### Flow 1: Onboarding (MVP Critical)

```
Welcome Screen
    ↓
Sign Up / Sign In
    ↓
BVN/NIN Verification (2-3 min wait)
    ↓
Bank Account Linking (Open Banking / Manual)
    ↓
Identity Verification (Face ID or Fingerprint)
    ↓
Device Approval & Security Code
    ↓
Personalization (Language, Theme, Notifications)
    ↓
✓ Dashboard (Verified User)
```

**Requirements:**
- Each step must have a "Back" option (except Welcome)
- Progress indicator shows 5-6 steps
- BVN verification must call government API
- Face ID must store biometric hash (not raw data)
- Final screen shows "Welcome, [Name]!" with trust score starting at 20%

---

### Flow 2: Dashboard (MVP Critical)

```
Dashboard (Home)
    ├─ Tap Wallet Card → Wallet Expanded → Deposit/Withdraw/History
    ├─ Tap Task Card → Task In-Progress → Completion State
    ├─ Tap Pinwheel → Group Detail Expanded
    ├─ Tap Community Card → Analytics Detail
    ├─ Tap Activity → Activity Detail
    ├─ Bottom Nav → ShuraBot/Groups/Sadaqah/Profile
    └─ Pull to Refresh → Data Updates
```

**Requirements:**
- Wallet card shows: Balance, "Next Contribution: 50,000 on Apr 25"
- Tasks carousel shows 3-5 overdue/pending tasks
- Pinwheel animates pool growth weekly
- Activity feed auto-refreshes every 30 seconds

---

### Flow 3: Group Discovery & Join (MVP Critical)

```
Groups Page (Marketplace)
    ↓
Browse / Search / Filter
    ↓
Tap Group Card → Group Details
    (View rules, member count, payout date, trust requirements)
    ↓
"Join this Group" Button
    ↓
Application Form (optional questions per group)
    ↓
Submit for Approval
    ↓
Pending Approval Status
    ↓
Administrator Approval
    ↓
✓ Group Added to Dashboard
```

**Requirements:**
- Groups filterable by: Goal, Payout Size, Frequency, Shariah Compliance
- Member trust requirement shown (e.g., "Requires 60+ trust score")
- Application form can be customized by admin
- Approval decision sent as notification + email
- Successful join triggers celebratory animation

---

### Flow 4: Group Creation (MVP Critical)

```
"Create Group" Button (Dashboard)
    ↓
Step 1: Group Name & Goal Amount
    ↓
Step 2: Contribution Schedule
    (Amount, Frequency: Weekly/Bi-weekly/Monthly, Duration)
    ↓
Step 3: Payout Order
    (Rotating, Merit-based, Custom order, or Random)
    ↓
Step 4: Add Members / Open to Public
    ↓
Step 5: Shariah Compliance & Governance Rules (Optional)
    ↓
Summary & Confirm
    ↓
✓ Group Created (Creator as Admin)
```

**Requirements:**
- Form validation on each step
- Goal amount must be ≥ 100,000
- Min 2 members, Max 50
- Payout order visualized with member avatars
- Confirmation email sent to all members

---

### Flow 5: Contribution & Escrow (MVP Critical)

```
Reminder Notification
    "Contribution due: 50,000 in 2 days"
    ↓
Dashboard Task or Group Detail Button
    "Contribute Now"
    ↓
Amount Input (Pre-filled from schedule)
    ↓
Choose Payment Method
    (Bank Transfer, USSD, Card, Wallet)
    ↓
Authorization / OTP
    ↓
✓ Payment Success Screen
    (Receipt, confirmation code, updated balance)
    ↓
Escrowed until payout date
    (Group progress wheel updates)
```

**Requirements:**
- Payment processor must support all 4 methods
- OTP valid for 10 minutes
- Escrow holds amount securely
- Contribution visible in group activity immediately
- Receipt downloadable as PDF

---

### Flow 6: Payout (MVP Critical)

```
Scheduled Payout Date Reached
    ↓
Validation: All members contributed? 
    (Alert if members are late)
    ↓
Initiate Payout to Next Recipient
    ↓
Funds Released from Escrow → Bank Account / Wallet
    ↓
✓ Recipient Receives Funds
    Notification sent to all group members
    ↓
Group Progress Wheel Updates
    ↓
Next Payout Countdown Begins
```

**Requirements:**
- Payout can be manual (admin approval) or auto (if rules met)
- If members overdue, payout can be delayed (configurable grace period)
- All members notified of payout event
- Payout receipt generated and archived
- New round begins with fresh contribution due dates

---

### Flow 7-10: ShuraBot, Sadaqah, Wallet, Profile

(See Part 2: User Flows in requirements document—each has dedicated flow)

---

## Technical Standards

### Code Style & Architecture

#### File Organization
```
src/
├── main.tsx                      # Entry point
├── app/
│   ├── App.tsx                   # Root component
│   ├── routes.ts                 # Route definitions
│   ├── pages/
│   │   ├── Dashboard.tsx         # Each page is 1-3 modules
│   │   ├── Groups.tsx
│   │   ├── GroupDetail.tsx
│   │   ├── ShuraBot.tsx
│   │   ├── Wallet.tsx
│   │   ├── Profile.tsx
│   │   ├── Onboarding.tsx        # NEW
│   │   └── Sadaqah.tsx           # NEW
│   ├── components/
│   │   ├── ui/                   # Radix UI components (existing)
│   │   ├── features/             # Feature-specific components
│   │   │   ├── onboarding/       # NEW
│   │   │   ├── wallet/           # NEW
│   │   │   ├── notifications/    # NEW
│   │   │   └── ...
│   │   └── RootLayout.tsx
│   ├── data/
│   │   ├── mockData.ts           # Keep for now (UI testing)
│   │   ├── types.ts              # TypeScript interfaces (shared)
│   │   └── constants.ts          # Enums, config
│   └── styles/
│       ├── index.css
│       ├── theme.css
│       ├── tailwind.css
│       └── fonts.css
```

#### Component Standards
- **Functional components only** (no class components)
- **Props interface for every component**
  ```typescript
  interface DashboardProps {
    userId: string;
    onNavigate: (page: string) => void;
  }
  
  export const Dashboard: React.FC<DashboardProps> = ({ userId, onNavigate }) => {
    // ...
  };
  ```
- **TypeScript strict mode:** All types explicit, no `any`
- **Radix UI + Tailwind** for 100% components
- **Hooks only** for state management (React Context or Redux for global state)

#### Naming Conventions
- **Pages:** PascalCase, export as `Page` (e.g., `DashboardPage`)
- **Components:** PascalCase, descriptive
- **Hooks:** camelCase, prefix with `use` (e.g., `useContributionReminder`)
- **Constants:** UPPER_SNAKE_CASE
- **Classes/IDs:** kebab-case (Tailwind)

### State Management
- **Local State:** React `useState` for component-level state
- **Global State:** React Context API + `useReducer` (or Redux if complexity grows)
- **API State:** React Query (TanStack Query) for server state
- **Form State:** React Hook Form + Zod for validation

### Authentication & Security
- **Auth Flow:** JWT tokens (access + refresh)
- **Token Storage:** Secure HTTP-only cookies (server-side)
- **Session Management:** 30-min expiry, auto-refresh on tab focus
- **Biometric:** Device-level APIs (Face ID / Fingerprint), not sent to server
- **Passwords:** Minimum 12 characters, uppercase + lowercase + numbers + symbols

### Data Persistence
- **Backend API:** RESTful with OpenAPI docs (Swagger)
- **Database:** PostgreSQL (financial data integrity)
- **Caching:** Redis for session, rate limits, group data
- **Transactions:** Database-level ACID compliance for payments/transfers

### Testing Requirements
- **Unit Tests:** Jest + React Testing Library
  - Target: 80% code coverage
  - All business logic must have tests
- **Integration Tests:** E2E flows (Cypress or Playwright)
  - Onboarding flow
  - Group creation & contribution
  - Payout flow
- **Manual QA:** Visual regression (Percy), accessibility (Axe)

---

## Data Model Requirements

### Core Entities

#### User
```typescript
interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  trustScore: number;           // 0-100
  verificationStatus: {
    bvn: boolean;
    bank: boolean;
    faceId: boolean;
    device: boolean;
  };
  wallet: {
    balance: number;            // NGN cents
    escrow: number;             // Locked in groups
    transactions: Transaction[];
  };
  groups: Group[];              // Member of
  createdAt: Date;
  updatedAt: Date;
}
```

#### Group
```typescript
interface Group {
  id: string;
  name: string;
  goal: number;                 // Total to save (NGN)
  currentPool: number;          // Amount saved so far
  frequency: 'weekly' | 'biweekly' | 'monthly';
  contributionAmount: number;   // Per member per cycle
  payoutOrder: 'rotating' | 'merit' | 'custom' | 'random';
  payoutSchedule: PayoutCycle[]; // Next payout dates
  members: GroupMember[];
  creator: User;
  shariatCompliant: boolean;
  governanceRules: GovernanceRule[];
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  nextPayoutDate: Date;
}
```

#### Transaction
```typescript
interface Transaction {
  id: string;
  userId: string;
  groupId?: string;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'payout' | 'investment' | 'sadaqah';
  amount: number;               // NGN cents
  paymentMethod: 'bank' | 'ussd' | 'card' | 'wallet';
  status: 'pending' | 'success' | 'failed';
  reference: string;            // Payment reference
  Receipt?: Receipt;
  createdAt: Date;
}
```

#### Contribution
```typescript
interface Contribution {
  id: string;
  userId: string;
  groupId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'overdue' | 'paid';
  transaction?: Transaction;
}
```

#### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'contribution_due' | 'payout_ready' | 'member_joined' | 'group_alert' | 'task_reminder';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  deliveryStatus: 'sent' | 'pending' | 'failed';
  createdAt: Date;
}
```

---

## Implementation Roadmap

### Phase 1 (MVP): Weeks 1-12

**Goal:** Complete core savings group functionality with payment integration

1. **Week 1-2: Onboarding System**
   - BVN/NIN verification integration
   - Bank account linking
   - Face ID / Fingerprint integration
   - KYC checklist UI & logic

2. **Week 3-4: Authentication & Wallet**
   - Backend auth service (JWT)
   - Wallet balance system
   - Payment gateway integration (deposits)

3. **Week 5-6: Contribution & Escrow**
   - Contribution flow UI & backend
   - Escrow logic & tracking
   - Transaction receipts

4. **Week 7-8: Payout System**
   - Payout scheduling
   - Fund releases
   - Payout notifications

5. **Week 9-10: Real-Time Updates**
   - WebSocket for activity feed
   - Push notifications (FCM)
   - Activity bell notifications

6. **Week 11-12: Testing & Polish**
   - E2E testing (onboarding → contribution → payout)
   - Security audit
   - Performance optimization

**MVP Definition:** User can sign up → create/join group → contribute → receive payout

---

### Phase 2 (Phase 1 Complete Features): Weeks 13-20

1. **ShuraBot Backend** (Weeks 13-14)
   - LLM integration (Claude/GPT)
   - Scenario analysis engine
   - Recommendation logic

2. **Admin & Governance** (Weeks 15-16)
   - Admin dashboard
   - Member approval workflow
   - Payout rule editor
   - Automation setup

3. **Sadaqah & Impact** (Weeks 17-18)
   - Sadaqah portion tracking
   - Beneficiary library
   - Impact reporting
   - Certificate generation

4. **Communication Hub** (Weeks 19-20)
   - Group chat (simplified)
   - Polls & voting
   - Announcement broadcasts

---

### Phase 3 (Advanced): Weeks 21+

1. **Micro-Investments** (Idle balance investing)
2. **Credit Scoring** (Lending based on savings history)
3. **Multi-Currency Support**
4. **Mobile App** (React Native or Flutter)
5. **API Marketplace** (Third-party integrations)

---

## Quality & Compliance Standards

### Performance Targets
- **Dashboard load:** < 2s
- **Payment flow:** < 3s
- **API response:** < 500ms (p95)
- **Mobile Lighthouse:** >85 (Performance, Accessibility, Best Practices)

### Security & Compliance
- **KYC/AML:** Automated verification + manual review for high-value transfers
- **Data Protection:** GDPR-ready (Lagos Data Privacy Law compliance)
- **PCI DSS:** For payment processing (via third-party gateway)
- **Encryption:** TLS 1.3 in transit, AES-256 at rest
- **Audit Logs:** All financial transactions logged for 7 years

### Accessibility (WCAG 2.1 AA)
- Keyboard navigation on all pages
- Screen reader support (ARIA labels)
- Color contrast >4.5:1 for text
- All forms have associated labels

### Localization
- **Language:** English (MVP), Yoruba/Hausa/Igbo (Phase 2)
- **Currencies:** NGN (MVP), Multi-currency (Phase 3)
- **Date/Time Formats:** Locale-based

### Monitoring & Analytics
- **Error Tracking:** Sentry for frontend errors
- **Analytics:** Mixpanel for user behavior
- **Uptime Monitoring:** 99.5% target
- **Log Aggregation:** ELK Stack for debugging

---

## Enforcement & Amendments

This constitution is binding for all development on Khalia. Deviations require:
1. **Written Proposal** (describe change, rationale, impact)
2. **Architecture Review** (technical feasibility)
3. **Stakeholder Approval** (product, engineering, compliance)
4. **Amendment Citation** (reference this document with version bump)

**Version History:**
- v1.0: April 20, 2026 (Initial specification)

---

**Document Owner:** Product & Engineering  
**Last Updated:** April 20, 2026  
**Next Review:** (After Phase 1 completion)
