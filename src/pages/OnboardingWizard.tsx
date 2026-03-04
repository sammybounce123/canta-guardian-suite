import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, Upload, CheckCircle2, AlertTriangle, Send, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mockOnboardingDrafts } from "@/data/onboardingMockData";
import type { OnboardingDraft, CustomerType, CustomerSegment, IdType, CustomerDocument } from "@/types/onboarding";

const STEPS = [
  { label: "Customer Type", description: "Type & segment" },
  { label: "Basic Details", description: "Contact & address" },
  { label: "Identity Info", description: "ID / Business docs" },
  { label: "Documents", description: "Upload KYC docs" },
  { label: "Create & Invite", description: "Finalize" },
];

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States"];
const CORRIDORS = ["NGN↔USD", "NGN↔GBP", "NGN↔EUR", "NGN↔CNY", "GHS↔USD", "KES↔USD", "ZAR↔USD"];
const PURPOSES = [
  { value: "personal_transfers", label: "Personal Transfers" },
  { value: "business_payments", label: "Business Payments" },
  { value: "salary_payments", label: "Salary Payments" },
  { value: "trade_finance", label: "Trade Finance" },
  { value: "investment", label: "Investment" },
];

const emptyDraft: OnboardingDraft = {
  id: `ONB-${String(Date.now()).slice(-4)}`,
  salesRepId: "",
  salesRepName: "",
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  directors: [{ name: "", email: "", phone: "" }],
  documents: [],
  transactionCorridors: [],
};

