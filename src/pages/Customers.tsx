import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Eye, Ban, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: string;
  riskScore: string;
  wallets: number;
  createdAt: string;
  accountStatus: "active" | "suspended";
  salesRepId: string;
}

const initialCustomers: CustomerRow[] = [
  { id: "CUS-1000", name: "Folake Adeyemi", email: "folake@email.com", phone: "+234 801 234 5678", kycStatus: "verified", riskScore: "low", wallets: 3, createdAt: "2024-08-12", accountStatus: "active", salesRepId: "usr_003" },
  { id: "CUS-1001", name: "Chinedu Obi", email: "chinedu@email.com", phone: "+234 802 345 6789", kycStatus: "pending", riskScore: "medium", wallets: 2, createdAt: "2024-09-03", accountStatus: "active", salesRepId: "usr_003" },
  { id: "CUS-1002", name: "Amara Diallo", email: "amara@email.com", phone: "+233 20 345 6789", kycStatus: "verified", riskScore: "low", wallets: 4, createdAt: "2024-07-21", accountStatus: "active", salesRepId: "usr_006" },
  { id: "CUS-1003", name: "Kwame Mensah", email: "kwame@email.com", phone: "+233 24 456 7890", kycStatus: "rejected", riskScore: "high", wallets: 1, createdAt: "2024-10-15", accountStatus: "suspended", salesRepId: "usr_006" },
  { id: "CUS-1004", name: "Fatima Bello", email: "fatima@email.com", phone: "+234 803 567 8901", kycStatus: "verified", riskScore: "low", wallets: 2, createdAt: "2024-06-30", accountStatus: "active", salesRepId: "usr_003" },
  { id: "CUS-1005", name: "Olu Adebayo", email: "olu@email.com", phone: "+234 805 678 9012", kycStatus: "pending", riskScore: "medium", wallets: 1, createdAt: "2024-11-01", accountStatus: "active", salesRepId: "usr_006" },
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
  const { user, hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerRow[]>(initialCustomers);
  const [suspendTarget, setSuspendTarget] = useState<CustomerRow | null>(null);

  // Compliance or super_admin can suspend customer accounts
  const canSuspendCustomer = hasPermission("customers", "update") && (user?.role === "compliance" || user?.role === "super_admin");

  // Sales reps only see their own customers; other roles see all
  const visibleCustomers = user?.role === "sales"
    ? customers.filter((c) => c.salesRepId === user.id)
    : customers;

  const filtered = visibleCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSuspend = () => {
    if (!suspendTarget) return;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === suspendTarget.id
          ? { ...c, accountStatus: c.accountStatus === "active" ? "suspended" : "active" }
          : c
      )
    );
    const action = suspendTarget.accountStatus === "active" ? "suspended" : "reactivated";
    toast.success(`${suspendTarget.name}'s account has been ${action}. Payments are now ${action === "suspended" ? "blocked" : "enabled"}.`);
    setSuspendTarget(null);
  };

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
                  <th className="data-table-header text-center py-3 px-2">Account</th>
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
                    <td className="py-3 px-2 text-center">
                      <span className={c.accountStatus === "active" ? "status-badge status-completed" : "status-badge status-failed"}>
                        {c.accountStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm font-mono">{c.wallets}</td>
                    <td className="py-3 px-2 text-right flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      {canSuspendCustomer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs gap-1 px-2 ${c.accountStatus === "active" ? "text-destructive hover:text-destructive" : "text-success hover:text-success"}`}
                          onClick={() => setSuspendTarget(c)}
                        >
                          {c.accountStatus === "active" ? (
                            <><Ban className="h-3.5 w-3.5" /> Suspend</>
                          ) : (
                            <><CheckCircle className="h-3.5 w-3.5" /> Reactivate</>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Suspend/Reactivate customer confirmation */}
      <AlertDialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendTarget?.accountStatus === "active" ? "Suspend Customer Account" : "Reactivate Customer Account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendTarget?.accountStatus === "active"
                ? `Are you sure you want to suspend ${suspendTarget?.name}'s account? They will be unable to make any payments until reactivated.`
                : `Are you sure you want to reactivate ${suspendTarget?.name}'s account? They will be able to make payments again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleSuspend}>
              {suspendTarget?.accountStatus === "active" ? "Suspend Account" : "Reactivate Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
