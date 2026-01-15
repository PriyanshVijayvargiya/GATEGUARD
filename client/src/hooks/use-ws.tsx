import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ws, api } from '@shared/routes';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Only connect if on browser
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle gate events
        if (data.type === 'gateEvent') {
          const parsed = ws.receive.gateEvent.parse(data.payload);
          
          // Invalidate logs query to refresh tables
          queryClient.invalidateQueries({ queryKey: [api.logs.listAll.path] });
          queryClient.invalidateQueries({ queryKey: [api.logs.listMy.path] });

          // Show toast notification
          toast({
            title: `Vehicle ${parsed.type === 'entry' ? 'Arrival' : 'Departure'}`,
            description: `${parsed.plateNumber} - ${parsed.reason}`,
            variant: parsed.type === 'denied' ? 'destructive' : 'default',
          });
        }
      } catch (error) {
        console.error("Failed to parse WS message", error);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [queryClient, toast]);

  return socketRef.current;
}
