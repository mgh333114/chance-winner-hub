
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type PaymentContextType = {
  addFunds: (amount: number) => Promise<void>;
  processWithdrawal: (amount: number, method: string, details: string) => Promise<void>;
  processingPayment: boolean;
  userBalance: number;
  loadingBalance: boolean;
  refreshBalance: () => Promise<void>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const { toast } = useToast();

  // Fetch user balance on component mount and when auth state changes
  useEffect(() => {
    const fetchInitialBalance = async () => {
      await refreshBalance();
    };

    fetchInitialBalance();

    // Listen for auth changes to update balance
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshBalance();
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
      
      // Calculate user balance from transactions
      const { data: deposits, error: depositError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'deposit')
        .eq('status', 'completed');
      
      if (depositError) throw depositError;

      const { data: purchases, error: purchaseError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'purchase')
        .eq('status', 'completed');
      
      if (purchaseError) throw purchaseError;

      const { data: winnings, error: winningsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'winnings')
        .eq('status', 'completed');
      
      if (winningsError) throw winningsError;

      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'withdrawal')
        .eq('status', 'completed');

      if (withdrawalError) throw withdrawalError;

      // Calculate total balance
      const totalDeposits = deposits.reduce((sum, item) => sum + item.amount, 0);
      const totalPurchases = purchases.reduce((sum, item) => sum + item.amount, 0);
      const totalWinnings = winnings.reduce((sum, item) => sum + item.amount, 0);
      const totalWithdrawals = withdrawals.reduce((sum, item) => sum + item.amount, 0);
      
      const balance = totalDeposits + totalWinnings - totalPurchases - totalWithdrawals;
      setUserBalance(balance);
      console.log("User balance calculated:", balance);
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

      // Call our create-checkout function
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
        status: 'pending',
        details: JSON.stringify({
          method,
          account_details: details,
          requested_at: new Date().toISOString()
        })
      });

      if (error) throw error;

      // Update local balance (optimistic update)
      // We'll update the "real" balance via refreshBalance after the transaction is recorded
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
      refreshBalance 
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
