import { useState } from "react";
import { useAllVehicles, useUpdateVehicleStatus } from "@/hooks/use-vehicles";
import { StatusBadge } from "@/components/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, CheckCircle, XCircle, Ban, Filter } from "lucide-react";
import { format } from "date-fns";

export default function AdminVehicles() {
  const { data: vehicles = [], isLoading } = useAllVehicles();
  const { mutate: updateStatus } = useUpdateVehicleStatus();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.plateNumber.includes(search.toUpperCase()) || v.user?.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || v.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Vehicle Registry</h1>
          <p className="text-muted-foreground">Manage all registered vehicles and approval requests.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search plate or owner..." 
            className="pl-9 bg-background" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           {["all", "pending", "approved", "blocked"].map(f => (
             <Button 
               key={f} 
               variant={filter === f ? "default" : "outline"}
               size="sm"
               onClick={() => setFilter(f)}
               className="capitalize"
             >
               {f}
             </Button>
           ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plate Number</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Flat</TableHead>
              <TableHead>Vehicle Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Loading vehicles...</TableCell>
              </TableRow>
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No vehicles found</TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-mono font-bold">{vehicle.plateNumber}</TableCell>
                  <TableCell>{vehicle.user?.name}</TableCell>
                  <TableCell>{vehicle.user?.flatNumber}</TableCell>
                  <TableCell>{vehicle.name || "-"}</TableCell>
                  <TableCell><StatusBadge status={vehicle.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {vehicle.createdAt && format(new Date(vehicle.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatus({ id: vehicle.id, status: "approved" })}>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus({ id: vehicle.id, status: "rejected" })}>
                          <XCircle className="w-4 h-4 mr-2 text-red-600" /> Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus({ id: vehicle.id, status: "blocked" })}>
                          <Ban className="w-4 h-4 mr-2 text-red-600" /> Block
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
