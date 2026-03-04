export type CustomerType = "individual" | "business";
export type CustomerSegment = "retail" | "sme" | "enterprise";
export type OnboardingStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "more_info_needed";
export type CustomerTag = "lead" | "warm" | "activated";
export type IdType = "passport" | "nin" | "drivers_license" | "voters_card" | "residence_permit";

export interface OnboardingDraft {
  id: string;
  salesRepId: string;
  salesRepName: string;
  status: OnboardingStatus;
  createdAt: string;
  updatedAt: string;

  // Step 1
  customerType?: CustomerType;
  country?: string;
  nationality?: string;
  segment?: CustomerSegment;

  // Step 2
  fullName?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  dateOfBirth?: string;
  incorporationDate?: string;
  address?: {
    country: string;
    state: string;
    city: string;
    street: string;
  };
  accountPurpose?: string;
  transactionCorridors?: string[];

  // Step 3 Individual
  idType?: IdType;
  idNumber?: string;
  idIssueDate?: string;
  idExpiryDate?: string;

  // Step 3 Business
  rcNumber?: string;
  businessNature?: string;
  website?: string;
  directors?: { name: string; email: string; phone: string }[];

  // Step 4
  documents?: CustomerDocument[];

  // Step 5
  customerId?: string;
  inviteSent?: boolean;
  inviteChannel?: ("email" | "sms")[];
  tag?: CustomerTag;
}

export interface CustomerDocument {
  id: string;
  name: string;
  type: string;
  category: "id_front" | "id_back" | "proof_of_address" | "cac" | "memart" | "other";
  uploadedAt: string;
  fileUrl: string;
  status: "uploaded" | "verified" | "rejected";
}

export interface SalesNote {
  id: string;
  customerId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ComplianceQueueItem {
  id: string;
  customerId: string;
  customerName: string;
  status: OnboardingStatus;
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  expectedMonthlyVolume?: string;
}

export interface InviteLog {
  id: string;
  customerId: string;
  channel: "email" | "sms";
  sentAt: string;
  sentBy: string;
  status: "sent" | "delivered" | "failed";
  recipient: string;
}
