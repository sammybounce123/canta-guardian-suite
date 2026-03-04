export interface InviteToken {
  id: string;
  tokenHash: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  phoneCountryCode?: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "submitted" | "expired" | "revoked";
  otpVerified: boolean;
}

export type CustomerOnboardingStep =
  | "confirm_contact"
  | "customer_type"
  | "profile_details"
  | "expected_activity"
  | "kyc_uploads"
  | "review_submit";

export type SourceOfFunds =
  | "salary"
  | "business_income"
  | "investments"
  | "savings"
  | "gift"
  | "other";

export interface CustomerOnboardingData {
  // Step 1 - Contact (prefilled)
  fullName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  otpVerified: boolean;

  // Step 2 - Customer Type
  customerType?: "individual" | "business";

  // Step 3 - Profile Details (Individual)
  dateOfBirth?: string;
  nationality?: string;
  address?: {
    country: string;
    state: string;
    city: string;
    street: string;
  };

  // Step 3 - Profile Details (Business)
  rcNumber?: string;
  businessNature?: string;
  incorporationDate?: string;
  directors?: { name: string; email: string; phone: string }[];

  // Step 4 - Expected Activity
  expectedMonthlyVolume?: string;
  corridors?: string[];
  sourceOfFunds?: SourceOfFunds;
  accountPurpose?: string;

  // Step 5 - KYC Uploads
  documents?: {
    id: string;
    name: string;
    category: string;
    fileUrl: string;
    uploadedAt: string;
  }[];

  // Step 6
  confirmed?: boolean;
}
