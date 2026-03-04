import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockVAs = [
  { id: "VA-001", customer: "Folake Adeyemi", accountName: "Folake Adeyemi", accountNumber: "0123456789", bank: "Sterling Bank", provider: "Provider A", status: "active", createdAt: "2024-10-01" },
  { id: "VA-002", customer: "Chinedu Obi", accountName: "Chinedu Obi", accountNumber: "9876543210", bank: "Wema Bank", provider: "Provider B", status: "active", createdAt: "2024-10-05" },
  { id: "VA-003", customer: "Amara Diallo", accountName: "Amara Diallo", accountNumber: "1122334455", bank: "Providus Bank", provider: "Provider A", status: "inactive", createdAt: "2024-09-15" },
  { id: "VA-004", customer: "Kwame Mensah", accountName: "Kwame Mensah", accountNumber: "5566778899", bank: "Sterling Bank", provider: "Provider A", status: "active", createdAt: "2024-11-02" },
];

export default function VirtualAccounts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Virtual Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and manage virtual accounts for customers</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Generate VA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total VAs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold font-mono">{mockVAs.length}</div></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold font-mono text-success">{mockVAs.filter(v => v.status === "active").length}</div></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inactive</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold font-mono text-muted-foreground">{mockVAs.filter(v => v.status === "inactive").length}</div></CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="data-table-header text-left py-3 px-2">ID</th>
                  <th className="data-table-header text-left py-3 px-2">Customer</th>
                  <th className="data-table-header text-left py-3 px-2">Account Name</th>
                  <th className="data-table-header text-left py-3 px-2">Account No.</th>
                  <th className="data-table-header text-left py-3 px-2">Bank</th>
                  <th className="data-table-header text-center py-3 px-2">Status</th>
                  <th className="data-table-header text-right py-3 px-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {mockVAs.map((va) => (
                  <tr key={va.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-sm text-primary">{va.id}</td>
                    <td className="py-3 px-2 text-sm">{va.customer}</td>
                    <td className="py-3 px-2 text-sm">{va.accountName}</td>
                    <td className="py-3 px-2 font-mono text-sm">
                      <span className="flex items-center gap-1.5">
                        {va.accountNumber}
                        <button className="p-0.5 hover:text-primary transition-colors">
                          <Copy className="h-3 w-3" />
                        </button>
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{va.bank}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={va.status === "active" ? "status-badge status-completed" : "status-badge status-held"}>
                        {va.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground text-right">{va.createdAt}</td>
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
