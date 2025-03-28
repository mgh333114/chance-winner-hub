import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AccountType = 'real' | 'demo';

export const useBalance = () => {
  const [userBalance, setUserBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [accountType, setAccountType] = useState<AccountType>('real');
  const [isDemoAccount, setIsDemoAccount] = useState(false);
  const { toast } = useToast();

  const refreshBalance = async () => {
    setLoadingBalance(true);
    
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        setUserBalance(0);
        return;
      }

      const userId = session.data.session.user.id;

      // Demo account: Use simulated balance if in demo mode
      const { data: profileData } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', userId)
        .single();

      const isDemo = profileData?.account_type === 'demo';
      setIsDemoAccount(isDemo);

      if (isDemo) {
        // For demo accounts, check if they have any demo transactions
        const { data: demoTransactions, error: demoError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', userId)
          .eq('is_demo', true);

        if (demoError) throw demoError;

        // If no demo transactions exist yet, create an initial demo deposit
        if (demoTransactions.length === 0) {
          // Create initial demo funds (100)
          await supabase.from('transactions').insert({
            user_id: userId,
            amount: 100,
            type: 'deposit',
            status: 'completed',
            is_demo: true,
            details: JSON.stringify({ note: 'Initial demo funds' })
          });
        }
      }
      // Real accounts don't get initial funds - they start at 0 and need to make deposits
      
      // Calculate user balance from transactions
      const { data: deposits, error: depositError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'deposit')
        .eq('status', 'completed')
        .eq('is_demo', isDemo);
      
      if (depositError) throw depositError;

      const { data: purchases, error: purchaseError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'purchase')
        .eq('status', 'completed')
        .eq('is_demo', isDemo);
      
      if (purchaseError) throw purchaseError;

      const { data: winnings, error: winningsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'winnings')
        .eq('status', 'completed')
        .eq('is_demo', isDemo);
      
      if (winningsError) throw winningsError;

      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'withdrawal')
        .eq('status', 'completed')
        .eq('is_demo', isDemo);

      if (withdrawalError) throw withdrawalError;

      // Calculate total balance
      const totalDeposits = deposits.reduce((sum, item) => sum + item.amount, 0);
      const totalPurchases = purchases.reduce((sum, item) => sum + item.amount, 0);
      const totalWinnings = winnings.reduce((sum, item) => sum + item.amount, 0);
      const totalWithdrawals = withdrawals.reduce((sum, item) => sum + item.amount, 0);
      
      const balance = totalDeposits + totalWinnings - totalPurchases - totalWithdrawals;
      setUserBalance(balance);
      console.log(`${isDemo ? 'Demo' : 'Real'} user balance calculated:`, balance);
    } catch (error: any) {
      console.error("Error fetching user balance:", error);
      toast({
        title: "Error fetching balance",
        description: error.message || "Failed to load your balance",
        variant: "destructive",
      });
    } finally {
      setLoadingBalance(false);
    }
  };

  const switchAccountType = async (type: AccountType) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to switch account types",
          variant: "destructive",
        });
        return;
      }

      const userId = session.data.session.user.id;
      
      // Update account type in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ account_type: type })
        .eq('id', userId);

      if (error) throw error;
      
      setAccountType(type);
      setIsDemoAccount(type === 'demo');
      
      // Refresh balance to show correct amount based on account type
      await refreshBalance();

      toast({
        title: `Switched to ${type === 'demo' ? 'Demo' : 'Real'} Account`,
        description: type === 'demo' 
          ? "You're now using simulated funds for practice" 
          : "You're now using your actual balance",
      });
    } catch (error: any) {
      console.error("Error switching account type:", error);
      toast({
        title: "Failed to switch account type",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  return {
    userBalance,
    loadingBalance,
    accountType,
    isDemoAccount,
    refreshBalance,
    switchAccountType,
    setAccountType,
    setIsDemoAccount
  };
};
