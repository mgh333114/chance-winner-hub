
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
      
      const userId = session.data.session.user.id;
      console.log(`Adding ${amount} funds for user ${userId}, isDemoAccount: ${isDemoAccount}`);
      
      // Check if using demo account
      if (isDemoAccount) {
        console.log("Processing demo deposit...");
        // For demo accounts, directly add the funds to the transactions table
        // Use RPC function call instead of direct insert to bypass RLS
        const { data, error } = await supabase.rpc('add_demo_transaction', {
          user_id_input: userId,
          amount_input: amount,
          type_input: 'deposit',
          details_input: JSON.stringify({ note: 'Demo deposit' })
        });

        if (error) {
          console.error("Demo deposit error:", error);
          throw error;
        }

        console.log("Demo deposit response:", data);
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
      console.error("Payment error:", error);
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
