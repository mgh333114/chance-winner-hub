
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TableRow, TableInsert } from '@/types/supabase';
import { useToast } from './use-toast';
import { castData } from '@/types/supabase';

interface UseSupabaseOptions<T extends keyof Tables> {
  initialLoading?: boolean;
  fetchOnMount?: boolean;
  onError?: (error: Error) => void;
}

interface Tables {
  [key: string]: any;
}

export function useSupabase<T extends keyof Tables>(
  table: T,
  options: UseSupabaseOptions<T> = {}
) {
  const [data, setData] = useState<TableRow<T>[]>([]);
  const [loading, setLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchData = async (queryParams?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table as string).select('*');

      // Apply query filters if provided
      if (queryParams) {
        Object.keys(queryParams).forEach((key) => {
          const value = queryParams[key];
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value === null) {
            query = query.is(key, null);
          } else if (typeof value === 'object' && value !== null) {
            if ('gt' in value) query = query.gt(key, value.gt);
            if ('gte' in value) query = query.gte(key, value.gte);
            if ('lt' in value) query = query.lt(key, value.lt);
            if ('lte' in value) query = query.lte(key, value.lte);
            if ('like' in value) query = query.like(key, value.like);
            if ('ilike' in value) query = query.ilike(key, value.ilike);
          } else {
            query = query.eq(key, value);
          }
        });
      }

      const { data: result, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Cast the result to the correct type
      const typedResult = castData<TableRow<T>[]>(result || []);
      setData(typedResult);
    } catch (err: any) {
      setError(err);
      if (options.onError) {
        options.onError(err);
      } else {
        toast({
          title: 'Error fetching data',
          description: err.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const insertData = async (record: TableInsert<T>) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: supabaseError } = await supabase
        .from(table as string)
        .insert(record as any)
        .select('*')
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const typedResult = castData<TableRow<T>>(result);
      setData((prevData) => [...prevData, typedResult]);

      return typedResult;
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error inserting data',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (id: string, updates: Partial<TableInsert<T>>) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: supabaseError } = await supabase
        .from(table as string)
        .update(updates as any)
        .eq('id', id as any)
        .select('*')
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const typedResult = castData<TableRow<T>>(result);
      setData((prevData) =>
        prevData.map((item) =>
          (item as any).id === id ? typedResult : item
        )
      );

      return typedResult;
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error updating data',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from(table as string)
        .delete()
        .eq('id', id as any);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setData((prevData) =>
        prevData.filter((item) => (item as any).id !== id)
      );

      return true;
    } catch (err: any) {
      setError(err);
      toast({
        title: 'Error deleting data',
        description: err.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts if fetchOnMount is true
  useEffect(() => {
    if (options.fetchOnMount !== false) {
      fetchData();
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    insertData,
    updateData,
    deleteData,
    refetch: fetchData,
  };
}
