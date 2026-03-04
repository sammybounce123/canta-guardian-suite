import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, FileText, MessageSquare, Activity, ShieldCheck, Send, Tag, MailPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mockOnboardingDrafts, mockSalesNotes, mockComplianceQueue, mockInviteLogs } from "@/data/onboardingMockData";
import type { OnboardingStatus, CustomerTag, SalesNote } from "@/types/onboarding";

const statusConfig: Record<OnboardingStatus, { label: string; class: string }> = {
  draft: { label: "Draft", class: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", class: "bg-primary/15 text-primary" },
  under_review: { label: "Under Review", class: "bg-warning/15 text-warning" },
  approved: { label: "Approved", class: "bg-success/15 text-success" },
  rejected: { label: "Rejected", class: "bg-destructive/15 text-destructive" },
  more_info_needed: { label: "More Info Needed", class: "bg-warning/15 text-warning" },
};

const tagColors: Record<CustomerTag, string> = {
  lead: "bg-muted text-muted-foreground",
  warm: "bg-warning/15 text-warning",
  activated: "bg-success/15 text-success",
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const customer = mockOnboardingDrafts.find((d) => d.id === id);
  const notes = mockSalesNotes.filter((n) => n.customerId === id);
  const compliance = mockComplianceQueue.find((c) => c.customerId === id);
  const invites = mockInviteLogs.filter((i) => i.customerId === id);

  const [newNote, setNewNote] = useState("");
  const [localNotes, setLocalNotes] = useState<SalesNote[]>(notes);
  const [tag, setTag] = useState<CustomerTag | undefined>(customer?.tag);

  // Sales reps can only view their own customers
  const isSalesRestricted = user?.role === "sales" && customer && customer.salesRepId !== user.id;

  if (!customer || isSalesRestricted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <h2 className="text-lg font-medium">Customer not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/onboarding")}>Back to Onboarding</Button>
      </div>
    );
  }

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: SalesNote = {
      id: `SN-${Date.now()}`,
      customerId: id!,
      authorId: user?.id ?? "",
      authorName: user?.name ?? "",
      content: newNote,
      createdAt: new Date().toISOString(),
    };
    setLocalNotes([note, ...localNotes]);
    setNewNote("");
    toast.success("Note added");
  };

  const handleResendInvite = () => toast.success("Invite resent to " + customer.email);
  const handleRequestDocs = () => toast.success("Document request sent to " + customer.email);
  const handleScheduleReview = () => toast.success("Compliance review scheduled");

  const cfg = statusConfig[customer.status];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/onboarding")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{customer.fullName || "Unnamed"}</h1>
            <Badge variant="outline" className={`${cfg.class} border-0`}>{cfg.label}</Badge>
            {tag && <Badge variant="outline" className={`${tagColors[tag]} border-0 capitalize`}>{tag}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{customer.id} · {customer.customerType} · {customer.segment}</p>
        </div>
        <div className="flex gap-2">
          <Select value={tag ?? ""} onValueChange={(v) => { setTag(v as CustomerTag); toast.success("Tag updated to " + v); }}>
            <SelectTrigger className="w-[120px]">
              <Tag className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="activated">Activated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview"><User className="h-3.5 w-3.5 mr-1.5" />Overview</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="h-3.5 w-3.5 mr-1.5" />Documents</TabsTrigger>
          <TabsTrigger value="notes"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Notes</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="h-3.5 w-3.5 mr-1.5" />Activity</TabsTrigger>
          <TabsTrigger value="compliance"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Compliance</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm">Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{customer.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{customer.phoneCountryCode} {customer.phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span>{customer.country}</span></div>
                {customer.address && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-right">{customer.address.street}, {customer.address.city}, {customer.address.state}</span></div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm">Account Details</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Purpose</span><span className="capitalize">{customer.accountPurpose?.replace(/_/g, " ") ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Corridors</span><span>{(customer.transactionCorridors ?? []).join(", ") || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(customer.createdAt).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sales Rep</span><span>{customer.salesRepName}</span></div>
                {customer.customerType === "individual" && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">DOB</span><span>{customer.dateOfBirth ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">ID Type</span><span className="capitalize">{customer.idType?.replace(/_/g, " ") ?? "—"}</span></div>
                  </>
                )}
                {customer.customerType === "business" && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">RC Number</span><span>{customer.rcNumber ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Business</span><span>{customer.businessNature ?? "—"}</span></div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Sales Quick Actions */}
          <Card className="bg-card border-border mt-4">
            <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleResendInvite} className="gap-1.5"><MailPlus className="h-3.5 w-3.5" /> Resend Invite</Button>
              <Button variant="outline" size="sm" onClick={handleRequestDocs} className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Request Documents</Button>
              <Button variant="outline" size="sm" onClick={handleScheduleReview} className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Schedule Review</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-sm">Uploaded Documents</CardTitle></CardHeader>
            <CardContent>
              {(customer.documents ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {(customer.documents ?? []).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{doc.category.replace(/_/g, " ")} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`border-0 text-xs ${doc.status === "verified" ? "bg-success/15 text-success" : doc.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-sm">Internal Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea placeholder="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="min-h-[60px]" />
                <Button onClick={addNote} size="icon" className="shrink-0 self-end"><Send className="h-4 w-4" /></Button>
              </div>
              {localNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {localNotes.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{n.authorName}</span>
                        <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-sm">Activity & Invite Log</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <MailPlus className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm">Invite sent via <span className="font-medium uppercase">{inv.channel}</span> to {inv.recipient}</p>
                      <p className="text-xs text-muted-foreground">By {inv.sentBy} · {new Date(inv.sentAt).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className={`border-0 text-xs ${inv.status === "delivered" ? "bg-success/15 text-success" : inv.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      {inv.status}
                    </Badge>
                  </div>
                ))}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm">Customer record created</p>
                    <p className="text-xs text-muted-foreground">By {customer.salesRepName} · {new Date(customer.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {customer.status !== "draft" && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm">Submitted for KYC review</p>
                      <p className="text-xs text-muted-foreground">Status: {statusConfig[customer.status].label} · {new Date(customer.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-sm">Compliance Status</CardTitle></CardHeader>
            <CardContent>
              {compliance ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Queue Status</span><Badge variant="outline" className={`${statusConfig[compliance.status].class} border-0`}>{statusConfig[compliance.status].label}</Badge></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Requested By</span><span>{compliance.requestedBy}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Requested At</span><span>{new Date(compliance.requestedAt).toLocaleString()}</span></div>
                  {compliance.reviewedBy && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Reviewed By</span><span>{compliance.reviewedBy}</span></div>}
                  {compliance.expectedMonthlyVolume && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Expected Volume</span><span>{compliance.expectedMonthlyVolume}</span></div>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No compliance review initiated yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
