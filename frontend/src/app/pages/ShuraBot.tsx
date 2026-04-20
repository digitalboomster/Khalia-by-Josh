import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Send, Sparkles, Users, Plus, ChevronRight, Zap, BookOpen,
  AlertTriangle, CheckCircle2, TrendingUp, Bell, BarChart2,
  MessageSquare, Shield, Clock, X, Play, Vote, ArrowRight,
  Star, Flame, Info,
} from "lucide-react";
import {
  collaborativeSessions,
  proactiveInsights,
  CollabSession,
  CollabMessage,
  ProactiveInsight,
  SessionParticipant,
} from "../data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

// ─── Avatar Component ──────────────────────────────────────────────────────────
function Avatar({
  initials,
  color,
  size = "md",
  isOnline,
  isTyping,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  isOnline?: boolean;
  isTyping?: boolean;
}) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold`}
        style={{ backgroundColor: color }}
      >
        {initials === "SB" ? <Sparkles className="w-4 h-4" /> : initials}
      </div>
      {isOnline !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
            isTyping ? "bg-amber-400 animate-pulse" : isOnline ? "bg-emerald-500" : "bg-gray-300"
          }`}
        />
      )}
    </div>
  );
}

// ─── Vetting / Scenario Bar ────────────────────────────────────────────────────
function ScenarioBar({ label, current, projected, unit }: { label: string; current: number; projected: number; unit: string }) {
  const fmt = (v: number) => unit === "₦" ? `₦${v.toLocaleString()}` : `${v}${unit === "%" ? "%" : ` ${unit}`}`;
  const isBetter = projected < current && (label.includes("Date") || label.includes("Recovery"));
  const isWorse = projected < current && !isBetter;
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-gray-600 w-40 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-3 flex-1">
        <span className="text-gray-500 w-20 text-right">{fmt(current)}</span>
        <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <span className={`font-medium w-24 ${isWorse ? "text-red-600" : "text-amber-600"}`}>
          {fmt(projected)}
        </span>
      </div>
    </div>
  );
}

