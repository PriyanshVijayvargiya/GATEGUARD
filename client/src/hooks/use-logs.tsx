import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useMyLogs() {
  return useQuery({
    queryKey: [api.logs.listMy.path],
    queryFn: async () => {
      const res = await fetch(api.logs.listMy.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.listMy.responses[200].parse(await res.json());
    },
  });
}

export function useAllLogs() {
  return useQuery({
    queryKey: [api.logs.listAll.path],
    queryFn: async () => {
      const res = await fetch(api.logs.listAll.path);
      if (!res.ok) throw new Error("Failed to fetch all logs");
      return api.logs.listAll.responses[200].parse(await res.json());
    },
  });
}
