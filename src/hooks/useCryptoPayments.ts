
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
      
      // Fetch all pending deposit transactions first
      const { data: allPendingDeposits, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')
        .eq('type', 'deposit');
      
      if (fetchError) throw fetchError;
      
      console.log('Fetched all pending deposits:', allPendingDeposits?.length || 0);
      
      if (!allPendingDeposits || allPendingDeposits.length === 0) {
        console.log('No pending deposits found');
        setPayments([]);
        setIsLoading(false);
        return;
      }
      
      // Filter for crypto payments on client side
      const cryptoPayments = allPendingDeposits.filter(payment => {
        // If details doesn't exist, it's not a crypto payment
        if (!payment.details) return false;
        
        let detailsObj: Record<string, unknown>;
        
        // Handle different types of details field
        if (typeof payment.details === 'string') {
          try {
            detailsObj = JSON.parse(payment.details);
          } catch (e) {
            console.error('Failed to parse payment details JSON:', e);
            return false;
          }
        } else if (typeof payment.details === 'object' && payment.details !== null) {
          detailsObj = payment.details as Record<string, unknown>;
        } else {
          return false;
        }
        
        // Check if method exists and is a crypto method
        if (!detailsObj || !('method' in detailsObj)) return false;
        
        const method = String(detailsObj.method).toLowerCase();
        return ['crypto', 'bitcoin', 'ethereum'].includes(method);
      });
      
      console.log('Filtered crypto payments:', cryptoPayments.length);
      
      // Get user data for each payment
      const paymentsWithUserData = await Promise.all(
        cryptoPayments.map(async (payment) => {
          try {
            // Fetch profile data for this payment
            const { data: profile } = await supabase
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
              email: profile?.email,
              username: profile?.username
            } as CryptoPayment;
          } catch (err) {
            console.error(`Error fetching user data for payment ${payment.id}:`, err);
            // Return payment without user data if fetching fails
            return {
              id: payment.id,
              user_id: payment.user_id,
              amount: payment.amount,
              created_at: payment.created_at,
              status: payment.status,
              type: payment.type,
              details: transformPaymentDetails(payment.details),
            } as CryptoPayment;
          }
        })
      );
      
      console.log('Final payments with user data:', paymentsWithUserData.length);
      setPayments(paymentsWithUserData);
      
    } catch (error: any) {
      console.error("Error loading crypto payments:", error.message);
      toast({
        title: "Error loading payment data",
        description: error.message || "Failed to load crypto payment data",
        variant: "destructive",
      });
      setPayments([]);
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
