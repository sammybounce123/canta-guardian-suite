import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, DollarSign, TrendingUp, Wallet, Lock } from "lucide-react";

const metrics = [
  { title: "Total Payouts (MTD)", value: "$4,231,890", change: "+8.2%", icon: DollarSign, roles: ["super_admin", "treasury", "admin", "finance"] },
  { title: "Revenue (MTD)", value: "$187,340", change: "+5.1%", icon: TrendingUp, roles: ["super_admin", "treasury", "finance"] },
  { title: "Provider Costs", value: "$42,100", change: "-2.3%", icon: Wallet, roles: ["super_admin", "treasury", "finance"] },
  { title: "Net Margin", value: "$145,240", change: "+7.8%", icon: BarChart3, roles: ["super_admin", "treasury", "finance"] },
];

export default function FinancialMetrics() {
  const { user, hasPermission } = useAuth();
  const role = user?.role;

  if (!hasPermission("financial_metrics", "view")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">You don't have access to financial metrics.</p>
        </div>
      </div>
    );
  }

  const visibleMetrics = metrics.filter((m) => m.roles.includes(role ?? ""));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Financial Metrics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {role === "admin" ? "Payout overview (limited view)" : "Revenue, costs, and payout metrics"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleMetrics.map((m) => (
          <Card key={m.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.title}</CardTitle>
              <m.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{m.value}</div>
              <p className={`text-xs mt-1 ${m.change.startsWith("+") ? "text-success" : "text-destructive"}`}>{m.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="data-table-header text-left py-3 px-2">Month</th>
                  <th className="data-table-header text-right py-3 px-2">Payouts</th>
                  <th className="data-table-header text-right py-3 px-2">Revenue</th>
                  <th className="data-table-header text-right py-3 px-2">Costs</th>
                  <th className="data-table-header text-right py-3 px-2">Net</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { month: "November 2024", payouts: "$4,231,890", revenue: "$187,340", costs: "$42,100", net: "$145,240" },
                  { month: "October 2024", payouts: "$3,912,450", revenue: "$178,200", costs: "$43,500", net: "$134,700" },
                  { month: "September 2024", payouts: "$3,654,200", revenue: "$165,800", costs: "$39,200", net: "$126,600" },
                ].map((row) => (
                  <tr key={row.month} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 text-sm font-medium">{row.month}</td>
                    <td className="py-3 px-2 text-sm font-mono text-right">{row.payouts}</td>
                    <td className="py-3 px-2 text-sm font-mono text-right text-success">{row.revenue}</td>
                    <td className="py-3 px-2 text-sm font-mono text-right text-destructive">{row.costs}</td>
                    <td className="py-3 px-2 text-sm font-mono text-right font-medium">{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
