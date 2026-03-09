import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  ArrowLeft, CheckCircle2, AlertCircle, Users, DollarSign,
  Clock, Shield, Flame, ArrowRight, Check, X, Calendar, Zap,
  ChevronRight,
} from "lucide-react";
import { marketplaceGroups, userGroups, currentUser } from "../data/mockData";

// ─── Eligibility Check ────────────────────────────────────────────────────────
const ELIGIBILITY_CHECKS = [
  { id: "kyc", label: "Identity Verified (KYC)", desc: "Your BVN and ID are confirmed", status: "pass" as const },
  { id: "bvn", label: "BVN Linked", desc: "Bank Verification Number connected", status: "pass" as const },
  { id: "wallet", label: "Khalia Wallet Active", desc: "Wallet funded and operational", status: "pass" as const },
  { id: "capacity", label: "Sufficient Financial Capacity", desc: "Income can support monthly commitment", status: "pass" as const },
];

const COMMITMENT_ITEMS = [
  "I understand this is a binding financial commitment for the group's cycle duration.",
  "I will contribute on time each cycle, as per the agreed schedule.",
  "I accept the default penalty if I miss a contribution without prior notice.",
  "I understand that early exit requires the agreed notice period and group vote.",
  "I confirm this group structure aligns with my Shariah compliance requirements.",
  "I acknowledge that Khalia facilitates — it does not custody funds or guarantee returns.",
];

