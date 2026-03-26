import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import Rates from "./pages/Rates";
import VirtualAccounts from "./pages/VirtualAccounts";
import Approvals from "./pages/Approvals";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import OnboardingWizard from "./pages/OnboardingWizard";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerOnboarding from "./pages/CustomerOnboarding";
import FinancialMetrics from "./pages/FinancialMetrics";
import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";
import TransactOnBehalf from "./pages/TransactOnBehalf";
import MerchantPortfolio from "./pages/MerchantPortfolio";
import MerchantProfile from "./pages/MerchantProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboard" element={<CustomerOnboarding />} />
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/onboarding" element={<AppLayout><Onboarding /></AppLayout>} />
            <Route path="/onboarding/:id" element={<AppLayout><OnboardingWizard /></AppLayout>} />
            <Route path="/onboarding/:id/detail" element={<AppLayout><CustomerDetail /></AppLayout>} />
            <Route path="/transactions" element={<AppLayout><Transactions /></AppLayout>} />
            <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
            <Route path="/rates" element={<AppLayout><Rates /></AppLayout>} />
            <Route path="/virtual-accounts" element={<AppLayout><VirtualAccounts /></AppLayout>} />
            <Route path="/approvals" element={<AppLayout><Approvals /></AppLayout>} />
            <Route path="/audit-logs" element={<AppLayout><AuditLogs /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="/financial-metrics" element={<AppLayout><FinancialMetrics /></AppLayout>} />
            <Route path="/expenses" element={<AppLayout><Expenses /></AppLayout>} />
            <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
            <Route path="/merchants" element={<AppLayout><MerchantPortfolio /></AppLayout>} />
            <Route path="/merchants/:id" element={<AppLayout><MerchantProfile /></AppLayout>} />
            <Route path="/transact-on-behalf" element={<AppLayout><TransactOnBehalf /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
