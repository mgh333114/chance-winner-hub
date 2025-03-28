
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const usePaymentSession = () => {
  const [session, setSession] = useState<any>(null);

  // Fetch user profile and account type on component mount and when auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await supabase.auth.getSession();
      setSession(sessionData.data.session);
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

  return { session };
};
