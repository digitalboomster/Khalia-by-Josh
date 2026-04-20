import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Search, Users, TrendingUp, Filter, Plus, ChevronDown, ChevronUp,
  Shield, CheckCircle, AlertTriangle, XCircle, Star, Clock, Calendar,
  Flame, ArrowRight, Info,
} from "lucide-react";
import { Link } from "react-router";
import { marketplaceGroups, VettingCriterion, VettingScore, Group } from "../data/mockData";

// ─── Vetting Tier Badge ───────────────────────────────────────────────────────
function VettingTierBadge({ tier, score }: { tier: string; score: number }) {
  const configs = {
    gold: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", icon: "🥇", label: "Gold Vetted" },
    silver: { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-700", icon: "🥈", label: "Silver Vetted" },
    bronze: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", icon: "🥉", label: "Bronze Vetted" },
    unrated: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", icon: "⬜", label: "Unrated" },
  };
  const c = configs[tier as keyof typeof configs] || configs.unrated;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${c.bg} ${c.border}`}>
      <span className="text-sm">{c.icon}</span>
      <span className={`text-xs font-semibold ${c.text}`}>{c.label}</span>
      <span className={`text-xs font-bold ${c.text}`}>{score}</span>
    </div>
  );
}

// ─── Criterion Row ─────────────────────────────────────────────────────────────
function CriterionRow({ criterion }: { criterion: VettingCriterion }) {
  const statusConfig = {
    pass: { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, bar: "bg-emerald-500", text: "text-emerald-700" },
    warning: { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, bar: "bg-amber-500", text: "text-amber-700" },
    fail: { icon: <XCircle className="w-4 h-4 text-red-500" />, bar: "bg-red-500", text: "text-red-700" },
  };
  const s = statusConfig[criterion.status];
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0 border-gray-100">
      <div className="mt-0.5 flex-shrink-0">{s.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-800">{criterion.name}</span>
          <span className={`text-xs font-bold ${s.text}`}>{criterion.score}/100</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{criterion.description}</p>
        <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${s.bar} rounded-full transition-all`}
            style={{ width: `${criterion.score}%` }}
          />
        </div>
      </div>
      <div className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{criterion.weight}%</div>
    </div>
  );
}

