import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  TrendingUp,
  Building2,
  ShieldCheck,
  ScrollText,
  Settings,
  LogOut,
  ChevronDown,
  UserPlus,
  BarChart3,
  FileBarChart,
  Receipt,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth, type Resource, type UserRole } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems: { title: string; url: string; icon: React.ElementType; resource: Resource }[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, resource: "dashboard" },
  { title: "Onboarding", url: "/onboarding", icon: UserPlus, resource: "onboarding" },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight, resource: "transactions" },
  { title: "Customers", url: "/customers", icon: Users, resource: "customers" },
  { title: "Rates & Treasury", url: "/rates", icon: TrendingUp, resource: "rates" },
  { title: "Virtual Accounts", url: "/virtual-accounts", icon: Building2, resource: "virtual_accounts" },
  { title: "Approvals", url: "/approvals", icon: ShieldCheck, resource: "approvals" },
  { title: "Audit Logs", url: "/audit-logs", icon: ScrollText, resource: "audit_logs" },
  { title: "Financial Metrics", url: "/financial-metrics", icon: BarChart3, resource: "financial_metrics" },
  { title: "Expenses", url: "/expenses", icon: Receipt, resource: "expenses" },
  { title: "Reports", url: "/reports", icon: FileBarChart, resource: "reporting" },
  { title: "Settings", url: "/settings", icon: Settings, resource: "settings" },
];

const allRoles: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "sales", label: "Sales" },
  { value: "compliance", label: "Compliance" },
  { value: "treasury", label: "Treasury" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
];

const roleBadgeColor: Record<UserRole, string> = {
  super_admin: "bg-primary/20 text-primary",
  admin: "bg-success/20 text-success",
  sales: "bg-warning/20 text-warning",
  compliance: "bg-destructive/20 text-destructive",
  treasury: "bg-accent/20 text-accent-foreground",
  support: "bg-muted text-muted-foreground",
  finance: "bg-primary/10 text-primary",
};

export function AppSidebar() {
  const { user, logout, canAccessRoute, switchRole } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`px-4 py-5 ${collapsed ? "px-2" : ""}`}>
          {collapsed ? (
            <span className="block text-center text-lg font-bold text-primary font-mono">C</span>
          ) : (
            <div>
              <h1 className="text-lg font-bold text-primary font-mono tracking-wider">CANTA OPS</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Operations Portal</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => canAccessRoute(item.resource))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user && !collapsed && (
          <div className="px-4 py-3 border-t border-sidebar-border">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 mt-0.5 outline-none">
                <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${roleBadgeColor[user.role]}`}>
                  {user.role.replace("_", " ")}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {allRoles.map((r) => (
                  <DropdownMenuItem
                    key={r.value}
                    onClick={() => switchRole(r.value)}
                    className={user.role === r.value ? "bg-muted font-medium" : ""}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${roleBadgeColor[r.value].split(" ")[0]}`} />
                    {r.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
