import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Upload, CheckCircle2, Shield, X, FileText, Send, AlertCircle, Clock, Mail, Phone,
} from "lucide-react";
import { toast } from "sonner";
import { mockInviteTokens } from "@/data/mockInviteTokens";
import type { InviteToken, CustomerOnboardingData, SourceOfFunds } from "@/types/customerOnboarding";

const STEPS = [
  { label: "Verify Contact", icon: Shield },
  { label: "Customer Type", icon: FileText },
  { label: "Profile Details", icon: FileText },
  { label: "Expected Activity", icon: FileText },
  { label: "KYC Uploads", icon: Upload },
  { label: "Review & Submit", icon: CheckCircle2 },
];

const CORRIDORS = ["NGN↔USD", "NGN↔GBP", "NGN↔EUR", "NGN↔CNY", "GHS↔USD", "KES↔USD", "ZAR↔USD"];
const PURPOSES = [
  { value: "personal_transfers", label: "Personal Transfers" },
  { value: "business_payments", label: "Business Payments" },
  { value: "salary_payments", label: "Salary Payments" },
  { value: "trade_finance", label: "Trade Finance" },
  { value: "investment", label: "Investment" },
];
const VOLUME_RANGES = [
  "Less than $1,000",
  "$1,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000 - $50,000",
  "$50,000 - $100,000",
  "Over $100,000",
];
const SOURCE_OF_FUNDS: { value: SourceOfFunds; label: string }[] = [
  { value: "salary", label: "Salary / Employment Income" },
  { value: "business_income", label: "Business Income" },
  { value: "investments", label: "Investment Returns" },
  { value: "savings", label: "Personal Savings" },
  { value: "gift", label: "Gift / Donation" },
  { value: "other", label: "Other" },
];
const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States"];

type PageState = "loading" | "invalid" | "form" | "submitted";

