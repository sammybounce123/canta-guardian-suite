export type TxOnBehalfStatus =
  | "draft"
  | "awaiting_consent"
  | "awaiting_funding"
  | "funded"
  | "processing"
  | "sent_to_beneficiary"
  | "completed"
  | "failed"
  | "cancelled";

export type ConsentMethod = "otp" | "document_upload" | "approval_link";

export type PaymentMethod = "bank_transfer" | "wallet" | "card" | "cash";

export interface BeneficiaryDetails {
  name: string;
  bankName: string;
  accountNumber: string;
  swiftBic?: string;
  country: string;
  currency: string;
  paymentMethod: PaymentMethod;
}

export interface FxQuote {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  inputAmount: number;
  convertedAmount: number;
  fee: number;
  totalCost: number;
  timestamp: string;
  expiresAt: string;
}

export interface ConsentRecord {
  method: ConsentMethod;
  timestamp: string;
  verified: boolean;
  reference?: string;
}

export interface VirtualAccountInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  expiresAt?: string;
}

export interface TxOnBehalfRecord {
  id: string;
  customerId: string;
  customerName: string;
  salesAgentId: string;
  salesAgentName: string;
  amountNgn: number;
  beneficiary: BeneficiaryDetails;
  fxQuote: FxQuote;
  narration: string;
  consent: ConsentRecord;
  virtualAccount?: VirtualAccountInfo;
  status: TxOnBehalfStatus;
  fundingReference?: string;
  providerPayoutReference?: string;
  approvedBy?: string;
  complianceFlags: string[];
  timeline: TxTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TxTimelineEvent {
  id: string;
  action: string;
  actor: string;
  role: string;
  timestamp: string;
  details?: string;
}

export interface WizardState {
  step: number;
  customerId: string;
  customerName: string;
  customerStatus: string;
  kycApproved: boolean;
  accountFrozen: boolean;
  walletActive: boolean;
  amountNgn: number;
  selectedCurrency: string;
  fxQuote: FxQuote | null;
  rateLocked: boolean;
  beneficiary: Partial<BeneficiaryDetails>;
  narration: string;
  consentMethod: ConsentMethod | null;
  consentVerified: boolean;
  virtualAccount: VirtualAccountInfo | null;
  fundingDetected: boolean;
}
