export const mockFxRates: Record<string, { rate: number; fee: number }> = {
  GBP: { rate: 0.00052, fee: 2500 },
  USD: { rate: 0.00065, fee: 2000 },
  CNY: { rate: 0.00478, fee: 3000 },
  EUR: { rate: 0.00060, fee: 2500 },
};

export const HIGH_VALUE_THRESHOLD = 50_000_000; // 50M NGN
export const HIGH_RISK_CORRIDORS = ["CNY", "AED"];