// ─── Schedule Preview ─────────────────────────────────────────────────────────
function SchedulePreview({ contribution, frequency, startMonth }: { contribution: number; frequency: string; startMonth: string }) {
  const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 min-w-max pb-2">
        {months.slice(0, 6).map((m, i) => (
          <div
            key={m}
            className={`flex flex-col items-center p-3 rounded-xl border-2 min-w-[72px] transition-colors ${
              i === 0 ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className={`text-xs font-semibold mb-1 ${i === 0 ? "text-emerald-700" : "text-gray-500"}`}>{m}</div>
            <div className={`text-xs font-bold ${i === 0 ? "text-emerald-600" : "text-gray-700"}`}>₦{(contribution / 1000).toFixed(0)}k</div>
            {i === 0 && <div className="text-[9px] text-emerald-500 mt-0.5">first due</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function JoinGroup() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const allGroups = [...marketplaceGroups, ...userGroups];
  const group = allGroups.find((g) => g.id === groupId);

  const [step, setStep] = useState<"review" | "commitment" | "form" | "submitting" | "success">("review");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [motivation, setMotivation] = useState("");
  const [referral, setReferral] = useState("");

  const toggleCheck = (i: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const allChecked = checkedItems.size === COMMITMENT_ITEMS.length;

  const handleSubmit = () => {
    setStep("submitting");
    setTimeout(() => setStep("success"), 2000);
  };

  if (!group) {
    return (
      <div className="p-4 lg:p-8">
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold mb-2">Group Not Found</h3>
            <Link to="/marketplace"><Button>Back to Marketplace</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeLabels: Record<string, string> = { rosca: "ROSCA", savings: "Savings Circle", investment: "Investment Circle", "co-buying": "Co-Ownership" };

  // ── Success State ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="p-4 lg:p-8 max-w-lg mx-auto">
        <Card>
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-emerald-700">Request Submitted! 🎉</h2>
              <p className="text-gray-500 mt-2">
                Your request to join <strong>{group.name}</strong> has been sent to the group admin.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left space-y-2 text-sm">
              <div className="font-medium text-gray-700 mb-2">What happens next?</div>
              {[
                { icon: "⏳", step: "Admin reviews your request (within 48 hours)" },
                { icon: "📩", step: "You'll receive an in-app notification on approval" },
                { icon: "💰", step: "First contribution due on your confirmed start date" },
                { icon: "🤖", step: "ShūrāBot will send you an onboarding guide" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-2 text-gray-600">
                  <span>{s.icon}</span><span>{s.step}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 text-left">
              <strong>Reference ID:</strong> KHL-JR-{Math.random().toString(36).slice(2, 8).toUpperCase()}
              <br />Keep this for your records.
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/groups")}>My Groups</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate("/shurabot")}>
                <Zap className="w-4 h-4 mr-2" /> Open ShūrāBot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Submitting ─────────────────────────────────────────────────────────────
  if (step === "submitting") {
    return (
      <div className="p-4 lg:p-8 max-w-lg mx-auto">
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="font-semibold text-gray-700">Submitting your request…</div>
            <p className="text-sm text-gray-500">Running eligibility checks and sending to group admin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link to={`/marketplace/${group.id}`}>
        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Group</Button>
      </Link>

      {/* Header */}
      <div>
        <h1>Join Request</h1>
        <p className="text-gray-500 mt-1">Complete the steps below to request membership in this group.</p>
      </div>

      {/* Group Summary Banner */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                {group.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-emerald-900">{group.name}</div>
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <span>{typeLabels[group.type]}</span>
                  <span>·</span>
                  <span>{group.members} members</span>
                  {group.contributionStreak && <><span>·</span><Flame className="w-3 h-3 text-orange-500" /><span className="text-orange-600">{group.contributionStreak}mo streak</span></>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-emerald-700">₦{group.contributionAmount.toLocaleString()}</div>
              <div className="text-xs text-emerald-600 capitalize">{group.frequency}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step: Review */}
      {step === "review" && (
        <div className="space-y-5">
          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" /> Eligibility Check
              </CardTitle>
              <p className="text-sm text-gray-500">Your account is automatically checked against group requirements.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {ELIGIBILITY_CHECKS.map((check) => (
                <div key={check.id} className={`flex items-center gap-3 p-3 rounded-xl border ${check.status === "pass" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  {check.status === "pass"
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    : <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  }
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${check.status === "pass" ? "text-emerald-800" : "text-red-800"}`}>{check.label}</div>
                    <div className="text-xs text-gray-500">{check.desc}</div>
                  </div>
                  <Badge className={`text-[10px] h-4 border-0 ${check.status === "pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {check.status === "pass" ? "Pass" : "Fail"}
                  </Badge>
                </div>
              ))}
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl mt-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <strong>All checks passed.</strong> You meet the eligibility requirements for this group.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Profile */}
          <Card>
            <CardHeader><CardTitle>Your Member Profile</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl font-semibold">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{currentUser.name}</div>
                  <div className="text-sm text-gray-500">{currentUser.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                    <span className="text-xs text-orange-600 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" /> {currentUser.contributionStreak}-month streak
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="font-semibold text-emerald-600">{currentUser.reliabilityScore}%</div>
                  <div className="text-xs text-gray-500">Reliability</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="font-semibold text-blue-600">{userGroups.length}</div>
                  <div className="text-xs text-gray-500">Active Groups</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="font-semibold text-purple-600">{currentUser.wellnessScore}%</div>
                  <div className="text-xs text-gray-500">Wellness Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" /> Your Payment Schedule
              </CardTitle>
              <p className="text-sm text-gray-500">Contributions due every {group.frequency === "monthly" ? "month" : "week"} once approved</p>
            </CardHeader>
            <CardContent>
              <SchedulePreview contribution={group.contributionAmount} frequency={group.frequency} startMonth="Mar 2026" />
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600 p-3 bg-gray-50 rounded-xl">
                <span>Annual commitment</span>
                <span className="font-semibold text-gray-800">
                  ₦{(group.contributionAmount * (group.frequency === "monthly" ? 12 : 52)).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep("commitment")}>
            Continue to Commitment <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step: Commitment */}
      {step === "commitment" && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Member Commitment Agreement</CardTitle>
              <p className="text-sm text-gray-500">
                Please read and acknowledge each commitment. All {COMMITMENT_ITEMS.length} items must be confirmed.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {COMMITMENT_ITEMS.map((item, i) => (
                <div
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    checkedItems.has(i) ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    checkedItems.has(i) ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                  }`}>
                    {checkedItems.has(i) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-gray-500">{checkedItems.size}/{COMMITMENT_ITEMS.length} acknowledged</span>
                {allChecked && <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> All confirmed</span>}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep("review")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={!allChecked}
              onClick={() => setStep("form")}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Form */}
      {step === "form" && (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Application</CardTitle>
              <p className="text-sm text-gray-500">Help the group admin understand who you are.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Why do you want to join this group? <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full min-h-[110px] px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  placeholder="e.g. I want to build a disciplined savings habit with like-minded professionals, and this group's 7-month streak shows the level of commitment I'm looking for…"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  maxLength={400}
                />
                <div className="text-xs text-gray-400 mt-1 text-right">{motivation.length}/400</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  How did you hear about this group? <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. Referred by Chidi Nwosu, found on Marketplace…"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                />
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  Your application is reviewed by the group admin within 48 hours. Joining is not guaranteed — the group may be full or have specific membership criteria.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Final Summary */}
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-4 pb-4">
              <div className="text-sm font-medium text-gray-700 mb-3">Application Summary</div>
              <div className="space-y-1.5 text-sm">
                {[
                  ["Group", group.name],
                  ["Your commitment", `₦${group.contributionAmount.toLocaleString()} / ${group.frequency}`],
                  ["Your reliability score", `${currentUser.reliabilityScore}%`],
                  ["Eligibility", "✅ All checks passed"],
                  ["Commitments", `✅ All ${COMMITMENT_ITEMS.length} acknowledged`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep("commitment")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={motivation.trim().length < 20}
              onClick={handleSubmit}
            >
              Submit Request 🚀
            </Button>
          </div>
          <p className="text-center text-xs text-gray-400">
            {motivation.trim().length < 20 && motivation.length > 0 ? "Please write at least 20 characters" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
