// Mock data for the Khalia platform

export type UserRole = 'individual' | 'institutional' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  joinDate?: string;
  reliabilityScore?: number;
  wellnessScore?: number;
  contributionStreak?: number;
  badges?: string[];
}

export interface WalletBalance {
  ngn: number;
  usd: number;
}

export interface GovernanceRules {
  votingThreshold: number;
  defaultPenalty: number;
  exitNotice: number;
}

export interface VettingCriterion {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  score: number;
  weight: number;
}

export interface VettingScore {
  overall: number;
  tier: 'gold' | 'silver' | 'bronze' | 'unrated';
  criteria: VettingCriterion[];
  lastAudit: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: 'admin' | 'member';
  joinedDate: string;
  reliabilityScore: number;
  contributions: number;
  isOnline: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'contribution' | 'payout' | 'member_joined' | 'proposal' | 'milestone' | 'vote' | 'streak';
  message: string;
  timestamp: string;
  memberName?: string;
  memberColor?: string;
  memberInitials?: string;
  amount?: number;
}

export interface Group {
  id: string;
  name: string;
  type: 'rosca' | 'savings' | 'investment' | 'co-buying';
  members: number;
  contributionAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  totalPool: number;
  nextPayout: string;
  status: 'active' | 'pending' | 'completed';
  governance: GovernanceRules;
  performance?: number;
  riskScore?: number;
  vetting?: VettingScore;
  description?: string;
  tags?: string[];
  adminName?: string;
  adminVerified?: boolean;
  monthsActive?: number;
  contributionStreak?: number;
  wellnessScore?: number;
  goalAmount?: number;
  goalProgress?: number;
  emergencyFundPercent?: number;
  memberProfiles?: MemberProfile[];
  activityFeed?: ActivityItem[];
}

export interface Transaction {
  id: string;
  type: 'contribution' | 'payout' | 'investment' | 'withdrawal';
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  groupName?: string;
}

export interface CapitalMetric {
  name: string;
  value: number;
  change: number;
  status: 'good' | 'warning' | 'critical';
}

export interface PortfolioItem {
  asset: string;
  allocation: number;
  value: number;
  change: number;
}

// --- ShūrāBot Collaborative Session Types ---

export interface SessionParticipant {
  id: string;
  name: string;
  initials: string;
  color: string;
  isOnline: boolean;
  isTyping: boolean;
}

export interface ProposalOption {
  label: string;
  pros: string[];
  cons: string[];
  impact: string;
}

export interface ProposalData {
  title: string;
  options: ProposalOption[];
}

export interface MessageAction {
  label: string;
  type: 'vote' | 'remind' | 'contribute' | 'simulate' | 'view' | 'propose';
  variant: 'default' | 'outline';
}

export interface ScenarioResult {
  label: string;
  current: number;
  projected: number;
  unit: string;
}

export interface CollabMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'scenario' | 'proposal' | 'insight' | 'education' | 'wellness';
  timestamp: string;
  scenarioResults?: ScenarioResult[];
  proposalData?: ProposalData;
  shariahCompliant?: boolean;
  disclaimer?: string;
  actions?: MessageAction[];
  wellnessData?: { label: string; value: number; color: string }[];
}

export interface CollabSession {
  id: string;
  name: string;
  type: 'individual' | 'group';
  groupId?: string;
  groupName?: string;
  participants: SessionParticipant[];
  messages: CollabMessage[];
  createdAt: string;
  isActive: boolean;
}

export interface ProactiveInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'milestone';
  title: string;
  body: string;
  timestamp: string;
  groupName?: string;
  actionLabel?: string;
  actionType?: 'chat' | 'view' | 'remind';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ----- CURRENT USER -----
export const currentUser: User = {
  id: '1',
  name: 'Amara Okafor',
  email: 'amara.okafor@example.com',
  role: 'individual',
  bio: 'Tech professional passionate about collaborative savings and ethical investing.',
  location: 'Lagos, Nigeria',
  phone: '+234 801 234 5678',
  joinDate: 'February 2024',
  reliabilityScore: 98,
  wellnessScore: 84,
  contributionStreak: 7,
  badges: ['Top Contributor', 'Shariah Certified', '1 Year Member'],
};

// Wallet Balance
export const walletBalance: WalletBalance = {
  ngn: 2450000,
  usd: 1580,
};

