import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  CreditCard,
  Wallet as WalletIcon,
} from "lucide-react";
import { recentTransactions, walletBalance } from "../data/mockData";

export function Wallet() {
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1>Wallet</h1>
        <p className="text-gray-500">
          Manage your funds, view transactions, and transfer money
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm font-medium">
              Nigerian Naira Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-4">
              ₦{walletBalance.ngn.toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <Download className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm font-medium">
              USD Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-4">
              ${walletBalance.usd.toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                <Download className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">Fund Wallet</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Download className="w-6 h-6" />
              <span className="text-sm">Withdraw</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <WalletIcon className="w-6 h-6" />
              <span className="text-sm">Transfer</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Plus className="w-6 h-6" />
              <span className="text-sm">Pay Group</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                All your wallet activities
              </p>
            </div>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-6">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === "contribution" ||
                        transaction.type === "investment"
                          ? "bg-red-100"
                          : "bg-green-100"
                      }`}
                    >
                      {transaction.type === "contribution" ||
                      transaction.type === "investment" ? (
                        <ArrowDownRight className="w-6 h-6 text-red-600" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium capitalize flex items-center gap-2">
                        {transaction.type}
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      {transaction.groupName && (
                        <div className="text-sm text-gray-500">
                          {transaction.groupName}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {new Date(transaction.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-right ${
                      transaction.type === "contribution" ||
                      transaction.type === "investment"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    <div className="font-semibold">
                      {transaction.type === "contribution" ||
                      transaction.type === "investment"
                        ? "-"
                        : "+"}
                      {transaction.currency === "NGN" ? "₦" : "$"}
                      {transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.currency}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="contributions" className="space-y-3 mt-6">
              {recentTransactions
                .filter((t) => t.type === "contribution")
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                        <ArrowDownRight className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.groupName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-red-600">
                      <div className="font-semibold">
                        -₦{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="payouts" className="space-y-3 mt-6">
              {recentTransactions
                .filter((t) => t.type === "payout")
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                        <ArrowUpRight className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.groupName}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-green-600">
                      <div className="font-semibold">
                        +₦{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="withdrawals" className="space-y-3 mt-6">
              {recentTransactions
                .filter((t) => t.type === "withdrawal")
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                        <ArrowUpRight className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Withdrawal to Bank</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-green-600">
                      <div className="font-semibold">
                        +₦{transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Linked Bank Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Linked Bank Accounts</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Manage your connected accounts
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  GT
                </div>
                <div>
                  <div className="font-medium">GTBank</div>
                  <div className="text-sm text-gray-500">****8745</div>
                </div>
              </div>
              <Badge>Primary</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white font-semibold">
                  UB
                </div>
                <div>
                  <div className="font-medium">UBA</div>
                  <div className="text-sm text-gray-500">****3421</div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
