import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

const mockApprovals = [
  { id: "APR-001", type: "Rate Change", item: "USD/NGN sell rate → 1,600", requestedBy: "Treasury Ops", status: "pending", createdAt: "10 min ago", priority: "high" },
  { id: "APR-002", type: "Account Freeze", item: "CUS-1003 (Kwame Mensah)", requestedBy: "Compliance Team", status: "pending", createdAt: "1 hr ago", priority: "high" },
  { id: "APR-003", type: "Act on Behalf", item: "Initiate transfer $25,000 for CUS-1000", requestedBy: "Admin Ops", status: "pending", createdAt: "2 hrs ago", priority: "medium" },
  { id: "APR-004", type: "KYC Override", item: "CUS-1001 manual verification", requestedBy: "Compliance Team", status: "approved", createdAt: "1 day ago", priority: "low" },
  { id: "APR-005", type: "Transaction Hold", item: "TXN-78220 release from hold", requestedBy: "Admin Ops", status: "rejected", createdAt: "2 days ago", priority: "medium" },
];

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-warning" />,
  approved: <CheckCircle className="h-4 w-4 text-success" />,
  rejected: <XCircle className="h-4 w-4 text-destructive" />,
};

const priorityClass: Record<string, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export default function Approvals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Approvals & Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and action pending approval requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-warning">
              {mockApprovals.filter(a => a.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Approved Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold font-mono text-success">1</div></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Rejected Today</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold font-mono text-destructive">1</div></CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="space-y-3">
            {mockApprovals.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors">
                <div className="flex items-center gap-4">
                  {statusIcon[a.status]}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{a.type}</span>
                      <Badge variant="outline" className="text-xs">{a.id}</Badge>
                      <span className={`text-xs font-medium uppercase ${priorityClass[a.priority]}`}>{a.priority}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{a.item}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">by {a.requestedBy} · {a.createdAt}</p>
                  </div>
                </div>
                {a.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10">Approve</Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">Reject</Button>
                  </div>
                )}
                {a.status !== "pending" && (
                  <Badge variant="outline" className={`capitalize ${a.status === "approved" ? "text-success" : "text-destructive"}`}>
                    {a.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