// ─── Wellness Radial ──────────────────────────────────────────────────────────
function WellnessRadials({ data }: { data: { label: string; value: number; color: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={item.color} strokeWidth="4"
                strokeDasharray={`${(item.value / 100) * 87.96} 87.96`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
          <span className="text-xs text-gray-600 leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: CollabMessage }) {
  const isAI = message.role === "assistant";
  const isUser = message.senderId === "1"; // current user

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar initials={message.senderInitials} color={message.senderColor} isOnline={isAI ? true : undefined} />
      <div className={`max-w-[78%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className="flex items-center gap-2">
          {!isUser && (
            <span className="text-xs font-medium" style={{ color: message.senderColor }}>
              {message.senderName}
            </span>
          )}
          {isAI && message.shariahCompliant && (
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 border-0">
              ☪ Halal
            </Badge>
          )}
          <span className="text-[10px] text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-emerald-600 text-white rounded-tr-sm"
              : isAI
              ? "bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm"
              : "bg-gray-100 text-gray-900 rounded-tl-sm"
          }`}
        >
          {/* Content with basic markdown */}
          <div className="whitespace-pre-wrap">
            {message.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={i}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>

          {/* Wellness Radials */}
          {message.wellnessData && <WellnessRadials data={message.wellnessData} />}

          {/* Scenario Results */}
          {message.scenarioResults && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart2 className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-800">Scenario Impact</span>
              </div>
              <div className="divide-y divide-amber-100">
                {message.scenarioResults.map((r) => (
                  <ScenarioBar key={r.label} {...r} />
                ))}
              </div>
            </div>
          )}

          {/* Proposal */}
          {message.proposalData && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Vote className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-800">{message.proposalData.title}</span>
              </div>
              {message.proposalData.options.map((opt, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs ${idx === 0 ? "bg-blue-50 border-blue-200" : "bg-purple-50 border-purple-200"}`}>
                  <div className={`font-semibold mb-1.5 ${idx === 0 ? "text-blue-800" : "text-purple-800"}`}>{opt.label}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-green-700 font-medium mb-0.5">Pros</div>
                      {opt.pros.map((p, i) => <div key={i} className="text-gray-600">• {p}</div>)}
                    </div>
                    <div>
                      <div className="text-red-700 font-medium mb-0.5">Cons</div>
                      {opt.cons.map((c, i) => <div key={i} className="text-gray-600">• {c}</div>)}
                    </div>
                  </div>
                  <div className={`mt-1.5 font-medium ${idx === 0 ? "text-blue-700" : "text-purple-700"}`}>
                    📊 {opt.impact}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          {message.disclaimer && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
              <Shield className="w-3 h-3" />
              {message.disclaimer}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.actions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant={action.variant}
                className={`text-xs h-7 px-3 ${action.variant === "default" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              >
                {action.type === "vote" && <Vote className="w-3 h-3 mr-1" />}
                {action.type === "remind" && <Bell className="w-3 h-3 mr-1" />}
                {action.type === "simulate" && <Play className="w-3 h-3 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────
function InsightCard({ insight, onChat }: { insight: ProactiveInsight; onChat: (text: string) => void }) {
  const styles = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: <Star className="w-4 h-4 text-emerald-600" />, text: "text-emerald-800" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: <AlertTriangle className="w-4 h-4 text-amber-600" />, text: "text-amber-800" },
    info: { bg: "bg-blue-50", border: "border-blue-200", icon: <TrendingUp className="w-4 h-4 text-blue-600" />, text: "text-blue-800" },
    milestone: { bg: "bg-purple-50", border: "border-purple-200", icon: <Flame className="w-4 h-4 text-purple-600" />, text: "text-purple-800" },
  }[insight.type];

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-3 space-y-1.5`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold ${styles.text}`}>{insight.title}</div>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{insight.body}</p>
          {insight.groupName && (
            <div className="text-[10px] text-gray-400 mt-1">{insight.groupName}</div>
          )}
        </div>
      </div>
      {insight.actionLabel && (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs"
          onClick={() => onChat(`Tell me more about: ${insight.title}`)}
        >
          {insight.actionLabel}
        </Button>
      )}
    </div>
  );
}

// ─── Quick Scenario Card ──────────────────────────────────────────────────────
const quickScenarios = [
  { icon: "👥", label: "What if 2 members drop out?", query: "What if 2 members drop out of the group for 3 months?" },
  { icon: "💰", label: "Increase contributions by ₦5,000?", query: "What happens if we increase contributions by ₦5,000 each month?" },
  { icon: "📅", label: "Extend cycle by 2 months?", query: "Should we extend our savings cycle by 2 more months?" },
  { icon: "🌱", label: "Add 3 new members?", query: "What's the impact of adding 3 new members next cycle?" },
  { icon: "🕌", label: "What is musharakah?", query: "Can you explain musharakah and how it applies to our group?" },
  { icon: "🏥", label: "Set up an emergency pool?", query: "How should we structure an emergency protection pool for our group?" },
];

// ─── Presence Bar ─────────────────────────────────────────────────────────────
function PresenceBar({ participants }: { participants: SessionParticipant[] }) {
  const online = participants.filter((p) => p.isOnline);
  const typing = participants.find((p) => p.isTyping);
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {participants.map((p) => (
            <Avatar key={p.id} initials={p.initials} color={p.color} size="sm" isOnline={p.isOnline} isTyping={p.isTyping} />
          ))}
        </div>
        <span className="text-xs text-gray-500">
          {online.length} online · {participants.length} in session
        </span>
      </div>
      {typing && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600">
          <div className="flex gap-0.5">
            {[0, 0.15, 0.3].map((d) => (
              <div
                key={d}
                className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: `${d}s` }}
              />
            ))}
          </div>
          <span>{typing.name} is typing…</span>
        </div>
      )}
      <Button size="sm" variant="outline" className="h-7 text-xs">
        <Plus className="w-3 h-3 mr-1" /> Invite
      </Button>
    </div>
  );
}

// ─── Main ShūrāBot Page ───────────────────────────────────────────────────────
export function ShuraBot() {
  const [sessions, setSessions] = useState<CollabSession[]>(collaborativeSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(collaborativeSessions[0].id);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [insightsDismissed, setInsightsDismissed] = useState<string[]>([]);
  const [showScenarioPanel, setShowScenarioPanel] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId)!;
  const visibleInsights = proactiveInsights.filter((i) => !insightsDismissed.includes(i.id));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, isTyping]);

  const generateAIResponse = (userMessage: string, session: CollabSession): CollabMessage => {
    const lower = userMessage.toLowerCase();
    const base = {
      id: (Date.now() + 1).toString(),
      senderId: "ai",
      senderName: "ShūrāBot",
      senderInitials: "SB",
      senderColor: "#059669",
      role: "assistant" as const,
      shariahCompliant: true,
      disclaimer: "Educational insights only. Not financial advice. All recommendations are Shariah-screened.",
      timestamp: new Date().toISOString(),
    };

    if (lower.includes("drop out") || lower.includes("miss") || lower.includes("scenario")) {
      return {
        ...base,
        type: "scenario",
        content: "**Scenario: 2 Members Drop Out for 3 Months**\n\nHere's the projected impact on your group pool and payout timeline:\n\n• **Pool shortfall**: ₦300,000 over 3 cycles\n• **Payout delay**: ~3 weeks for the next scheduled recipient\n• **Recovery time**: 2 months with emergency fund activation\n\n💡 My recommendation is to activate 50% of the emergency reserve and issue gentle reminders to at-risk members. This maintains the cycle without placing burden on other members.",
        scenarioResults: [
          { label: "Payout Delay", current: 0, projected: 21, unit: "days" },
          { label: "Pool Coverage", current: 100, projected: 75, unit: "%" },
          { label: "Emergency Fund Used", current: 0, projected: 150000, unit: "₦" },
          { label: "Recovery Period", current: 0, projected: 2, unit: "months" },
        ],
        actions: [
          { label: "Send Reminders", type: "remind" as const, variant: "default" as const },
          { label: "Activate Emergency Fund", type: "vote" as const, variant: "outline" as const },
        ],
      };
    }

    if (lower.includes("increase") || lower.includes("contributions")) {
      return {
        ...base,
        type: "proposal",
        content: "Here's a structured proposal for increasing contributions. I've modelled both options for your group size and goal.",
        proposalData: {
          title: "Contribution Increase — Member Proposal",
          options: [
            {
              label: "Option A: Increase by ₦5,000/month",
              pros: ["Modest, manageable increase", "Goal achieved 5 weeks early", "Builds emergency reserve faster"],
              cons: ["Small additional commitment", "May affect 1–2 members"],
              impact: "Goal achieved ~5 weeks earlier",
            },
            {
              label: "Option B: Increase by ₦10,000/month",
              pros: ["Significant goal acceleration", "Higher payouts for recipients", "Stronger emergency fund"],
              cons: ["Larger monthly commitment", "May exclude lower-income members"],
              impact: "Goal achieved ~10 weeks earlier",
            },
          ],
        },
        actions: [
          { label: "Send to Group for Vote", type: "vote" as const, variant: "default" as const },
          { label: "Simulate Option A", type: "simulate" as const, variant: "outline" as const },
        ],
      };
    }

    if (lower.includes("musharakah") || lower.includes("sukuk") || lower.includes("takaful") || lower.includes("halal") || lower.includes("riba") || lower.includes("rosca") || lower.includes("education")) {
      const topic = lower.includes("musharakah") ? "Musharakah" : lower.includes("sukuk") ? "Sukuk" : lower.includes("takaful") ? "Takaful" : lower.includes("rosca") ? "ROSCAs" : "Islamic Finance";
      return {
        ...base,
        type: "education",
        content: `**${topic} — Educational Guide**\n\n${
          topic === "Musharakah"
            ? "Musharakah is a partnership structure where all parties contribute capital and share profits/losses proportionally. It's the Islamic finance equivalent of a joint venture — fully halal because there's no guaranteed return or interest.\n\n**In the context of your group**: Your co-ownership pool uses a musharakah framework — each member owns a proportional share of the asset."
            : topic === "Sukuk"
            ? "Sukuk are Islamic bonds where investors hold ownership stakes in tangible assets, services, or projects — not debt. Returns come from asset performance, not interest (riba).\n\n**Halal check**: Certified sukuk are permissible (halal). Conventional bonds with fixed interest (riba) are prohibited."
            : topic === "Takaful"
            ? "Takaful is Islamic cooperative insurance. Members contribute to a shared fund (tabarru') to cover each other's losses. Surplus is redistributed, not retained as profit.\n\n**For your group**: A takaful-style emergency fund aligns perfectly with your co-op structure."
            : topic === "ROSCAs"
            ? "ROSCA stands for Rotating Savings and Credit Association — known as 'ajo', 'esusu', or 'adashi' in Nigeria. Members contribute equally each cycle and take turns receiving the pool.\n\n**Halal status**: ROSCAs are permissible as long as no interest or penalty charges are applied (your group's 10% penalty requires scholarly review for halal compliance)."
            : "Islamic finance is built on five principles: no riba (interest), no gharar (excessive uncertainty), no maysir (gambling), ethical investment, and risk-sharing. All Khalia group structures are designed to align with these principles."
        }\n\n📚 *Source: AAOIFI Shariah Standards & IFSB Guidelines (verified)*`,
        actions: [
          { label: "Ask Follow-Up", type: "view" as const, variant: "outline" as const },
          { label: "View Scholar Hub", type: "view" as const, variant: "outline" as const },
        ],
      };
    }

    if (lower.includes("extend") || lower.includes("cycle") || lower.includes("add") || lower.includes("new members")) {
      return {
        ...base,
        type: "scenario",
        content: `**Scenario: ${lower.includes("extend") ? "Extend Cycle by 2 Months" : "Add 3 New Members"}**\n\n${
          lower.includes("extend")
            ? "Extending your savings cycle by 2 months would:\n\n• **Increase total pool by**: ₦1,200,000 (12 members × ₦50,000 × 2 months)\n• **Delay the final payout by**: 2 months\n• **Benefit**: Larger pool for the last recipient\n• **Cost**: All members wait longer\n\n💡 This works best if the current last-in-line member agrees. I'd recommend putting this to a group vote."
            : "Adding 3 new members next cycle would:\n\n• **Reduce per-member contribution** from ₦50,000 to ₦40,000 (if pool stays same)\n• **Extend cycle by 3 more months** (total 15 months)\n• **Increase total pool** to ₦750,000 per payout\n\n💡 New members must pass vetting checks. I can draft an onboarding checklist."
        }`,
        scenarioResults: lower.includes("extend")
          ? [
              { label: "Total Pool Growth", current: 600000, projected: 1800000, unit: "₦" },
              { label: "Cycle Length", current: 12, projected: 14, unit: "months" },
              { label: "Final Payout", current: 600000, projected: 700000, unit: "₦" },
            ]
          : [
              { label: "Members", current: 12, projected: 15, unit: "" },
              { label: "Per-Member Contribution", current: 50000, projected: 40000, unit: "₦" },
              { label: "Total Cycle Pool", current: 600000, projected: 750000, unit: "₦" },
              { label: "Cycle Length", current: 12, projected: 15, unit: "months" },
            ],
        actions: [
          { label: "Draft Proposal for Vote", type: "vote" as const, variant: "default" as const },
          { label: "Preview New Schedule", type: "simulate" as const, variant: "outline" as const },
        ],
      };
    }

    if (lower.includes("emergency") || lower.includes("protection pool") || lower.includes("takaful")) {
      return {
        ...base,
        type: "wellness",
        content: "**Emergency Protection Pool — Setup Guide**\n\nFor a group of 12 members, here's what I recommend:\n\n• **Pool size**: ₦60,000–₦120,000 (1–2 months of group contributions)\n• **Trigger conditions**: Medical emergency, job loss, bereavement (by group vote)\n• **Contribution**: ₦5,000/member/month (separate from regular savings)\n• **Replenishment**: Auto-deducted from next cycle if used\n\n☪ This is a **takaful-compliant** structure — members contribute as sadaqah (voluntary), not insurance premiums, making it fully halal.\n\n💡 Your current emergency fund is 12% of pool. I'd recommend building to 20% for full coverage.",
        wellnessData: [
          { label: "Current Reserve", value: 12, color: "#f59e0b" },
          { label: "Recommended", value: 20, color: "#10b981" },
          { label: "Pool Coverage", value: 83, color: "#3b82f6" },
          { label: "Member Safety", value: 65, color: "#8b5cf6" },
        ],
        actions: [
          { label: "Set Up Emergency Pool", type: "propose" as const, variant: "default" as const },
          { label: "Learn About Takaful", type: "view" as const, variant: "outline" as const },
        ],
      };
    }

    // Default response
    return {
      ...base,
      type: "text",
      content: `Thanks for that question, ${session.type === "group" ? "team" : "Amara"}! Here's what I can help with:\n\n• **Scenario Simulation**: Model "what if" situations for your group\n• **Proposal Drafting**: Generate structured proposals for group votes\n• **Financial Health**: Explain your group's wellness metrics\n• **Shariah Guidance**: Get halal-compliant financial education\n• **Conflict Resolution**: Neutral summaries when members disagree\n\nFor your group specifically, your contribution health is at **96%** and you're **83% to goal**. Want me to run a scenario or draft a proposal?`,
      actions: [
        { label: "Run a Scenario", type: "simulate" as const, variant: "default" as const },
        { label: "Learn About Halal Finance", type: "view" as const, variant: "outline" as const },
      ],
    };
  };

  const handleSend = (message?: string) => {
    const text = (message ?? inputValue).trim();
    if (!text) return;

    const userMessage: CollabMessage = {
      id: Date.now().toString(),
      senderId: "1",
      senderName: "Amara Okafor",
      senderInitials: "AO",
      senderColor: "#10b981",
      role: "user",
      type: "text",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [...s.messages, userMessage] } : s
      )
    );
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = generateAIResponse(text, activeSession);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, messages: [...s.messages, aiReply] } : s
        )
      );
      setIsTyping(false);
    }, 1600);
  };

  const createNewSession = (type: "individual" | "group") => {
    const newSession: CollabSession = {
      id: `sess_${Date.now()}`,
      name: type === "individual" ? "New Individual Session" : "New Group Session",
      type,
      isActive: true,
      createdAt: new Date().toISOString(),
      participants: [
        { id: "1", name: "Amara Okafor", initials: "AO", color: "#10b981", isOnline: true, isTyping: false },
      ],
      messages: [
        {
          id: "init",
          senderId: "ai",
          senderName: "ShūrāBot",
          senderInitials: "SB",
          senderColor: "#059669",
          role: "assistant",
          type: "text",
          content: type === "individual"
            ? "As-salamu alaykum, Amara! This is your private session. I'm here to help with personal financial planning, goal-setting, or anything you'd like to think through before bringing to a group. What's on your mind?"
            : "A new group session is ready. Invite your group members using the button above and I'll provide shared, contextual guidance for your collective decision-making.",
          shariahCompliant: true,
          disclaimer: "Educational only. Not financial advice.",
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  };

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col lg:h-screen lg:overflow-hidden">
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="leading-tight">ShūrāBot</h1>
            <p className="text-xs text-gray-500">AI Co-Working Assistant · Shariah-Compliant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 border-0 hidden sm:flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live · Collaborative
          </Badge>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Sessions */}
        <div className="hidden lg:flex flex-col w-56 border-r border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="p-3 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sessions</div>
            <div className="space-y-1">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start h-8 text-xs"
                onClick={() => createNewSession("group")}
              >
                <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Group Session
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start h-8 text-xs"
                onClick={() => createNewSession("individual")}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Personal Session
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors group ${
                    activeSessionId === session.id ? "bg-emerald-50 border border-emerald-200" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {session.type === "group" ? (
                      <Users className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === session.id ? "text-emerald-600" : "text-gray-400"}`} />
                    ) : (
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === session.id ? "text-blue-600" : "text-gray-400"}`} />
                    )}
                    <span className={`text-xs font-medium truncate ${activeSessionId === session.id ? "text-emerald-800" : "text-gray-700"}`}>
                      {session.name}
                    </span>
                  </div>
                  <div className="flex -space-x-1 ml-5">
                    {session.participants.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-bold"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.initials[0]}
                      </div>
                    ))}
                    {session.participants.length > 3 && (
                      <div className="w-4 h-4 rounded-full border border-white bg-gray-300 flex items-center justify-center text-[8px] text-gray-600">
                        +{session.participants.length - 3}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Features */}
          <div className="p-3 border-t border-gray-200 space-y-1">
            {[
              { icon: <Zap className="w-3 h-3" />, label: "Scenario Sim", color: "text-amber-600" },
              { icon: <BookOpen className="w-3 h-3" />, label: "Scholar Hub", color: "text-blue-600" },
              { icon: <BarChart2 className="w-3 h-3" />, label: "Group Health", color: "text-purple-600" },
            ].map((f) => (
              <button key={f.label} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <span className={f.color}>{f.icon}</span> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center — Chat */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Session Header */}
          <div className="bg-white border-b border-gray-200 flex-shrink-0">
            <div className="px-4 py-3 flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activeSession.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    {activeSession.type === "group" ? "Group" : "Private"}
                  </Badge>
                  {activeSession.groupName && (
                    <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-100 text-emerald-700 border-0">
                      {activeSession.groupName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <PresenceBar participants={activeSession.participants} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5" ref={scrollRef}>
            {activeSession.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar initials="SB" color="#059669" isOnline />
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 0.15, 0.3].map((d) => (
                      <div
                        key={d}
                        className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-2">ShūrāBot is thinking…</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Scenarios Bar */}
          {showScenarioPanel && (
            <div className="border-t border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Quick Scenarios</span>
                <button onClick={() => setShowScenarioPanel(false)}>
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {quickScenarios.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => { handleSend(s.query); setShowScenarioPanel(false); }}
                    className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <span className="text-base">{s.icon}</span>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <button
                onClick={() => setShowScenarioPanel(!showScenarioPanel)}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-500" />
              </button>
              <div className="flex-1 relative">
                <Input
                  placeholder={`Message ${activeSession.type === "group" ? "group session" : "ShūrāBot"}…`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="pr-12"
                />
              </div>
              <Button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-emerald-600 hover:bg-emerald-700 w-9 h-9 p-0 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Shield className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] text-gray-400">All responses are Shariah-screened · Educational only, not financial advice · Privacy preserved</span>
            </div>
          </div>
        </div>

        {/* Right Panel — Insights */}
        <div className="hidden xl:flex flex-col w-72 border-l border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold">Proactive Insights</span>
              </div>
              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0">{visibleInsights.length}</Badge>
            </div>
            <p className="text-xs text-gray-500">ShūrāBot pushes insights without being asked.</p>
          </div>

          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2.5">
              {visibleInsights.map((insight) => (
                <div key={insight.id} className="relative">
                  <button
                    onClick={() => setInsightsDismissed((p) => [...p, insight.id])}
                    className="absolute top-2 right-2 z-10 text-gray-300 hover:text-gray-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <InsightCard insight={insight} onChat={(text) => handleSend(text)} />
                </div>
              ))}
              {visibleInsights.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                  <p className="text-xs">All caught up! No new insights.</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Scenarios */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Play className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-gray-700">Quick Scenarios</span>
            </div>
            <div className="space-y-1">
              {quickScenarios.slice(0, 4).map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.query)}
                  className="w-full flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg text-xs text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
                >
                  <span>{s.icon}</span>
                  <span className="truncate">{s.label}</span>
                  <ChevronRight className="w-3 h-3 ml-auto text-gray-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Halal Compliance Badge */}
          <div className="p-3 border-t border-gray-200">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">☪</span>
                <span className="text-xs font-semibold text-emerald-800">Shariah-Compliant AI</span>
              </div>
              <p className="text-[10px] text-emerald-700 leading-relaxed">
                All ShūrāBot responses are filtered for halal compliance. Riba-based instruments are automatically excluded. Educational content is verified against AAOIFI standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}