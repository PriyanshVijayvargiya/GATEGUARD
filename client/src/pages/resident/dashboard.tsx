import { useUser } from "@/hooks/use-auth";
import { useMyVehicles } from "@/hooks/use-vehicles";
import { useMyLogs } from "@/hooks/use-logs";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Ticket, Plus, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function ResidentDashboard() {
  const { data: user } = useUser();
  const { data: vehicles = [] } = useMyVehicles();
  const { data: logs = [] } = useMyLogs();

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Good day, {user?.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Here's what's happening with your access.</p>
        </div>
        <div className="flex gap-2">
           <Link href="/vehicles">
             <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
               <Car className="w-4 h-4 mr-2" />
               Add Vehicle
             </Button>
           </Link>
           <Link href="/passes">
             <Button variant="outline">
               <Ticket className="w-4 h-4 mr-2" />
               New Pass
             </Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/50 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest entry and exit logs</CardDescription>
            </div>
            <Link href="/activity">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No recent activity</div>
            ) : (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.type === 'entry' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {log.type === 'entry' ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{log.plateNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.timestamp ? format(new Date(log.timestamp), "MMM d, h:mm a") : "Just now"}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={log.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>My Vehicles</CardTitle>
            <CardDescription>{vehicles.length} registered vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{vehicle.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.name || "Vehicle"}</p>
                    </div>
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>
              ))}
              {vehicles.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">No vehicles registered</p>
                </div>
              )}
              <Link href="/vehicles">
                <Button variant="outline" className="w-full mt-2">Manage Vehicles</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
