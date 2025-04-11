
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { WithdrawalMethod, WithdrawalStatus } from '@/types/rewards';

export const useWithdrawal = (isDemoAccount: boolean, refreshBalance: () => Promise<void>) => {
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();

  // Subscribe to real-time updates for withdrawal status changes
  const { isSubscribed } = useSupabaseRealtime('transactions', {
    onUpdate: (item) => {
      if (item.type === 'withdrawal' && (item.status === 'completed' || item.status === 'rejected')) {
        // Show toast notification for completed or rejected withdrawals
        toast({
          title: item.status === 'completed' ? "Withdrawal Approved" : "Withdrawal Rejected",
          description: item.status === 'completed' 
            ? `Your withdrawal of ${item.amount} has been approved` 
            : `Your withdrawal request has been rejected`,
          variant: item.status === 'completed' ? "default" : "destructive",
          duration: 6000,
        });
        
        // Update balance since it has changed
        refreshBalance();
        
        // Refresh withdrawal history
        loadWithdrawalHistory();
      }
    }
  });

  // Load user's withdrawal history
  const loadWithdrawalHistory = async () => {
    setIsLoadingHistory(true);
    
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) return;

      const userId = session.data.session.user.id;
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'withdrawal')
        .eq('is_demo', isDemoAccount)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPendingWithdrawals(data || []);
    } catch (error: any) {
      console.error("Error loading withdrawal history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load withdrawal history on component mount and when account type changes
  useEffect(() => {
    loadWithdrawalHistory();
  }, [isDemoAccount]);

  const processWithdrawal = async (amount: number, method: WithdrawalMethod, details: string) => {
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
        
        // Refresh withdrawal history
        loadWithdrawalHistory();

        return;
      }

      // For real accounts, we need to use a different approach
      // The type safety issue is because TypeScript doesn't know about our custom RPC function
      console.log("Processing real account withdrawal");
      
      // Use @ts-ignore to bypass TypeScript's type checking for this specific call
      // @ts-ignore - Custom RPC function added to database
      const { error } = await supabase.rpc('process_real_withdrawal', {
        user_id_input: userId,
        amount_input: amount,
        type_input: 'withdrawal',
        details_input: JSON.stringify({
          method,
          account_details: details,
          requested_at: new Date().toISOString()
        }),
        status_input: 'pending' // Set status as pending for admin approval
      });

      if (error) {
        console.error("Real withdrawal error:", error);
        throw error;
      }

      // Update local balance (withdrawal not yet completed until approved)
      await refreshBalance();
      
      // Refresh withdrawal history
      loadWithdrawalHistory();
      
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
    processingWithdrawal,
    pendingWithdrawals,
    isLoadingHistory,
    refreshWithdrawals: loadWithdrawalHistory
  };
};
