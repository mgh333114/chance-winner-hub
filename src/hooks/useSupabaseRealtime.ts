
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface UseSupabaseRealtimeOptions {
  onInsert?: (item: any) => void;
  onUpdate?: (item: any) => void;
  onDelete?: (item: any) => void;
}

export function useSupabaseRealtime<T extends TableName>(
  table: T,
  options: UseSupabaseRealtimeOptions = {}
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: table,
      }, (payload) => {
        console.log(`New ${table} record inserted:`, payload.new);
        if (options.onInsert) options.onInsert(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: table,
      }, (payload) => {
        console.log(`${table} record updated:`, payload.new);
        if (options.onUpdate) options.onUpdate(payload.new);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: table,
      }, (payload) => {
        console.log(`${table} record deleted:`, payload.old);
        if (options.onDelete) options.onDelete(payload.old);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          console.log(`Subscribed to ${table} table changes`);
        } else {
          setIsSubscribed(false);
        }
      });

    return () => {
      console.log(`Unsubscribing from ${table} table changes`);
      supabase.removeChannel(channel);
    };
  }, [table]);

  return { isSubscribed };
}
