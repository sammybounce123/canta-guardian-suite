import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, MoreHorizontal } from "lucide-react";

const mockCustomers = [
  { id: "CUS-1000", name: "Folake Adeyemi", email: "folake@email.com", phone: "+234 801 234 5678", kycStatus: "verified", riskScore: "low", wallets: 3, createdAt: "2024-08-12" },
  { id: "CUS-1001", name: "Chinedu Obi", email: "chinedu@email.com", phone: "+234 802 345 6789", kycStatus: "pending", riskScore: "medium", wallets: 2, createdAt: "2024-09-03" },
  { id: "CUS-1002", name: "Amara Diallo", email: "amara@email.com", phone: "+233 20 345 6789", kycStatus: "verified", riskScore: "low", wallets: 4, createdAt: "2024-07-21" },
  { id: "CUS-1003", name: "Kwame Mensah", email: "kwame@email.com", phone: "+233 24 456 7890", kycStatus: "rejected", riskScore: "high", wallets: 1, createdAt: "2024-10-15" },
  { id: "CUS-1004", name: "Fatima Bello", email: "fatima@email.com", phone: "+234 803 567 8901", kycStatus: "verified", riskScore: "low", wallets: 2, createdAt: "2024-06-30" },
  { id: "CUS-1005", name: "Olu Adebayo", email: "olu@email.com", phone: "+234 805 678 9012", kycStatus: "pending", riskScore: "medium", wallets: 1, createdAt: "2024-11-01" },
];

const kycClass: Record<string, string> = {
  verified: "status-badge status-completed",
  pending: "status-badge status-pending",
  rejected: "status-badge status-failed",
};

const riskClass: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const filtered = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage customer profiles, KYC, and accounts</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted border-none"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="data-table-header text-left py-3 px-2">ID</th>
                  <th className="data-table-header text-left py-3 px-2">Name</th>
                  <th className="data-table-header text-left py-3 px-2">Email</th>
                  <th className="data-table-header text-left py-3 px-2">Phone</th>
                  <th className="data-table-header text-center py-3 px-2">KYC</th>
                  <th className="data-table-header text-center py-3 px-2">Risk</th>
                  <th className="data-table-header text-center py-3 px-2">Wallets</th>
                  <th className="data-table-header text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-sm text-primary">{c.id}</td>
                    <td className="py-3 px-2 text-sm font-medium">{c.name}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{c.email}</td>
                    <td className="py-3 px-2 text-sm font-mono text-muted-foreground">{c.phone}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={kycClass[c.kycStatus]}>{c.kycStatus}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-sm font-medium capitalize ${riskClass[c.riskScore]}`}>{c.riskScore}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm font-mono">{c.wallets}</td>
                    <td className="py-3 px-2 text-right">
                      <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                        <Eye className="h-4 w-4 text-muted-foreground" />
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