// ----- VETTING CRITERIA HELPERS -----
const roscaVetting = (membersOk: boolean, streakMonths: number, hasEscrow: boolean): VettingScore => ({
  overall: membersOk && streakMonths >= 4 && hasEscrow ? 91 : streakMonths >= 2 ? 74 : 58,
  tier: membersOk && streakMonths >= 4 && hasEscrow ? 'gold' : streakMonths >= 2 ? 'silver' : 'bronze',
  lastAudit: '2026-02-15',
  criteria: [
    { id: 'c1', name: 'Member Reliability', description: 'Avg on-time contribution rate ≥ 90%', status: membersOk ? 'pass' : 'warning', score: membersOk ? 96 : 72, weight: 25 },
    { id: 'c2', name: 'Group Tenure', description: 'Active for ≥ 3 completed cycles', status: streakMonths >= 4 ? 'pass' : streakMonths >= 2 ? 'warning' : 'fail', score: Math.min(100, streakMonths * 20), weight: 15 },
    { id: 'c3', name: 'Governance Clarity', description: 'Written, member-approved ruleset', status: 'pass', score: 100, weight: 15 },
    { id: 'c4', name: 'Transparent Records', description: 'All transactions visible to members', status: hasEscrow ? 'pass' : 'warning', score: hasEscrow ? 100 : 65, weight: 15 },
    { id: 'c5', name: 'Optimal Group Size', description: '8–20 members for effective coordination', status: membersOk ? 'pass' : 'warning', score: membersOk ? 88 : 60, weight: 10 },
    { id: 'c6', name: 'Emergency Reserve', description: '≥ 10% of pool set aside for defaults', status: 'pass', score: 80, weight: 10 },
    { id: 'c7', name: 'Shariah Compliance', description: 'No riba-based structure, halal framework', status: 'pass', score: 100, weight: 10 },
  ],
});

const investmentVetting = (hasTrackRecord: boolean, riskScore: number): VettingScore => ({
  overall: hasTrackRecord && riskScore < 7 ? 88 : hasTrackRecord ? 76 : 60,
  tier: hasTrackRecord && riskScore < 7 ? 'gold' : hasTrackRecord ? 'silver' : 'bronze',
  lastAudit: '2026-02-10',
  criteria: [
    { id: 'i1', name: 'Historical Return Track Record', description: '≥ 6 months of verified performance data', status: hasTrackRecord ? 'pass' : 'warning', score: hasTrackRecord ? 90 : 45, weight: 20 },
    { id: 'i2', name: 'Risk Disclosure Quality', description: 'Documented risk factors & stress tests', status: 'pass', score: 85, weight: 20 },
    { id: 'i3', name: 'Portfolio Diversification', description: '≥ 3 distinct asset classes represented', status: riskScore < 7 ? 'pass' : 'warning', score: riskScore < 7 ? 80 : 55, weight: 15 },
    { id: 'i4', name: 'Audit & Reporting Frequency', description: 'Monthly performance reports issued', status: 'pass', score: 95, weight: 15 },
    { id: 'i5', name: 'Member KYC & Vetting', description: 'All members identity-verified on platform', status: 'pass', score: 100, weight: 10 },
    { id: 'i6', name: 'Liquidity & Exit Provisions', description: 'Clear, fair exit mechanism documented', status: riskScore < 8 ? 'pass' : 'warning', score: riskScore < 8 ? 75 : 50, weight: 10 },
    { id: 'i7', name: 'Shariah Compliance', description: 'Sukuk/halal assets only, no prohibited instruments', status: 'pass', score: 100, weight: 10 },
  ],
});

const coOwnershipVetting = (hasLegal: boolean): VettingScore => ({
  overall: hasLegal ? 93 : 70,
  tier: hasLegal ? 'gold' : 'silver',
  lastAudit: '2026-01-20',
  criteria: [
    { id: 'o1', name: 'Legal Title Verification', description: 'Government-registered title in co-owners\' names', status: hasLegal ? 'pass' : 'fail', score: hasLegal ? 100 : 0, weight: 25 },
    { id: 'o2', name: 'Professional Asset Valuation', description: 'Recent independent appraisal (≤ 12 months)', status: 'pass', score: 95, weight: 20 },
    { id: 'o3', name: 'Exit Liquidity Provisions', description: 'Clear buy-out process & exit timeline', status: hasLegal ? 'pass' : 'warning', score: hasLegal ? 80 : 55, weight: 15 },
    { id: 'o4', name: 'Maintenance Reserve Fund', description: '≥ 5% of asset value held in reserve', status: 'pass', score: 85, weight: 15 },
    { id: 'o5', name: 'Insurance Coverage', description: 'Comprehensive asset insurance active', status: 'pass', score: 100, weight: 10 },
    { id: 'o6', name: 'Regulatory & Title Compliance', description: 'Compliant with Nigerian property laws', status: hasLegal ? 'pass' : 'warning', score: hasLegal ? 100 : 60, weight: 10 },
    { id: 'o7', name: 'Shariah Compliance', description: 'Musharakah-based shared ownership model', status: 'pass', score: 100, weight: 5 },
  ],
});