export default function OnboardingWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === "new";

  const existing = !isNew ? mockOnboardingDrafts.find((d) => d.id === id) : undefined;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() =>
    existing
      ? { ...existing }
      : { ...emptyDraft, salesRepId: user?.id ?? "", salesRepName: user?.name ?? "" }
  );
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const update = useCallback((partial: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }));
  }, []);

  const checkDuplicates = useCallback(() => {
    const dupes: string[] = [];
    mockOnboardingDrafts.forEach((d) => {
      if (d.id === draft.id) return;
      if (draft.email && d.email === draft.email) dupes.push(`Email match: ${d.fullName} (${d.id})`);
      if (draft.phone && d.phone === draft.phone) dupes.push(`Phone match: ${d.fullName} (${d.id})`);
      if (draft.idNumber && d.idNumber === draft.idNumber) dupes.push(`ID match: ${d.fullName} (${d.id})`);
      if (draft.rcNumber && d.rcNumber === draft.rcNumber) dupes.push(`RC match: ${d.fullName} (${d.id})`);
    });
    setDuplicateWarning(dupes.length > 0 ? dupes.join("; ") : null);
  }, [draft]);

  const handleNext = () => {
    if (step === 1) checkDuplicates();
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleSave = () => {
    update({ status: "draft" });
    toast.success("Draft saved successfully");
  };

  const handleSubmit = () => {
    update({ status: "submitted" });
    toast.success("Customer onboarded and submitted for KYC review");
    navigate("/onboarding");
  };

  const handleFileUpload = (category: CustomerDocument["category"]) => {
    const newDoc: CustomerDocument = {
      id: `doc-${Date.now()}`,
      name: `${category}_upload.pdf`,
      type: "application/pdf",
      category,
      uploadedAt: new Date().toISOString(),
      fileUrl: "#",
      status: "uploaded",
    };
    update({ documents: [...(draft.documents ?? []), newDoc] });
    toast.success(`${category.replace(/_/g, " ")} uploaded`);
  };

  const removeDoc = (docId: string) => {
    update({ documents: (draft.documents ?? []).filter((d) => d.id !== docId) });
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const readOnly = existing && existing.status !== "draft";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/onboarding")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{isNew ? "Onboard New Customer" : `Onboarding: ${draft.fullName || draft.id}`}</h1>
          <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => !readOnly && setStep(i)}
              className={`${i === step ? "text-primary font-medium" : ""} ${i < step ? "text-success" : ""} transition-colors`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {duplicateWarning && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Potential Duplicate Detected</p>
              <p className="text-xs text-muted-foreground mt-1">{duplicateWarning}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setDuplicateWarning(null)}>Dismiss</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {/* Step 1: Customer Type */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <Label className="text-sm">Customer Type</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {(["individual", "business"] as CustomerType[]).map((t) => (
                    <button
                      key={t}
                      disabled={!!readOnly}
                      onClick={() => update({ customerType: t })}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        draft.customerType === t ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <p className="font-medium capitalize">{t}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t === "individual" ? "Personal account for an individual" : "Business or corporate account"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Country of Residence</Label>
                  <Select value={draft.country ?? ""} onValueChange={(v) => update({ country: v })} disabled={!!readOnly}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Customer Segment</Label>
                  <Select value={draft.segment ?? ""} onValueChange={(v) => update({ segment: v as CustomerSegment })} disabled={!!readOnly}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select segment" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="sme">SME</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {draft.customerType === "individual" && (
                <div>
                  <Label className="text-sm">Nationality</Label>
                  <Input className="mt-1.5" value={draft.nationality ?? ""} onChange={(e) => update({ nationality: e.target.value })} disabled={!!readOnly} placeholder="e.g., Nigerian" />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Basic Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm">{draft.customerType === "business" ? "Business Legal Name" : "Full Name"}</Label>
                <Input className="mt-1.5" value={draft.fullName ?? ""} onChange={(e) => update({ fullName: e.target.value })} disabled={!!readOnly} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input type="email" className="mt-1.5" value={draft.email ?? ""} onChange={(e) => update({ email: e.target.value })} disabled={!!readOnly} />
                </div>
                <div>
                  <Label className="text-sm">Phone Number</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input className="w-20" value={draft.phoneCountryCode ?? "+234"} onChange={(e) => update({ phoneCountryCode: e.target.value })} disabled={!!readOnly} />
                    <Input className="flex-1" value={draft.phone ?? ""} onChange={(e) => update({ phone: e.target.value })} disabled={!!readOnly} />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm">{draft.customerType === "business" ? "Incorporation Date" : "Date of Birth"}</Label>
                <Input type="date" className="mt-1.5" value={draft.customerType === "business" ? draft.incorporationDate ?? "" : draft.dateOfBirth ?? ""} onChange={(e) => update(draft.customerType === "business" ? { incorporationDate: e.target.value } : { dateOfBirth: e.target.value })} disabled={!!readOnly} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Country</Label>
                  <Input className="mt-1.5" value={draft.address?.country ?? draft.country ?? ""} onChange={(e) => update({ address: { ...draft.address!, country: e.target.value } })} disabled={!!readOnly} />
                </div>
                <div>
                  <Label className="text-sm">State</Label>
                  <Input className="mt-1.5" value={draft.address?.state ?? ""} onChange={(e) => update({ address: { ...draft.address!, state: e.target.value } })} disabled={!!readOnly} />
                </div>
                <div>
                  <Label className="text-sm">City</Label>
                  <Input className="mt-1.5" value={draft.address?.city ?? ""} onChange={(e) => update({ address: { ...draft.address!, city: e.target.value } })} disabled={!!readOnly} />
                </div>
                <div>
                  <Label className="text-sm">Street Address</Label>
                  <Input className="mt-1.5" value={draft.address?.street ?? ""} onChange={(e) => update({ address: { ...draft.address!, street: e.target.value } })} disabled={!!readOnly} />
                </div>
              </div>
              <div>
                <Label className="text-sm">Purpose of Account</Label>
                <Select value={draft.accountPurpose ?? ""} onValueChange={(v) => update({ accountPurpose: v })} disabled={!!readOnly}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select purpose" /></SelectTrigger>
                  <SelectContent>{PURPOSES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Expected Transaction Corridors</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CORRIDORS.map((c) => (
                    <button
                      key={c}
                      disabled={!!readOnly}
                      onClick={() => {
                        const current = draft.transactionCorridors ?? [];
                        update({ transactionCorridors: current.includes(c) ? current.filter((x) => x !== c) : [...current, c] });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                        (draft.transactionCorridors ?? []).includes(c) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Identity / Business Info */}
          {step === 2 && (
            <div className="space-y-4">
              {draft.customerType === "individual" ? (
                <>
                  <div>
                    <Label className="text-sm">ID Type</Label>
                    <Select value={draft.idType ?? ""} onValueChange={(v) => update({ idType: v as IdType })} disabled={!!readOnly}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select ID type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="nin">NIN</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                        <SelectItem value="voters_card">Voter's Card</SelectItem>
                        <SelectItem value="residence_permit">Residence Permit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">ID Number</Label>
                    <Input className="mt-1.5" value={draft.idNumber ?? ""} onChange={(e) => update({ idNumber: e.target.value })} disabled={!!readOnly} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Issue Date (optional)</Label>
                      <Input type="date" className="mt-1.5" value={draft.idIssueDate ?? ""} onChange={(e) => update({ idIssueDate: e.target.value })} disabled={!!readOnly} />
                    </div>
                    <div>
                      <Label className="text-sm">Expiry Date (optional)</Label>
                      <Input type="date" className="mt-1.5" value={draft.idExpiryDate ?? ""} onChange={(e) => update({ idExpiryDate: e.target.value })} disabled={!!readOnly} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-sm">RC / Registration Number</Label>
                    <Input className="mt-1.5" value={draft.rcNumber ?? ""} onChange={(e) => update({ rcNumber: e.target.value })} disabled={!!readOnly} />
                  </div>
                  <div>
                    <Label className="text-sm">Nature of Business</Label>
                    <Input className="mt-1.5" value={draft.businessNature ?? ""} onChange={(e) => update({ businessNature: e.target.value })} disabled={!!readOnly} />
                  </div>
                  <div>
                    <Label className="text-sm">Website (optional)</Label>
                    <Input className="mt-1.5" value={draft.website ?? ""} onChange={(e) => update({ website: e.target.value })} disabled={!!readOnly} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Directors / Owners</Label>
                      {!readOnly && (
                        <Button variant="ghost" size="sm" onClick={() => update({ directors: [...(draft.directors ?? []), { name: "", email: "", phone: "" }] })}>
                          + Add Director
                        </Button>
                      )}
                    </div>
                    {(draft.directors ?? []).map((dir, i) => (
                      <div key={i} className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-muted/30">
                        <Input placeholder="Name" value={dir.name} disabled={!!readOnly} onChange={(e) => {
                          const dirs = [...(draft.directors ?? [])];
                          dirs[i] = { ...dirs[i], name: e.target.value };
                          update({ directors: dirs });
                        }} />
                        <Input placeholder="Email" value={dir.email} disabled={!!readOnly} onChange={(e) => {
                          const dirs = [...(draft.directors ?? [])];
                          dirs[i] = { ...dirs[i], email: e.target.value };
                          update({ directors: dirs });
                        }} />
                        <Input placeholder="Phone" value={dir.phone} disabled={!!readOnly} onChange={(e) => {
                          const dirs = [...(draft.directors ?? [])];
                          dirs[i] = { ...dirs[i], phone: e.target.value };
                          update({ directors: dirs });
                        }} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Document Upload */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Upload required KYC documents for verification.</p>
              {draft.customerType === "individual" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["id_front", "id_back", "proof_of_address"] as const).map((cat) => {
                    const existing = (draft.documents ?? []).find((d) => d.category === cat);
                    return (
                      <div key={cat} className="p-4 rounded-lg border border-dashed border-border hover:border-muted-foreground transition-colors">
                        <p className="text-sm font-medium capitalize">{cat.replace(/_/g, " ")}</p>
                        {existing ? (
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="h-4 w-4 text-success" />
                            <span className="text-xs text-success flex-1">{existing.name}</span>
                            {!readOnly && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDoc(existing.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="mt-2 gap-2" onClick={() => handleFileUpload(cat)} disabled={!!readOnly}>
                            <Upload className="h-3.5 w-3.5" /> Upload
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["cac", "memart", "proof_of_address", "other"] as const).map((cat) => {
                    const existing = (draft.documents ?? []).find((d) => d.category === cat);
                    return (
                      <div key={cat} className="p-4 rounded-lg border border-dashed border-border hover:border-muted-foreground transition-colors">
                        <p className="text-sm font-medium capitalize">{cat === "cac" ? "CAC Certificate" : cat === "memart" ? "MEMART" : cat.replace(/_/g, " ")}</p>
                        {existing ? (
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="h-4 w-4 text-success" />
                            <span className="text-xs text-success flex-1">{existing.name}</span>
                            {!readOnly && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDoc(existing.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="mt-2 gap-2" onClick={() => handleFileUpload(cat)} disabled={!!readOnly}>
                            <Upload className="h-3.5 w-3.5" /> Upload
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {(draft.documents ?? []).length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">{(draft.documents ?? []).length} document(s) uploaded</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Create & Invite */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                <h3 className="text-sm font-medium">Onboarding Summary</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{draft.customerType}</span></div>
                  <div><span className="text-muted-foreground">Segment:</span> <span className="capitalize">{draft.segment}</span></div>
                  <div><span className="text-muted-foreground">Name:</span> {draft.fullName}</div>
                  <div><span className="text-muted-foreground">Email:</span> {draft.email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {draft.phoneCountryCode} {draft.phone}</div>
                  <div><span className="text-muted-foreground">Country:</span> {draft.country}</div>
                  <div><span className="text-muted-foreground">Documents:</span> {(draft.documents ?? []).length} uploaded</div>
                  <div><span className="text-muted-foreground">Corridors:</span> {(draft.transactionCorridors ?? []).join(", ") || "None"}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm">KYC Status</Label>
                <Badge variant="outline" className="ml-2 bg-warning/15 text-warning border-0">Pending Review</Badge>
                <p className="text-xs text-muted-foreground mt-1">KYC review will be assigned to Compliance after submission.</p>
              </div>
              <div>
                <Label className="text-sm">Send Onboarding Invite via</Label>
                <div className="flex gap-4 mt-2">
                  {(["email", "sms"] as const).map((ch) => (
                    <label key={ch} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={(draft.inviteChannel ?? []).includes(ch)}
                        disabled={!!readOnly}
                        onCheckedChange={(checked) => {
                          const channels = draft.inviteChannel ?? [];
                          update({ inviteChannel: checked ? [...channels, ch] : channels.filter((c) => c !== ch) });
                        }}
                      />
                      <span className="text-sm capitalize">{ch}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => (step > 0 ? setStep(step - 1) : navigate("/onboarding"))} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> {step > 0 ? "Back" : "Cancel"}
        </Button>
        <div className="flex gap-2">
          {!readOnly && (
            <Button variant="outline" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save Draft
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            !readOnly && (
              <Button onClick={handleSubmit} className="gap-2">
                <Send className="h-4 w-4" /> Submit & Send Invite
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
