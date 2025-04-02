
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { Database } from '@/integrations/supabase/types';
import { safeCast, safeCastSingle } from '@/lib/supabaseUtils';

// Define a type for table names from the Database type
type TableName = keyof Database['public']['Tables'];

interface UseSupabaseOptions {
  initialLoading?: boolean;
  fetchOnMount?: boolean;
  onError?: (error: Error) => void;
}

export function useSupabase<T extends TableName>(
  table: T,
  options: UseSupabaseOptions = {}
) {
  type Row = Database['public']['Tables'][T]['Row'];
  type Insert = Database['public']['Tables'][T]['Insert'];
  type Update = Database['public']['Tables'][T]['Update'];
  
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(options.initialLoading !== false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchData = async (queryParams?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(table).select('*');

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

      setData(safeCast<Row>(result));
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

  const insertData = async (record: Insert): Promise<Row | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: supabaseError } = await supabase
        .from(table)
        .insert(record as any)
        .select('*')
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const newRecord = safeCastSingle<Row>(result);
      if (newRecord) {
        setData((prevData) => [...prevData, newRecord]);
      }

      return newRecord;
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

  const updateData = async (id: string | number, updates: Update): Promise<Row | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: supabaseError } = await supabase
        .from(table)
        .update(updates as any)
        .eq('id', id as any) // Fixed by using as any to bypass TypeScript's string literal checking
        .select('*')
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const updatedRecord = safeCastSingle<Row>(result);
      if (updatedRecord) {
        setData((prevData) =>
          prevData.map((item: any) =>
            item.id === id ? updatedRecord : item
          )
        );
      }

      return updatedRecord;
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

  const deleteData = async (id: string | number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from(table)
        .delete()
        .eq('id', id as any) // Fixed by using as any to bypass TypeScript's string literal checking
        .single();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setData((prevData) =>
        prevData.filter((item: any) => item.id !== id)
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