// ----- USER GROUPS -----
export const userGroups: Group[] = [
  {
    id: '1',
    name: 'Lagos Tech Circle',
    type: 'rosca',
    members: 12,
    contributionAmount: 50000,
    frequency: 'monthly',
    totalPool: 600000,
    nextPayout: '2026-03-15',
    status: 'active',
    governance: { votingThreshold: 60, defaultPenalty: 10, exitNotice: 30 },
    description: 'A tight-knit rotating savings circle for Lagos tech professionals. Members contribute monthly and take turns receiving the pool.',
    tags: ['Tech', 'ROSCA', 'Lagos'],
    adminName: 'Chidi Nwosu',
    adminVerified: true,
    monthsActive: 7,
    contributionStreak: 7,
    wellnessScore: 91,
    goalAmount: 720000,
    goalProgress: 83,
    emergencyFundPercent: 12,
    vetting: roscaVetting(true, 7, true),
    memberProfiles: [
      { id: 'm1', name: 'Amara Okafor', initials: 'AO', color: '#10b981', role: 'member', joinedDate: '2025-08', reliabilityScore: 100, contributions: 7, isOnline: true },
      { id: 'm2', name: 'Chidi Nwosu', initials: 'CN', color: '#3b82f6', role: 'admin', joinedDate: '2025-08', reliabilityScore: 100, contributions: 7, isOnline: true },
      { id: 'm3', name: 'Ngozi Adeyemi', initials: 'NA', color: '#8b5cf6', role: 'member', joinedDate: '2025-08', reliabilityScore: 86, contributions: 6, isOnline: false },
      { id: 'm4', name: 'Emeka Johnson', initials: 'EJ', color: '#f59e0b', role: 'member', joinedDate: '2025-09', reliabilityScore: 100, contributions: 6, isOnline: false },
      { id: 'm5', name: 'Fatima Hassan', initials: 'FH', color: '#ef4444', role: 'member', joinedDate: '2025-08', reliabilityScore: 100, contributions: 7, isOnline: true },
    ],
    activityFeed: [
      { id: 'a1', type: 'streak', message: '🎉 7-month contribution streak achieved! All members on time.', timestamp: '2026-02-27T09:00:00Z', memberColor: '#10b981', memberInitials: '🌟' },
      { id: 'a2', type: 'contribution', message: 'Amara contributed ₦50,000', timestamp: '2026-02-25T14:30:00Z', memberName: 'Amara Okafor', memberInitials: 'AO', memberColor: '#10b981', amount: 50000 },
      { id: 'a3', type: 'contribution', message: 'Fatima contributed ₦50,000', timestamp: '2026-02-24T10:15:00Z', memberName: 'Fatima Hassan', memberInitials: 'FH', memberColor: '#ef4444', amount: 50000 },
      { id: 'a4', type: 'payout', message: 'Chidi received payout of ₦600,000', timestamp: '2026-02-15T12:00:00Z', memberName: 'Chidi Nwosu', memberInitials: 'CN', memberColor: '#3b82f6', amount: 600000 },
      { id: 'a5', type: 'milestone', message: '🏆 Group crossed ₦500,000 in total savings!', timestamp: '2026-01-20T09:00:00Z' },
    ],
  },
  {
    id: '2',
    name: 'Green Energy Investment Pool',
    type: 'investment',
    members: 8,
    contributionAmount: 100000,
    frequency: 'monthly',
    totalPool: 3200000,
    nextPayout: '2026-04-01',
    status: 'active',
    governance: { votingThreshold: 75, defaultPenalty: 15, exitNotice: 60 },
    performance: 8.5,
    riskScore: 6.2,
    description: 'Pooled investment in renewable energy assets — solar farms, wind bonds, and green sukuk. Shariah-compliant and ESG aligned.',
    tags: ['ESG', 'Renewable', 'Halal', 'Medium Risk'],
    adminName: 'Dr. Aisha Umar',
    adminVerified: true,
    monthsActive: 14,
    contributionStreak: 5,
    wellnessScore: 78,
    goalAmount: 5000000,
    goalProgress: 64,
    emergencyFundPercent: 18,
    vetting: investmentVetting(true, 6.2),
    memberProfiles: [
      { id: 'm1', name: 'Amara Okafor', initials: 'AO', color: '#10b981', role: 'member', joinedDate: '2025-01', reliabilityScore: 100, contributions: 14, isOnline: true },
      { id: 'm2', name: 'Dr. Aisha Umar', initials: 'AU', color: '#6366f1', role: 'admin', joinedDate: '2025-01', reliabilityScore: 100, contributions: 14, isOnline: false },
      { id: 'm3', name: 'Babatunde Adeyemi', initials: 'BA', color: '#f59e0b', role: 'member', joinedDate: '2025-01', reliabilityScore: 93, contributions: 13, isOnline: false },
    ],
    activityFeed: [
      { id: 'b1', type: 'milestone', message: '🌱 Portfolio returned +8.5% — outperforming market by 2.3%!', timestamp: '2026-02-26T08:00:00Z' },
      { id: 'b2', type: 'proposal', message: 'New proposal: Allocate 15% to solar bond sukuk', timestamp: '2026-02-20T11:00:00Z', memberName: 'Dr. Aisha Umar', memberInitials: 'AU', memberColor: '#6366f1' },
      { id: 'b3', type: 'vote', message: 'Vote passed: 7/8 approved quarterly rebalancing', timestamp: '2026-02-18T16:00:00Z' },
      { id: 'b4', type: 'contribution', message: 'Amara contributed ₦100,000', timestamp: '2026-02-15T09:30:00Z', memberName: 'Amara Okafor', memberInitials: 'AO', memberColor: '#10b981', amount: 100000 },
    ],
  },
  {
    id: '3',
    name: 'Property Co-Ownership - Lekki',
    type: 'co-buying',
    members: 15,
    contributionAmount: 500000,
    frequency: 'monthly',
    totalPool: 22500000,
    nextPayout: '2026-12-31',
    status: 'active',
    governance: { votingThreshold: 80, defaultPenalty: 20, exitNotice: 90 },
    performance: 12.3,
    riskScore: 4.1,
    description: 'Fractional co-ownership of a premium residential development in Lekki Phase 2. Legal title registered, insurance active.',
    tags: ['Real Estate', 'Lekki', 'Fractional', 'Low Risk'],
    adminName: 'Hajia Bilkisu Sani',
    adminVerified: true,
    monthsActive: 18,
    contributionStreak: 18,
    wellnessScore: 95,
    goalAmount: 30000000,
    goalProgress: 75,
    emergencyFundPercent: 22,
    vetting: coOwnershipVetting(true),
    memberProfiles: [
      { id: 'm1', name: 'Amara Okafor', initials: 'AO', color: '#10b981', role: 'member', joinedDate: '2024-09', reliabilityScore: 100, contributions: 18, isOnline: true },
      { id: 'm2', name: 'Hajia Bilkisu Sani', initials: 'HB', color: '#ec4899', role: 'admin', joinedDate: '2024-09', reliabilityScore: 100, contributions: 18, isOnline: true },
    ],
    activityFeed: [
      { id: 'c1', type: 'milestone', message: '🏠 75% of purchase target reached! On track for Q4 2026 close.', timestamp: '2026-02-25T10:00:00Z' },
      { id: 'c2', type: 'contribution', message: 'Amara contributed ₦500,000', timestamp: '2026-02-22T14:00:00Z', memberName: 'Amara Okafor', memberInitials: 'AO', memberColor: '#10b981', amount: 500000 },
    ],
  },
];

