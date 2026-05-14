import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { Plus, Shield, Users, Key, Lock, Ban, CheckCircle, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ROLES: UserRole[] = ["super_admin", "admin", "sales", "compliance", "treasury", "support", "finance"];

interface InternalUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const initialUsers: InternalUserRow[] = [
  { id: "usr_001", name: "Adeyemi Okonkwo", email: "adeyemi@cantaops.com", role: "super_admin", status: "active", lastLogin: "2024-11-15 09:00" },
  { id: "usr_002", name: "Sarah Chen", email: "sarah@cantaops.com", role: "admin", status: "active", lastLogin: "2024-11-15 08:30" },
  { id: "usr_003", name: "John Doe", email: "john@cantaops.com", role: "sales", status: "active", lastLogin: "2024-11-14 17:45" },
  { id: "usr_004", name: "Aisha Compliance", email: "aisha@cantaops.com", role: "compliance", status: "active", lastLogin: "2024-11-15 10:00" },
  { id: "usr_005", name: "Treasury Lead", email: "treasury@cantaops.com", role: "treasury", status: "disabled", lastLogin: "2024-11-10 14:00" },
  { id: "usr_006", name: "David Support", email: "david@cantaops.com", role: "support", status: "active", lastLogin: "2024-11-15 11:00" },
  { id: "usr_007", name: "Grace Finance", email: "grace@cantaops.com", role: "finance", status: "active", lastLogin: "2024-11-15 09:30" },
];

const roleColor: Record<string, string> = {
  super_admin: "text-primary",
  admin: "text-success",
  sales: "text-warning",
  compliance: "text-destructive",
  treasury: "text-accent-foreground",
  support: "text-muted-foreground",
  finance: "text-primary",
};

export default function Settings() {
  const { user, hasPermission } = useAuth();
  const role = user?.role;
  const canUpdate = hasPermission("settings", "update");
  const canManageUsers = hasPermission("internal_users", "create");
  const canViewUsers = hasPermission("internal_users", "view");
  const canDeleteUsers = hasPermission("internal_users", "delete");

  const [internalUsers, setInternalUsers] = useState<InternalUserRow[]>(initialUsers);
  const [suspendTarget, setSuspendTarget] = useState<InternalUserRow | null>(null);

  const handleToggleSuspend = () => {
    if (!suspendTarget) return;
    setInternalUsers((prev) =>
      prev.map((u) =>
        u.id === suspendTarget.id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
    const action = suspendTarget.status === "active" ? "suspended" : "reactivated";
    toast.success(`${suspendTarget.name} has been ${action}.`);
    setSuspendTarget(null);
  };

  if (!hasPermission("settings", "view")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">You don't have access to settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {canUpdate ? "Portal configuration and user management" : "View portal configuration"}
          {role === "admin" && <span className="ml-2 text-warning text-xs">(View only)</span>}
        </p>
      </div>

      <Tabs defaultValue={canViewUsers ? "users" : "security"} className="space-y-4">
        <TabsList className="bg-muted">
          {canViewUsers && (
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Internal Users</TabsTrigger>
          )}
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="api" className="gap-2"><Key className="h-4 w-4" /> API & Providers</TabsTrigger>
        </TabsList>

        {canViewUsers && (
          <TabsContent value="users">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Internal Users</CardTitle>
                {canManageUsers && (
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add User</Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="data-table-header text-left py-3 px-2">Name</th>
                        <th className="data-table-header text-left py-3 px-2">Email</th>
                        <th className="data-table-header text-center py-3 px-2">Role</th>
                        <th className="data-table-header text-center py-3 px-2">Status</th>
                        <th className="data-table-header text-right py-3 px-2">Last Login</th>
                        {canDeleteUsers && <th className="data-table-header text-center py-3 px-2">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {internalUsers.map((u) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-2 text-sm font-medium">{u.name}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{u.email}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`text-xs font-medium capitalize ${roleColor[u.role]}`}>
                              {u.role.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={
                              u.status === "active"
                                ? "status-badge status-completed"
                                : u.status === "suspended"
                                ? "status-badge status-failed"
                                : "status-badge status-held"
                            }>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground text-right font-mono">{u.lastLogin}</td>
                          {canDeleteUsers && (
                            <td className="py-3 px-2 text-center">
                              {u.role !== "super_admin" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`text-xs gap-1.5 ${u.status === "active" ? "text-destructive hover:text-destructive" : "text-success hover:text-success"}`}
                                  onClick={() => setSuspendTarget(u)}
                                >
                                  {u.status === "active" ? (
                                    <><Ban className="h-3.5 w-3.5" /> Suspend</>
                                  ) : (
                                    <><CheckCircle className="h-3.5 w-3.5" /> Reactivate</>
                                  )}
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Enforce MFA</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Require multi-factor authentication for all users</p>
                </div>
                <Switch disabled={!canUpdate} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Session Timeout</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Auto-logout after inactivity (minutes)</p>
                </div>
                <Input type="number" defaultValue={30} disabled={!canUpdate} className="w-20 bg-muted border-none text-right" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">IP Allowlisting</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Restrict portal access to specific IPs</p>
                </div>
                <Switch disabled={!canUpdate} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Approval Threshold</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Transactions above this amount require approval ($)</p>
                </div>
                <Input type="number" defaultValue={10000} disabled={!canUpdate} className="w-28 bg-muted border-none text-right font-mono" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Provider Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["VA Provider", "Payment Provider", "SMS Provider", "Email Provider"].map((provider) => (
                <div key={provider} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{provider}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">API key configured via environment</p>
                  </div>
                  <Badge variant="outline" className="text-xs text-success">Connected</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspend/Reactivate confirmation dialog */}
      <AlertDialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendTarget?.status === "active" ? "Suspend User" : "Reactivate User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendTarget?.status === "active"
                ? `Are you sure you want to suspend ${suspendTarget?.name}? They will lose access to the portal immediately.`
                : `Are you sure you want to reactivate ${suspendTarget?.name}? They will regain portal access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleSuspend}>
              {suspendTarget?.status === "active" ? "Suspend" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
