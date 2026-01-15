import { useWebSocket } from "@/hooks/use-ws";
import { useAllVehicles } from "@/hooks/use-vehicles";
import { useAllLogs } from "@/hooks/use-logs";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Car, AlertCircle, Clock, History } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  // Initialize WS
  useWebSocket();
  
  const { data: vehicles = [] } = useAllVehicles();
  const { data: logs = [] } = useAllLogs();

  const pendingVehicles = vehicles.filter(v => v.status === "pending");
  const todayLogs = logs.filter(l => {
    const today = new Date().toDateString();
    return l.timestamp && new Date(l.timestamp).toDateString() === today;
  });

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold">Admin Control Center</h1>
        <p className="text-muted-foreground">System overview and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                <h3 className="text-2xl font-bold">{vehicles.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <h3 className="text-2xl font-bold">{pendingVehicles.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entries Today</p>
                <h3 className="text-2xl font-bold">{todayLogs.filter(l => l.type === 'entry').length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Activity</p>
                <h3 className="text-lg font-bold truncate">
                  {logs[0] ? format(new Date(logs[0].timestamp!), "h:mm a") : "--"}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2 shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Vehicle Approvals</CardTitle>
              <CardDescription>Vehicles waiting for verification</CardDescription>
            </div>
            <Link href="/admin/vehicles">
              <Button variant="outline" size="sm">Manage All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingVehicles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending approvals</div>
            ) : (
              <div className="space-y-4">
                {pendingVehicles.slice(0, 5).map(vehicle => (
                  <div key={vehicle.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center font-mono font-bold">
                        {vehicle.plateNumber.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold">{vehicle.plateNumber}</h4>
                        <p className="text-sm text-muted-foreground">{vehicle.name} • {vehicle.user?.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Link href="/admin/vehicles">
                        <Button size="sm" variant="secondary">Review</Button>
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Feed Placeholder */}
        <Card className="shadow-md border-border/50">
          <CardHeader>
            <CardTitle>Live Gate Activity</CardTitle>
            <CardDescription>Real-time entry logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm pb-3 border-b border-border/50 last:border-0">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${log.type === 'entry' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-bold">{log.plateNumber}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(log.timestamp!), "h:mm a")}</span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">{log.status} • {log.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
