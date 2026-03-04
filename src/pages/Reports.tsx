import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Download, FileBarChart, Lock } from "lucide-react";
import { toast } from "sonner";

const reports = [
  { id: "RPT-001", name: "Daily Operations Report", type: "operational", date: "2024-11-15", roles: ["super_admin", "admin"] },
  { id: "RPT-002", name: "Settlement Report - Nov 2024", type: "settlement", date: "2024-11-14", roles: ["super_admin", "treasury", "finance"] },
  { id: "RPT-003", name: "Monthly Financial Summary", type: "financial", date: "2024-11-01", roles: ["super_admin", "finance"] },
  { id: "RPT-004", name: "Transaction Volume Report", type: "operational", date: "2024-11-15", roles: ["super_admin", "admin", "finance"] },
  { id: "RPT-005", name: "Provider Cost Analysis", type: "financial", date: "2024-11-10", roles: ["super_admin", "treasury", "finance"] },
  { id: "RPT-006", name: "Daily Settlement Reconciliation", type: "settlement", date: "2024-11-15", roles: ["super_admin", "treasury"] },
];

const typeClass: Record<string, string> = {
  operational: "bg-primary/15 text-primary",
  settlement: "bg-warning/15 text-warning",
  financial: "bg-success/15 text-success",
};

export default function Reports() {
  const { user, hasPermission } = useAuth();
  const role = user?.role;

  if (!hasPermission("reporting", "view")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">You don't have access to reports.</p>
        </div>
      </div>
    );
  }

  const visibleReports = reports.filter((r) => r.roles.includes(role ?? ""));
  const canExport = hasPermission("reporting", "export");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and download operational and financial reports</p>
        </div>
        {canExport && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Report generation started")}>
            <FileBarChart className="h-4 w-4" /> Generate Report
          </Button>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visibleReports.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors">
                <div className="flex items-center gap-4">
                  <FileBarChart className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeClass[r.type]}`}>{r.type}</span>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                  </div>
                </div>
                {canExport && (
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => toast.success(`Downloading ${r.name}`)}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
