import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@db/schema';

export function useWebSocket(user: User | null) {
  const ws = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}?userId=${user.id}`);

    ws.current.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      toast({
        title: notification.type,
        description: notification.message,
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user, queryClient, toast]);

  return ws.current;
}
