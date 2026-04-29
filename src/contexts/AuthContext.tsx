import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const SESSION_STORAGE_KEY = "canta_ops_session";
const REMEMBER_ME_DAYS = 7;

interface PersistedSession {
  user: InternalUser;
  expiresAt: number | null; // null = session-only (cleared on tab close)
}

function loadSession(): InternalUser | null {
  try {
    // Prefer persistent (remember-me) storage, fall back to session storage
    const raw =
      localStorage.getItem(SESSION_STORAGE_KEY) ??
      sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: PersistedSession = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed.user;
  } catch {
    return null;
  }
}

function saveSession(user: InternalUser, remember: boolean) {
  const payload: PersistedSession = {
    user,
    expiresAt: remember ? Date.now() + REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000 : null,
  };
  const serialized = JSON.stringify(payload);
  if (remember) {
    localStorage.setItem(SESSION_STORAGE_KEY, serialized);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export type UserRole = "super_admin" | "admin" | "sales" | "compliance" | "treasury" | "support" | "finance";

export interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled";
  lastLogin: string;
}

type Resource =
  | "dashboard"
  | "transactions"
  | "customers"
  | "rates"
  | "virtual_accounts"
  | "approvals"
  | "audit_logs"
  | "settings"
  | "internal_users"
  | "onboarding"
  | "kyc"
  | "financial_metrics"
  | "notifications"
  | "reporting"
  | "expenses";

type Action =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "act_on_behalf"
  | "freeze"
  | "unfreeze"
  | "export"
  | "retry"
  | "cancel"
  | "send_invite"
  | "send_notification";

const permissionMatrix: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
  super_admin: {
    dashboard: ["view"],
    transactions: ["view", "create", "update", "delete", "approve", "act_on_behalf", "export", "retry", "cancel"],
    customers: ["view", "create", "update", "delete", "freeze", "unfreeze"],
    rates: ["view", "create", "update", "approve"],
    virtual_accounts: ["view", "create", "update", "delete"],
    approvals: ["view", "approve"],
    audit_logs: ["view"],
    settings: ["view", "update"],
    internal_users: ["view", "create", "update", "delete"],
    onboarding: ["view", "create", "update"],
    kyc: ["view", "approve", "update", "delete"],
    financial_metrics: ["view"],
    notifications: ["send_invite", "send_notification"],
    reporting: ["view", "export"],
    expenses: ["view", "create", "update", "delete", "approve", "export"],
  },
  admin: {
    dashboard: ["view"],
    transactions: ["view", "create", "update", "act_on_behalf", "export"],
    customers: ["view", "create", "update"],
    rates: ["view", "create", "update"],
    virtual_accounts: ["view", "create", "update"],
    approvals: ["view", "approve"],
    audit_logs: ["view"],
    settings: ["view"],
    internal_users: ["view", "create", "update"],
    onboarding: ["view", "create", "update"],
    kyc: ["view"],
    financial_metrics: ["view"],
    notifications: ["send_invite"],
    reporting: ["view", "export"],
    expenses: ["view"],
  },
  sales: {
    dashboard: ["view"],
    transactions: ["view", "act_on_behalf"],
    customers: ["view", "create"],
    rates: ["view"],
    virtual_accounts: ["view", "create"],
    approvals: [],
    audit_logs: [],
    settings: [],
    internal_users: [],
    onboarding: ["view", "create", "update"],
    kyc: [],
    financial_metrics: [],
    notifications: ["send_invite"],
    reporting: [],
    expenses: [],
  },
  compliance: {
    dashboard: ["view"],
    transactions: ["view", "update"],
    customers: ["view", "update", "freeze", "unfreeze"],
    rates: ["view"],
    virtual_accounts: ["view"],
    approvals: ["view", "approve"],
    audit_logs: ["view"],
    settings: [],
    internal_users: [],
    onboarding: ["view"],
    kyc: ["view", "approve", "update", "delete"],
    financial_metrics: [],
    notifications: [],
    reporting: [],
    expenses: ["view"],
  },
  treasury: {
    dashboard: ["view"],
    transactions: ["view", "update"],
    customers: ["view"],
    rates: ["view", "create", "update"],
    virtual_accounts: ["view", "create"],
    approvals: ["view"],
    audit_logs: ["view"],
    settings: [],
    internal_users: [],
    onboarding: [],
    kyc: [],
    financial_metrics: ["view"],
    notifications: [],
    reporting: ["view", "export"],
    expenses: ["view"],
  },
  support: {
    dashboard: ["view"],
    transactions: ["view", "retry"],
    customers: ["view", "update"],
    rates: [],
    virtual_accounts: ["view"],
    approvals: [],
    audit_logs: [],
    settings: [],
    internal_users: [],
    onboarding: [],
    kyc: [],
    financial_metrics: [],
    notifications: ["send_notification"],
    reporting: [],
    expenses: [],
  },
  finance: {
    dashboard: ["view"],
    transactions: ["view", "export"],
    customers: ["view"],
    rates: [],
    virtual_accounts: [],
    approvals: [],
    audit_logs: [],
    settings: [],
    internal_users: [],
    onboarding: [],
    kyc: [],
    financial_metrics: ["view"],
    notifications: [],
    reporting: ["view", "export"],
    expenses: ["view", "create", "update", "delete", "approve", "export"],
  },
};

interface AuthContextType {
  user: InternalUser | null;
  login: (email: string, password: string, remember?: boolean) => boolean;
  logout: () => void;
  hasPermission: (resource: Resource, action: Action) => boolean;
  canAccessRoute: (resource: Resource) => boolean;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: InternalUser = {
  id: "usr_001",
  name: "Adeyemi Okonkwo",
  email: "adeyemi@cantaops.com",
  role: "super_admin",
  status: "active",
  lastLogin: new Date().toISOString(),
};

const roleProfiles: Record<UserRole, { name: string; id: string }> = {
  super_admin: { name: "Adeyemi Okonkwo", id: "usr_001" },
  admin: { name: "Sarah Chen", id: "usr_002" },
  sales: { name: "John Doe", id: "usr_003" },
  compliance: { name: "Aisha Compliance", id: "usr_004" },
  treasury: { name: "Treasury Lead", id: "usr_005" },
  support: { name: "David Support", id: "usr_006" },
  finance: { name: "Grace Finance", id: "usr_007" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<InternalUser | null>(() => loadSession() ?? mockUser);
  const [remember, setRemember] = useState<boolean>(() => {
    return localStorage.getItem(SESSION_STORAGE_KEY) !== null;
  });

  // Re-persist whenever the user changes (e.g. role switch) using current remember preference
  useEffect(() => {
    if (user) {
      saveSession(user, remember);
    } else {
      clearSession();
    }
  }, [user, remember]);

  const login = (email: string, _password: string, rememberMe = false) => {
    const next = { ...mockUser, email, lastLogin: new Date().toISOString() };
    setRemember(rememberMe);
    setUser(next);
    saveSession(next, rememberMe);
    return true;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    const profile = roleProfiles[role];
    setUser(prev => prev ? { ...prev, role, name: profile.name, id: profile.id } : null);
  };

  const hasPermission = (resource: Resource, action: Action): boolean => {
    if (!user) return false;
    const perms = permissionMatrix[user.role]?.[resource];
    return perms?.includes(action) ?? false;
  };

  const canAccessRoute = (resource: Resource): boolean => {
    if (!user) return false;
    const perms = permissionMatrix[user.role]?.[resource];
    return (perms?.length ?? 0) > 0;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, canAccessRoute, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { permissionMatrix };
export type { Resource, Action };
