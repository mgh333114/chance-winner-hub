
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const usePaymentSession = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile and account type on component mount and when auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const sessionData = await supabase.auth.getSession();
        setSession(sessionData.data.session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
};
