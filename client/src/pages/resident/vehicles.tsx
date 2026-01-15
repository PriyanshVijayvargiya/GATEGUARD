import { useState } from "react";
import { useMyVehicles, useCreateVehicle } from "@/hooks/use-vehicles";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Car, Plus, Trash2, Edit2 } from "lucide-react";

export default function ResidentVehicles() {
  const { data: vehicles = [], isLoading } = useMyVehicles();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My Vehicles</h1>
          <p className="text-muted-foreground">Manage your registered vehicles for automatic entry.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Enter your vehicle details. It will be pending until approved by admin.
              </DialogDescription>
            </DialogHeader>
            <AddVehicleForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 rounded-2xl border-2 border-dashed border-muted-foreground/10">
          <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No vehicles yet</h3>
          <p className="text-muted-foreground mb-4">Add your first vehicle to get started.</p>
          <Button onClick={() => setOpen(true)}>Add Vehicle</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-colors shadow-md hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Car className="w-6 h-6" />
                  </div>
                  <StatusBadge status={vehicle.status} />
                </div>
                
                <h3 className="text-2xl font-display font-bold tracking-tight mb-1">{vehicle.plateNumber}</h3>
                <p className="text-muted-foreground font-medium mb-6">{vehicle.name || "Unnamed Vehicle"}</p>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Edit2 className="w-3 h-3 mr-2" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddVehicleForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createVehicle, isPending } = useCreateVehicle();
  
  const form = useForm({
    resolver: zodResolver(api.vehicles.create.input),
    defaultValues: {
      plateNumber: "",
      name: "",
    },
  });

  const onSubmit = (data: z.infer<typeof api.vehicles.create.input>) => {
    // Auto-uppercase
    createVehicle({ ...data, plateNumber: data.plateNumber.toUpperCase() }, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="plateNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plate Number</FormLabel>
              <FormControl>
                <Input placeholder="ABC-1234" {...field} className="uppercase" onChange={e => field.onChange(e.target.value.toUpperCase())} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. White Honda City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding..." : "Add Vehicle"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
