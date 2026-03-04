import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mockLogs = [
  { id: "LOG-001", actor: "Adeyemi Okonkwo", actorType: "internal_user", action: "rate.update", resource: "USD/NGN", before: "sell: 1,590", after: "sell: 1,595", ip: "102.89.23.45", timestamp: "2024-11-15 14:23:01" },
  { id: "LOG-002", actor: "System", actorType: "system", action: "transaction.status_change", resource: "TXN-78232", before: "pending", after: "held", ip: "-", timestamp: "2024-11-15 14:18:32" },
  { id: "LOG-003", actor: "Adeyemi Okonkwo", actorType: "internal_user", action: "customer.kyc_update", resource: "CUS-1001", before: "pending", after: "verified", ip: "102.89.23.45", timestamp: "2024-11-15 13:45:10" },
  { id: "LOG-004", actor: "Compliance Team", actorType: "internal_user", action: "approval.created", resource: "APR-002", before: "-", after: "Account freeze request", ip: "41.204.12.78", timestamp: "2024-11-15 13:30:00" },
  { id: "LOG-005", actor: "Treasury Ops", actorType: "internal_user", action: "va.created", resource: "VA-004", before: "-", after: "Created for CUS-1003", ip: "102.89.23.50", timestamp: "2024-11-15 12:15:22" },
  { id: "LOG-006", actor: "System", actorType: "system", action: "rate.auto_update", resource: "USD/GHS", before: "buy: 14.80", after: "buy: 14.85", ip: "-", timestamp: "2024-11-15 12:00:01" },
  { id: "LOG-007", actor: "Adeyemi Okonkwo", actorType: "internal_user", action: "user.login", resource: "usr_001", before: "-", after: "Login successful", ip: "102.89.23.45", timestamp: "2024-11-15 09:00:15" },
];

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = mockLogs.filter((log) => {
    const matchSearch = log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.action.startsWith(actionFilter);
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete activity trail for all portal actions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by actor, resource, action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted border-none"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-44 bg-muted border-none">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="rate">Rate Changes</SelectItem>
                <SelectItem value="transaction">Transactions</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="approval">Approvals</SelectItem>
                <SelectItem value="va">Virtual Accounts</SelectItem>
                <SelectItem value="user">User Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-border/60 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{log.actor}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="font-mono text-xs text-primary">{log.action}</span>
                      <span className="text-xs text-muted-foreground">on</span>
                      <span className="font-mono text-xs font-medium">{log.resource}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="text-xs text-muted-foreground">
                        <span className="text-destructive/70">{log.before}</span>
                        {log.before !== "-" && <span className="mx-1.5">→</span>}
                        <span className="text-success/70">{log.after}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-muted-foreground font-mono">{log.timestamp}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">IP: {log.ip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