export default function CustomerOnboarding() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [pageState, setPageState] = useState<PageState>("loading");
  const [invite, setInvite] = useState<InviteToken | null>(null);
  const [step, setStep] = useState(0);
  const [requestEmail, setRequestEmail] = useState("");

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);

  const [data, setData] = useState<CustomerOnboardingData>({
    fullName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+234",
    otpVerified: false,
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      return;
    }
    const found = mockInviteTokens.find((t) => t.tokenHash === token);
    if (!found || found.status === "submitted" || found.status === "revoked") {
      setPageState("invalid");
      return;
    }
    if (found.status === "expired" || new Date(found.expiresAt) < new Date()) {
      setPageState("invalid");
      return;
    }
    setInvite(found);
    setData({
      fullName: found.customerName ?? "",
      email: found.customerEmail ?? "",
      phone: found.customerPhone ?? "",
      phoneCountryCode: found.phoneCountryCode ?? "+234",
      otpVerified: false,
      documents: [],
      corridors: [],
      directors: [{ name: "", email: "", phone: "" }],
    });
    setPageState("form");
  }, [token]);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const update = useCallback((partial: Partial<CustomerOnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const sendOtp = () => {
    if (otpAttempts >= 5) {
      toast.error("Too many OTP requests. Please try again later.");
      return;
    }
    setOtpSent(true);
    setOtpCooldown(60);
    setOtpAttempts((a) => a + 1);
    toast.success(`Verification code sent to ${data.email}`);
  };

  const verifyOtp = () => {
    // Mock: any 6-digit code works
    if (otpValue.length === 6) {
      setOtpVerified(true);
      update({ otpVerified: true });
      toast.success("Contact verified successfully");
    } else {
      toast.error("Invalid verification code. Please try again.");
    }
  };

  const handleFileUpload = (category: string) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: `${category}_upload.pdf`,
      category,
      fileUrl: "#",
      uploadedAt: new Date().toISOString(),
    };
    update({ documents: [...(data.documents ?? []), newDoc] });
    toast.success(`${category.replace(/_/g, " ")} uploaded`);
  };

  const removeDoc = (docId: string) => {
    update({ documents: (data.documents ?? []).filter((d) => d.id !== docId) });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return otpVerified;
      case 1: return !!data.customerType;
      case 2: {
        if (data.customerType === "individual") {
          return !!(data.fullName && data.dateOfBirth && data.address?.country && data.address?.city);
        }
        return !!(data.fullName && data.rcNumber && data.businessNature && data.address?.country);
      }
      case 3: return !!(data.expectedMonthlyVolume && data.sourceOfFunds && data.accountPurpose);
      case 4: {
        const docs = data.documents ?? [];
        if (data.customerType === "individual") {
          return docs.some((d) => d.category === "id_front") && docs.some((d) => d.category === "proof_of_address");
        }
        return docs.some((d) => d.category === "cac") && docs.some((d) => d.category === "proof_of_address") && docs.some((d) => d.category === "director_id");
      }
      case 5: return !!data.confirmed;
      default: return false;
    }
  };

  const handleSubmit = () => {
    toast.success("Onboarding submitted successfully!");
    setPageState("submitted");
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  // ── Invalid / expired page ──
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Validating your link...</div>
      </div>
    );
  }

  if (pageState === "invalid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-border">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold">Link No Longer Valid</h1>
            <p className="text-sm text-muted-foreground">
              This onboarding link has expired, already been used, or is invalid. Please contact your representative to request a new link.
            </p>
            <div className="pt-4 space-y-3">
              <p className="text-xs text-muted-foreground">Or request a new link below:</p>
              <Input
                placeholder="Your email or phone"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() => {
                  if (requestEmail.trim()) {
                    toast.success("Request sent. Your representative will reach out shortly.");
                    setRequestEmail("");
                  }
                }}
                disabled={!requestEmail.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Request New Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === "submitted") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-border">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-xl font-semibold">Onboarding Submitted</h1>
            <p className="text-sm text-muted-foreground">
              Thank you, {data.fullName}! Your information has been submitted successfully. Our compliance team will review your application and you'll be contacted if additional information is needed.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              A confirmation has been sent to <span className="font-medium text-foreground">{data.email}</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Canta</h1>
              <p className="text-xs text-muted-foreground">Secure Onboarding</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Secure Session
          </Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  i === step ? "text-primary font-medium" : i < step ? "text-success" : "text-muted-foreground"
                }`}
              >
                {i < step ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-medium border ${
                    i === step ? "border-primary text-primary" : "border-muted-foreground/30"
                  }`}>
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {/* ── Step 0: Verify Contact ── */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Verify Your Contact</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please confirm your details and verify your identity with a one-time code.
                  </p>
                </div>
                <div>
                  <Label className="text-sm">Full Name</Label>
                  <Input className="mt-1.5" value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Email</Label>
                    <Input className="mt-1.5" value={data.email} onChange={(e) => update({ email: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-sm">Phone</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input className="w-20" value={data.phoneCountryCode} onChange={(e) => update({ phoneCountryCode: e.target.value })} />
                      <Input className="flex-1" value={data.phone} onChange={(e) => update({ phone: e.target.value })} />
                    </div>
                  </div>
                </div>

                {!otpVerified && (
                  <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                    <p className="text-sm font-medium">Email Verification</p>
                    {!otpSent ? (
                      <Button onClick={sendOtp} size="sm">
                        <Mail className="h-4 w-4 mr-2" /> Send Verification Code
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Enter 6-digit code</Label>
                          <div className="flex gap-2 mt-1.5">
                            <Input
                              className="w-40 tracking-[0.3em] text-center font-mono"
                              maxLength={6}
                              value={otpValue}
                              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="000000"
                            />
                            <Button onClick={verifyOtp} disabled={otpValue.length !== 6} size="sm">
                              Verify
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={sendOtp}
                          disabled={otpCooldown > 0}
                          className="text-xs"
                        >
                          {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend Code"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {otpVerified && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Contact verified</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 1: Customer Type ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Account Type</h2>
                  <p className="text-sm text-muted-foreground mt-1">Select the type of account you'd like to open.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(["individual", "business"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => update({ customerType: t })}
                      className={`p-5 rounded-lg border text-left transition-all ${
                        data.customerType === t ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <p className="font-medium capitalize">{t}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t === "individual" ? "Personal account" : "Business or corporate account"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Profile Details ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {data.customerType === "business" ? "Business Details" : "Personal Details"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Provide your profile information.</p>
                </div>

                <div>
                  <Label className="text-sm">{data.customerType === "business" ? "Legal Business Name" : "Full Name"}</Label>
                  <Input className="mt-1.5" value={data.fullName} onChange={(e) => update({ fullName: e.target.value })} />
                </div>

                {data.customerType === "individual" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Date of Birth</Label>
                        <Input type="date" className="mt-1.5" value={data.dateOfBirth ?? ""} onChange={(e) => update({ dateOfBirth: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-sm">Nationality (optional)</Label>
                        <Input className="mt-1.5" value={data.nationality ?? ""} onChange={(e) => update({ nationality: e.target.value })} placeholder="e.g. Nigerian" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">RC / Registration Number</Label>
                        <Input className="mt-1.5" value={data.rcNumber ?? ""} onChange={(e) => update({ rcNumber: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-sm">Incorporation Date</Label>
                        <Input type="date" className="mt-1.5" value={data.incorporationDate ?? ""} onChange={(e) => update({ incorporationDate: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Nature of Business</Label>
                      <Input className="mt-1.5" value={data.businessNature ?? ""} onChange={(e) => update({ businessNature: e.target.value })} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Director / Owner Details</Label>
                        <Button variant="ghost" size="sm" onClick={() => update({ directors: [...(data.directors ?? []), { name: "", email: "", phone: "" }] })}>
                          + Add
                        </Button>
                      </div>
                      {(data.directors ?? []).map((dir, i) => (
                        <div key={i} className="grid grid-cols-3 gap-2 p-3 rounded-lg border border-border bg-muted/30">
                          <Input placeholder="Name" value={dir.name} onChange={(e) => {
                            const dirs = [...(data.directors ?? [])];
                            dirs[i] = { ...dirs[i], name: e.target.value };
                            update({ directors: dirs });
                          }} />
                          <Input placeholder="Email" value={dir.email} onChange={(e) => {
                            const dirs = [...(data.directors ?? [])];
                            dirs[i] = { ...dirs[i], email: e.target.value };
                            update({ directors: dirs });
                          }} />
                          <Input placeholder="Phone" value={dir.phone} onChange={(e) => {
                            const dirs = [...(data.directors ?? [])];
                            dirs[i] = { ...dirs[i], phone: e.target.value };
                            update({ directors: dirs });
                          }} />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Address */}
                <div className="pt-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Country</Label>
                      <Select value={data.address?.country ?? ""} onValueChange={(v) => update({ address: { ...data.address!, country: v } })}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">State / Region</Label>
                      <Input className="mt-1" value={data.address?.state ?? ""} onChange={(e) => update({ address: { ...data.address!, state: e.target.value } })} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">City</Label>
                      <Input className="mt-1" value={data.address?.city ?? ""} onChange={(e) => update({ address: { ...data.address!, city: e.target.value } })} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Street</Label>
                      <Input className="mt-1" value={data.address?.street ?? ""} onChange={(e) => update({ address: { ...data.address!, street: e.target.value } })} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Expected Activity ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Expected Activity</h2>
                  <p className="text-sm text-muted-foreground mt-1">Tell us about your expected usage so we can serve you better.</p>
                </div>
                <div>
                  <Label className="text-sm">Expected Monthly Volume</Label>
                  <Select value={data.expectedMonthlyVolume ?? ""} onValueChange={(v) => update({ expectedMonthlyVolume: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select range" /></SelectTrigger>
                    <SelectContent>{VOLUME_RANGES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Purpose of Account</Label>
                  <Select value={data.accountPurpose ?? ""} onValueChange={(v) => update({ accountPurpose: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select purpose" /></SelectTrigger>
                    <SelectContent>{PURPOSES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Source of Funds</Label>
                  <Select value={data.sourceOfFunds ?? ""} onValueChange={(v) => update({ sourceOfFunds: v as SourceOfFunds })}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>{SOURCE_OF_FUNDS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Transaction Corridors</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CORRIDORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          const current = data.corridors ?? [];
                          update({ corridors: current.includes(c) ? current.filter((x) => x !== c) : [...current, c] });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                          (data.corridors ?? []).includes(c) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: KYC Uploads ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Document Upload</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload the required documents to verify your identity.
                  </p>
                </div>

                {data.customerType === "individual" ? (
                  <>
                    <UploadSlot
                      label="ID Document (Front)"
                      category="id_front"
                      docs={data.documents ?? []}
                      onUpload={handleFileUpload}
                      onRemove={removeDoc}
                      required
                    />
                    <UploadSlot
                      label="ID Document (Back)"
                      category="id_back"
                      docs={data.documents ?? []}
                      onUpload={handleFileUpload}
                      onRemove={removeDoc}
                    />
                    <UploadSlot
                      label="Proof of Address"
                      category="proof_of_address"
                      docs={data.documents ?? []}
                      onUpload={handleFileUpload}
                      onRemove={removeDoc}
                      required
                    />
                  </>
                ) : (
                  <>
                    <UploadSlot
                      label="CAC / Business Certificate"
                      category="cac"
                      docs={data.documents ?? []}
                      onUpload={handleFileUpload}
                      onRemove={removeDoc}
                      required
                    />
                    <UploadSlot
                      label="Proof of Business Address"
                      category="proof_of_address"
                      docs={data.documents ?? []}
                      onUpload={handleFileUpload}
                      onRemove={removeDoc}
                      required
                    />
                    <UploadSlot
                      label="Director ID"
                      category="director_id"
                      docs={data.documents ?? []}
                      onUpload={handleFileUpload}
                      onRemove={removeDoc}
                      required
                    />
                    <UploadSlot
                      label="MEMART (optional)"
                      category="memart"
                      docs={data.documents ?? []}
                      onUpload={handleFileUpload}
                      onRemove={removeDoc}
                    />
                  </>
                )}
              </div>
            )}

            {/* ── Step 5: Review & Submit ── */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Review & Submit</h2>
                  <p className="text-sm text-muted-foreground mt-1">Please review your information before submitting.</p>
                </div>

                <div className="space-y-4">
                  <ReviewSection title="Contact">
                    <ReviewField label="Name" value={data.fullName} />
                    <ReviewField label="Email" value={data.email} />
                    <ReviewField label="Phone" value={`${data.phoneCountryCode} ${data.phone}`} />
                  </ReviewSection>

                  <ReviewSection title="Account">
                    <ReviewField label="Type" value={data.customerType ?? ""} />
                    {data.customerType === "individual" && <ReviewField label="Date of Birth" value={data.dateOfBirth ?? ""} />}
                    {data.customerType === "business" && (
                      <>
                        <ReviewField label="RC Number" value={data.rcNumber ?? ""} />
                        <ReviewField label="Nature" value={data.businessNature ?? ""} />
                      </>
                    )}
                  </ReviewSection>

                  <ReviewSection title="Address">
                    <ReviewField label="Location" value={[data.address?.street, data.address?.city, data.address?.state, data.address?.country].filter(Boolean).join(", ")} />
                  </ReviewSection>

                  <ReviewSection title="Activity">
                    <ReviewField label="Monthly Volume" value={data.expectedMonthlyVolume ?? ""} />
                    <ReviewField label="Purpose" value={PURPOSES.find((p) => p.value === data.accountPurpose)?.label ?? ""} />
                    <ReviewField label="Source of Funds" value={SOURCE_OF_FUNDS.find((s) => s.value === data.sourceOfFunds)?.label ?? ""} />
                    <ReviewField label="Corridors" value={(data.corridors ?? []).join(", ")} />
                  </ReviewSection>

                  <ReviewSection title="Documents">
                    {(data.documents ?? []).map((d) => (
                      <ReviewField key={d.id} label={d.category.replace(/_/g, " ")} value={d.name} />
                    ))}
                    {(data.documents ?? []).length === 0 && <p className="text-xs text-muted-foreground">No documents uploaded</p>}
                  </ReviewSection>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                  <Checkbox
                    id="confirm"
                    checked={data.confirmed ?? false}
                    onCheckedChange={(v) => update({ confirmed: v === true })}
                  />
                  <label htmlFor="confirm" className="text-sm cursor-pointer leading-relaxed">
                    I confirm that the information provided is accurate and complete to the best of my knowledge. I understand that providing false information may result in the rejection of my application.
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed()} className="bg-success hover:bg-success/90 text-success-foreground">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ──

function UploadSlot({
  label,
  category,
  docs,
  onUpload,
  onRemove,
  required,
}: {
  label: string;
  category: string;
  docs: { id: string; name: string; category: string }[];
  onUpload: (category: string) => void;
  onRemove: (id: string) => void;
  required?: boolean;
}) {
  const uploaded = docs.find((d) => d.category === category);

  return (
    <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm">{label}</Label>
          {required && <span className="text-xs text-destructive">*</span>}
        </div>
        {uploaded && (
          <Badge variant="outline" className="text-success border-success/30 bg-success/10 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Uploaded
          </Badge>
        )}
      </div>
      {uploaded ? (
        <div className="flex items-center justify-between p-2 rounded bg-card border border-border">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {uploaded.name}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemove(uploaded.id)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => onUpload(category)} className="w-full">
          <Upload className="h-4 w-4 mr-2" /> Choose File
        </Button>
      )}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-muted/20">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value || "—"}</span>
    </div>
  );
}
