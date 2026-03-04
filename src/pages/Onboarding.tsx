import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, FileText, Clock, CheckCircle2, XCircle, AlertCircle, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockOnboardingDrafts } from "@/data/onboardingMockData";
import type { OnboardingStatus } from "@/types/onboarding";

const statusConfig: Record<OnboardingStatus, { label: string; class: string; icon: React.ElementType }> = {
  draft: { label: "Draft", class: "bg-muted text-muted-foreground", icon: FileText },
  submitted: { label: "Submitted", class: "bg-primary/15 text-primary", icon: Clock },
  under_review: { label: "Under Review", class: "bg-warning/15 text-warning", icon: AlertCircle },
  approved: { label: "Approved", class: "bg-success/15 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejected", class: "bg-destructive/15 text-destructive", icon: XCircle },
  more_info_needed: { label: "More Info", class: "bg-warning/15 text-warning", icon: AlertCircle },
};

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = mockOnboardingDrafts.filter((d) => {
    const matchSearch =
      !search ||
      d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: mockOnboardingDrafts.length,
    draft: mockOnboardingDrafts.filter((d) => d.status === "draft").length,
    submitted: mockOnboardingDrafts.filter((d) => d.status === "submitted").length,
    under_review: mockOnboardingDrafts.filter((d) => d.status === "under_review").length,
    approved: mockOnboardingDrafts.filter((d) => d.status === "approved").length,
    rejected: mockOnboardingDrafts.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customer Onboarding</h1>
          <p className="text-sm text-muted-foreground mt-1">Onboard new customers and track progress</p>
        </div>
        {(user?.role === "sales" || user?.role === "admin" || user?.role === "super_admin") && (
          <Button onClick={() => navigate("/onboarding/new")} className="gap-2">
            <Plus className="h-4 w-4" /> Onboard Customer
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["draft", "submitted", "under_review", "approved", "rejected"] as OnboardingStatus[]).map((s) => {
          const cfg = statusConfig[s];
          return (
            <Card
              key={s}
              className={`bg-card border-border cursor-pointer transition-colors ${statusFilter === s ? "ring-1 ring-primary" : ""}`}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{cfg.label}</span>
                  <cfg.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold font-mono mt-1">{counts[s] ?? 0}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-3.5 w-3.5 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                  <th className="data-table-header text-left py-3 px-2">Segment</th>
                  <th className="data-table-header text-center py-3 px-2">Status</th>
                  <th className="data-table-header text-left py-3 px-2">Sales Rep</th>
                  <th className="data-table-header text-left py-3 px-2">Created</th>
                  <th className="data-table-header text-center py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">No onboarding records found.</td>
                  </tr>
                )}
                {filtered.map((d) => {
                  const cfg = statusConfig[d.status];
                  return (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-2 font-mono text-sm text-primary">{d.id}</td>
                      <td className="py-3 px-2">
                        <div className="text-sm font-medium">{d.fullName ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{d.email}</div>
                      </td>
                      <td className="py-3 px-2 text-sm capitalize text-muted-foreground">{d.customerType ?? "—"}</td>
                      <td className="py-3 px-2 text-sm capitalize text-muted-foreground">{d.segment ?? "—"}</td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant="outline" className={`${cfg.class} border-0 text-xs`}>
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{d.salesRepName}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/onboarding/${d.id}/detail`)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                          {d.status === "draft" && (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/onboarding/${d.id}`)}>
                              Edit
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
