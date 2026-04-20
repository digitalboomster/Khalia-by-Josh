import { useParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft, Users, Calendar, TrendingUp, Shield, Clock, DollarSign,
  AlertCircle, CheckCircle, CheckCircle2, Flame, Star, Zap, Vote,
  BarChart2, Bell, ArrowUpRight, ChevronRight,
} from "lucide-react";
import { userGroups, MemberProfile, ActivityItem } from "../data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from "recharts";
import { useState } from "react";

// ─── Wellness Ring ────────────────────────────────────────────────────────────
function WellnessRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  const label = score >= 85 ? "Strong" : score >= 70 ? "Good" : "Needs Attention";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 76 76" className="-rotate-90" style={{ width: size, height: size }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-semibold" style={{ color }}>{score}</span>
          <span className="text-[9px] text-gray-400">score</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Member Row ───────────────────────────────────────────────────────────────
function MemberRow({ member }: { member: MemberProfile }) {
  const reliabilityColor = member.reliabilityScore >= 95 ? "text-emerald-600" : member.reliabilityScore >= 80 ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: member.color }}
        >
          {member.initials}
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${member.isOnline ? "bg-emerald-500" : "bg-gray-300"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium">{member.name}</span>
          {member.role === "admin" && <Badge className="text-[10px] h-4 bg-blue-100 text-blue-700 border-0">Admin</Badge>}
        </div>
        <div className="text-xs text-gray-500">{member.contributions} contributions · since {member.joinedDate}</div>
        <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${member.reliabilityScore}%`,
              backgroundColor: member.reliabilityScore >= 95 ? "#10b981" : member.reliabilityScore >= 80 ? "#f59e0b" : "#ef4444",
            }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`font-semibold ${reliabilityColor}`}>{member.reliabilityScore}%</div>
        <div className="text-xs text-gray-400">reliability</div>
      </div>
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ item }: { item: ActivityItem }) {
  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  const icons: Record<string, React.ReactNode> = {
    streak: <Flame className="w-3.5 h-3.5 text-orange-500" />,
    milestone: <Star className="w-3.5 h-3.5 text-amber-500" />,
    payout: <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />,
    contribution: <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />,
    proposal: <Vote className="w-3.5 h-3.5 text-purple-500" />,
    vote: <Shield className="w-3.5 h-3.5 text-indigo-500" />,
    member_joined: <Users className="w-3.5 h-3.5 text-emerald-500" />,
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0 border-gray-100">
      {item.memberInitials ? (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: item.memberColor ?? "#10b981" }}
        >
          {item.memberInitials.length <= 2 ? item.memberInitials : icons[item.type]}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {icons[item.type]}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-gray-700">{item.message}</p>
        <span className="text-xs text-gray-400">{timeAgo(item.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Contribution History Mock ────────────────────────────────────────────────
const mockHistory = [
  { month: "Aug", amount: 50000, target: 50000 },
  { month: "Sep", amount: 50000, target: 50000 },
  { month: "Oct", amount: 50000, target: 50000 },
  { month: "Nov", amount: 50000, target: 50000 },
  { month: "Dec", amount: 50000, target: 50000 },
  { month: "Jan", amount: 50000, target: 50000 },
  { month: "Feb", amount: 50000, target: 50000 },
];

// ─── Main GroupDetail Page ────────────────────────────────────────────────────
export function GroupDetail() {
  const { groupId } = useParams();
  const group = userGroups.find((g) => g.id === groupId);
  const [votingOpen, setVotingOpen] = useState(false);

  if (!group) {
    return (
      <div className="p-4 lg:p-8">
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold mb-2">Group Not Found</h3>
            <p className="text-gray-500 mb-6">The group you're looking for doesn't exist.</p>
            <Link to="/groups"><Button>Back to Groups</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    rosca: "bg-blue-50 text-blue-700 border-blue-200",
    savings: "bg-purple-50 text-purple-700 border-purple-200",
    investment: "bg-amber-50 text-amber-700 border-amber-200",
    "co-buying": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const typeLabels: Record<string, string> = { rosca: "ROSCA", savings: "Savings", investment: "Investment Circle", "co-buying": "Co-Ownership" };

  const memberData = group.memberProfiles ?? [];
  const avgReliability = memberData.length
    ? Math.round(memberData.reduce((s, m) => s + m.reliabilityScore, 0) / memberData.length)
    : 100;

  const reliabilityChartData = memberData.map((m) => ({
    name: m.name.split(" ")[0],
    reliability: m.reliabilityScore,
    fill: m.reliabilityScore >= 95 ? "#10b981" : m.reliabilityScore >= 80 ? "#f59e0b" : "#ef4444",
  }));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Back */}
      <Link to="/groups">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Groups
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="leading-tight">{group.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${typeColors[group.type]}`}>
                {typeLabels[group.type]}
              </span>
              <Badge variant="default">{group.status}</Badge>
              {group.adminVerified && (
                <Badge className="text-xs bg-blue-100 text-blue-700 border-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Admin
                </Badge>
              )}
            </div>
            {group.description && <p className="text-gray-500 text-sm max-w-xl">{group.description}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" /> {group.members} members
              </div>
              <div className="text-sm text-gray-600 capitalize">{group.frequency} contributions</div>
              {group.contributionStreak && (
                <div className="flex items-center gap-1.5 text-sm text-orange-600">
                  <Flame className="w-4 h-4 text-orange-500" /> {group.contributionStreak}-month streak
                </div>
              )}
              {group.vetting && (
                <div className="flex items-center gap-1.5 text-sm">
                  {group.vetting.tier === "gold" ? "🥇" : group.vetting.tier === "silver" ? "🥈" : "🥉"}
                  <span className="text-gray-600">{group.vetting.overall} vetting score</span>
                </div>
              )}
            </div>
            {/* Tags */}
            {group.tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/shurabot">
            <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <Zap className="w-4 h-4 mr-2" /> Ask ShūrāBot
            </Button>
          </Link>
          <Button variant="outline">Invite Members</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link to={`/groups/${group.id}/contribute`}>
              Contribute ₦{group.contributionAmount.toLocaleString()}
            </Link>
          </Button>
        </div>
      </div>

      {/* Member Avatars Quick Row */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex -space-x-2">
          {memberData.slice(0, 6).map((m) => (
            <div
              key={m.id}
              className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: m.color }}
              title={m.name}
            >
              {m.initials}
            </div>
          ))}
          {group.members > 6 && (
            <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              +{group.members - 6}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-700">{group.members} members</div>
          <div className="text-xs text-gray-500">
            {memberData.filter((m) => m.isOnline).length} online now · {avgReliability}% avg reliability
          </div>
        </div>
        {group.adminName && (
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Admin: <strong>{group.adminName}</strong></span>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Total Pool</div>
            <div className="font-semibold">₦{group.totalPool.toLocaleString()}</div>
            {group.goalAmount && <p className="text-xs text-gray-400 mt-0.5">of ₦{group.goalAmount.toLocaleString()}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Next Payout</div>
            <div className="font-semibold">{new Date(group.nextPayout).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
            <p className="text-xs text-gray-400 mt-0.5">
              in {Math.max(0, Math.ceil((new Date(group.nextPayout).getTime() - Date.now()) / 86400000))} days
            </p>
          </CardContent>
        </Card>
        {group.performance ? (
          <Card>
            <CardContent className="pt-5">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Returns</div>
              <div className="font-semibold text-green-600">+{group.performance}%</div>
              <p className="text-xs text-gray-400 mt-0.5">Annual</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-5">
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Streak</div>
              <div className="font-semibold text-orange-600">{group.contributionStreak ?? 0} months</div>
              <p className="text-xs text-gray-400 mt-0.5">100% on time</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-5">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" /> Group Health</div>
            <div className="font-semibold text-emerald-600">{group.wellnessScore ?? 75}%</div>
            <p className="text-xs text-gray-400 mt-0.5">
              {(group.wellnessScore ?? 75) >= 85 ? "Strong" : (group.wellnessScore ?? 75) >= 70 ? "Good" : "Needs attention"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wellness">Group Health</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Progress</CardTitle>
              <p className="text-sm text-gray-500">Contributions vs target over the last 7 months</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mockHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} name="Contributions" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Target" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Group Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: <DollarSign className="w-5 h-5 text-gray-400" />, label: "Contribution", value: `₦${group.contributionAmount.toLocaleString()}` },
                  { icon: <Calendar className="w-5 h-5 text-gray-400" />, label: "Frequency", value: group.frequency },
                  { icon: <Users className="w-5 h-5 text-gray-400" />, label: "Members", value: group.members.toString() },
                  { icon: <Clock className="w-5 h-5 text-gray-400" />, label: "Active for", value: `${group.monthsActive ?? "—"} months` },
                  { icon: <Flame className="w-5 h-5 text-gray-400" />, label: "Streak", value: `${group.contributionStreak ?? 0} months` },
                  { icon: <Shield className="w-5 h-5 text-gray-400" />, label: "Emergency Fund", value: `${group.emergencyFundPercent ?? "—"}% of pool` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    {row.icon}
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">{row.label}</div>
                      <div className="font-medium capitalize text-sm">{row.value}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Governance Rules</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">Voting Threshold</div>
                    <p className="text-xs text-blue-800 mt-0.5">{group.governance.votingThreshold}% approval required for major decisions.</p>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-amber-900">Default Penalty</div>
                    <p className="text-xs text-amber-800 mt-0.5">{group.governance.defaultPenalty}% penalty on missed contributions.</p>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-purple-900">Exit Notice</div>
                    <p className="text-xs text-purple-800 mt-0.5">{group.governance.exitNotice} days notice required to exit.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Group Health / Wellness */}
        <TabsContent value="wellness" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Overall Score */}
            <Card>
              <CardHeader><CardTitle>Overall Wellness</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center py-4">
                <WellnessRing score={group.wellnessScore ?? 75} size={100} />
                <div className="mt-4 w-full space-y-2">
                  {[
                    { label: "Contribution Health", value: avgReliability },
                    { label: "Goal Progress", value: group.goalProgress ?? 0 },
                    { label: "Emergency Fund", value: (group.emergencyFundPercent ?? 0) * 5 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                          style={{ width: `${Math.min(item.value, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Member Reliability Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Member Reliability</CardTitle>
                <p className="text-sm text-gray-500">Contribution on-time rate per member</p>
              </CardHeader>
              <CardContent>
                {reliabilityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={reliabilityChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis domain={[0, 100]} fontSize={12} />
                      <Tooltip formatter={(v: number) => [`${v}%`, "Reliability"]} />
                      <Bar dataKey="reliability" radius={[4, 4, 0, 0]}>
                        {reliabilityChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                    No member data available
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-xl text-sm">
                  <span className="text-gray-600">Group Average</span>
                  <span className={`font-semibold ${avgReliability >= 95 ? "text-emerald-600" : avgReliability >= 80 ? "text-amber-600" : "text-red-600"}`}>
                    {avgReliability}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Streak + Emergency Fund */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" /> Contribution Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-4xl">🔥</div>
                  <div>
                    <div className="font-semibold text-orange-700">{group.contributionStreak ?? 0} Months</div>
                    <p className="text-sm text-orange-600">100% on-time contributions streak</p>
                    <p className="text-xs text-gray-500 mt-1">Top 15% of all Khalia groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" /> Emergency Fund
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current reserve</span>
                    <span className="font-medium">{group.emergencyFundPercent ?? 0}% of pool</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                      style={{ width: `${Math.min((group.emergencyFundPercent ?? 0) * 5, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0%</span>
                    <span className="text-emerald-600">Recommended: 20%</span>
                    <span>100%</span>
                  </div>
                  {(group.emergencyFundPercent ?? 0) < 20 && (
                    <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      Your emergency fund is below the 20% recommended level. Ask ShūrāBot for a top-up plan.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ShūrāBot CTA */}
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-emerald-900">Ask ShūrāBot for Group Insights</div>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    Get scenario simulations, contribution plans, and financial health analysis for this group.
                  </p>
                </div>
                <Link to="/shurabot">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0">
                    Open ShūrāBot <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Group Members ({memberData.length || group.members})</CardTitle>
              <p className="text-sm text-gray-500">Contribution history and reliability scores</p>
            </CardHeader>
            <CardContent>
              {memberData.length > 0 ? (
                <div className="space-y-2">
                  {memberData.map((member) => <MemberRow key={member.id} member={member} />)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">Member details not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Group Activity</CardTitle>
              <p className="text-sm text-gray-500">Everything that's happened in this group</p>
            </CardHeader>
            <CardContent>
              {group.activityFeed && group.activityFeed.length > 0 ? (
                <div>
                  {group.activityFeed.map((item) => <ActivityRow key={item.id} item={item} />)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">No activity yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Governance */}
        <TabsContent value="governance" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Governance & Compliance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { color: "blue", icon: <Shield className="w-5 h-5 text-blue-600 mt-0.5" />, title: "Voting Requirements", body: `Major decisions require ${group.governance.votingThreshold}% member approval. This includes contribution changes, payout schedules, and investment decisions.` },
                { color: "amber", icon: <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />, title: "Default Policy", body: `Members who miss contributions face a ${group.governance.defaultPenalty}% penalty. Repeated defaults may result in suspension, subject to group vote.` },
                { color: "purple", icon: <Clock className="w-5 h-5 text-purple-600 mt-0.5" />, title: "Exit Protocol", body: `Members wishing to exit must provide ${group.governance.exitNotice} days notice. Contributions and applicable returns are paid out after the notice period.` },
                { color: "green", icon: <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />, title: "Escrow & Security", body: "All funds are held in escrow with licensed financial partners. Transactions are immutable and fully auditable by all members." },
              ].map((item) => (
                <div key={item.title} className={`p-4 bg-${item.color}-50 border border-${item.color}-200 rounded-xl flex items-start gap-3`}>
                  {item.icon}
                  <div>
                    <div className={`font-medium text-${item.color}-900 mb-1`}>{item.title}</div>
                    <p className={`text-sm text-${item.color}-800`}>{item.body}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Vetting Panel */}
          {group.vetting && (
            <Card>
              <CardHeader>
                <CardTitle>Khalia Vetting Report</CardTitle>
                <p className="text-sm text-gray-500">
                  Last audited: {new Date(group.vetting.lastAudit).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                    {(() => {
                      const p = group.vetting.criteria.filter((c) => c.status === "pass").length;
                      const w = group.vetting.criteria.filter((c) => c.status === "warning").length;
                      const f = group.vetting.criteria.filter((c) => c.status === "fail").length;
                      const total = group.vetting.criteria.length;
                      return (
                        <>
                          <div className="bg-emerald-500 h-full" style={{ width: `${(p / total) * 100}%` }} />
                          <div className="bg-amber-400 h-full" style={{ width: `${(w / total) * 100}%` }} />
                          <div className="bg-red-400 h-full" style={{ width: `${(f / total) * 100}%` }} />
                        </>
                      );
                    })()}
                  </div>
                  <span className="font-semibold text-sm">{group.vetting.overall}/100</span>
                </div>
                {group.vetting.criteria.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 py-2 border-b last:border-0 border-gray-100">
                    {c.status === "pass" ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      : c.status === "warning" ? <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      : <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.description}</div>
                    </div>
                    <span className="text-sm font-bold text-gray-600 flex-shrink-0">{c.score}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}