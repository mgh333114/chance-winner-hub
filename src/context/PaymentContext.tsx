
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type PaymentContextType = {
  addFunds: (amount: number) => Promise<void>;
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

      // Calculate total balance
      const totalDeposits = deposits.reduce((sum, item) => sum + item.amount, 0);
      const totalPurchases = purchases.reduce((sum, item) => sum + item.amount, 0);
      const totalWinnings = winnings.reduce((sum, item) => sum + item.amount, 0);
      
      const balance = totalDeposits + totalWinnings - totalPurchases;
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

  return (
    <PaymentContext.Provider value={{ addFunds, processingPayment, userBalance, loadingBalance, refreshBalance }}>
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
