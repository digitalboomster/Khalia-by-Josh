import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Plus, Users, TrendingUp, Calendar, ArrowUpRight, Flame,
  Shield, CheckCircle2, Star, Bell, Zap, ChevronRight, BarChart2,
} from "lucide-react";
import { Link } from "react-router";
import { userGroups } from "../data/mockData";

// ─── Wellness Score Ring ──────────────────────────────────────────────────────
function WellnessRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  const label = score >= 85 ? "Strong" : score >= 70 ? "Good" : "Review";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 52 52" className="-rotate-90" style={{ width: size, height: size }}>
          <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Member Avatars ───────────────────────────────────────────────────────────
function MemberAvatars({ profiles, total }: { profiles?: any[]; total: number }) {
  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
  const show = profiles?.slice(0, 4) ?? [];
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {show.map((m, i) => (
          <div
            key={m.id}
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: m.color ?? colors[i % colors.length] }}
            title={m.name}
          >
            {m.initials}
          </div>
        ))}
        {total > 4 && (
          <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600">
            +{total - 4}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500">{total} members</span>
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ group }: { group: typeof userGroups[0] }) {
  const typeColors: Record<string, string> = {
    rosca: "bg-blue-50 text-blue-700 border-blue-200",
    savings: "bg-purple-50 text-purple-700 border-purple-200",
    investment: "bg-amber-50 text-amber-700 border-amber-200",
    "co-buying": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const typeLabels: Record<string, string> = {
    rosca: "ROSCA",
    savings: "Savings",
    investment: "Investment Circle",
    "co-buying": "Co-Ownership",
  };

  const latestActivity = group.activityFeed?.[0];

  return (
    <Card className="hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Card Top */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className="font-semibold truncate">{group.name}</h3>
                {group.adminVerified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" title="Verified Admin" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[group.type]}`}>
                  {typeLabels[group.type]}
                </span>
                <Badge variant={group.status === "active" ? "default" : "secondary"} className="text-xs h-5">
                  {group.status}
                </Badge>
                {group.vetting && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    {group.vetting.tier === "gold" ? "🥇" : group.vetting.tier === "silver" ? "🥈" : "🥉"}
                    {group.vetting.overall} vetted
                  </span>
                )}
              </div>
            </div>
            <WellnessRing score={group.wellnessScore ?? 75} />
          </div>

          {/* Member Avatars */}
          <div className="mb-4">
            <MemberAvatars profiles={group.memberProfiles} total={group.members} />
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Contribution
              </div>
              <div className="font-semibold text-sm">₦{group.contributionAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-400 capitalize">{group.frequency}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-500 mb-1">Total Pool</div>
              <div className="font-semibold text-sm">₦{group.totalPool.toLocaleString()}</div>
              <div className="text-xs text-gray-400">
                Next: {new Date(group.nextPayout).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
            </div>
          </div>

          {/* Streak + Performance */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {group.contributionStreak && group.contributionStreak > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-orange-600 font-medium">{group.contributionStreak}-month streak</span>
              </div>
            )}
            {group.performance && (
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600 font-medium">+{group.performance}% returns</span>
              </div>
            )}
            {group.riskScore && (
              <span className="text-xs text-gray-500">Risk {group.riskScore}/10</span>
            )}
          </div>

          {/* Goal Progress */}
          {group.goalProgress !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Goal Progress</span>
                <span className="font-medium text-emerald-600">{group.goalProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                  style={{ width: `${group.goalProgress}%` }}
                />
              </div>
              {group.goalAmount && (
                <div className="text-xs text-gray-400 mt-1">
                  ₦{group.totalPool.toLocaleString()} of ₦{group.goalAmount.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Latest Activity */}
          {latestActivity && (
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Latest activity</div>
              <p className="text-xs text-gray-600 leading-snug">{latestActivity.message}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-4 pt-2 border-t border-gray-100">
          <Link to={`/groups/${group.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link to={`/groups/${group.id}/contribute`}>
              Contribute ₦{group.contributionAmount.toLocaleString()}
            </Link>
          </Button>
        </div>

        {/* ShūrāBot Quick Access */}
        <div className="px-5 pb-4">
          <Link to="/shurabot">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors text-xs text-emerald-700 font-medium">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                Ask ShūrāBot about this group
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Groups Page ─────────────────────────────────────────────────────────
export function Groups() {
  const totalPool = userGroups.reduce((sum, g) => sum + g.totalPool, 0);
  const avgWellness = Math.round(userGroups.reduce((sum, g) => sum + (g.wellnessScore ?? 75), 0) / userGroups.length);
  const totalStreak = Math.min(...userGroups.map((g) => g.contributionStreak ?? 0));

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>My Groups</h1>
          <p className="text-gray-500">
            Your savings circles, investment pools, and co-ownership groups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/groups/create">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Create Group
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Join a Group
            </Button>
          </Link>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold">{userGroups.length}</div>
                <p className="text-xs text-gray-500">Active Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">₦{(totalPool / 1000000).toFixed(1)}M</div>
                <p className="text-xs text-gray-500">Combined Pool</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="font-semibold">{totalStreak} mo</div>
                <p className="text-xs text-gray-500">Shared Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold">{avgWellness}%</div>
                <p className="text-xs text-gray-500">Avg Wellness</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {userGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>

      {/* Discover More */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Discover more groups</h3>
              <p className="text-sm text-gray-600 mt-1">
                Browse vetted savings circles, investment pools, and co-ownership opportunities.
              </p>
            </div>
            <Link to="/marketplace">
              <Button className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0">
                Browse Marketplace <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}