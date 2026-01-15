import { useState } from "react";
import { useMyPasses, useCreatePass } from "@/hooks/use-passes";
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
import { Ticket, Plus, Calendar, Clock } from "lucide-react";
import { format, addHours } from "date-fns";

export default function ResidentPasses() {
  const { data: passes = [], isLoading } = useMyPasses();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Visitor Passes</h1>
          <p className="text-muted-foreground">Create temporary passes for guests and deliveries.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Create Pass
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Visitor Pass</DialogTitle>
              <DialogDescription>
                Passes are valid for a specific duration.
              </DialogDescription>
            </DialogHeader>
            <CreatePassForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : passes.length === 0 ? (
        <div className="text-center py-16 bg-muted/10 rounded-2xl border-2 border-dashed border-muted-foreground/10">
          <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No active passes</h3>
          <p className="text-muted-foreground mb-4">Create a pass for your upcoming guests.</p>
          <Button onClick={() => setOpen(true)}>Create Pass</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passes.map((pass) => (
            <Card key={pass.id} className="relative overflow-hidden border-border/50 shadow-md">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
              <CardContent className="p-6 pl-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg">{pass.visitorName}</h3>
                  <StatusBadge status={pass.status} />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center"><span className="font-bold text-[10px]">A</span></div>
                    <span className="font-mono font-medium text-foreground">{pass.plateNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Valid from: {format(new Date(pass.validFrom), "MMM d, h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Until: {format(new Date(pass.validTill), "MMM d, h:mm a")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreatePassForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createPass, isPending } = useCreatePass();
  
  const form = useForm({
    resolver: zodResolver(api.passes.create.input),
    defaultValues: {
      visitorName: "",
      plateNumber: "",
      validFrom: new Date().toISOString().slice(0, 16),
      validTill: addHours(new Date(), 24).toISOString().slice(0, 16), // Default 24h
    },
  });

  const onSubmit = (data: any) => {
    createPass({
      ...data,
      plateNumber: data.plateNumber.toUpperCase(),
      validFrom: new Date(data.validFrom).toISOString(),
      validTill: new Date(data.validTill).toISOString(),
    }, {
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
          name="visitorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visitor Name</FormLabel>
              <FormControl>
                <Input placeholder="Guest Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plateNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plate Number</FormLabel>
              <FormControl>
                <Input placeholder="XYZ-987" {...field} className="uppercase" onChange={e => field.onChange(e.target.value.toUpperCase())} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="validFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid From</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="validTill"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Till</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Generating..." : "Generate Pass"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
