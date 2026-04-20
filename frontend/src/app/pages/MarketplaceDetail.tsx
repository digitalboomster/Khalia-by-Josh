import { useParams, Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft, ArrowRight, Users, Calendar, TrendingUp, Shield, Clock, DollarSign,
  CheckCircle, CheckCircle2, AlertCircle, Flame, Star, Zap, ChevronRight,
  BarChart2, XCircle, Info, AlertTriangle, ArrowUpRight, Heart,
} from "lucide-react";
import { marketplaceGroups, VettingCriterion, MemberProfile } from "../data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useState } from "react";

// ─── Vetting Criterion Row ───────────────────────────────────────────────────
function CriterionRow({ c }: { c: VettingCriterion }) {
  const cfg = {
    pass: { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, bar: "bg-emerald-500", text: "text-emerald-700" },
    warning: { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, bar: "bg-amber-400", text: "text-amber-700" },
    fail: { icon: <XCircle className="w-4 h-4 text-red-500" />, bar: "bg-red-400", text: "text-red-700" },
  }[c.status];
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0 border-gray-100">
      <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-medium text-gray-800">{c.name}</span>
          <span className={`text-xs font-bold ${cfg.text}`}>{c.score}/100</span>
        </div>
        <p className="text-xs text-gray-500 mb-1.5">{c.description}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${cfg.bar} rounded-full`} style={{ width: `${c.score}%` }} />
        </div>
      </div>
      <div className="text-[10px] text-gray-400 flex-shrink-0 mt-1">{c.weight}%</div>
    </div>
  );
}

// ─── Anon Member Row ──────────────────────────────────────────────────────────
const MOCK_ANON_MEMBERS = [
  { initials: "A.O", color: "#10b981", reliability: 100, months: 12, isOnline: true, role: "admin" },
  { initials: "C.N", color: "#3b82f6", reliability: 100, months: 12, isOnline: true, role: "member" },
  { initials: "N.A", color: "#8b5cf6", reliability: 86, months: 11, isOnline: false, role: "member" },
  { initials: "E.J", color: "#f59e0b", reliability: 100, months: 10, isOnline: false, role: "member" },
  { initials: "F.H", color: "#ef4444", reliability: 100, months: 12, isOnline: true, role: "member" },
];

// ─── Projected Growth Chart ───────────────────────────────────────────────────
function ProjectedGrowth({ contributionAmount, members, months }: { contributionAmount: number; members: number; months: number }) {
  const data = Array.from({ length: Math.min(months, 12) }, (_, i) => ({
    month: `M${i + 1}`,
    pool: contributionAmount * members * (i + 1),
    target: contributionAmount * members * Math.min(months, 12),
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" fontSize={11} />
        <YAxis fontSize={11} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => `₦${v.toLocaleString()}`} />
        <Bar dataKey="pool" fill="#10b981" radius={[3, 3, 0, 0]} name="Pool Growth" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function MarketplaceDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const group = marketplaceGroups.find((g) => g.id === groupId);
  const [saved, setSaved] = useState(false);

  if (!group) {
    return (
      <div className="p-4 lg:p-8">
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold mb-2">Group Not Found</h3>
            <p className="text-gray-500 mb-6">This group may have been removed or is no longer accepting members.</p>
            <Link to="/marketplace"><Button>Back to Marketplace</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeLabels: Record<string, string> = { rosca: "ROSCA", savings: "Savings Circle", investment: "Investment Circle", "co-buying": "Co-Ownership" };
  const typeColors: Record<string, string> = {
    rosca: "bg-blue-100 text-blue-700",
    savings: "bg-purple-100 text-purple-700",
    investment: "bg-amber-100 text-amber-700",
    "co-buying": "bg-emerald-100 text-emerald-700",
  };
  const tierConfig = {
    gold: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", icon: "🥇" },
    silver: { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-700", icon: "🥈" },
    bronze: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", icon: "🥉" },
    unrated: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", icon: "⬜" },
  }[group.vetting?.tier ?? "unrated"];

  const wellnessColor = (s: number) => s >= 85 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";
  const ws = group.wellnessScore ?? 75;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link to="/marketplace">
        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Marketplace</Button>
      </Link>

      {/* Hero */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="leading-tight">{group.name}</h1>
            {group.adminVerified && <CheckCircle2 className="w-5 h-5 text-blue-500" title="Verified Admin" />}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[group.type]}`}>
              {typeLabels[group.type]}
            </span>
            {group.vetting && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${tierConfig.bg} ${tierConfig.border}`}>
                <span>{tierConfig.icon}</span>
                <span className={`text-xs font-semibold ${tierConfig.text}`}>{group.vetting.tier.charAt(0).toUpperCase() + group.vetting.tier.slice(1)} Vetted</span>
                <span className={`text-xs font-bold ${tierConfig.text}`}>{group.vetting.overall}</span>
              </div>
            )}
            {group.tags?.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{tag}</span>
            ))}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xl">{group.description}</p>
          {group.adminName && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                {group.adminName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <span className="text-sm text-gray-600">Admin: <strong>{group.adminName}</strong></span>
              {group.adminVerified && <Badge className="text-[9px] h-4 bg-blue-100 text-blue-700 border-0">Verified</Badge>}
            </div>
          )}
        </div>

        {/* Action Card */}
        <Card className="lg:w-72 flex-shrink-0">
          <CardContent className="pt-5 space-y-4">
            {/* Wellness ring */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg viewBox="0 0 52 52" className="w-14 h-14 -rotate-90">
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                  <circle cx="26" cy="26" r="20" fill="none" stroke={wellnessColor(ws)} strokeWidth="5"
                    strokeDasharray={`${(ws / 100) * 125.6} 125.6`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold" style={{ color: wellnessColor(ws) }}>{ws}</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold">Group Health</div>
                <div className="text-xs text-gray-500">{ws >= 85 ? "Strong" : ws >= 70 ? "Good" : "Developing"}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 text-sm">
              {[
                [<Users className="w-3.5 h-3.5" />, "Members", `${group.members} / ${group.members + 4} max`],
                [<DollarSign className="w-3.5 h-3.5" />, "Contribution", `₦${group.contributionAmount.toLocaleString()} / ${group.frequency}`],
                [<BarChart2 className="w-3.5 h-3.5" />, "Total pool", `₦${group.totalPool.toLocaleString()}`],
                [<Flame className="w-3.5 h-3.5 text-orange-500" />, "Streak", `${group.contributionStreak} months`],
                ...(group.performance ? [[<TrendingUp className="w-3.5 h-3.5 text-green-600" />, "Returns", `+${group.performance}%`]] : []),
              ].map(([icon, label, value], i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">{icon as React.ReactNode} {label as string}</span>
                  <span className="font-medium text-gray-800">{value as string}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate(`/groups/${group.id}/join`)}
              >
                Request to Join <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSaved(!saved)}
              >
                <Heart className={`w-4 h-4 mr-2 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                {saved ? "Saved" : "Save for Later"}
              </Button>
              <Link to="/shurabot" className="block">
                <Button variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  <Zap className="w-4 h-4 mr-2" /> Ask ShūrāBot About This
                </Button>
              </Link>
            </div>

            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-[11px] text-blue-700">
                <strong>Spots available:</strong> This group is accepting up to 4 new members. Join requests are reviewed by the group admin.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Monthly Pool", value: `₦${(group.contributionAmount * group.members).toLocaleString()}`, sub: "per cycle", icon: <DollarSign className="w-4 h-4 text-emerald-600" /> },
          { label: "Members", value: group.members.toString(), sub: `${group.members - 2} spots left`, icon: <Users className="w-4 h-4 text-blue-600" /> },
          { label: "Active Since", value: `${group.monthsActive}mo`, sub: "months running", icon: <Clock className="w-4 h-4 text-purple-600" /> },
          { label: "Vetting Score", value: `${group.vetting?.overall ?? "—"}`, sub: group.vetting ? `${group.vetting.tier} tier` : "unrated", icon: <Shield className="w-4 h-4 text-amber-600" /> },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">{m.icon}<span className="text-xs text-gray-500">{m.label}</span></div>
              <div className="font-semibold">{m.value}</div>
              <div className="text-xs text-gray-400">{m.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vetting">Vetting Report</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Projected Pool Growth</CardTitle>
                <p className="text-sm text-gray-500">Estimated cumulative pool over first 12 months</p>
              </CardHeader>
              <CardContent>
                <ProjectedGrowth
                  contributionAmount={group.contributionAmount}
                  members={group.members}
                  months={group.type === "rosca" ? group.members : 12}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>What You're Joining</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { icon: "🔄", label: "Structure", value: typeLabels[group.type] },
                  { icon: "💰", label: "Your commitment", value: `₦${group.contributionAmount.toLocaleString()} / ${group.frequency}` },
                  { icon: "📅", label: "Next payout", value: new Date(group.nextPayout).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                  { icon: "🔒", label: "Exit notice", value: `${group.governance.exitNotice} days` },
                  { icon: "⚖️", label: "Default penalty", value: `${group.governance.defaultPenalty}% of contribution` },
                  { icon: "🗳️", label: "Decision voting", value: `${group.governance.votingThreshold}% approval required` },
                  { icon: "🏥", label: "Emergency fund", value: `${group.emergencyFundPercent}% of pool reserved` },
                  { icon: "☪", label: "Shariah status", value: "Compliant — no riba instruments" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b last:border-0 border-gray-100">
                    <span className="text-gray-500 flex items-center gap-2"><span>{row.icon}</span>{row.label}</span>
                    <span className="font-medium text-gray-800">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Goal Progress */}
          {group.goalProgress !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>Group Goal Progress</CardTitle>
                <p className="text-sm text-gray-500">How far along this group is towards its target</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-600">₦{group.totalPool.toLocaleString()} raised</span>
                  <span className="font-semibold text-emerald-600">{group.goalProgress}%</span>
                  <span className="text-gray-400">Target: ₦{group.goalAmount?.toLocaleString()}</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                    style={{ width: `${group.goalProgress}%` }}
                  />
                </div>
                {group.contributionStreak && (
                  <div className="flex items-center gap-1.5 mt-3 text-sm text-orange-600">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{group.contributionStreak}-month contribution streak</span>
                    <span className="text-gray-400">— 100% on-time payments</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vetting Report */}
        <TabsContent value="vetting" className="space-y-6">
          {group.vetting ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Khalia Vetting Report</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Independently audited · Last reviewed {new Date(group.vetting.lastAudit).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${tierConfig.bg} ${tierConfig.border}`}>
                      <span className="text-2xl">{tierConfig.icon}</span>
                      <div>
                        <div className={`font-semibold ${tierConfig.text}`}>{group.vetting.tier.charAt(0).toUpperCase() + group.vetting.tier.slice(1)}</div>
                        <div className="text-xs text-gray-500">{group.vetting.overall}/100</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Score breakdown bar */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
                      {(() => {
                        const p = group.vetting.criteria.filter((c) => c.status === "pass").length;
                        const w = group.vetting.criteria.filter((c) => c.status === "warning").length;
                        const f = group.vetting.criteria.filter((c) => c.status === "fail").length;
                        const total = group.vetting.criteria.length;
                        return <>
                          <div className="bg-emerald-500 h-full" style={{ width: `${(p / total) * 100}%` }} />
                          <div className="bg-amber-400 h-full" style={{ width: `${(w / total) * 100}%` }} />
                          <div className="bg-red-400 h-full" style={{ width: `${(f / total) * 100}%` }} />
                        </>;
                      })()}
                    </div>
                    <div className="flex gap-3 text-xs flex-shrink-0">
                      <span className="text-emerald-600 font-medium">{group.vetting.criteria.filter((c) => c.status === "pass").length} pass</span>
                      <span className="text-amber-500 font-medium">{group.vetting.criteria.filter((c) => c.status === "warning").length} review</span>
                      <span className="text-red-500 font-medium">{group.vetting.criteria.filter((c) => c.status === "fail").length} fail</span>
                    </div>
                  </div>

                  <div className="space-y-0">
                    {group.vetting.criteria.map((c) => <CriterionRow key={c.id} c={c} />)}
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Khalia vetting assesses governance, reliability, transparency, and Shariah alignment. It is not a guarantee of financial returns or safety of funds. Always read the group rules before joining.
                </p>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <Shield className="w-10 h-10 mx-auto mb-3" />
                <p>Vetting report not available for this group.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Members */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Current Members ({group.members})</CardTitle>
              <p className="text-sm text-gray-500">Member identities are partially anonymized to protect privacy.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {MOCK_ANON_MEMBERS.slice(0, Math.min(group.members, 5)).map((m, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: m.color }}
                      >{m.initials}</div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${m.isOnline ? "bg-emerald-500" : "bg-gray-300"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{m.initials}***</span>
                        {m.role === "admin" && <Badge className="text-[10px] h-4 bg-blue-100 text-blue-700 border-0">Admin</Badge>}
                      </div>
                      <div className="text-xs text-gray-500">{m.months} months member</div>
                      <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden w-24">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.reliability}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600">{m.reliability}%</div>
                      <div className="text-xs text-gray-400">reliability</div>
                    </div>
                  </div>
                ))}
                {group.members > 5 && (
                  <div className="text-center py-3 text-sm text-gray-500">
                    +{group.members - 5} more members · identities visible after joining
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Governance */}
        <TabsContent value="governance" className="space-y-4">
          {[
            { color: "blue", icon: <Shield className="w-5 h-5 text-blue-600" />, title: "Voting Threshold", body: `${group.governance.votingThreshold}% of members must approve major decisions — including contribution changes, new members, and investment allocations.` },
            { color: "amber", icon: <AlertCircle className="w-5 h-5 text-amber-600" />, title: "Default Penalty", body: `A ${group.governance.defaultPenalty}% fee applies to missed contributions. Repeat defaults may result in suspension by group vote.` },
            { color: "purple", icon: <Clock className="w-5 h-5 text-purple-600" />, title: "Exit Protocol", body: `Members must provide ${group.governance.exitNotice} days notice to exit. Contributions and applicable returns are returned after the notice period.` },
            { color: "green", icon: <CheckCircle className="w-5 h-5 text-green-600" />, title: "Escrow Protection", body: "All funds are held in Khalia escrow accounts with licensed partners. Transactions are immutable and fully auditable." },
            { color: "emerald", icon: <span className="text-lg">☪</span>, title: "Shariah Compliance", body: "No riba-based interest or prohibited instruments. Group operates under halal financial principles with regular compliance review." },
          ].map((item) => (
            <div key={item.title} className={`p-4 bg-${item.color}-50 border border-${item.color}-200 rounded-xl flex items-start gap-3`}>
              <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
              <div>
                <div className={`font-medium text-${item.color}-900 mb-1`}>{item.title}</div>
                <p className={`text-sm text-${item.color}-800`}>{item.body}</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Bottom CTA */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-emerald-900">Ready to join {group.name}?</h3>
              <p className="text-sm text-emerald-700 mt-1">Submit a join request — the admin will review and respond within 48 hours.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Button variant="outline" className="border-emerald-300" onClick={() => setSaved(!saved)}>
                <Heart className={`w-4 h-4 mr-2 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate(`/groups/${group.id}/join`)}
              >
                Request to Join <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}