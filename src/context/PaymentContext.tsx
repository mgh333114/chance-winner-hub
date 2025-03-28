
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AccountType = 'real' | 'demo';

type PaymentContextType = {
  addFunds: (amount: number) => Promise<void>;
  processWithdrawal: (amount: number, method: string, details: string) => Promise<void>;
  processingPayment: boolean;
  userBalance: number;
  loadingBalance: boolean;
  refreshBalance: () => Promise<void>;
  accountType: AccountType;
  switchAccountType: (type: AccountType) => Promise<void>;
  isDemoAccount: boolean;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [accountType, setAccountType] = useState<AccountType>('real');
  const [isDemoAccount, setIsDemoAccount] = useState(false);
  const { toast } = useToast();

  // Fetch user profile and account type on component mount and when auth state changes
  useEffect(() => {
    const fetchUserProfileAndBalance = async () => {
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        // Fetch account type preference
        const { data: profileData } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', session.data.session.user.id)
          .single();

        // Set account type if available, default to 'real' if not set
        if (profileData && profileData.account_type) {
          setAccountType(profileData.account_type);
          setIsDemoAccount(profileData.account_type === 'demo');
        }

        await refreshBalance();
      }
    };

    fetchUserProfileAndBalance();

    // Listen for auth changes to update balance and account type
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserProfileAndBalance();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

        if (error) throw error;

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

  const processWithdrawal = async (amount: number, method: string, details: string) => {
    setProcessingPayment(true);

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error("You must be logged in to withdraw funds");
      }

      const userId = session.data.session.user.id;

      // First verify if the user has sufficient balance
      if (amount > userBalance) {
        throw new Error(`Insufficient balance. Your current balance is $${userBalance.toFixed(2)}`);
      }

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
      setProcessingPayment(false);
    }
  };

  return (
    <PaymentContext.Provider value={{ 
      addFunds, 
      processWithdrawal,
      processingPayment, 
      userBalance, 
      loadingBalance, 
      refreshBalance,
      accountType,
      switchAccountType,
      isDemoAccount
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
