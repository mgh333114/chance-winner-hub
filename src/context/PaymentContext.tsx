
import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useBalance, AccountType } from '@/hooks/useBalance';
import { useDeposit } from '@/hooks/useDeposit';
import { useWithdrawal } from '@/hooks/useWithdrawal';
import { usePaymentSession } from '@/hooks/usePaymentSession';

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
  // Use our custom hooks to manage different aspects of payment functionality
  const { session } = usePaymentSession();
  
  const {
    userBalance,
    loadingBalance,
    accountType,
    isDemoAccount,
    refreshBalance,
    switchAccountType
  } = useBalance();
  
  const { addFunds, processingPayment } = useDeposit(isDemoAccount, refreshBalance);
  
  const { processWithdrawal } = useWithdrawal(isDemoAccount, refreshBalance);

  // Fetch balance when session changes
  React.useEffect(() => {
    if (session) {
      refreshBalance();
    }
  }, [session]);

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
