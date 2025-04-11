
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWithdrawal = (isDemoAccount: boolean, refreshBalance: () => Promise<void>) => {
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const { toast } = useToast();

  const processWithdrawal = async (amount: number, method: string, details: string) => {
    setProcessingWithdrawal(true);

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error("You must be logged in to withdraw funds");
      }

      const userId = session.data.session.user.id;
      console.log(`Processing withdrawal: amount=${amount}, method=${method}, userId=${userId}, isDemoAccount=${isDemoAccount}`);

      // For demo accounts, use the RPC function to bypass RLS
      if (isDemoAccount) {
        console.log(`Processing demo withdrawal of ${amount} for user ${userId}`);
        
        const { data, error } = await supabase.rpc('process_demo_withdrawal', {
          user_id_input: userId,
          amount_input: amount,
          type_input: 'withdrawal',
          details_input: JSON.stringify({
            method,
            account_details: details,
            requested_at: new Date().toISOString()
          })
        });

        if (error) {
          console.error("Demo withdrawal error:", error);
          toast({
            title: "Withdrawal error",
            description: error.message || "Failed to process withdrawal",
            variant: "destructive",
          });
          throw error;
        }

        console.log("Demo withdrawal response:", data);
        
        // Update local balance
        await refreshBalance();

        return;
      }

      // For real accounts, set status as pending for admin approval
      console.log("Inserting transaction record for real account withdrawal");
      const { error } = await supabase.from('transactions').insert({
        user_id: userId,
        amount: amount,
        type: 'withdrawal',
        status: 'pending', // Set status as pending for admin approval
        is_demo: false,
        details: JSON.stringify({
          method,
          account_details: details,
          requested_at: new Date().toISOString()
        })
      });

      if (error) {
        console.error("Transaction insert error:", error);
        throw error;
      }

      // Update local balance
      await refreshBalance();
      
      // Notify user of pending status
      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal request has been submitted and is pending admin approval.",
        duration: 5000,
      });
      
      return;
      
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessingWithdrawal(false);
    }
  };

  return {
    processWithdrawal,
    processingWithdrawal
  };
};
