import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LogOut, 
  Menu, 
  X, 
  Car, 
  ShieldCheck, 
  History, 
  LayoutDashboard, 
  Users,
  Ticket
} from "lucide-react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const navItems = isAdmin ? [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Vehicles", href: "/admin/vehicles", icon: Car },
    { label: "Residents", href: "/admin/users", icon: Users },
    { label: "Gate Logs", href: "/admin/logs", icon: History },
  ] : [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "My Vehicles", href: "/vehicles", icon: Car },
    { label: "Visitor Passes", href: "/passes", icon: Ticket },
    { label: "Activity", href: "/activity", icon: History },
  ];

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg">GateGuard</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl">GateGuard</h1>
            <p className="text-xs text-muted-foreground font-medium">Secure Entry System</p>
          </div>
        </div>

        <div className="px-4 py-2 md:py-6 flex-1 space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
