
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useDeposit = (isDemoAccount: boolean, refreshBalance: () => Promise<void>) => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addFunds = async (amount: number, method: string = 'card') => {
    setProcessingPayment(true);
    
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add funds",
          variant: "destructive",
        });
        setProcessingPayment(false);
        return;
      }
      
      const userId = session.data.session.user.id;
      console.log(`Adding ${amount} funds for user ${userId}, isDemoAccount: ${isDemoAccount}, method: ${method}`);
      
      // Check if using demo account
      if (isDemoAccount) {
        console.log("Processing demo deposit...");
        // For demo accounts, use the RPC function to bypass RLS
        const { data, error } = await supabase.rpc('add_demo_transaction', {
          user_id_input: userId,
          amount_input: amount,
          type_input: 'deposit',
          details_input: { method: method, note: `Demo deposit via ${method}` }
        });

        if (error) {
          console.error("Demo deposit error:", error);
          throw error;
        }

        console.log("Demo deposit response:", data);
        await refreshBalance();
        
        toast({
          title: "Demo funds added",
          description: `KSh${amount} added to your demo account via ${method}`,
        });
        
        return;
      }

      // For real accounts with crypto or mpesa
      if (method.toLowerCase() === 'crypto' || method.toLowerCase() === 'mpesa') {
        console.log(`Processing ${method} payment...`);
        
        // For crypto and M-Pesa payments, redirect to the appropriate payment page
        if (method.toLowerCase() === 'crypto') {
          navigate('/payment/crypto', { state: { amount } });
          return;
        } else if (method.toLowerCase() === 'mpesa') {
          navigate('/payment/mpesa', { state: { amount } });
          return;
        }
      } 
      else {
        // For card payments, proceed with Stripe checkout
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            amount, 
            paymentMethod: method.toLowerCase(),
            currency: 'kes'
          }
        });

        if (error) {
          console.error("Stripe checkout error:", error);
          throw error;
        }

        if (data?.url) {
          window.location.href = data.url;
        }
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
