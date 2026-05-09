import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Users, TrendingUp,
  Home, RefreshCw, Shield, AlertCircle, Sparkles, ChevronRight,
  Flame, Star, Info, Check, X, Clock, DollarSign, Zap,
} from "lucide-react";
import { currentUser } from "../data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────
type GroupType = "rosca" | "savings" | "investment" | "co-buying";
type Frequency = "weekly" | "monthly";
type VettingAnswer = "yes" | "in_progress" | "no";

interface FormData {
  type: GroupType | null;
  name: string;
  description: string;
  purpose: string;
  tags: string[];
  maxMembers: number;
  contributionAmount: number;
  frequency: Frequency;
  cycleLength: number;
  goalAmount: number;
  votingThreshold: number;
  defaultPenalty: number;
  exitNotice: number;
  emergencyFundTarget: number;
  shariahCompliant: boolean;
  allowEarlyExit: boolean;
  requireKYC: boolean;
  vettingAnswers: Record<string, VettingAnswer>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GROUP_TYPES = [
  {
    id: "rosca" as GroupType,
    icon: "🔄",
    name: "ROSCA",
    subtitle: "Rotating Savings",
    description: "Members take turns receiving the full pool each cycle. Classic 'ajo', 'esusu', or 'adashi' structure.",
    bestFor: ["Regular income", "Short-term goals", "Community trust"],
    duration: "3–24 months",
    risk: "Very Low",
    shariahStatus: "Halal",
    color: "blue",
  },
  {
    id: "savings" as GroupType,
    icon: "💰",
    name: "Savings Circle",
    subtitle: "Collective Goal",
    description: "Group saves towards a shared milestone. Funds held until goal is reached — weddings, Umrah, equipment.",
    bestFor: ["Shared milestones", "Community events", "Group purchases"],
    duration: "3–18 months",
    risk: "Very Low",
    shariahStatus: "Halal",
    color: "purple",
  },
  {
    id: "investment" as GroupType,
    icon: "📈",
    name: "Investment Circle",
    subtitle: "Pooled Capital",
    description: "Pool capital to invest in halal assets — sukuk, ethical equities, agritech, or real estate funds.",
    bestFor: ["Wealth building", "Diversification", "Long-term returns"],
    duration: "12–60 months",
    risk: "Medium",
    shariahStatus: "Halal (screened)",
    color: "amber",
  },
  {
    id: "co-buying" as GroupType,
    icon: "🏠",
    name: "Co-Ownership",
    subtitle: "Shared Asset",
    description: "Jointly acquire a tangible asset — property, land, equipment — with fractional ownership and clear exit rights.",
    bestFor: ["Real estate", "Agricultural land", "Shared infrastructure"],
    duration: "24–120 months",
    risk: "Low–Medium",
    shariahStatus: "Musharakah",
    color: "emerald",
  },
];

const AVAILABLE_TAGS = [
  "Lagos", "Abuja", "Kaduna", "Tech Professionals", "Women", "Entrepreneurs",
  "Muslim Community", "Youth", "Healthcare", "Agriculture", "Real Estate",
  "Umrah", "Education", "Business Capital", "Family",
];

const VETTING_QUESTIONS: Record<GroupType, { id: string; label: string; description: string; weight: number }[]> = {
  rosca: [
    { id: "q1", label: "All members are KYC-verified on Khalia", description: "Each member has submitted identity documents and BVN.", weight: 20 },
    { id: "q2", label: "Written governance rules exist and are approved by all members", description: "A signed agreement covering contributions, penalties, and payouts.", weight: 15 },
    { id: "q3", label: "Transaction history will be visible to all members", description: "Full transparency on who paid, when, and how much.", weight: 15 },
    { id: "q4", label: "Group size is between 6 and 20 members", description: "Optimal size for coordination and trust.", weight: 10 },
    { id: "q5", label: "An emergency fund reserve is planned (≥10% of pool)", description: "Buffer for missed contributions or unexpected defaults.", weight: 15 },
    { id: "q6", label: "The structure uses no interest or riba-based penalties", description: "Penalties are flat fees, not compounding interest.", weight: 15 },
    { id: "q7", label: "A conflict resolution protocol is documented", description: "Clear process for disputes between members.", weight: 10 },
  ],
  savings: [
    { id: "q1", label: "All members are KYC-verified on Khalia", description: "Identity documents and BVN verified.", weight: 20 },
    { id: "q2", label: "The savings goal and timeline are agreed by all", description: "Written shared goal document signed by members.", weight: 20 },
    { id: "q3", label: "Withdrawal conditions are clearly defined", description: "When and how funds can be accessed.", weight: 15 },
    { id: "q4", label: "Transaction history is visible to all members", description: "Full transparency on contributions and balances.", weight: 15 },
    { id: "q5", label: "An emergency clause exists (partial early access)", description: "Provisions for genuine emergencies with group approval.", weight: 15 },
    { id: "q6", label: "Funds are held in a dedicated escrow or group account", description: "Segregated from personal finances.", weight: 15 },
  ],
  investment: [
    { id: "q1", label: "All members are KYC-verified on Khalia", description: "Identity documents and BVN verified.", weight: 15 },
    { id: "q2", label: "Investment thesis and target assets are documented", description: "Written investment policy statement approved by members.", weight: 20 },
    { id: "q3", label: "All proposed investments are Shariah-screened", description: "No riba, gharar, or haram sector exposure.", weight: 15 },
    { id: "q4", label: "Risk levels and potential losses are disclosed to members", description: "Each member understands the downside.", weight: 15 },
    { id: "q5", label: "Monthly performance reporting is committed to", description: "Regular updates to all members.", weight: 15 },
    { id: "q6", label: "A clear liquidity and exit mechanism exists", description: "How members exit and recover their share.", weight: 10 },
    { id: "q7", label: "A qualified investment lead or advisor is named", description: "Named person responsible for investment decisions.", weight: 10 },
  ],
  "co-buying": [
    { id: "q1", label: "Legal ownership structure is established or planned", description: "Title in co-owners' names or SPV structure.", weight: 25 },
    { id: "q2", label: "An independent asset valuation will be obtained", description: "Professional appraisal before purchase.", weight: 20 },
    { id: "q3", label: "All members have signed a co-ownership agreement", description: "Legal document covering ownership shares and rights.", weight: 15 },
    { id: "q4", label: "A maintenance reserve fund is planned (≥5% annually)", description: "Ongoing asset maintenance budget.", weight: 15 },
    { id: "q5", label: "Insurance coverage will be taken out", description: "Asset protected against damage or loss.", weight: 10 },
    { id: "q6", label: "Exit mechanism and buy-out process is documented", description: "How a member exits and their share is valued/purchased.", weight: 15 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const computeVettingScore = (type: GroupType | null, answers: Record<string, VettingAnswer>): number => {
  if (!type) return 0;
  const questions = VETTING_QUESTIONS[type];
  if (!questions?.length) return 0;
  let score = 0;
  questions.forEach((q) => {
    const ans = answers[q.id];
    if (ans === "yes") score += q.weight;
    else if (ans === "in_progress") score += q.weight * 0.4;
  });
  return Math.round(score);
};

const getVettingTier = (score: number) => {
  if (score >= 80) return { tier: "Gold", icon: "🥇", color: "text-amber-600", bg: "bg-amber-50" };
  if (score >= 60) return { tier: "Silver", icon: "🥈", color: "text-gray-600", bg: "bg-gray-50" };
  if (score >= 40) return { tier: "Bronze", icon: "🥉", color: "text-orange-600", bg: "bg-orange-50" };
  return { tier: "Unrated", icon: "⬜", color: "text-gray-400", bg: "bg-gray-50" };
};

// ─── Step Components ──────────────────────────────────────────────────────────

function StepTypeSelection({ selected, onSelect }: { selected: GroupType | null; onSelect: (t: GroupType) => void }) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-300 bg-blue-50 ring-blue-400",
    purple: "border-purple-300 bg-purple-50 ring-purple-400",
    amber: "border-amber-300 bg-amber-50 ring-amber-400",
    emerald: "border-emerald-300 bg-emerald-50 ring-emerald-400",
  };
  const riskColor: Record<string, string> = {
    "Very Low": "text-emerald-600 bg-emerald-50",
    "Low–Medium": "text-blue-600 bg-blue-50",
    "Medium": "text-amber-600 bg-amber-50",
  };
  return (
    <div className="space-y-4">
      <div>
        <h2>What kind of group are you creating?</h2>
        <p className="text-gray-500 mt-1">Choose the structure that best fits your community's goals.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GROUP_TYPES.map((gt) => {
          const isSelected = selected === gt.id;
          return (
            <button
              key={gt.id}
              onClick={() => onSelect(gt.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? `${colorMap[gt.color]} ring-2 ring-offset-2 shadow-md`
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-3xl">{gt.icon}</span>
                  <div className="mt-2">
                    <div className="font-semibold text-gray-900">{gt.name}</div>
                    <div className="text-sm text-gray-500">{gt.subtitle}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{gt.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {gt.bestFor.map((b) => (
                  <span key={b} className="text-[11px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">{b}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-gray-400"><Clock className="w-3 h-3 inline mr-0.5" />{gt.duration}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${riskColor[gt.risk] ?? "text-gray-500 bg-gray-50"}`}>
                  Risk: {gt.risk}
                </span>
                <span className="text-[11px] text-emerald-600 flex items-center gap-0.5">
                  <span>☪</span> {gt.shariahStatus}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepDetails({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) {
  const [tagInput, setTagInput] = useState("");
  const addTag = (tag: string) => {
    if (!data.tags.includes(tag) && data.tags.length < 5) {
      onChange("tags", [...data.tags, tag]);
    }
  };
  const removeTag = (tag: string) => onChange("tags", data.tags.filter((t) => t !== tag));

  return (
    <div className="space-y-6">
      <div>
        <h2>Tell us about your group</h2>
        <p className="text-gray-500 mt-1">Give your group a name and purpose that resonates with potential members.</p>
      </div>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Group Name <span className="text-red-500">*</span></label>
          <Input
            placeholder={data.type === "rosca" ? "e.g. Lagos Tech Circle" : data.type === "investment" ? "e.g. Green Energy Investment Pool" : "e.g. Al-Noor Women's Co-Op"}
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            maxLength={60}
          />
          <div className="text-xs text-gray-400 mt-1 text-right">{data.name.length}/60</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose Statement</label>
          <Input
            placeholder="Why does this group exist? What's the shared goal?"
            value={data.purpose}
            onChange={(e) => onChange("purpose", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            className="w-full min-h-[100px] px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
            placeholder="Describe your group's mission, values, and who it's for. Be specific — this helps the right members find you."
            value={data.description}
            onChange={(e) => onChange("description", e.target.value)}
            maxLength={400}
          />
          <div className="text-xs text-gray-400 mt-1 text-right">{data.description.length}/400</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (up to 5)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                {tag}
                <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TAGS.filter((t) => !data.tags.includes(t)).map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="text-xs px-2.5 py-1 border border-gray-200 rounded-full text-gray-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepStructure({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) {
  const monthlyPool = data.contributionAmount * data.maxMembers;
  const annualPool = monthlyPool * (data.frequency === "monthly" ? 12 : 52);
  const typeLabel = data.type === "rosca" ? "Each payout" : "Annual target";
  const payoutAmount = data.type === "rosca" ? monthlyPool : annualPool;

  return (
    <div className="space-y-6">
      <div>
        <h2>Structure & Contribution Terms</h2>
        <p className="text-gray-500 mt-1">Define how many members, how much each contributes, and how often.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Maximum Members <span className="text-gray-400 text-xs">(recommended: 6–20)</span>
          </label>
          <Input
            type="number"
            min={2}
            max={100}
            value={data.maxMembers}
            onChange={(e) => onChange("maxMembers", Number(e.target.value))}
          />
          {data.maxMembers > 20 && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Large groups can be harder to coordinate</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contribution Frequency</label>
          <div className="flex gap-2">
            {(["weekly", "monthly"] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => onChange("frequency", f)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                  data.frequency === f ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contribution Amount (₦)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
            <Input
              type="number"
              min={1000}
              className="pl-8"
              value={data.contributionAmount}
              onChange={(e) => onChange("contributionAmount", Number(e.target.value))}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Per member, per {data.frequency === "monthly" ? "month" : "week"}</p>
        </div>
        {(data.type === "rosca" || data.type === "savings") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {data.type === "rosca" ? "Cycle Length (months)" : "Target Amount (₦)"}
            </label>
            {data.type === "rosca" ? (
              <Input
                type="number"
                min={2}
                max={36}
                value={data.cycleLength}
                onChange={(e) => onChange("cycleLength", Number(e.target.value))}
              />
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
                <Input
                  type="number"
                  className="pl-8"
                  value={data.goalAmount}
                  onChange={(e) => onChange("goalAmount", Number(e.target.value))}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Pool Preview */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-emerald-800 text-sm">Live Pool Preview</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold text-emerald-700">₦{monthlyPool.toLocaleString()}</div>
            <div className="text-xs text-emerald-600">Pool per cycle</div>
          </div>
          <div>
            <div className="font-semibold text-emerald-700">{data.maxMembers}</div>
            <div className="text-xs text-emerald-600">Members max</div>
          </div>
          <div>
            <div className="font-semibold text-emerald-700">₦{payoutAmount.toLocaleString()}</div>
            <div className="text-xs text-emerald-600">{typeLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepGovernance({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) {
  const SliderRow = ({
    label, desc, value, min, max, step, unit, field,
  }: { label: string; desc: string; value: number; min: number; max: number; step: number; unit: string; field: keyof FormData }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          <div className="text-xs text-gray-500">{desc}</div>
        </div>
        <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-sm">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(field, Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2>Governance & Rules</h2>
        <p className="text-gray-500 mt-1">Set the rules that protect all members and ensure fair, transparent decision-making.</p>
      </div>
      <div className="space-y-6 p-5 bg-gray-50 rounded-2xl">
        <SliderRow label="Voting Threshold" desc="% of members needed to approve group decisions" value={data.votingThreshold} min={50} max={90} step={5} unit="%" field="votingThreshold" />
        <SliderRow label="Default Penalty" desc="% fee applied to missed contributions" value={data.defaultPenalty} min={0} max={20} step={1} unit="%" field="defaultPenalty" />
        <SliderRow label="Emergency Fund Target" desc="% of pool reserved for defaults & emergencies" value={data.emergencyFundTarget} min={5} max={30} step={1} unit="%" field="emergencyFundTarget" />
      </div>

      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Exit Notice Period</div>
        <div className="grid grid-cols-4 gap-2">
          {[14, 30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => onChange("exitNotice", days)}
              className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                data.exitNotice === days ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[
          { field: "shariahCompliant" as keyof FormData, label: "Shariah-Compliant Structure", desc: "Confirm no riba-based fees or instruments will be used" },
          { field: "requireKYC" as keyof FormData, label: "Require KYC for all members", desc: "Only verified (BVN + ID) users can join" },
          { field: "allowEarlyExit" as keyof FormData, label: "Allow Emergency Early Exit", desc: "Members may exit early with group vote (during genuine hardship)" },
        ].map(({ field, label, desc }) => (
          <div
            key={field}
            onClick={() => onChange(field, !data[field])}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              data[field] ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${data[field] ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
              {data[field] && <Check className="w-3 h-3 text-white" />}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">{label}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepVetting({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: any) => void }) {
  const questions = VETTING_QUESTIONS[data.type!] ?? [];
  const score = computeVettingScore(data.type, data.vettingAnswers);
  const tier = getVettingTier(score);

  const setAnswer = (qid: string, ans: VettingAnswer) => {
    onChange("vettingAnswers", { ...data.vettingAnswers, [qid]: ans });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Vetting Self-Assessment</h2>
        <p className="text-gray-500 mt-1">Answer honestly — this determines your preliminary vetting tier and builds trust with future members.</p>
      </div>

      {/* Score Preview */}
      <div className={`flex items-center gap-4 p-4 ${tier.bg} rounded-2xl border border-gray-200`}>
        <div className="text-4xl">{tier.icon}</div>
        <div className="flex-1">
          <div className={`font-semibold ${tier.color}`}>{tier.tier} Tier — {score}/100</div>
          <div className="text-sm text-gray-600 mt-0.5">Your preliminary vetting score. Complete more criteria to improve.</div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-gray-800">{score}</div>
          <div className="text-xs text-gray-400">/ 100</div>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q) => {
          const answer = data.vettingAnswers[q.id];
          return (
            <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{q.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{q.description}</div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">Weight: {q.weight}%</span>
              </div>
              <div className="flex gap-2">
                {([
                  { val: "yes" as VettingAnswer, label: "✅ Yes", active: "bg-emerald-500 text-white border-emerald-500" },
                  { val: "in_progress" as VettingAnswer, label: "⏳ In Progress", active: "bg-amber-500 text-white border-amber-500" },
                  { val: "no" as VettingAnswer, label: "❌ Not Yet", active: "bg-red-100 text-red-700 border-red-300" },
                ]).map(({ val, label, active }) => (
                  <button
                    key={val}
                    onClick={() => setAnswer(q.id, val)}
                    className={`flex-1 py-2 px-2 rounded-lg border-2 text-xs font-medium transition-all ${
                      answer === val ? active : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          <strong>Khalia will re-audit your group after 30 days.</strong> Your score may increase as you complete "In Progress" items. Gold-tier groups get priority placement in the Marketplace.
        </p>
      </div>
    </div>
  );
}

function StepReview({ data }: { data: FormData }) {
  const typeInfo = GROUP_TYPES.find((t) => t.id === data.type);
  const score = computeVettingScore(data.type, data.vettingAnswers);
  const tier = getVettingTier(score);
  const monthlyPool = data.contributionAmount * data.maxMembers;

  return (
    <div className="space-y-6">
      <div>
        <h2>Review & Launch</h2>
        <p className="text-gray-500 mt-1">Everything looks good. Review your group settings before going live.</p>
      </div>

      {/* Group Identity */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{typeInfo?.icon}</div>
          <div className="flex-1">
            <div className="font-semibold text-lg text-gray-900">{data.name || "Untitled Group"}</div>
            <div className="text-sm text-gray-600 mt-0.5">{data.purpose || "No purpose statement"}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="text-xs bg-white border-emerald-300 text-emerald-700">{typeInfo?.name}</Badge>
              {data.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 ${tier.bg} rounded-xl border border-gray-200`}>
            <span className="text-lg">{tier.icon}</span>
            <div>
              <div className={`text-xs font-semibold ${tier.color}`}>{tier.tier}</div>
              <div className="text-xs text-gray-500">{score}/100</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Structure */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="font-medium text-gray-700 text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Structure</div>
          {[
            ["Members", `Up to ${data.maxMembers}`],
            ["Contribution", `₦${data.contributionAmount.toLocaleString()} / ${data.frequency}`],
            ["Pool per cycle", `₦${monthlyPool.toLocaleString()}`],
            ...(data.type === "rosca" ? [["Cycle length", `${data.cycleLength} months`]] : []),
            ...(data.goalAmount ? [["Target amount", `₦${data.goalAmount.toLocaleString()}`]] : []),
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm py-1 border-b last:border-0 border-gray-100">
              <span className="text-gray-500">{l}</span>
              <span className="font-medium text-gray-800">{v}</span>
            </div>
          ))}
        </div>
        {/* Governance */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="font-medium text-gray-700 text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Governance</div>
          {[
            ["Voting threshold", `${data.votingThreshold}%`],
            ["Default penalty", `${data.defaultPenalty}%`],
            ["Emergency fund", `${data.emergencyFundTarget}%`],
            ["Exit notice", `${data.exitNotice} days`],
            ["Shariah-compliant", data.shariahCompliant ? "✅ Yes" : "❌ No"],
            ["KYC required", data.requireKYC ? "✅ Yes" : "❌ No"],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm py-1 border-b last:border-0 border-gray-100">
              <span className="text-gray-500">{l}</span>
              <span className="font-medium text-gray-800">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-700">
          By launching this group you confirm that all settings are accurate and that your group will operate in accordance with Khalia's Community Finance Standards. You can edit settings after launch via a group vote.
        </p>
      </div>
    </div>
  );
}

// ─── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen({ data, groupId }: { data: FormData; groupId: string }) {
  const typeInfo = GROUP_TYPES.find((t) => t.id === data.type);
  const score = computeVettingScore(data.type, data.vettingAnswers);
  const tier = getVettingTier(score);
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-8 py-4">
      {/* Celebration */}
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 text-3xl animate-bounce" style={{ marginLeft: "50%", marginTop: "-8px" }}>🎉</div>
      </div>

      <div>
        <h2 className="text-emerald-700">Your group is live!</h2>
        <p className="text-gray-500 mt-2 text-lg">
          <strong>{data.name}</strong> has been created and is ready for members.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-2xl">{typeInfo?.icon}</span>
          <Badge className="bg-emerald-100 text-emerald-700 border-0">{typeInfo?.name}</Badge>
          <span className={`flex items-center gap-1 text-sm font-semibold ${tier.color}`}>
            {tier.icon} {tier.tier} Vetting Tier
          </span>
        </div>
      </div>

      {/* Group ID */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl max-w-sm mx-auto">
        <div className="text-xs text-gray-500 mb-1">Group ID</div>
        <div className="font-mono font-semibold text-gray-800">KHL-{groupId.toUpperCase()}</div>
        <div className="text-xs text-gray-400 mt-1">Share this with members to let them find your group</div>
      </div>

      {/* Next Steps */}
      <div className="text-left max-w-md mx-auto space-y-3">
        <div className="text-sm font-semibold text-gray-700">Next steps</div>
        {[
          { icon: "👥", label: "Invite members", desc: "Share the group link or ID with your founding members", action: () => navigate(`/groups/1`) },
          { icon: "🤖", label: "Start a ShūrāBot session", desc: "Let AI help plan your first contribution cycle", action: () => navigate("/shurabot") },
          { icon: "📋", label: "Complete your vetting", desc: `You're at ${score}/100 — improve to Gold tier`, action: () => {} },
          { icon: "🏪", label: "List on Marketplace", desc: "Once 3+ members join, your group can appear in Marketplace", action: () => navigate("/marketplace") },
        ].map((step) => (
          <button
            key={step.label}
            onClick={step.action}
            className="w-full flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left group"
          >
            <span className="text-2xl">{step.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">{step.label}</div>
              <div className="text-xs text-gray-500">{step.desc}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => navigate("/groups")}>View My Groups</Button>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate("/marketplace")}>
          Browse Marketplace
        </Button>
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = ["Type", "Details", "Structure", "Governance", "Vetting", "Review"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                done ? "bg-emerald-500 text-white" : active ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-gray-100 text-gray-400"
              }`}>
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] hidden sm:block ${active ? "text-emerald-700 font-semibold" : done ? "text-emerald-500" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${done ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CreateGroup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [groupId] = useState(() => Math.random().toString(36).slice(2, 8));
  const [form, setForm] = useState<FormData>({
    type: null,
    name: "",
    description: "",
    purpose: "",
    tags: [],
    maxMembers: 12,
    contributionAmount: 50000,
    frequency: "monthly",
    cycleLength: 12,
    goalAmount: 0,
    votingThreshold: 65,
    defaultPenalty: 10,
    exitNotice: 30,
    emergencyFundTarget: 15,
    shariahCompliant: true,
    allowEarlyExit: false,
    requireKYC: true,
    vettingAnswers: {},
  });

  const onChange = (key: keyof FormData, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const canProceed = () => {
    if (step === 0) return !!form.type;
    if (step === 1) return form.name.trim().length >= 3;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else setLaunched(true);
  };

  if (launched) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        <Card><CardContent className="pt-8 pb-8"><SuccessScreen data={form} groupId={groupId} /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/groups">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        </Link>
        <div className="flex-1">
          <h1>Create a Group</h1>
          <p className="text-gray-500 text-sm">Set up your savings, investment, or co-ownership circle</p>
        </div>
        <div className="text-sm text-gray-500 hidden sm:block">
          Step {step + 1} of {STEPS.length}
        </div>
      </div>

      {/* Progress */}
      <StepIndicator current={step} />

      {/* Step Card */}
      <Card>
        <CardContent className="pt-6 pb-6">
          {step === 0 && <StepTypeSelection selected={form.type} onSelect={(t) => onChange("type", t)} />}
          {step === 1 && <StepDetails data={form} onChange={onChange} />}
          {step === 2 && <StepStructure data={form} onChange={onChange} />}
          {step === 3 && <StepGovernance data={form} onChange={onChange} />}
          {step === 4 && <StepVetting data={form} onChange={onChange} />}
          {step === 5 && <StepReview data={form} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {!canProceed() && step === 0 && "Select a group type to continue"}
          {!canProceed() && step === 1 && "Enter a group name (min 3 chars)"}
        </div>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {step === STEPS.length - 1 ? (
            <><Zap className="w-4 h-4 mr-2" /> Launch Group</>
          ) : (
            <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