// ----- RECENT TRANSACTIONS -----
export const recentTransactions: Transaction[] = [
  { id: '1', type: 'contribution', amount: 50000, currency: 'NGN', date: '2026-02-20', status: 'completed', groupName: 'Lagos Tech Circle' },
  { id: '2', type: 'contribution', amount: 100000, currency: 'NGN', date: '2026-02-18', status: 'completed', groupName: 'Green Energy Investment Pool' },
  { id: '3', type: 'payout', amount: 600000, currency: 'NGN', date: '2026-02-15', status: 'completed', groupName: 'Lagos Tech Circle' },
  { id: '4', type: 'withdrawal', amount: 150000, currency: 'NGN', date: '2026-02-10', status: 'completed' },
  { id: '5', type: 'contribution', amount: 500000, currency: 'NGN', date: '2026-02-05', status: 'completed', groupName: 'Property Co-Ownership - Lekki' },
];

// Capital Intelligence Metrics
export const capitalMetrics: CapitalMetric[] = [
  { name: 'Allocation Efficiency Score', value: 87.5, change: 2.3, status: 'good' },
  { name: 'Liquidity Risk Score', value: 23.4, change: -5.1, status: 'good' },
  { name: 'Default Probability', value: 4.2, change: 1.8, status: 'warning' },
  { name: 'Portfolio Concentration', value: 68.3, change: 3.2, status: 'warning' },
  { name: 'Treasury Optimization', value: 91.2, change: 1.5, status: 'good' },
  { name: 'Inflation Vulnerability', value: 34.7, change: -2.1, status: 'good' },
];

