import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, Eye, RefreshCw } from "lucide-react";

const mockRates = [
  { pair: "USD/NGN", buy: "1,580.00", sell: "1,595.00", mid: "1,587.50", source: "Manual", updatedBy: "Treasury Ops", updatedAt: "5 min ago" },
  { pair: "USD/GHS", buy: "14.85", sell: "15.10", mid: "14.97", source: "Provider", updatedBy: "System", updatedAt: "1 min ago" },
  { pair: "USD/KES", buy: "128.50", sell: "130.20", mid: "129.35", source: "Manual", updatedBy: "Treasury Ops", updatedAt: "12 min ago" },
  { pair: "GBP/NGN", buy: "2,010.00", sell: "2,035.00", mid: "2,022.50", source: "Provider", updatedBy: "System", updatedAt: "1 min ago" },
  { pair: "EUR/NGN", buy: "1,720.00", sell: "1,745.00", mid: "1,732.50", source: "Manual", updatedBy: "Treasury Ops", updatedAt: "30 min ago" },
];

export default function Rates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rates & Treasury</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage exchange rates and spreads</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Rates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Pairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{mockRates.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Manual Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{mockRates.filter(r => r.source === "Manual").length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Provider Feeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{mockRates.filter(r => r.source === "Provider").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Currency Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="data-table-header text-left py-3 px-2">Pair</th>
                  <th className="data-table-header text-right py-3 px-2">Buy Rate</th>
                  <th className="data-table-header text-right py-3 px-2">Sell Rate</th>
                  <th className="data-table-header text-right py-3 px-2">Mid Rate</th>
                  <th className="data-table-header text-center py-3 px-2">Source</th>
                  <th className="data-table-header text-left py-3 px-2">Updated By</th>
                  <th className="data-table-header text-right py-3 px-2">Updated</th>
                  <th className="data-table-header text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRates.map((r) => (
                  <tr key={r.pair} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-sm font-medium text-primary">{r.pair}</td>
                    <td className="py-3 px-2 font-mono text-sm text-right">{r.buy}</td>
                    <td className="py-3 px-2 font-mono text-sm text-right">{r.sell}</td>
                    <td className="py-3 px-2 font-mono text-sm text-right text-muted-foreground">{r.mid}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={r.source === "Manual" ? "default" : "secondary"} className="text-xs">
                        {r.source}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{r.updatedBy}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground text-right">{r.updatedAt}</td>
                    <td className="py-3 px-2 text-right">
                      <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
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
