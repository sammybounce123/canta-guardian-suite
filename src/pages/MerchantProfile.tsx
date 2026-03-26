import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ArrowLeftRight, Wallet, Building2, Users,
  Clock, CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockMerchants } from "@/data/mockMerchants";

const statusStyle: Record<string, string> = {
  active: "bg-success/15 text-success border-0",
  pending: "bg-warning/15 text-warning border-0",
  restricted: "bg-destructive/15 text-destructive border-0",
  frozen: "bg-destructive/15 text-destructive border-0",
  expired: "bg-muted text-muted-foreground border-0",
};

const txStatusStyle: Record<string, string> = {
  completed: "status-badge status-completed",
  pending: "status-badge status-pending",
  failed: "status-badge status-failed",
};

function formatMoney(amount: number, currency: string = "NGN") {
  const symbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", CNY: "¥", EUR: "€" };
  return `${symbols[currency] ?? currency}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MerchantProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const merchant = mockMerchants.find((m) => m.id === id);

  if (!merchant) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-lg font-medium">Merchant Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/merchants")}>Back to Merchants</Button>
      </div>
    );
  }

  // Sales can only view their own merchants
  if (user?.role === "sales" && merchant.salesRepId !== user.id) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-warning mb-3" />
        <h2 className="text-lg font-medium">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1">You can only view merchants you onboarded.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/merchants")}>Back to Merchants</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/merchants")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">{merchant.businessName}</h1>
            <Badge className={statusStyle[merchant.status]}>{merchant.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{merchant.email} · {merchant.phone}</p>
        </div>
        {merchant.status === "active" && (
          <Button
            className="gap-1.5"
            onClick={() => navigate(`/transact-on-behalf?customerId=${merchant.onboardingId}`)}
          >
            <ArrowLeftRight className="h-4 w-4" /> Assist Transaction
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="virtual-accounts">Virtual Accounts</TabsTrigger>
          <TabsTrigger value="beneficiaries">Saved Beneficiaries</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground font-medium">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold font-mono">{formatMoney(merchant.totalProcessedVolume)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground font-medium">Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold font-mono">{merchant.wallets.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground font-medium">KYC Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={statusStyle[merchant.kycStatus === "verified" ? "active" : merchant.kycStatus === "pending" ? "pending" : "restricted"]}>
                  {merchant.kycStatus}
                </Badge>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-sm">Merchant Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Merchant ID" value={merchant.id} />
              <Row label="Email" value={merchant.email} />
              <Row label="Phone" value={merchant.phone} />
              <Row label="Sales Rep" value={merchant.salesRepName} />
              <Row label="Onboarded" value={new Date(merchant.createdAt).toLocaleDateString()} />
              <Row label="Last Transaction" value={merchant.lastTransactionDate ? new Date(merchant.lastTransactionDate).toLocaleDateString() : "None"} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallets */}
        <TabsContent value="wallets" className="space-y-4 mt-4">
          {merchant.wallets.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No wallets.</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {merchant.wallets.map((w, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{w.currency} Wallet</p>
                        <p className="text-xs text-muted-foreground">{formatMoney(w.balance, w.currency)}</p>
                      </div>
                    </div>
                    <Badge className={statusStyle[w.status]}>{w.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Virtual Accounts */}
        <TabsContent value="virtual-accounts" className="space-y-4 mt-4">
          {merchant.virtualAccounts.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No virtual accounts.</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {merchant.virtualAccounts.map((va, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{va.bankName}</span>
                      <Badge className={statusStyle[va.status]}>{va.status}</Badge>
                    </div>
                    <div className="text-sm space-y-1 ml-7">
                      <Row label="Account Name" value={va.accountName} />
                      <Row label="Account Number" value={va.accountNumber} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Saved Beneficiaries */}
        <TabsContent value="beneficiaries" className="space-y-4 mt-4">
          {merchant.savedBeneficiaries.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No saved beneficiaries.</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {merchant.savedBeneficiaries.map((b) => (
                <Card key={b.id} className="bg-card border-border">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.bankName} · {b.accountNumber} · {b.country}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{b.currency}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="transactions" className="space-y-4 mt-4">
          {merchant.recentTransactions.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No transactions yet.</CardContent></Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="data-table-header text-left py-3 px-2">ID</th>
                        <th className="data-table-header text-left py-3 px-2">Date</th>
                        <th className="data-table-header text-left py-3 px-2">Type</th>
                        <th className="data-table-header text-left py-3 px-2">Beneficiary</th>
                        <th className="data-table-header text-right py-3 px-2">Amount</th>
                        <th className="data-table-header text-center py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {merchant.recentTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-2 font-mono text-sm text-primary">{tx.id}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-sm">{tx.type}</td>
                          <td className="py-3 px-2 text-sm">{tx.beneficiary}</td>
                          <td className="py-3 px-2 text-sm font-mono text-right">{formatMoney(tx.amount, tx.currency)}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={txStatusStyle[tx.status]}>{tx.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