export const portfolioAllocation: PortfolioItem[] = [
  { asset: 'Treasury Bills', allocation: 35, value: 17500000, change: 1.2 },
  { asset: 'SME Loans', allocation: 28, value: 14000000, change: -2.3 },
  { asset: 'Venture Capital', allocation: 15, value: 7500000, change: 8.7 },
  { asset: 'Fixed Deposits', allocation: 12, value: 6000000, change: 0.8 },
  { asset: 'Corporate Bonds', allocation: 10, value: 5000000, change: 2.1 },
];

export const performanceData = [
  { month: 'Aug', value: 2150000, benchmark: 2100000 },
  { month: 'Sep', value: 2280000, benchmark: 2200000 },
  { month: 'Oct', value: 2420000, benchmark: 2350000 },
  { month: 'Nov', value: 2380000, benchmark: 2400000 },
  { month: 'Dec', value: 2550000, benchmark: 2500000 },
  { month: 'Jan', value: 2680000, benchmark: 2600000 },
  { month: 'Feb', value: 2450000, benchmark: 2700000 },
];

// ----- MARKETPLACE GROUPS -----
export const marketplaceGroups: Group[] = [
  {
    id: '4',
    name: 'Abuja Professionals ROSCA',
    type: 'rosca',
    members: 20,
    contributionAmount: 100000,
    frequency: 'monthly',
    totalPool: 2000000,
    nextPayout: '2026-03-10',
    status: 'active',
    governance: { votingThreshold: 70, defaultPenalty: 10, exitNotice: 30 },
    description: 'A disciplined rotating savings circle for Abuja professionals. Strong 12-month track record with zero defaults.',
    tags: ['Professionals', 'Abuja', 'ROSCA'],
    adminName: 'Ibrahim Musa',
    adminVerified: true,
    monthsActive: 12,
    contributionStreak: 12,
    wellnessScore: 87,
    goalAmount: 2400000,
    goalProgress: 83,
    emergencyFundPercent: 15,
    vetting: roscaVetting(true, 12, true),
  },
  {
    id: '5',
    name: 'Tech Startup Investment Syndicate',
    type: 'investment',
    members: 25,
    contributionAmount: 250000,
    frequency: 'monthly',
    totalPool: 18750000,
    nextPayout: '2026-06-01',
    status: 'active',
    governance: { votingThreshold: 80, defaultPenalty: 15, exitNotice: 60 },
    performance: 15.2,
    riskScore: 7.8,
    description: 'High-conviction investment syndicate backing early-stage tech startups. Portfolio includes fintech, agritech, and edtech verticals.',
    tags: ['Startups', 'High Growth', 'VC', 'Higher Risk'],
    adminName: 'Tunde Adesanya',
    adminVerified: true,
    monthsActive: 9,
    contributionStreak: 9,
    wellnessScore: 72,
    goalAmount: 30000000,
    goalProgress: 63,
    emergencyFundPercent: 8,
    vetting: investmentVetting(true, 7.8),
  },
  {
    id: '6',
    name: 'Agricultural Land Co-Purchase',
    type: 'co-buying',
    members: 10,
    contributionAmount: 1000000,
    frequency: 'monthly',
    totalPool: 30000000,
    nextPayout: '2027-02-28',
    status: 'active',
    governance: { votingThreshold: 85, defaultPenalty: 20, exitNotice: 90 },
    performance: 10.5,
    riskScore: 3.9,
    description: 'Co-purchase of 50 hectares of premium agricultural land in Kaduna State. Title registered. Leased to halal farming cooperative.',
    tags: ['Agriculture', 'Kaduna', 'Halal', 'Low Risk'],
    adminName: 'Maryam Aliyu',
    adminVerified: true,
    monthsActive: 24,
    contributionStreak: 24,
    wellnessScore: 96,
    goalAmount: 40000000,
    goalProgress: 75,
    emergencyFundPercent: 25,
    vetting: coOwnershipVetting(true),
  },
  {
    id: '7',
    name: 'Women Entrepreneurs Savings',
    type: 'savings',
    members: 30,
    contributionAmount: 25000,
    frequency: 'weekly',
    totalPool: 3000000,
    nextPayout: '2026-03-01',
    status: 'active',
    governance: { votingThreshold: 60, defaultPenalty: 5, exitNotice: 14 },
    description: 'A supportive savings group exclusively for women entrepreneurs. Weekly contributions build capital for business expansion.',
    tags: ['Women', 'Entrepreneurs', 'Savings', 'Weekly'],
    adminName: 'Chioma Obi',
    adminVerified: true,
    monthsActive: 3,
    contributionStreak: 2,
    wellnessScore: 68,
    goalAmount: 5000000,
    goalProgress: 60,
    emergencyFundPercent: 6,
    vetting: roscaVetting(true, 3, false),
  },
  {
    id: '8',
    name: 'Al-Noor Women\'s Co-Op',
    type: 'rosca',
    members: 10,
    contributionAmount: 30000,
    frequency: 'monthly',
    totalPool: 360000,
    nextPayout: '2026-03-20',
    status: 'active',
    governance: { votingThreshold: 70, defaultPenalty: 8, exitNotice: 21 },
    description: 'A Shariah-compliant rotating savings circle for Muslim women. Focused on halal goal planning — Umrah, education, and family savings.',
    tags: ['Halal', 'Women', 'ROSCA', 'Umrah'],
    adminName: 'Fatima Hassan',
    adminVerified: true,
    monthsActive: 4,
    contributionStreak: 3,
    wellnessScore: 81,
    goalAmount: 500000,
    goalProgress: 72,
    emergencyFundPercent: 10,
    vetting: roscaVetting(true, 4, true),
  },
];

