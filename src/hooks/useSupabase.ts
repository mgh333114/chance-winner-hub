
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TableInsert, TableRow, TableUpdate } from '@/types/supabase';
import { useToast } from './use-toast';

/**
 * A hook to simplify interactions with Supabase
 * Provides common crud operations with proper typing
 */
export function useSupabase<T extends keyof Database['public']['Tables']>(tableName: T) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Insert data into a table
   */
  const insert = async (data: TableInsert<T>) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data as any)
        .select();
      
      if (error) throw new Error(error.message);
      return result;
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update data in a table
   */
  const update = async (id: string, data: TableUpdate<T>) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data as any)
        .eq('id', id)
        .select();
      
      if (error) throw new Error(error.message);
      return result;
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Select data from a table
   */
  const select = async (options?: {
    columns?: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
    orderBy?: string;
    ascending?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from(tableName)
        .select(options?.columns || '*');
      
      // Apply filters if provided
      if (options?.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          query = query.eq(key, value);
        }
      }
      
      // Apply sorting if provided
      if (options?.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options?.ascending ?? true 
        });
      }
      
      // Apply pagination if provided
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.range(
          options.offset, 
          options.offset + (options.limit || 10) - 1
        );
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      return data as TableRow<T>[];
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete data from a table
   */
  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    insert,
    update,
    select,
    remove,
  };
}

// Type definition needed for the hook
type Database = import('@/integrations/supabase/types').Database;
