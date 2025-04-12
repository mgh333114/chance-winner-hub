
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseRealtime } from './useSupabaseRealtime';
import { Json } from '@/integrations/supabase/types';

export interface CryptoPayment {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  status: string;
  type: string;
  details: {
    method: string;
    wallet_address?: string;
    transaction_hash?: string;
    currency?: string;
  };
  email?: string;
  username?: string;
}

// Helper function to safely type cast the details JSON from the database
function transformPaymentDetails(details: Json | null): CryptoPayment['details'] {
  if (!details) {
    return { method: 'crypto' }; // Default value if details is null
  }
  
  // Ensure details is an object before trying to access its properties
  if (typeof details !== 'object' || details === null) {
    return { method: 'crypto' };
  }
  
  // Cast to the expected shape, with type safety
  const detailsObj = details as Record<string, any>;
  
  return {
    method: detailsObj.method || 'crypto',
    wallet_address: detailsObj.wallet_address,
    transaction_hash: detailsObj.transaction_hash,
    currency: detailsObj.currency
  };
}

export function useCryptoPayments() {
  const [payments, setPayments] = useState<CryptoPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Subscribe to real-time updates for transactions
  useSupabaseRealtime('transactions', {
    onInsert: () => {
      console.log('New transaction detected, refreshing crypto payments');
      loadCryptoPayments();
    },
    onUpdate: () => {
      console.log('Transaction updated, refreshing crypto payments');
      loadCryptoPayments();
    }
  });

  const loadCryptoPayments = async () => {
    setIsLoading(true);
    try {
      console.log('Loading crypto payments...');
      
      // Fetch transactions with pending status and details.method containing 'crypto'
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')
        .eq('type', 'deposit');
      
      if (error) throw error;
      
      console.log('Fetched transactions:', data?.length || 0);
      
      // Filter for crypto payments client-side
      const cryptoPayments = data?.filter(payment => {
        // Check if details exists and is an object
        if (!payment.details) return false;
        
        // If details is a string, try to parse it
        let details: Record<string, unknown>;
        if (typeof payment.details === 'string') {
          try {
            details = JSON.parse(payment.details);
          } catch (e) {
            console.error('Failed to parse details JSON:', e);
            return false;
          }
        } else if (typeof payment.details === 'object' && payment.details !== null) {
          details = payment.details as Record<string, unknown>;
        } else {
          return false;
        }
        
        // Check if method property exists and is one of the crypto types
        if (!('method' in details)) return false;
        
        const method = details.method as string;
        return method === 'crypto' || method === 'bitcoin' || method === 'ethereum';
      }) || [];
      
      console.log('Filtered crypto payments:', cryptoPayments.length);
      
      // Fetch user profile data for each payment
      const formattedPayments: CryptoPayment[] = await Promise.all(cryptoPayments.map(async (payment) => {
        // Fetch profile data separately for each payment
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, username')
          .eq('id', payment.user_id)
          .single();
        
        return {
          id: payment.id,
          user_id: payment.user_id,
          amount: payment.amount,
          created_at: payment.created_at,
          status: payment.status,
          type: payment.type,
          details: transformPaymentDetails(payment.details),
          email: profileData?.email || undefined,
          username: profileData?.username || undefined
        };
      }));
      
      console.log('Formatted payments with user data:', formattedPayments.length);
      setPayments(formattedPayments);
    } catch (error: any) {
      console.error("Error loading crypto payments:", error.message);
      toast({
        title: "Error loading payment data",
        description: error.message || "Failed to load crypto payment data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approvePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', paymentId);
        
      if (error) throw error;
      
      toast({
        title: "Payment Approved",
        description: "Crypto payment has been approved and funds added to user's account",
      });
      
      // Refresh payment data
      loadCryptoPayments();
    } catch (error: any) {
      console.error("Error approving payment:", error.message);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve the payment",
        variant: "destructive",
      });
    }
  };

  const rejectPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'rejected' })
        .eq('id', paymentId);
        
      if (error) throw error;
      
      toast({
        title: "Payment Rejected",
        description: "Crypto payment has been rejected",
      });
      
      // Refresh payment data
      loadCryptoPayments();
    } catch (error: any) {
      console.error("Error rejecting payment:", error.message);
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject the payment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadCryptoPayments();
  }, []);

  return {
    payments,
    isLoading,
    approvePayment,
    rejectPayment,
    refreshPayments: loadCryptoPayments
  };
}
