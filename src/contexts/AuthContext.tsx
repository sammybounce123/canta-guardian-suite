import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "super_admin" | "admin" | "sales" | "compliance" | "treasury";

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
  | "internal_users";

type Action = "view" | "create" | "update" | "delete" | "approve" | "act_on_behalf";

const permissionMatrix: Record<UserRole, Partial<Record<Resource, Action[]>>> = {
  super_admin: {
    dashboard: ["view"],
    transactions: ["view", "create", "update", "delete", "approve", "act_on_behalf"],
    customers: ["view", "create", "update", "delete"],
    rates: ["view", "create", "update", "approve"],
    virtual_accounts: ["view", "create", "update", "delete"],
    approvals: ["view", "approve"],
    audit_logs: ["view"],
    settings: ["view", "update"],
    internal_users: ["view", "create", "update", "delete"],
  },
  admin: {
    dashboard: ["view"],
    transactions: ["view", "create", "update", "act_on_behalf"],
    customers: ["view", "create", "update"],
    rates: ["view"],
    virtual_accounts: ["view", "create", "update"],
    approvals: ["view", "approve"],
    audit_logs: ["view"],
    settings: ["view"],
    internal_users: ["view"],
  },
  sales: {
    dashboard: ["view"],
    transactions: ["view"],
    customers: ["view", "create"],
    rates: ["view"],
    virtual_accounts: ["view"],
    approvals: [],
    audit_logs: [],
    settings: [],
    internal_users: [],
  },
  compliance: {
    dashboard: ["view"],
    transactions: ["view", "update"],
    customers: ["view", "update"],
    rates: ["view"],
    virtual_accounts: ["view"],
    approvals: ["view", "approve"],
    audit_logs: ["view"],
    settings: [],
    internal_users: [],
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
  },
};

interface AuthContextType {
  user: InternalUser | null;
  login: (email: string, password: string) => boolean;
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

const roleNames: Record<UserRole, string> = {
  super_admin: "Adeyemi Okonkwo",
  admin: "Sarah Chen",
  sales: "John Doe",
  compliance: "Aisha Compliance",
  treasury: "Treasury Lead",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<InternalUser | null>(mockUser);

  const login = (email: string, _password: string) => {
    setUser({ ...mockUser, email });
    return true;
  };

  const logout = () => setUser(null);

  const switchRole = (role: UserRole) => {
    setUser(prev => prev ? { ...prev, role, name: roleNames[role] } : null);
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
