import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Plus,
  Truck,
  Warehouse,
  Users,
  UserCheck,
  Handshake,
  LogOut,
  Menu,
  X,
  Boxes,
  Tags,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Tags },
  { label: "Shipments", path: "/shipments", icon: Package },
  { label: "New Shipment", path: "/shipments/create", icon: Plus },
  { label: "Suppliers", path: "/suppliers", icon: Truck },
  { label: "Warehouses", path: "/warehouses", icon: Warehouse },
  { label: "Transporters", path: "/transporters", icon: Boxes },
  { label: "Customers", path: "/customers", icon: Users },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 border-r border-border bg-card flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo area */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Package className="size-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground leading-none">
              SupplyTrack
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide uppercase">
              Chain Management
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                item.path === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User area */}
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-accent">
              <UserCheck className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.name || user?.email || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex-1" />
          <span className="text-[11px] text-muted-foreground tracking-wide uppercase hidden sm:block">
            Supply Chain Goods Tracking
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
