export interface MerchantWallet {
  currency: string;
  balance: number;
  status: "active" | "frozen";
}

export interface SavedBeneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  country: string;
  currency: string;
}

export interface MerchantTransaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  beneficiary: string;
}

export interface MerchantVirtualAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: "active" | "expired";
}

export interface Merchant {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  status: "active" | "pending" | "restricted";
  kycStatus: "verified" | "pending" | "rejected";
  salesRepId: string;
  salesRepName: string;
  lastTransactionDate: string | null;
  totalProcessedVolume: number;
  wallets: MerchantWallet[];
  virtualAccounts: MerchantVirtualAccount[];
  savedBeneficiaries: SavedBeneficiary[];
  recentTransactions: MerchantTransaction[];
  onboardingId: string;
  createdAt: string;
}

export const mockMerchants: Merchant[] = [
  {
    id: "MER-001",
    businessName: "Adebayo Ogunleye",
    email: "adebayo@gmail.com",
    phone: "+234 801 234 5678",
    status: "active",
    kycStatus: "verified",
    salesRepId: "usr_003",
    salesRepName: "John Doe",
    lastTransactionDate: "2026-03-24T14:30:00Z",
    totalProcessedVolume: 45_750_000,
    wallets: [
      { currency: "NGN", balance: 12_500_000, status: "active" },
      { currency: "USD", balance: 8_250, status: "active" },
      { currency: "GBP", balance: 3_100, status: "active" },
    ],
    virtualAccounts: [
      { bankName: "Wema Bank", accountName: "Adebayo Ogunleye", accountNumber: "9912345678", status: "active" },
    ],
    savedBeneficiaries: [
      { id: "BEN-001", name: "James Smith", bankName: "Barclays UK", accountNumber: "****4521", country: "United Kingdom", currency: "GBP" },
      { id: "BEN-002", name: "Chen Wei", bankName: "Bank of China", accountNumber: "****8832", country: "China", currency: "CNY" },
    ],
    recentTransactions: [
      { id: "TXN-90001", date: "2026-03-24T14:30:00Z", type: "Transfer", amount: 5_200_000, currency: "NGN", status: "completed", beneficiary: "James Smith" },
      { id: "TXN-90002", date: "2026-03-22T09:15:00Z", type: "Transfer", amount: 3_800_000, currency: "NGN", status: "completed", beneficiary: "Chen Wei" },
      { id: "TXN-90003", date: "2026-03-18T16:45:00Z", type: "Add Funds", amount: 10_000_000, currency: "NGN", status: "completed", beneficiary: "Self" },
      { id: "TXN-90004", date: "2026-03-15T11:20:00Z", type: "Transfer", amount: 1_500_000, currency: "NGN", status: "failed", beneficiary: "James Smith" },
    ],
    onboardingId: "ONB-001",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "MER-002",
    businessName: "Greenfield Agro Ltd",
    email: "info@greenfieldagro.ng",
    phone: "+234 908 765 4321",
    status: "pending",
    kycStatus: "pending",
    salesRepId: "usr_003",
    salesRepName: "John Doe",
    lastTransactionDate: null,
    totalProcessedVolume: 0,
    wallets: [
      { currency: "NGN", balance: 0, status: "active" },
    ],
    virtualAccounts: [],
    savedBeneficiaries: [],
    recentTransactions: [],
    onboardingId: "ONB-002",
    createdAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "MER-003",
    businessName: "Kweku Asante Trading",
    email: "kweku.asante@mail.com",
    phone: "+233 24 123 4567",
    status: "active",
    kycStatus: "verified",
    salesRepId: "usr_003",
    salesRepName: "John Doe",
    lastTransactionDate: "2026-03-20T10:00:00Z",
    totalProcessedVolume: 18_200_000,
    wallets: [
      { currency: "NGN", balance: 4_800_000, status: "active" },
      { currency: "USD", balance: 2_400, status: "active" },
    ],
    virtualAccounts: [
      { bankName: "Wema Bank", accountName: "Kweku Asante", accountNumber: "9923456789", status: "active" },
    ],
    savedBeneficiaries: [
      { id: "BEN-003", name: "Mike Johnson", bankName: "Chase Bank", accountNumber: "****7712", country: "United States", currency: "USD" },
    ],
    recentTransactions: [
      { id: "TXN-90010", date: "2026-03-20T10:00:00Z", type: "Transfer", amount: 2_100_000, currency: "NGN", status: "completed", beneficiary: "Mike Johnson" },
      { id: "TXN-90011", date: "2026-03-16T08:30:00Z", type: "Transfer", amount: 950_000, currency: "NGN", status: "pending", beneficiary: "Mike Johnson" },
    ],
    onboardingId: "ONB-003",
    createdAt: "2026-03-02T08:00:00Z",
  },
  {
    id: "MER-004",
    businessName: "Folake Adeyemi Enterprises",
    email: "folake@email.com",
    phone: "+234 801 234 5678",
    status: "restricted",
    kycStatus: "verified",
    salesRepId: "usr_006",
    salesRepName: "Sarah Sales",
    lastTransactionDate: "2026-03-10T12:00:00Z",
    totalProcessedVolume: 92_300_000,
    wallets: [
      { currency: "NGN", balance: 25_000_000, status: "frozen" },
      { currency: "GBP", balance: 12_500, status: "frozen" },
    ],
    virtualAccounts: [
      { bankName: "Wema Bank", accountName: "Folake Adeyemi", accountNumber: "9934567890", status: "active" },
    ],
    savedBeneficiaries: [
      { id: "BEN-004", name: "London Imports Ltd", bankName: "HSBC", accountNumber: "****3344", country: "United Kingdom", currency: "GBP" },
    ],
    recentTransactions: [
      { id: "TXN-90020", date: "2026-03-10T12:00:00Z", type: "Transfer", amount: 15_000_000, currency: "NGN", status: "completed", beneficiary: "London Imports Ltd" },
    ],
    onboardingId: "",
    createdAt: "2026-01-20T08:00:00Z",
  },
];
