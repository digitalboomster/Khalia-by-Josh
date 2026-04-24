import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, Users,
  DollarSign, AlertCircle, Flame, Sparkles, Shield, Star,
  Bell, CheckCircle2, ChevronRight, Zap, Loader,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from '../context/AuthContext';
import walletService, { WalletBalance } from '../services/wallet';
import groupsService, { Group } from '../services/groups';
import kycService, { KYCStatus } from '../services/kyc';
import userService, { TrustScoreBreakdown } from '../services/user';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ─── Wellness Radial ──────────────────────────────────────────────────────────
function WellnessMeter({ score }: { score: number }) {
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  const label = score >= 85 ? "Strong" : score >= 70 ? "Good" : "Needs Attention";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-24 h-24 -rotate-90">
          <circle cx="44" cy="44" r="36" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="44" cy="44" r="36" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-semibold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-gray-400">score</span>
        </div>
      </div>
      <span className="text-xs font-medium mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Streak Badge ─────────────────────────────────────────────────────────────
function StreakBanner({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200 rounded-xl">
      <Flame className="w-5 h-5 text-orange-500" />
      <div>
        <span className="font-semibold text-orange-700">{streak}-Month Contribution Streak!</span>
        <span className="text-xs text-orange-600 ml-2">Keep it up — you're in the top 15% of members.</span>
      </div>
      <Star className="w-4 h-4 text-amber-500 ml-auto" />
    </div>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityRow({ item }: { item: { type: string; message: string; timestamp: string; memberInitials?: string; memberColor?: string; amount?: number } }) {
  const getIcon = (type: string) => {
    if (type === "streak" || type === "milestone") return <Star className="w-4 h-4 text-amber-500" />;
    if (type === "payout") return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (type === "contribution") return <ArrowDownRight className="w-4 h-4 text-blue-500" />;
    if (type === "proposal" || type === "vote") return <Shield className="w-4 h-4 text-purple-500" />;
    return <Bell className="w-4 h-4 text-gray-400" />;
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  return (
    <div className="flex items-start gap-3 py-2.5">
      {item.memberInitials ? (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: item.memberColor ?? "#10b981" }}
        >
          {item.memberInitials.length > 2 ? <span>{getIcon(item.type)}</span> : item.memberInitials}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {getIcon(item.type)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-snug">{item.message}</p>
        <span className="text-xs text-gray-400">{timeAgo(item.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Group Health Pinwheel ────────────────────────────────────────────────────
function GroupHealthCard({ group }: { group: Group }) {
  const score = 75; // Default score since Group interface doesn't have wellnessScore
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <Link to={`/groups/${group.id}`} className="block">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
        {/* Radial */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 52 52" className="w-14 h-14 -rotate-90">
            <circle cx="26" cy="26" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle
              cx="26" cy="26" r="22" fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={`${(score / 100) * 138.2} 138.2`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color }}>{score}</span>
          </div>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-sm truncate">{group.name}</span>
            <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 bg-blue-100 text-blue-700">{group.status}</Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.member_count}</span>
            <span className="flex items-center gap-1">₦{group.contribution_amount.toLocaleString()} {group.contribution_frequency}</span>
          </div>
          <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${(group.member_count / group.max_members) * 100}%` }} />
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
      </div>
    </Link>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for fetched data
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [trustScore, setTrustScore] = useState<TrustScoreBreakdown | null>(null);
  const [topInsight, setTopInsight] = useState<{ body: string } | null>(null);
  const [nextPayout, setNextPayout] = useState<{ totalPool: number; nextPayout: string } | null>(null);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [balance, groups, kyc, trust] = await Promise.all([
          walletService.getBalance(),
          groupsService.listUserGroups(),
          kycService.getKYCStatus(),
          userService.getTrustScoreBreakdown(),
        ]);
        setWalletBalance(balance);
        setUserGroups(groups);
        setKycStatus(kyc);
        setTrustScore(trust);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  
  // Calculate total group contributions
  const totalGroupContributions = (Array.isArray(userGroups) ? userGroups : []).reduce((sum, group) => sum + (group.contribution_amount * group.member_count || 0), 0);
  
  // Mock performance data
  const performanceData = [
    { month: 'Jan', value: 45000, benchmark: 40000 },
    { month: 'Feb', value: 52000, benchmark: 42000 },
    { month: 'Mar', value: 58000, benchmark: 45000 },
    { month: 'Apr', value: 65000, benchmark: 48000 },
    { month: 'May', value: 75000, benchmark: 50000 },
  ];

  // Mock activity feed data
  const allActivity = [
    { id: '1', type: 'contribution', message: 'You contributed ₦50,000 to Lagos Tech Circle', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', type: 'payout', message: 'You received payout of ₦150,000 from Green Energy Pool', timestamp: new Date(Date.now() - 172800000).toISOString() },
  ];

  // Mock recent transactions
  const recentTransactions = [
    { id: '1', type: 'contribution', amount: 50000, groupName: 'Lagos Tech Circle', date: new Date(Date.now() - 86400000) },
    { id: '2', type: 'deposit', amount: 100000, groupName: undefined, date: new Date(Date.now() - 172800000) },
    { id: '3', type: 'payout', amount: 150000, groupName: 'Green Energy Pool', date: new Date(Date.now() - 259200000) },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Personalized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-sm flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-gray-500 text-sm">{greeting} 👋</p>
            <h1 className="leading-tight">{user?.name || 'User'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Member
              </Badge>
              {user?.badges?.slice(0, 1).map((b: boolean | React.Key | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | null | undefined) => (
                <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WellnessMeter score={user?.wellnessScore ?? 84} />
          <div className="hidden sm:block text-right">
            <div className="text-xs text-gray-500">Financial Wellness</div>
            <div className="text-xs text-gray-400">Your personal score</div>
          </div>
        </div>
      </div>

      {/* Streak Banner */}
      {user?.contributionStreak && user.contributionStreak > 0 && (
        <StreakBanner streak={user.contributionStreak} />
      )}

      {/* ShūrāBot Proactive Insight */}
      {topInsight && (
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-emerald-800">ShūrāBot Insight</span>
              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0">☪ Halal</Badge>
            </div>
            <p className="text-sm text-emerald-700">{topInsight.body}</p>
          </div>
          <Link to="/shurabot">
            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 h-8 text-xs flex-shrink-0">
              Chat <Zap className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Wallet Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {walletBalance ? (
              <>
                <div className="font-semibold">₦{walletBalance.available_balance.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">{walletBalance.pending_transactions > 0 ? `₦${walletBalance.pending_transactions.toLocaleString()} pending` : 'No pending transactions'}</p>
              </>
            ) : (
              <div className="text-sm text-gray-500">Loading balance...</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Group Pool</CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="font-semibold">₦{totalGroupContributions?.toLocaleString() || '0'}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 8.5% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Groups</CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="font-semibold">{Array.isArray(userGroups) ? userGroups.length : 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {(Array.isArray(userGroups) ? userGroups : []).filter((g) => g.payout_strategy === "proportional").length} active circles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Next Payout</CardTitle>
            <Calendar className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {nextPayout ? (
              <>
                <div className="font-semibold">₦{nextPayout.totalPool.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(nextPayout.nextPayout).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </>
            ) : (
              <div className="text-sm text-gray-500">No upcoming payouts</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <p className="text-sm text-gray-500">Your contribution growth over the last 7 months</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                formatter={(value: any) => [`₦${(value || 0).toLocaleString()}`, ""]}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} name="Your Portfolio" dot={{ r: 4, fill: "#10b981" }} />
              <Line type="monotone" dataKey="benchmark" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Market Average" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Groups + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Health Dashboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Group Health</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Real-time wellness across your circles</p>
            </div>
            <Link to="/groups">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {(Array.isArray(userGroups) ? userGroups : []).map((group) => (
              <GroupHealthCard key={group.id} group={group} />
            ))}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Community Activity</CardTitle>
              <p className="text-sm text-gray-500 mt-1">What's happening in your groups</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {allActivity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Your latest financial activities</p>
          </div>
          <Link to="/wallet">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTransactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 border-b last:border-0 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    tx.type === "contribution" || tx.type === "investment" ? "bg-red-100" : "bg-green-100"
                  }`}>
                    {tx.type === "contribution" || tx.type === "investment"
                      ? <ArrowDownRight className="w-4 h-4 text-red-600" />
                      : <ArrowUpRight className="w-4 h-4 text-green-600" />
                    }
                  </div>
                  <div>
                    <div className="font-medium text-sm capitalize">{tx.type}</div>
                    {tx.groupName && <div className="text-xs text-gray-500">{tx.groupName}</div>}
                    <div className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className={`font-medium text-sm ${tx.type === "contribution" || tx.type === "investment" ? "text-red-600" : "text-green-600"}`}>
                  {tx.type === "contribution" || tx.type === "investment" ? "-" : "+"}
                  ₦{(tx.amount || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <CardTitle className="text-amber-900">Action Required</CardTitle>
              <p className="text-sm text-amber-700 mt-1">Upcoming contributions due</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100">
            <div>
              <div className="font-medium text-sm">Lagos Tech Circle</div>
              <div className="text-xs text-gray-500">Due in 5 days · Monthly</div>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link to="/groups/1/contribute">Pay ₦50,000</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100">
            <div>
              <div className="font-medium text-sm">Green Energy Investment Pool</div>
              <div className="text-xs text-gray-500">Due in 12 days · Monthly</div>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link to="/groups/2/contribute">Pay ₦100,000</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}