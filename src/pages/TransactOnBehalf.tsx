import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertTriangle,
  Clock, ShieldCheck, CreditCard, Send, Copy, Loader2, Lock,
  User, Banknote, FileText, KeyRound, Landmark, Radio, MailPlus
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mockOnboardingDrafts } from "@/data/onboardingMockData";
import { mockFxRates, HIGH_VALUE_THRESHOLD, HIGH_RISK_CORRIDORS } from "@/data/mockFxRates";
import type {
  WizardState, ConsentMethod, FxQuote, BeneficiaryDetails,
  TxOnBehalfStatus, PaymentMethod
} from "@/types/transactionOnBehalf";

const STEPS = [
  "Customer Verification",
  "Amount & FX Quote",
  "Beneficiary Details",
  "Narration",
  "Customer Consent",
  "Virtual Account",
  "Awaiting Funding",
  "Treasury Execution",
  "Beneficiary Payment",
  "Confirmation",
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  awaiting_consent: "bg-warning/15 text-warning",
  awaiting_funding: "bg-primary/15 text-primary",
  funded: "bg-success/15 text-success",
  processing: "bg-primary/15 text-primary",
  sent_to_beneficiary: "bg-primary/15 text-primary",
  completed: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const currencySymbols: Record<string, string> = {
  NGN: "₦", GBP: "£", USD: "$", CNY: "¥", EUR: "€",
};

function formatMoney(amount: number, currency: string = "NGN") {
  const sym = currencySymbols[currency] ?? currency;
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TransactOnBehalf() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const customerId = params.get("customerId") ?? "";

  const customer = mockOnboardingDrafts.find((d) => d.id === customerId);

  const canInitiate = hasPermission("transactions", "act_on_behalf");
  const canApprove = hasPermission("transactions", "approve") || hasPermission("approvals", "approve");
  const isSales = user?.role === "sales";

  const [wizard, setWizard] = useState<WizardState>({
    step: 0,
    customerId,
    customerName: customer?.fullName ?? "",
    customerStatus: customer?.status ?? "draft",
    kycApproved: customer?.status === "approved",
    accountFrozen: false,
    walletActive: customer?.status === "approved",
    amountNgn: 0,
    selectedCurrency: "GBP",
    fxQuote: null,
    rateLocked: false,
    beneficiary: {},
    narration: "",
    consentMethod: null,
    consentVerified: false,
    virtualAccount: null,
    fundingDetected: false,
  });

  const [rateExpiry, setRateExpiry] = useState(60);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [txStatus, setTxStatus] = useState<TxOnBehalfStatus>("draft");
  const [complianceFlags, setComplianceFlags] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Rate expiry countdown
  useEffect(() => {
    if (!wizard.rateLocked || rateExpiry <= 0) return;
    const timer = setInterval(() => setRateExpiry((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [wizard.rateLocked, rateExpiry]);

  useEffect(() => {
    if (rateExpiry === 0 && wizard.rateLocked) {
      if (wizard.step <= 1) {
        setWizard((w) => ({ ...w, rateLocked: false, fxQuote: null }));
        toast.error("Rate expired. Please get a new quote.");
      }
      // Don't reset rate if user has already moved past the FX quote step
    }
  }, [rateExpiry, wizard.rateLocked, wizard.step]);

  const generateQuote = useCallback(() => {
    const rateInfo = mockFxRates[wizard.selectedCurrency];
    if (!rateInfo || wizard.amountNgn <= 0) return;
    const converted = wizard.amountNgn * rateInfo.rate;
    const quote: FxQuote = {
      fromCurrency: "NGN",
      toCurrency: wizard.selectedCurrency,
      rate: rateInfo.rate,
      inputAmount: wizard.amountNgn,
      convertedAmount: converted,
      fee: rateInfo.fee,
      totalCost: wizard.amountNgn + rateInfo.fee,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };
    setWizard((w) => ({ ...w, fxQuote: quote }));
  }, [wizard.amountNgn, wizard.selectedCurrency]);

  const lockRate = () => {
    if (!wizard.fxQuote) return;
    setWizard((w) => ({ ...w, rateLocked: true }));
    setRateExpiry(60);
    // Check compliance flags
    const flags: string[] = [];
    if (wizard.amountNgn >= HIGH_VALUE_THRESHOLD) flags.push("High value transaction");
    if (HIGH_RISK_CORRIDORS.includes(wizard.selectedCurrency)) flags.push("High-risk corridor");
    setComplianceFlags(flags);
    toast.success("Rate locked for 60 seconds");
  };

  const sendOtp = () => {
    setOtpSent(true);
    toast.success(`OTP sent to ${customer?.email}`);
  };

  const verifyOtp = () => {
    if (otpValue.length === 6) {
      setWizard((w) => ({ ...w, consentVerified: true }));
      setTxStatus("awaiting_funding");
      toast.success("Customer consent verified");
    } else {
      toast.error("Invalid OTP");
    }
  };

  const generateVA = () => {
    setWizard((w) => ({
      ...w,
      virtualAccount: {
        bankName: "Wema Bank",
        accountName: customer?.fullName ?? "Customer",
        accountNumber: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    }));
    toast.success("Virtual account generated and sent to customer");
  };

  const simulateFunding = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setWizard((w) => ({ ...w, fundingDetected: true }));
      setTxStatus("funded");
      setIsProcessing(false);
      toast.success("Payment detected — transaction funded");
    }, 2000);
  };

  const approvePayout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setTxStatus("sent_to_beneficiary");
      setIsProcessing(false);
      toast.success("Payout approved and sent to beneficiary");
    }, 1500);
  };

  const completeTx = () => {
    setTxStatus("completed");
    toast.success("Transaction completed successfully");
  };

  const update = (partial: Partial<WizardState>) => setWizard((w) => ({ ...w, ...partial }));
  const next = () => update({ step: wizard.step + 1 });
  const prev = () => update({ step: wizard.step - 1 });

  if (!canInitiate) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-lg font-medium">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">You don't have permission to initiate transactions on behalf of customers.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!customer) {
    const approvedCustomers = mockOnboardingDrafts.filter((d) => d.status === "approved");
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl font-semibold">Transaction on Behalf of Customer</h1>
          <p className="text-sm text-muted-foreground">Select an approved customer to initiate a transaction</p>
        </div>
        {approvedCustomers.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No approved customers available.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {approvedCustomers.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/transact-on-behalf?customerId=${c.id}`)}
              >
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.fullName}</p>
                      <p className="text-xs text-muted-foreground">{c.email} · {c.id}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const progress = ((wizard.step + 1) / STEPS.length) * 100;

  const canProceed = (): boolean => {
    switch (wizard.step) {
      case 0: return wizard.kycApproved && !wizard.accountFrozen && wizard.walletActive;
      case 1: return wizard.rateLocked && !!wizard.fxQuote;
      case 2: return !!(
        wizard.beneficiary.name?.trim() &&
        wizard.beneficiary.bankName?.trim() &&
        wizard.beneficiary.accountNumber?.trim() &&
        wizard.beneficiary.country?.trim() &&
        wizard.selectedCurrency &&
        wizard.beneficiary.paymentMethod
      );
      case 3: return wizard.narration.trim().length > 0;
      case 4: return wizard.consentVerified;
      case 5: return !!wizard.virtualAccount;
      case 6: return wizard.fundingDetected;
      case 7: return txStatus === "sent_to_beneficiary" || txStatus === "completed";
      case 8: return txStatus === "completed" || txStatus === "sent_to_beneficiary";
      default: return true;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Transaction on Behalf of Customer</h1>
          <p className="text-sm text-muted-foreground">{customer.fullName} · {customer.id}</p>
        </div>
        <Badge className={`${statusColors[txStatus]} border-0`}>{txStatus.replace(/_/g, " ")}</Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {wizard.step + 1} of {STEPS.length}</span>
          <span>{STEPS[wizard.step]}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= wizard.step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      {/* Real-time Timeline */}
      <Card className="bg-card border-border">
        <CardContent className="py-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((stepLabel, i) => {
              const isCompleted = i < wizard.step;
              const isCurrent = i === wizard.step;
              return (
                <div key={i} className="flex items-center min-w-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isCompleted ? "bg-success text-success-foreground" :
                      isCurrent ? "bg-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={`text-[9px] text-center leading-tight max-w-[60px] ${
                      isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                    }`}>
                      {stepLabel}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 w-4 mx-0.5 mt-[-12px] ${isCompleted ? "bg-success" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Compliance flags */}
      {complianceFlags.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-warning">Compliance Flags</p>
              {complianceFlags.map((f) => <p key={f} className="text-muted-foreground">{f}</p>)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {wizard.step === 0 && <><ShieldCheck className="h-4 w-4" /> Customer Verification</>}
            {wizard.step === 1 && <><Banknote className="h-4 w-4" /> Amount & FX Quote</>}
            {wizard.step === 2 && <><User className="h-4 w-4" /> Beneficiary Details</>}
            {wizard.step === 3 && <><FileText className="h-4 w-4" /> Narration</>}
            {wizard.step === 4 && <><KeyRound className="h-4 w-4" /> Customer Consent</>}
            {wizard.step === 5 && <><Landmark className="h-4 w-4" /> Virtual Account</>}
            {wizard.step === 6 && <><Radio className="h-4 w-4" /> Awaiting Funding</>}
            {wizard.step === 7 && <><CreditCard className="h-4 w-4" /> Treasury Execution</>}
            {wizard.step === 8 && <><Send className="h-4 w-4" /> Beneficiary Payment</>}
            {wizard.step === 9 && <><CheckCircle2 className="h-4 w-4" /> Confirmation</>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Step 0: Customer Verification */}
          {wizard.step === 0 && (
            <div className="space-y-3">
              <VerifyRow label="KYC Status" ok={wizard.kycApproved} okText="Approved" failText="Not Approved — KYC must be completed" />
              <VerifyRow label="Account Status" ok={!wizard.accountFrozen} okText="Active" failText="Account is frozen" />
              <VerifyRow label="Wallet Status" ok={wizard.walletActive} okText="Active" failText="Wallet inactive" />
              {!canProceed() && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
                  <XCircle className="h-4 w-4" /> Cannot proceed — resolve issues above
                </div>
              )}
            </div>
          )}

          {/* Step 1: Amount & FX */}
          {wizard.step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (NGN)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 10000000"
                    value={wizard.amountNgn || ""}
                    onChange={(e) => update({ amountNgn: Number(e.target.value), rateLocked: false, fxQuote: null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Currency</Label>
                  <Select value={wizard.selectedCurrency} onValueChange={(v) => update({ selectedCurrency: v, rateLocked: false, fxQuote: null })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(mockFxRates).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" onClick={generateQuote} disabled={wizard.amountNgn <= 0}>
                Get Quote
              </Button>
              {wizard.fxQuote && (
                <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Input</span><span>{formatMoney(wizard.fxQuote.inputAmount, "NGN")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span>1 NGN = {wizard.fxQuote.rate} {wizard.fxQuote.toCurrency}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Converted</span><span className="font-medium">{formatMoney(wizard.fxQuote.convertedAmount, wizard.fxQuote.toCurrency)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span>{formatMoney(wizard.fxQuote.fee, "NGN")}</span></div>
                  <Separator />
                  <div className="flex justify-between font-medium"><span>Total Cost</span><span>{formatMoney(wizard.fxQuote.totalCost, "NGN")}</span></div>
                  {wizard.rateLocked ? (
                    <div className="flex items-center gap-2 text-xs text-primary mt-2">
                      <Lock className="h-3 w-3" />
                      Rate locked — expires in {rateExpiry}s
                    </div>
                  ) : (
                    <Button size="sm" onClick={lockRate} className="mt-2 gap-1.5">
                      <Lock className="h-3 w-3" /> Lock Rate (60s)
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Beneficiary */}
          {wizard.step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Beneficiary Name" value={wizard.beneficiary.name} onChange={(v) => update({ beneficiary: { ...wizard.beneficiary, name: v } })} />
              <Field label="Bank Name" value={wizard.beneficiary.bankName} onChange={(v) => update({ beneficiary: { ...wizard.beneficiary, bankName: v } })} />
              <Field label="Account Number / IBAN" value={wizard.beneficiary.accountNumber} onChange={(v) => update({ beneficiary: { ...wizard.beneficiary, accountNumber: v } })} />
              <Field label="SWIFT/BIC (optional)" value={wizard.beneficiary.swiftBic} onChange={(v) => update({ beneficiary: { ...wizard.beneficiary, swiftBic: v } })} />
              <Field label="Country" value={wizard.beneficiary.country} onChange={(v) => update({ beneficiary: { ...wizard.beneficiary, country: v } })} />
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={wizard.selectedCurrency} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={wizard.beneficiary.paymentMethod ?? ""} onValueChange={(v) => update({ beneficiary: { ...wizard.beneficiary, paymentMethod: v as PaymentMethod } })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Narration */}
          {wizard.step === 3 && (
            <div className="space-y-3">
              <Label>Purpose of Payment</Label>
              <Textarea
                placeholder="e.g. Goods purchase, Tuition payment, Supplier settlement..."
                value={wizard.narration}
                onChange={(e) => update({ narration: e.target.value })}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">This will appear in transaction logs, payout records, and beneficiary receipt.</p>
            </div>
          )}

          {/* Step 4: Customer Consent */}
          {wizard.step === 4 && (
            <div className="space-y-4">
              {!wizard.consentVerified ? (
                <>
                  <Label>Consent Method</Label>
                  <RadioGroup value={wizard.consentMethod ?? ""} onValueChange={(v) => update({ consentMethod: v as ConsentMethod })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="otp" id="otp" />
                      <Label htmlFor="otp" className="font-normal">OTP Verification (SMS/Email)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="document_upload" id="doc" />
                      <Label htmlFor="doc" className="font-normal">Recorded Consent (Document Upload)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="approval_link" id="link" />
                      <Label htmlFor="link" className="font-normal">Customer Approval Link</Label>
                    </div>
                  </RadioGroup>

                  {wizard.consentMethod === "otp" && (
                    <div className="space-y-3 pt-2">
                      {!otpSent ? (
                        <Button variant="outline" onClick={sendOtp} className="gap-1.5">
                          <Send className="h-3.5 w-3.5" /> Send OTP to {customer.email}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Label>Enter 6-digit OTP</Label>
                          <div className="flex gap-2">
                            <Input
                              maxLength={6}
                              placeholder="000000"
                              value={otpValue}
                              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                              className="w-[140px] font-mono tracking-widest"
                            />
                            <Button onClick={verifyOtp}>Verify</Button>
                          </div>
                          <p className="text-xs text-muted-foreground">OTP sent to {customer.email}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {wizard.consentMethod === "document_upload" && (
                    <div className="space-y-2 pt-2">
                      <Button variant="outline" onClick={() => { update({ consentVerified: true }); toast.success("Consent document uploaded"); }}>
                        Upload Consent Document
                      </Button>
                      <p className="text-xs text-muted-foreground">Upload a signed authorization or recorded voice note.</p>
                    </div>
                  )}

                  {wizard.consentMethod === "approval_link" && (
                    <div className="space-y-2 pt-2">
                      <Button variant="outline" onClick={() => { update({ consentVerified: true }); toast.success("Approval link sent and confirmed"); }} className="gap-1.5">
                        <MailPlus className="h-3.5 w-3.5" /> Send Approval Link
                      </Button>
                      <p className="text-xs text-muted-foreground">Customer will receive a link to authorize: "I authorize Canta to process this transaction on my behalf."</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> Customer consent verified via {wizard.consentMethod?.replace(/_/g, " ")}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Virtual Account */}
          {wizard.step === 5 && (
            <div className="space-y-4">
              {!wizard.virtualAccount ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Generate a virtual account for the customer to fund this transaction.</p>
                  <Button onClick={generateVA} className="gap-1.5">
                    <Landmark className="h-3.5 w-3.5" /> Generate Virtual Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                    <VARow label="Bank" value={wizard.virtualAccount.bankName} />
                    <VARow label="Account Name" value={wizard.virtualAccount.accountName} />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account Number</span>
                      <span className="flex items-center gap-1.5 font-mono">
                        {wizard.virtualAccount.accountNumber}
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(wizard.virtualAccount!.accountNumber); toast.success("Copied"); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </span>
                    </div>
                    <VARow label="Amount" value={formatMoney(wizard.fxQuote?.totalCost ?? 0, "NGN")} />
                    {wizard.virtualAccount.expiresAt && <VARow label="Expires" value={new Date(wizard.virtualAccount.expiresAt).toLocaleTimeString()} />}
                  </div>
                  <p className="text-xs text-muted-foreground">VA details sent to customer via Email & SMS.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Awaiting Funding */}
          {wizard.step === 6 && (
            <div className="space-y-4 text-center py-4">
              {!wizard.fundingDetected ? (
                <>
                  {isProcessing ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  ) : (
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
                  )}
                  <p className="text-sm text-muted-foreground">Waiting for customer to fund {formatMoney(wizard.fxQuote?.totalCost ?? 0, "NGN")}</p>
                  <Button variant="outline" onClick={simulateFunding} disabled={isProcessing}>
                    {isProcessing ? "Detecting..." : "Simulate Payment"}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  <p className="text-sm font-medium text-success">Payment received</p>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Treasury Execution */}
          {wizard.step === 7 && (
            <div className="space-y-4">
              {txStatus === "funded" ? (
                <>
                  <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{customer.fullName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Beneficiary</span><span>{wizard.beneficiary.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span>{formatMoney(wizard.fxQuote?.convertedAmount ?? 0, wizard.selectedCurrency)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Narration</span><span>{wizard.narration}</span></div>
                  </div>
                  {(canApprove && !isSales) ? (
                    <div className="flex gap-2">
                      <Button onClick={approvePayout} disabled={isProcessing} className="gap-1.5">
                        {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Approve & Execute Payout
                      </Button>
                      <Button variant="destructive" onClick={() => { setTxStatus("cancelled"); toast.error("Transaction cancelled"); }}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-sm text-warning">
                      <Clock className="h-4 w-4" /> Awaiting Treasury/Admin approval. Sales cannot execute final payout.
                    </div>
                  )}
                </>
              ) : txStatus === "sent_to_beneficiary" || txStatus === "completed" ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> Payout approved and sent
                </div>
              ) : txStatus === "cancelled" ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
                  <XCircle className="h-4 w-4" /> Transaction cancelled
                </div>
              ) : null}
            </div>
          )}

          {/* Step 8: Beneficiary Payment */}
          {wizard.step === 8 && (
            <div className="space-y-4 text-center py-4">
              {txStatus === "sent_to_beneficiary" ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Processing payout to {wizard.beneficiary.name}...</p>
                  <Button onClick={completeTx}>Confirm Delivery</Button>
                </>
              ) : txStatus === "completed" ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  <p className="text-sm font-medium text-success">Funds delivered to beneficiary</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Step 9: Confirmation */}
          {wizard.step === 9 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle2 className="h-12 w-12 text-success" />
                <h3 className="text-lg font-semibold">Transaction Complete</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {formatMoney(wizard.fxQuote?.convertedAmount ?? 0, wizard.selectedCurrency)} sent to {wizard.beneficiary.name}.
                  Customer has been notified.
                </p>
              </div>
              <Separator />
              <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                <VARow label="Transaction ID" value={`TXB-${Date.now().toString(36).toUpperCase()}`} />
                <VARow label="Customer" value={customer.fullName ?? ""} />
                <VARow label="Beneficiary" value={wizard.beneficiary.name ?? ""} />
                <VARow label="Amount Sent" value={formatMoney(wizard.fxQuote?.convertedAmount ?? 0, wizard.selectedCurrency)} />
                <VARow label="Amount Funded" value={formatMoney(wizard.fxQuote?.totalCost ?? 0, "NGN")} />
                <VARow label="FX Rate" value={`${wizard.fxQuote?.rate}`} />
                <VARow label="Narration" value={wizard.narration} />
                <VARow label="Consent" value={wizard.consentMethod?.replace(/_/g, " ") ?? ""} />
                <VARow label="Status" value="Completed" />
              </div>
              <Button className="w-full" onClick={() => navigate("/transactions")}>View in Transactions</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {wizard.step < 9 && txStatus !== "cancelled" && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={prev} disabled={wizard.step === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={next} disabled={!canProceed()}>
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

function VerifyRow({ label, ok, okText, failText }: { label: string; ok: boolean; okText: string; failText: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
      <span className="text-sm font-medium">{label}</span>
      {ok ? (
        <span className="flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> {okText}</span>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-destructive"><XCircle className="h-4 w-4" /> {failText}</span>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={label} />
    </div>
  );
}

function VARow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
