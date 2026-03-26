import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, ArrowRight, TrendingUp, Clock, Users,
  Building2, AlertTriangle, ArrowLeftRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockMerchants, type Merchant } from "@/data/mockMerchants";

const statusStyle: Record<string, string> = {
  active: "bg-success/15 text-success border-0",
  pending: "bg-warning/15 text-warning border-0",
  restricted: "bg-destructive/15 text-destructive border-0",
};

const statusIcon: Record<string, React.ElementType> = {
  active: TrendingUp,
  pending: Clock,
  restricted: AlertTriangle,
};

function formatVolume(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "No transactions";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function MerchantPortfolio() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const canAccess = hasPermission("transactions", "act_on_behalf");

  // Sales sees only their merchants; Admin/Super Admin see all
  const myMerchants = user?.role === "sales"
    ? mockMerchants.filter((m) => m.salesRepId === user.id)
    : mockMerchants;

  const filtered = myMerchants.filter((m) =>
    m.businessName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-lg font-medium">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">You don't have permission to access merchant portfolio.</p>
      </div>
    );
  }

  const activeMerchants = myMerchants.filter((m) => m.status === "active").length;
  const totalVolume = myMerchants.reduce((sum, m) => sum + m.totalProcessedVolume, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Merchants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === "sales" ? "Merchants you onboarded" : "All merchants in the system"}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{myMerchants.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Merchants</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{activeMerchants}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatVolume(totalVolume)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search merchants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-muted border-none"
        />
      </div>

      {/* Merchant cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No merchants found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function MerchantCard({ merchant, navigate }: { merchant: Merchant; navigate: ReturnType<typeof useNavigate> }) {
  const Icon = statusIcon[merchant.status] ?? TrendingUp;

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm truncate">{merchant.businessName}</h3>
                <Badge className={statusStyle[merchant.status]}>{merchant.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{merchant.email} · {merchant.id}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last tx: {timeAgo(merchant.lastTransactionDate)}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Volume: {formatVolume(merchant.totalProcessedVolume)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => navigate(`/merchants/${merchant.id}`)}
            >
              View Profile <ArrowRight className="h-3 w-3" />
            </Button>
            {merchant.status === "active" && (
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => navigate(`/transact-on-behalf?customerId=${merchant.onboardingId}`)}
              >
                <ArrowLeftRight className="h-3 w-3" /> Assist Transaction
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
