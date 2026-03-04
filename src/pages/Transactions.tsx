import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const mockTransactions = Array.from({ length: 25 }, (_, i) => ({
  id: `TXN-${78234 - i}`,
  customer: ["Folake Adeyemi", "Chinedu Obi", "Amara Diallo", "Kwame Mensah", "Fatima Bello"][i % 5],
  customerId: `CUS-${1000 + (i % 5)}`,
  type: ["Transfer", "Withdrawal", "Add Funds", "Conversion"][i % 4],
  amount: (Math.random() * 50000 + 100).toFixed(2),
  currency: ["USD", "NGN", "GHS", "KES"][i % 4],
  status: ["completed", "pending", "failed", "held"][i % 4],
  rateUsed: (1 + Math.random() * 0.05).toFixed(4),
  fees: (Math.random() * 50).toFixed(2),
  reference: `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
  riskFlag: i % 7 === 0,
  bankDetails: `****${Math.floor(1000 + Math.random() * 9000)}`,
  settlementRef: `STL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

const statusClass: Record<string, string> = {
  completed: "status-badge status-completed",
  pending: "status-badge status-pending",
  failed: "status-badge status-failed",
  held: "status-badge status-held",
};

export default function Transactions() {
  const { user, hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const role = user?.role;

  const filtered = mockTransactions.filter((tx) => {
    const matchSearch = tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.customer.toLowerCase().includes(search.toLowerCase()) ||
      tx.reference.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  // Role-based column visibility
  const showAmount = role !== "sales" && role !== "support";
  const showReference = role !== "sales" && role !== "support";
  const showRateUsed = role === "treasury" || role === "super_admin" || role === "admin";
  const showFees = role === "treasury" || role === "super_admin";
  const showBankDetails = role !== "sales" && role !== "support";
  const showRiskFlag = role === "compliance" || role === "super_admin";
  const showSettlement = role === "treasury" || role === "super_admin";
  const canExport = hasPermission("transactions", "export");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} transactions found
            {(role === "sales" || role === "support" || role === "finance") && <span className="ml-2 text-warning text-xs">(Limited view)</span>}
          </p>
        </div>
        {canExport && (
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, customer, reference..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 bg-muted border-none"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40 bg-muted border-none">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="held">Held</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  <th className="data-table-header text-left py-3 px-2">Currency</th>
                  <th className="data-table-header text-center py-3 px-2">Status</th>
                  {showRiskFlag && <th className="data-table-header text-center py-3 px-2">Risk</th>}
                  {showRateUsed && <th className="data-table-header text-right py-3 px-2">Rate</th>}
                  {showFees && <th className="data-table-header text-right py-3 px-2">Fees</th>}
                  {showSettlement && <th className="data-table-header text-left py-3 px-2">Settlement</th>}
                  {showReference && <th className="data-table-header text-left py-3 px-2">Reference</th>}
                  <th className="data-table-header text-right py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="py-3 px-2 font-mono text-sm text-primary">{tx.id}</td>
                    <td className="py-3 px-2 text-sm">{tx.customer}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{tx.type}</td>
                    {showAmount && <td className="py-3 px-2 text-sm font-mono text-right">${tx.amount}</td>}
                    <td className="py-3 px-2 text-sm font-mono">{tx.currency}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={statusClass[tx.status]}>{tx.status}</span>
                    </td>
                    {showRiskFlag && (
                      <td className="py-3 px-2 text-center">
                        {tx.riskFlag && <AlertTriangle className="h-4 w-4 text-warning inline-block" />}
                      </td>
                    )}
                    {showRateUsed && <td className="py-3 px-2 text-sm font-mono text-right">{tx.rateUsed}</td>}
                    {showFees && <td className="py-3 px-2 text-sm font-mono text-right">${tx.fees}</td>}
                    {showSettlement && <td className="py-3 px-2 text-sm font-mono text-muted-foreground">{tx.settlementRef}</td>}
                    {showReference && <td className="py-3 px-2 text-sm font-mono text-muted-foreground">{tx.reference}</td>}
                    <td className="py-3 px-2 text-sm text-muted-foreground text-right">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
