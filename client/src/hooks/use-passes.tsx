import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertPass } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMyPasses() {
  return useQuery({
    queryKey: [api.passes.listMy.path],
    queryFn: async () => {
      const res = await fetch(api.passes.listMy.path);
      if (!res.ok) throw new Error("Failed to fetch passes");
      return api.passes.listMy.responses[200].parse(await res.json());
    },
  });
}

export function useAllPasses() {
  return useQuery({
    queryKey: [api.passes.listAll.path],
    queryFn: async () => {
      const res = await fetch(api.passes.listAll.path);
      if (!res.ok) throw new Error("Failed to fetch all passes");
      return api.passes.listAll.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPass) => {
      // Ensure dates are converted to strings if needed by Zod schema, or handled automatically
      // Assuming Zod schema expects dates or strings that can be coerced
      const res = await fetch(api.passes.create.path, {
        method: api.passes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create pass");
      }
      return api.passes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.passes.listMy.path] });
      toast({
        title: "Pass created",
        description: "Your visitor pass has been generated.",
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
