import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertVehicle } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMyVehicles() {
  return useQuery({
    queryKey: [api.vehicles.listMy.path],
    queryFn: async () => {
      const res = await fetch(api.vehicles.listMy.path);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return api.vehicles.listMy.responses[200].parse(await res.json());
    },
  });
}

export function useAllVehicles() {
  return useQuery({
    queryKey: [api.vehicles.listAll.path],
    queryFn: async () => {
      const res = await fetch(api.vehicles.listAll.path);
      if (!res.ok) throw new Error("Failed to fetch all vehicles");
      return api.vehicles.listAll.responses[200].parse(await res.json());
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertVehicle) => {
      const res = await fetch(api.vehicles.create.path, {
        method: api.vehicles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create vehicle");
      }
      return api.vehicles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.vehicles.listMy.path] });
      toast({
        title: "Vehicle added",
        description: "Your vehicle has been registered and is pending approval.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" | "blocked" | "pending" }) => {
      const url = buildUrl(api.vehicles.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.vehicles.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      return api.vehicles.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: [api.vehicles.listAll.path] });
      toast({
        title: "Status updated",
        description: `Vehicle status changed to ${status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
