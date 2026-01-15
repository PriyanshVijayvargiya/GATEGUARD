import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import NotFound from "@/pages/not-found";

// Pages
import AuthPage from "@/pages/auth";
import ResidentDashboard from "@/pages/resident/dashboard";
import ResidentVehicles from "@/pages/resident/vehicles";
import ResidentPasses from "@/pages/resident/passes";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminVehicles from "@/pages/admin/vehicles";

function ProtectedRoute({ 
  component: Component, 
  requiredRole 
}: { 
  component: React.ComponentType, 
  requiredRole?: "admin" | "resident" 
}) {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  if (!user) return <Redirect to="/auth" />;
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on role if unauthorized
    return <Redirect to={user.role === "admin" ? "/admin" : "/"} />;
  }

  return (
    <LayoutShell>
      <Component />
    </LayoutShell>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Resident Routes */}
      <Route path="/">
        <ProtectedRoute component={ResidentDashboard} requiredRole="resident" />
      </Route>
      <Route path="/vehicles">
        <ProtectedRoute component={ResidentVehicles} requiredRole="resident" />
      </Route>
      <Route path="/passes">
        <ProtectedRoute component={ResidentPasses} requiredRole="resident" />
      </Route>
      <Route path="/activity">
        {/* Reuse dashboard for now or make activity page */}
        <ProtectedRoute component={ResidentDashboard} requiredRole="resident" />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} requiredRole="admin" />
      </Route>
      <Route path="/admin/vehicles">
        <ProtectedRoute component={AdminVehicles} requiredRole="admin" />
      </Route>
      <Route path="/admin/users">
        {/* Placeholder: redirect to dashboard */}
        <ProtectedRoute component={AdminDashboard} requiredRole="admin" />
      </Route>
      <Route path="/admin/logs">
        {/* Placeholder: redirect to dashboard */}
        <ProtectedRoute component={AdminDashboard} requiredRole="admin" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
