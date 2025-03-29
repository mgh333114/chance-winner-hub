
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeposit = (isDemoAccount: boolean, refreshBalance: () => Promise<void>) => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const { toast } = useToast();

  const addFunds = async (amount: number) => {
    setProcessingPayment(true);
    
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add funds",
          variant: "destructive",
        });
        return;
      }
      
      // Check if using demo account
      if (isDemoAccount) {
        // For demo accounts, directly add the funds to the transactions table
        const { error } = await supabase.from('transactions').insert({
          user_id: session.data.session.user.id,
          amount: amount,
          type: 'deposit',
          status: 'completed',
          is_demo: true,
          details: JSON.stringify({ note: 'Demo deposit' })
        });

        if (error) {
          console.error("Demo deposit error:", error);
          throw error;
        }

        await refreshBalance();
        
        toast({
          title: "Demo funds added",
          description: `$${amount} added to your demo account`,
        });
        
        return;
      }

      // For real accounts, proceed with Stripe checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { amount }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Payment error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  return {
    addFunds,
    processingPayment
  };
};
