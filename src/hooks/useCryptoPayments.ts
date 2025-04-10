
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseRealtime } from './useSupabaseRealtime';

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
      // Fetch crypto transactions with pending status
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            email,
            username
          )
        `)
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .or('details->method.eq.crypto,details->method.eq.bitcoin,details->method.eq.ethereum')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include user email/username
      const formattedPayments = (data || []).map((payment) => {
        const profile = payment.profiles as any;
        return {
          ...payment,
          email: profile?.email || null,
          username: profile?.username || null
        };
      });
      
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