// ----- SHŪRĀBOT COLLABORATIVE SESSIONS -----
export const collaborativeSessions: CollabSession[] = [
  {
    id: 'sess1',
    name: 'Lagos Tech Circle — Group Session',
    type: 'group',
    groupId: '1',
    groupName: 'Lagos Tech Circle',
    isActive: true,
    createdAt: '2026-02-27T09:00:00Z',
    participants: [
      { id: '1', name: 'Amara Okafor', initials: 'AO', color: '#10b981', isOnline: true, isTyping: false },
      { id: 'm2', name: 'Chidi Nwosu', initials: 'CN', color: '#3b82f6', isOnline: true, isTyping: false },
      { id: 'm5', name: 'Fatima Hassan', initials: 'FH', color: '#ef4444', isOnline: true, isTyping: true },
      { id: 'm3', name: 'Ngozi Adeyemi', initials: 'NA', color: '#8b5cf6', isOnline: false, isTyping: false },
    ],
    messages: [
      {
        id: 'msg1',
        senderId: 'ai',
        senderName: 'ShūrāBot',
        senderInitials: 'SB',
        senderColor: '#059669',
        role: 'assistant',
        type: 'wellness',
        content: 'As-salamu alaykum, Lagos Tech Circle! 🌟 Your group is on a **7-month contribution streak** with 100% on-time payments. You\'re currently **83% towards your ₦720,000 goal**.\n\nAt your current pace, you\'ll hit the target **3 weeks early**. How can I help the group today?',
        shariahCompliant: true,
        disclaimer: 'Educational insights only. Not financial advice.',
        timestamp: '2026-02-27T09:00:00Z',
        actions: [
          { label: 'Run Scenario', type: 'simulate', variant: 'outline' },
          { label: 'Draft Proposal', type: 'propose', variant: 'outline' },
        ],
        wellnessData: [
          { label: 'Contribution Health', value: 96, color: '#10b981' },
          { label: 'Goal Progress', value: 83, color: '#3b82f6' },
          { label: 'Emergency Fund', value: 12, color: '#f59e0b' },
          { label: 'Member Trust', value: 91, color: '#8b5cf6' },
        ],
      },
      {
        id: 'msg2',
        senderId: 'm5',
        senderName: 'Fatima Hassan',
        senderInitials: 'FH',
        senderColor: '#ef4444',
        role: 'user',
        type: 'text',
        content: 'What if Ngozi and I missed contributions for 2 months? How would that affect everyone\'s payout?',
        timestamp: '2026-02-27T09:05:00Z',
      },
      {
        id: 'msg3',
        senderId: 'ai',
        senderName: 'ShūrāBot',
        senderInitials: 'SB',
        senderColor: '#059669',
        role: 'assistant',
        type: 'scenario',
        content: '**Scenario: 2 Members Miss 2 Months of Contributions**\n\nI\'ve modelled this for your group of 12 members at ₦50,000/month each:\n\n• **Current trajectory**: Payout to next member in 16 days\n• **With 2 missed payments**: Payout delayed by **~18 days**\n• **Pool shortfall**: ₦100,000 (recoverable over 2 cycles)\n• **Recovery options**: Apply emergency reserve (12% pool), or request a make-up contribution\n\n💡 **My recommendation**: Activate the emergency fund for 1 cycle while members catch up. This keeps everyone\'s payout on schedule.',
        shariahCompliant: true,
        disclaimer: 'Simulation based on current group data. Actual outcomes may vary.',
        timestamp: '2026-02-27T09:06:00Z',
        scenarioResults: [
          { label: 'Current Payout Date', current: 16, projected: 34, unit: 'days' },
          { label: 'Pool Coverage', current: 100, projected: 83, unit: '%' },
          { label: 'Emergency Fund Used', current: 0, projected: 100000, unit: '₦' },
          { label: 'Cycle Recovery Time', current: 0, projected: 2, unit: 'months' },
        ],
        actions: [
          { label: 'Send Reminders to Members', type: 'remind', variant: 'default' },
          { label: 'Activate Emergency Fund', type: 'vote', variant: 'outline' },
        ],
      },
      {
        id: 'msg4',
        senderId: 'm2',
        senderName: 'Chidi Nwosu',
        senderInitials: 'CN',
        senderColor: '#3b82f6',
        role: 'user',
        type: 'text',
        content: 'Can ShūrāBot draft a proposal to increase contributions by ₦10,000 from next cycle?',
        timestamp: '2026-02-27T09:10:00Z',
      },
      {
        id: 'msg5',
        senderId: 'ai',
        senderName: 'ShūrāBot',
        senderInitials: 'SB',
        senderColor: '#059669',
        role: 'assistant',
        type: 'proposal',
        content: 'I\'ve drafted two options for the group to consider. Both maintain Shariah compliance.',
        shariahCompliant: true,
        disclaimer: 'This draft requires member approval via group vote (60% threshold).',
        timestamp: '2026-02-27T09:11:00Z',
        proposalData: {
          title: 'Contribution Increase — Cycle 8 Proposal',
          options: [
            {
              label: 'Option A: Increase to ₦60,000/month',
              pros: ['Reach ₦720,000 goal 6 weeks early', 'Larger payouts for all members', 'Builds stronger emergency reserve'],
              cons: ['₦10,000 additional monthly commitment', 'May strain 2-3 lower-income members'],
              impact: 'Goal achieved by April 2026 instead of June 2026',
            },
            {
              label: 'Option B: Keep ₦50,000, add voluntary top-up',
              pros: ['No mandatory increase', 'Maintains group cohesion', 'Flexible for all income levels'],
              cons: ['Goal timeline unchanged', 'Less predictable pool growth'],
              impact: 'Goal achieved by June 2026 as planned',
            },
          ],
        },
        actions: [
          { label: 'Send to Group for Vote', type: 'vote', variant: 'default' },
          { label: 'Edit Proposal', type: 'view', variant: 'outline' },
        ],
      },
    ],
  },
  {
    id: 'sess2',
    name: 'My Individual Session',
    type: 'individual',
    isActive: false,
    createdAt: '2026-02-25T14:00:00Z',
    participants: [
      { id: '1', name: 'Amara Okafor', initials: 'AO', color: '#10b981', isOnline: true, isTyping: false },
    ],
    messages: [
      {
        id: 'i1',
        senderId: 'ai',
        senderName: 'ShūrāBot',
        senderInitials: 'SB',
        senderColor: '#059669',
        role: 'assistant',
        type: 'text',
        content: 'Hello Amara! This is your private session — everything here stays between us. I can help you with personal financial planning, goal-setting, or preparing ideas to bring to your groups. What\'s on your mind?',
        shariahCompliant: true,
        disclaimer: 'Educational only. Not financial advice.',
        timestamp: '2026-02-25T14:00:00Z',
      },
    ],
  },
  {
    id: 'sess3',
    name: 'Green Energy — Strategy Session',
    type: 'group',
    groupId: '2',
    groupName: 'Green Energy Investment Pool',
    isActive: false,
    createdAt: '2026-02-20T11:00:00Z',
    participants: [
      { id: '1', name: 'Amara Okafor', initials: 'AO', color: '#10b981', isOnline: true, isTyping: false },
      { id: 'm2-g2', name: 'Dr. Aisha Umar', initials: 'AU', color: '#6366f1', isOnline: false, isTyping: false },
    ],
    messages: [
      {
        id: 'g2m1',
        senderId: 'ai',
        senderName: 'ShūrāBot',
        senderInitials: 'SB',
        senderColor: '#059669',
        role: 'assistant',
        type: 'text',
        content: 'Welcome to the Green Energy Investment Pool strategy session. Your portfolio is performing at +8.5% — 2.3% above market benchmark. The proposed solar bond sukuk reallocation is open for discussion.',
        shariahCompliant: true,
        disclaimer: 'Educational only. Not financial advice.',
        timestamp: '2026-02-20T11:00:00Z',
      },
    ],
  },
];

