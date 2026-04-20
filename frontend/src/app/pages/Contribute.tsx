import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  ArrowLeft, CheckCircle2, DollarSign, Shield, AlertCircle,
  CreditCard, Smartphone, Building2, Clock, Zap, ChevronRight,
  Flame, TrendingUp, Users,
} from "lucide-react";
import { userGroups, walletBalance } from "../data/mockData";

const PAYMENT_METHODS = [
  { id: "wallet", icon: <DollarSign className="w-5 h-5 text-emerald-600" />, label: "Khalia Wallet", desc: `Balance: ₦${walletBalance.ngn.toLocaleString()}`, available: true },
  { id: "bank", icon: <Building2 className="w-5 h-5 text-blue-600" />, label: "Bank Transfer", desc: "GTBank • ••••5432", available: true },
  { id: "card", icon: <CreditCard className="w-5 h-5 text-purple-600" />, label: "Debit Card", desc: "Mastercard ••••8821", available: true },
  { id: "ussd", icon: <Smartphone className="w-5 h-5 text-amber-600" />, label: "USSD", desc: "*737# (GTBank)", available: true },
];

export function Contribute() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const group = userGroups.find((g) => g.id === groupId);

  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"pay" | "confirm" | "processing" | "success">("pay");
  const [note, setNote] = useState("");

  if (!group) {
    return (
      <div className="p-4 lg:p-8">
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold mb-2">Group Not Found</h3>
            <Link to="/groups"><Button>Back to Groups</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fee = Math.round(group.contributionAmount * 0.001); // 0.1% platform fee
  const total = group.contributionAmount + fee;

  const daysLeft = Math.max(0, Math.ceil((new Date(group.nextPayout).getTime() - Date.now()) / 86400000));
  const streak = group.contributionStreak ?? 0;

  // ── Processing ─────────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="p-4 lg:p-8 max-w-md mx-auto">
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="font-semibold text-gray-700">Processing payment…</div>
            <p className="text-sm text-gray-500">Securely transferring ₦{total.toLocaleString()} to group escrow.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === "success") {
    const newStreak = streak + 1;
    return (
      <div className="p-4 lg:p-8 max-w-md mx-auto">
        <Card>
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="text-emerald-700">Payment Confirmed! 🎉</h2>
              <p className="text-gray-500 mt-2">
                ₦{group.contributionAmount.toLocaleString()} contributed to <strong>{group.name}</strong>
              </p>
            </div>

            {/* Receipt */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left space-y-2 text-sm">
              <div className="font-medium text-gray-700 mb-2">Receipt</div>
              {[
                ["Group", group.name],
                ["Amount", `₦${group.contributionAmount.toLocaleString()}`],
                ["Platform fee", `₦${fee.toLocaleString()}`],
                ["Total paid", `₦${total.toLocaleString()}`],
                ["Payment method", PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? ""],
                ["Reference", `KHL-PAY-${Math.random().toString(36).slice(2, 9).toUpperCase()}`],
                ["Date", new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-1 border-b last:border-0 border-gray-100">
                  <span className="text-gray-500">{l}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>

            {/* Streak celebration */}
            <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200 rounded-xl">
              <span className="text-3xl">🔥</span>
              <div className="text-left">
                <div className="font-semibold text-orange-700">{newStreak}-Month Streak!</div>
                <p className="text-xs text-orange-600">You're in the top 15% of contributors in this group.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(`/groups/${group.id}`)}>
                View Group
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 flex-1" onClick={() => navigate("/")}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Confirm ────────────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="p-4 lg:p-8 max-w-md mx-auto space-y-5">
        <Button variant="ghost" size="sm" onClick={() => setStep("pay")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div>
          <h1>Confirm Payment</h1>
          <p className="text-gray-500 text-sm mt-1">Review and enter your PIN to authorise.</p>
        </div>

        <Card>
          <CardContent className="pt-5 space-y-4">
            {/* Summary */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <div className="text-3xl font-bold text-emerald-700">₦{total.toLocaleString()}</div>
              <div className="text-sm text-emerald-600 mt-1">Total including ₦{fee.toLocaleString()} fee</div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                ["To", group.name],
                ["Type", "Monthly Contribution"],
                ["Via", PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ?? ""],
                ["Fee (0.1%)", `₦${fee.toLocaleString()}`],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-1.5 border-b last:border-0 border-gray-100">
                  <span className="text-gray-500">{l}</span>
                  <span className="font-medium text-gray-800">{v}</span>
                </div>
              ))}
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter Transaction PIN</label>
              <Input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="text-center tracking-[0.5em] text-xl"
              />
              <p className="text-xs text-gray-400 mt-1 text-center">4-digit transaction PIN</p>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              256-bit encrypted · funds go directly to group escrow · Khalia never holds your money
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={pin.length < 4}
          onClick={() => {
            setStep("processing");
            setTimeout(() => setStep("success"), 2200);
          }}
        >
          Authorise ₦{total.toLocaleString()} Payment
        </Button>
      </div>
    );
  }

  // ── Pay ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-8 max-w-xl mx-auto space-y-5">
      <Link to={`/groups/${group.id}`}>
        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Group</Button>
      </Link>

      <div>
        <h1>Make Contribution</h1>
        <p className="text-gray-500 text-sm mt-1">Contribute to your group and keep the streak alive.</p>
      </div>

      {/* Group Banner */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold">
                {group.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-emerald-900">{group.name}</div>
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <Users className="w-3 h-3" />{group.members} members
                  {streak > 0 && <><Flame className="w-3 h-3 text-orange-500" /><span className="text-orange-600">{streak}mo streak</span></>}
                </div>
              </div>
            </div>
            {daysLeft <= 5 && (
              <Badge className="bg-red-100 text-red-700 border-0 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {daysLeft}d left
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amount */}
      <Card>
        <CardHeader><CardTitle>Contribution Amount</CardTitle></CardHeader>
        <CardContent>
          <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200 text-center">
            <div className="text-xs text-gray-500 mb-1">Fixed contribution</div>
            <div className="text-4xl font-bold text-gray-900">₦{group.contributionAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1 capitalize">{group.frequency} · per member</div>
          </div>

          {note !== undefined && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Note to group admin <span className="text-gray-400 text-xs">(optional)</span></label>
              <Input
                placeholder="e.g. Paying 3 days early — see you next cycle!"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === method.id ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {method.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm text-gray-800">{method.label}</div>
                <div className="text-xs text-gray-500">{method.desc}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === method.id ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
              }`}>
                {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm">
            {[
              ["Contribution", `₦${group.contributionAmount.toLocaleString()}`],
              ["Platform fee (0.1%)", `₦${fee.toLocaleString()}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">{l}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 font-semibold">
              <span>Total</span>
              <span className="text-emerald-700">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Progress Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">After your contribution</span>
          </div>
          <div className="text-xs text-blue-700">
            Group pool will reach <strong>₦{(group.totalPool + group.contributionAmount).toLocaleString()}</strong>
            {group.goalProgress && <span> · {Math.min(100, group.goalProgress + 1)}% of goal</span>}
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-600">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Your streak extends to <strong>{streak + 1} months!</strong>
            </div>
          )}
        </CardContent>
      </Card>

      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 py-3" onClick={() => setStep("confirm")}>
        Continue to Confirm <ChevronRight className="w-4 h-4 ml-2" />
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Shield className="w-3 h-3 text-emerald-500" />
        Funds go directly to group escrow · Khalia facilitates only
      </div>
    </div>
  );
}
