
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useWithdrawal = (isDemoAccount: boolean, refreshBalance: () => Promise<void>) => {
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  const processWithdrawal = async (amount: number, method: string, details: string) => {
    setProcessingWithdrawal(true);

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error("You must be logged in to withdraw funds");
      }

      const userId = session.data.session.user.id;

      // Record the withdrawal transaction
      const { error } = await supabase.from('transactions').insert({
        user_id: userId,
        amount: amount,
        type: 'withdrawal',
        status: isDemoAccount ? 'completed' : 'pending', // Demo withdrawals complete instantly
        is_demo: isDemoAccount,
        details: JSON.stringify({
          method,
          account_details: details,
          requested_at: new Date().toISOString()
        })
      });

      if (error) throw error;

      // Update local balance
      await refreshBalance();

      return;
    } catch (error: any) {
      console.error("Withdrawal error:", error);
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
