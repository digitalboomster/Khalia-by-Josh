import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
} from "lucide-react";
import {
  capitalMetrics,
  portfolioAllocation,
  performanceData,
} from "../data/mockData";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function CapitalIntelligence() {
  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1>Capital Intelligence</h1>
        <p className="text-gray-500">
          AI-driven insights for optimal capital allocation and risk management
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {capitalMetrics.map((metric) => {
          const isGood = metric.status === "good";
          const isWarning = metric.status === "warning";
          const isCritical = metric.status === "critical";

          return (
            <Card key={metric.name}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.name}
                  </CardTitle>
                  <Badge
                    variant={
                      isGood
                        ? "default"
                        : isWarning
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {isGood ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {metric.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-semibold">{metric.value}%</div>
                <div
                  className={`text-sm flex items-center gap-1 mt-1 ${
                    metric.change > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.change > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(metric.change)}% from last period
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Intelligence Modules */}
      <Tabs defaultValue="allocation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
        </TabsList>

        {/* Capital Allocation Tab */}
        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <p className="text-sm text-gray-500">
                  Current capital distribution across asset classes
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioAllocation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, allocation }) =>
                        `${name}: ${allocation}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="allocation"
                    >
                      {portfolioAllocation.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Performance</CardTitle>
                <p className="text-sm text-gray-500">
                  Performance by asset class
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioAllocation.map((item, index) => (
                    <div key={item.asset}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">
                            {item.asset}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">
                            ₦{(item.value / 1000000).toFixed(1)}M
                          </span>
                          <span
                            className={`ml-2 ${
                              item.change > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.change > 0 ? "+" : ""}
                            {item.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Allocation Efficiency Over Time</CardTitle>
              <p className="text-sm text-gray-500">
                Historical allocation efficiency score
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={performanceData.map((d, i) => ({
                    ...d,
                    efficiency: 82 + i * 0.9,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Efficiency Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Monitoring Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Health Dashboard</CardTitle>
              <p className="text-sm text-gray-500">
                Real-time monitoring of portfolio metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-900">
                      Diversification
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-green-900">
                    78.5%
                  </div>
                  <p className="text-xs text-green-700 mt-1">Healthy spread</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-900">Volatility</span>
                  </div>
                  <div className="text-2xl font-semibold text-blue-900">
                    12.3%
                  </div>
                  <p className="text-xs text-blue-700 mt-1">Within target</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="text-sm text-amber-900">Stress Level</span>
                  </div>
                  <div className="text-2xl font-semibold text-amber-900">
                    23.1%
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Monitor closely
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portfolioAllocation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="asset" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="allocation" fill="#10b981" name="Allocation %" />
                  <Bar
                    dataKey="change"
                    fill="#3b82f6"
                    name="Change %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Indicators</CardTitle>
                <p className="text-sm text-gray-500">
                  Current risk profile and exposures
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Default Risk</span>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <div className="text-2xl font-semibold mb-1">4.2%</div>
                  <p className="text-sm text-gray-500">
                    Predicted default probability for SME portfolio
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Liquidity Risk</span>
                    <Badge>Low</Badge>
                  </div>
                  <div className="text-2xl font-semibold mb-1">23.4%</div>
                  <p className="text-sm text-gray-500">
                    Liquidity stress indicator improving
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Concentration Risk</span>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                  <div className="text-2xl font-semibold mb-1">68.3%</div>
                  <p className="text-sm text-gray-500">
                    Consider diversification strategies
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stress Test Scenarios</CardTitle>
                <p className="text-sm text-gray-500">
                  Impact of macroeconomic shocks
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">
                      FX Volatility (+15%)
                    </span>
                  </div>
                  <p className="text-sm text-red-800">
                    Portfolio impact: -8.2% • Estimated loss: ₦4.1M
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-amber-900">
                      Interest Rate Hike (+200bps)
                    </span>
                  </div>
                  <p className="text-sm text-amber-800">
                    Portfolio impact: -5.4% • Estimated loss: ₦2.7M
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Sector Recession
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Portfolio impact: -12.1% • Estimated loss: ₦6.05M
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Treasury Optimization Tab */}
        <TabsContent value="treasury" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Optimization Recommendations</CardTitle>
              <p className="text-sm text-gray-500">
                AI-driven suggestions for idle liquidity deployment
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">
                    Deploy ₦5M in 90-day Treasury Bills
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Current idle liquidity can be optimized with low-risk government securities
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">Expected return: 8.2%</span>
                  <span className="text-gray-500">Risk score: 1.2/10</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">
                    Rebalance SME loan portfolio
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Reduce exposure to high-risk sectors by 12%
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">Risk reduction: 15%</span>
                  <span className="text-gray-500">
                    Timeline: 30-45 days
                  </span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">
                    Increase VC allocation by 5%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Market conditions favorable for tech sector investments
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-blue-600">Potential upside: 18-22%</span>
                  <span className="text-gray-500">Risk score: 7.5/10</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold mb-1">12.8%</div>
                <p className="text-sm text-gray-500">
                  Stable deposit base
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Surge Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold mb-1">Low</div>
                <p className="text-sm text-gray-500">
                  No immediate concerns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimal Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold mb-1">90 days</div>
                <p className="text-sm text-gray-500">
                  Recommended holding period
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
