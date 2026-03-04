import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ArrowLeftRight, AlertTriangle, TrendingUp, Building2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const allStats = [
  { title: "Total Volume (24h)", value: "$2,847,392", change: "+12.5%", up: true, icon: DollarSign, roles: ["super_admin", "admin", "treasury"] },
  { title: "Active Customers", value: "3,284", change: "+4.2%", up: true, icon: Users, roles: ["super_admin", "admin", "sales", "compliance"] },
  { title: "Transactions (24h)", value: "1,847", change: "-2.1%", up: false, icon: ArrowLeftRight, roles: ["super_admin", "admin", "treasury", "compliance"] },
  { title: "Pending Reviews", value: "23", change: "+8", up: false, icon: AlertTriangle, roles: ["super_admin", "admin", "compliance"] },
  { title: "Avg Rate Spread", value: "1.32%", change: "-0.05%", up: true, icon: TrendingUp, roles: ["super_admin", "treasury"] },
  { title: "Active VAs", value: "1,204", change: "+15", up: true, icon: Building2, roles: ["super_admin", "admin", "treasury"] },
];

const recentTransactions = [
  { id: "TXN-78234", customer: "Folake Adeyemi", amount: "$12,500.00", type: "Transfer", status: "completed", time: "2 min ago" },
  { id: "TXN-78233", customer: "Chinedu Obi", amount: "$3,200.00", type: "Withdrawal", status: "pending", time: "5 min ago" },
  { id: "TXN-78232", customer: "Amara Diallo", amount: "$45,000.00", type: "Transfer", status: "held", time: "12 min ago" },
  { id: "TXN-78231", customer: "Kwame Mensah", amount: "$890.00", type: "Add Funds", status: "completed", time: "18 min ago" },
  { id: "TXN-78230", customer: "Fatima Bello", amount: "$7,100.00", type: "Transfer", status: "failed", time: "25 min ago" },
];

const statusClass: Record<string, string> = {
  completed: "status-badge status-completed",
  pending: "status-badge status-pending",
  failed: "status-badge status-failed",
  held: "status-badge status-held",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? "sales";

  const visibleStats = allStats.filter((s) => s.roles.includes(role));
  const showAmount = role !== "sales";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
          {role === "sales" && "Customer overview and onboarding metrics"}
          {role === "compliance" && "Compliance queue and review metrics"}
          {role === "treasury" && "Treasury overview, volumes, and rates"}
          {role === "admin" && "Operations overview"}
          {role === "super_admin" && "Full operations overview"}
          </p>
        </div>
        {(role === "sales" || role === "admin" || role === "super_admin") && (
          <Button onClick={() => navigate("/onboarding/new")} className="gap-2">
            <UserPlus className="h-4 w-4" /> Onboard Customer
          </Button>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(visibleStats.length, 4)} gap-4`}>
        {visibleStats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
              <div className={`flex items-center text-xs mt-1 ${stat.up ? "text-success" : "text-destructive"}`}>
                {stat.up ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="data-table-header text-left py-3 px-2">ID</th>
                  <th className="data-table-header text-left py-3 px-2">Customer</th>
                  <th className="data-table-header text-left py-3 px-2">Type</th>
                  {showAmount && <th className="data-table-header text-right py-3 px-2">Amount</th>}
                  <th className="data-table-header text-center py-3 px-2">Status</th>
                  <th className="data-table-header text-right py-3 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-sm text-primary">{tx.id}</td>
                    <td className="py-3 px-2 text-sm">{tx.customer}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{tx.type}</td>
                    {showAmount && <td className="py-3 px-2 text-sm font-mono text-right">{tx.amount}</td>}
                    <td className="py-3 px-2 text-center">
                      <span className={statusClass[tx.status]}>{tx.status}</span>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground text-right">{tx.time}</td>
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
