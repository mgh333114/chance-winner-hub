
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeposit = (isDemoAccount: boolean, refreshBalance: () => Promise<void>) => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const { toast } = useToast();

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
          details_input: { note: `Demo deposit via ${method}` }
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

      // For real accounts, determine which payment method to use
      if (method.toLowerCase() === 'crypto') {
        // For crypto payments, we'll show the address in the UI
        // We could log the payment intention here
        const { error } = await supabase.from('transactions').insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          status: 'pending', // Crypto payments need to be confirmed
          is_demo: false,
          details: { 
            method: 'cryptocurrency',
            requested_at: new Date().toISOString()
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Crypto payment initiated",
          description: "Please send the cryptocurrency to the provided address. Your account will be credited after confirmations.",
        });
        
        return;
      } 
      else if (method.toLowerCase() === 'mpesa') {
        // For M-Pesa payments
        const { error } = await supabase.from('transactions').insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          status: 'pending', // M-Pesa payments need to be confirmed
          is_demo: false,
          details: { 
            method: 'mpesa',
            requested_at: new Date().toISOString()
          }
        });
        
        if (error) throw error;
        
        // In a real implementation, this would call the M-Pesa API
        toast({
          title: "M-Pesa payment initiated",
          description: "Please check your phone to complete the payment.",
        });
        
        return;
      }
      else {
        // For card payments, proceed with Stripe checkout
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            amount, 
            paymentMethod: method.toLowerCase(),
            currency: 'kes' // Set currency to KES
          }
        });

        if (error) throw error;

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
