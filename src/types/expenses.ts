export type ExpenseStatus = "draft" | "pending_approval" | "approved" | "rejected";

export type ExpenseCategory =
  | "bank_charges"
  | "liquidity_provider_fees"
  | "fx_provider_costs"
  | "infrastructure"
  | "payroll"
  | "office_expenses"
  | "marketing"
  | "legal_compliance"
  | "miscellaneous";

export type PaymentMethod = "bank_transfer" | "card" | "cash" | "crypto" | "other";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  expenseDate: string;
  vendor: string;
  paymentMethod: PaymentMethod;
  description: string;
  linkedTransactionId?: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  createdBy: string;
  createdById: string;
  approvedBy?: string;
  approvedById?: string;
  createdAt: string;
  updatedAt: string;
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "bank_charges", label: "Bank Charges" },
  { value: "liquidity_provider_fees", label: "Liquidity Provider Fees" },
  { value: "fx_provider_costs", label: "FX Provider Costs" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "payroll", label: "Payroll" },
  { value: "office_expenses", label: "Office Expenses" },
  { value: "marketing", label: "Marketing" },
  { value: "legal_compliance", label: "Legal & Compliance" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "crypto", label: "Crypto" },
  { value: "other", label: "Other" },
];

export const STATUS_CONFIG: Record<ExpenseStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending_approval: { label: "Pending Approval", className: "bg-warning/20 text-warning" },
  approved: { label: "Approved", className: "bg-success/20 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/20 text-destructive" },
};