// ----- PROACTIVE INSIGHTS -----
export const proactiveInsights: ProactiveInsight[] = [
  {
    id: 'pi1',
    type: 'milestone',
    title: '🎉 7-Month Streak!',
    body: 'Lagos Tech Circle has achieved 7 consecutive months of 100% on-time contributions. Incredible team discipline!',
    timestamp: '2026-02-27T09:00:00Z',
    groupName: 'Lagos Tech Circle',
    actionLabel: 'Celebrate in Group',
    actionType: 'chat',
  },
  {
    id: 'pi2',
    type: 'success',
    title: '📈 Goal on Track',
    body: 'At current pace, Lagos Tech Circle will achieve its ₦720,000 goal 3 weeks ahead of schedule.',
    timestamp: '2026-02-26T08:00:00Z',
    groupName: 'Lagos Tech Circle',
    actionLabel: 'View Progress',
    actionType: 'view',
  },
  {
    id: 'pi3',
    type: 'warning',
    title: '⚠️ Ngozi Missed Last Cycle',
    body: 'Ngozi Adeyemi missed her February contribution. This is her first miss in 7 months. Shall I send a private, respectful nudge?',
    timestamp: '2026-02-25T10:00:00Z',
    groupName: 'Lagos Tech Circle',
    actionLabel: 'Send Gentle Reminder',
    actionType: 'remind',
  },
  {
    id: 'pi4',
    type: 'info',
    title: '🌿 Portfolio Outperforming',
    body: 'Green Energy Pool is beating market benchmark by +2.3%. The solar sukuk allocation is driving strong returns.',
    timestamp: '2026-02-24T12:00:00Z',
    groupName: 'Green Energy Investment Pool',
    actionLabel: 'Explore Details',
    actionType: 'view',
  },
  {
    id: 'pi5',
    type: 'success',
    title: '🏠 75% to Property Goal',
    body: 'Lekki Co-Ownership is 75% funded — only ₦7.5M remaining. Expected completion: Q4 2026.',
    timestamp: '2026-02-23T09:00:00Z',
    groupName: 'Property Co-Ownership - Lekki',
    actionLabel: 'View Property',
    actionType: 'view',
  },
];

// Legacy ChatMessage format
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "As-salamu alaykum, Amara! I'm ShūrāBot, your AI financial companion. I can help you with group planning, scenario simulations, halal investment guidance, and collaborative decision-making.\n\nWhat would you like to explore today?",
    timestamp: new Date().toISOString(),
  },
];