// ─── Vetting Panel ─────────────────────────────────────────────────────────────
function VettingPanel({ vetting, groupType }: { vetting: VettingScore; groupType: string }) {
  const typeLabel = groupType === "rosca" || groupType === "savings" ? "Savings Group" : groupType === "investment" ? "Investment Circle" : "Shared Ownership";
  const passing = vetting.criteria.filter((c) => c.status === "pass").length;
  const warning = vetting.criteria.filter((c) => c.status === "warning").length;
  const failing = vetting.criteria.filter((c) => c.status === "fail").length;

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-gray-800">Khalia Vetting — {typeLabel}</span>
        </div>
        <div className="text-xs text-gray-500">
          Last audited: {new Date(vetting.lastAudit).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(passing / vetting.criteria.length) * 100}%` }} />
          <div className="bg-amber-400 h-full transition-all" style={{ width: `${(warning / vetting.criteria.length) * 100}%` }} />
          <div className="bg-red-400 h-full transition-all" style={{ width: `${(failing / vetting.criteria.length) * 100}%` }} />
        </div>
        <div className="flex items-center gap-2 text-xs flex-shrink-0">
          <span className="text-emerald-600 font-medium">{passing} pass</span>
          {warning > 0 && <span className="text-amber-600 font-medium">{warning} review</span>}
          {failing > 0 && <span className="text-red-600 font-medium">{failing} fail</span>}
        </div>
      </div>

      <div>
        {vetting.criteria.map((c) => <CriterionRow key={c.id} criterion={c} />)}
      </div>

      <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-blue-700 leading-relaxed">
          Khalia vetting is independent and updated quarterly. It assesses governance, reliability, compliance, and Shariah alignment. It is not a guarantee of returns or safety.
        </p>
      </div>
    </div>
  );
}

// ─── Group Card ────────────────────────────────────────────────────────────────
function GroupCard({ group }: { group: Group }) {
  const [expanded, setExpanded] = useState(false);

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
    "co-buying": "Shared Ownership",
  };

  const wellnessColor = (score: number) =>
    score >= 85 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : "text-red-600";
  const wellnessBg = (score: number) =>
    score >= 85 ? "bg-emerald-50" : score >= 70 ? "bg-amber-50" : "bg-red-50";

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        {/* Card Header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className="font-semibold truncate">{group.name}</h3>
                {group.adminVerified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" title="Verified Admin" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[group.type]}`}>
                  {typeLabels[group.type]}
                </span>
                {group.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-gray-100">{tag}</span>
                ))}
              </div>
            </div>
            {group.vetting && <VettingTierBadge tier={group.vetting.tier} score={group.vetting.overall} />}
          </div>

          {group.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{group.description}</p>
          )}

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Users className="w-3.5 h-3.5" /> Members
              </div>
              <div className="font-semibold">{group.members}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Contribution
              </div>
              <div className="font-semibold">₦{group.contributionAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-400 capitalize">{group.frequency}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-500 mb-1">Total Pool</div>
              <div className="font-semibold">₦{group.totalPool.toLocaleString()}</div>
            </div>
            <div className={`p-3 rounded-xl ${group.wellnessScore ? wellnessBg(group.wellnessScore) : "bg-gray-50"}`}>
              <div className="text-xs text-gray-500 mb-1">Group Health</div>
              <div className={`font-semibold ${group.wellnessScore ? wellnessColor(group.wellnessScore) : "text-gray-400"}`}>
                {group.wellnessScore ?? "—"}{group.wellnessScore ? "%" : ""}
              </div>
            </div>
          </div>

          {/* Streak + Performance Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {group.contributionStreak && group.contributionStreak > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-orange-600 font-medium">{group.contributionStreak}-month streak</span>
              </div>
            )}
            {group.performance && (
              <div className="flex items-center gap-1.5 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">+{group.performance}% returns</span>
              </div>
            )}
            {group.riskScore && (
              <div className="text-sm text-gray-500">Risk: {group.riskScore}/10</div>
            )}
            {group.monthsActive && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-3.5 h-3.5" /> {group.monthsActive}mo active
              </div>
            )}
          </div>

          {/* Goal Progress Bar */}
          {group.goalProgress !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Savings Goal Progress</span>
                <span className="font-medium">{group.goalProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                  style={{ width: `${group.goalProgress}%` }}
                />
              </div>
              {group.goalAmount && (
                <div className="text-xs text-gray-400 mt-1">
                  Target: ₦{group.goalAmount.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Admin */}
          {group.adminName && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[9px] font-bold">
                {group.adminName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <span>Admin: <span className="font-medium text-gray-700">{group.adminName}</span></span>
              {group.adminVerified && <Badge className="text-[9px] px-1 h-4 bg-blue-100 text-blue-700 border-0">Verified</Badge>}
            </div>
          )}
        </div>

        {/* Governance Quick Stats */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-white border border-gray-100 rounded-lg text-center">
              <div className="font-semibold">{group.governance.votingThreshold}%</div>
              <div className="text-gray-500">Voting</div>
            </div>
            <div className="p-2 bg-white border border-gray-100 rounded-lg text-center">
              <div className="font-semibold">{group.governance.defaultPenalty}%</div>
              <div className="text-gray-500">Penalty</div>
            </div>
            <div className="p-2 bg-white border border-gray-100 rounded-lg text-center">
              <div className="font-semibold">{group.governance.exitNotice}d</div>
              <div className="text-gray-500">Exit</div>
            </div>
          </div>
        </div>

        {/* Vetting Expand Toggle */}
        {group.vetting && (
          <div className="px-5 pb-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors text-sm font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>View Vetting Criteria ({group.vetting.criteria.length} checks)</span>
              </div>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded && <VettingPanel vetting={group.vetting} groupType={group.type} />}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-4 pt-2 border-t border-gray-100">
          <Button variant="outline" className="flex-1" asChild>
            <Link to={`/marketplace/${group.id}`}>View Details</Link>
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" asChild>
            <Link to={`/groups/${group.id}/join`}>Request to Join</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Vetting Summary Banner ───────────────────────────────────────────────────
function VettingSummaryBanner() {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-emerald-900">How Khalia Vetting Works</h2>
          </div>
          <p className="text-sm text-emerald-800 leading-relaxed">
            Every group is independently assessed across 7–10 criteria before listing. Tiers reflect governance quality, reliability, compliance, and Shariah alignment — not predicted returns.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 flex-shrink-0">
          {[
            { icon: "🥇", label: "Gold", desc: "Score ≥ 85, all major checks pass" },
            { icon: "🥈", label: "Silver", desc: "Score 65–84, minor reviews" },
            { icon: "🥉", label: "Bronze", desc: "Score 45–64, newer groups" },
          ].map((tier) => (
            <div key={tier.label} className="flex items-center gap-2 px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs">
              <span className="text-lg">{tier.icon}</span>
              <div>
                <div className="font-semibold text-gray-800">{tier.label}</div>
                <div className="text-gray-500 w-28">{tier.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Marketplace Page ─────────────────────────────────────────────────────
export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");

  const filtered = marketplaceGroups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || g.type === filterType;
    const matchesTier = filterTier === "all" || g.vetting?.tier === filterTier;
    return matchesSearch && matchesType && matchesTier;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1>Groups Marketplace</h1>
          <p className="text-gray-500">
            Discover vetted savings circles, investment pools, and co-ownership groups
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
          <Link to="/groups/create">
            <Plus className="w-4 h-4 mr-2" /> Create New Group
          </Link>
        </Button>
      </div>

      {/* Vetting Explainer */}
      <VettingSummaryBanner />

      {/* Search + Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, description, or tag…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-44">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Group Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rosca">ROSCA</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="investment">Investment Circle</SelectItem>
                <SelectItem value="co-buying">Shared Ownership</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-full lg:w-44">
                <Star className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Vetting Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="gold">🥇 Gold</SelectItem>
                <SelectItem value="silver">🥈 Silver</SelectItem>
                <SelectItem value="bronze">🥉 Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Featured Groups</h2>
          <p className="text-sm text-gray-500">{filtered.length} group{filtered.length !== 1 ? "s" : ""} found</p>
        </div>
      </div>

      {/* Groups Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold mb-2">No Groups Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* Create CTA */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="py-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">Can't Find the Right Group?</h3>
            <p className="text-gray-600 mb-4">
              Create your own savings circle, investment pool, or co-ownership group. Khalia will guide you through vetting and governance setup.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link to="/groups/create">
                <Plus className="w-4 h-4 mr-2" /> Create Your Own Group
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}