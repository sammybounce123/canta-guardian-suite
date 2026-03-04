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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth, type Resource } from "@/contexts/AuthContext";
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

const navItems: { title: string; url: string; icon: React.ElementType; resource: Resource }[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, resource: "dashboard" },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight, resource: "transactions" },
  { title: "Customers", url: "/customers", icon: Users, resource: "customers" },
  { title: "Rates & Treasury", url: "/rates", icon: TrendingUp, resource: "rates" },
  { title: "Virtual Accounts", url: "/virtual-accounts", icon: Building2, resource: "virtual_accounts" },
  { title: "Approvals", url: "/approvals", icon: ShieldCheck, resource: "approvals" },
  { title: "Audit Logs", url: "/audit-logs", icon: ScrollText, resource: "audit_logs" },
  { title: "Settings", url: "/settings", icon: Settings, resource: "settings" },
];

export function AppSidebar() {
  const { user, logout, canAccessRoute } = useAuth();
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
            <p className="text-xs text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
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
