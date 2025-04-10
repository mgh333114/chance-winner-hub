
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
      // Fetch crypto transactions with pending status - fixing the join query
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, 
          user_id,
          amount,
          created_at,
          status,
          type,
          details
        `)
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .or('details->method.eq.crypto,details->method.eq.bitcoin,details->method.eq.ethereum');
      
      if (error) throw error;
      
      // Since we can't directly join, let's get profiles separately
      const formattedPayments: CryptoPayment[] = await Promise.all((data || []).map(async (payment) => {
        // Fetch profile data separately
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
          email: profileData?.email || null,
          username: profileData?.username || null
        };
      }));
      
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
