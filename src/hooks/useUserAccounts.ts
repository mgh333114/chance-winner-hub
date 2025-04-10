
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from './useSupabase';
import { useSupabaseRealtime } from './useSupabaseRealtime';

export interface UserAccount {
  id: string;
  email: string | null;
  username: string | null;
  account_type: string | null;
  created_at: string;
  balance: number;
  current_game: string | null;
}

export function useUserAccounts() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { data: profilesData } = useSupabase('profiles', { fetchOnMount: true });

  // Subscribe to real-time updates
  useSupabaseRealtime('profiles', {
    onInsert: (newProfile) => {
      console.log('New profile detected, refreshing accounts');
      loadAccounts();
    },
    onUpdate: (updatedProfile) => {
      console.log('Profile updated, refreshing accounts');
      loadAccounts();
    },
  });

  // Also track transactions in real-time for balance updates
  useSupabaseRealtime('transactions', {
    onInsert: () => {
      console.log('New transaction detected, refreshing account balances');
      loadAccounts();
    },
    onUpdate: () => {
      console.log('Transaction updated, refreshing account balances');
      loadAccounts();
    }
  });

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Create enriched account objects with balance info
      const accountsWithBalances = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Calculate balance for each user
          const { data: deposits } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', profile.id)
            .eq('type', 'deposit')
            .eq('status', 'completed')
            .eq('is_demo', profile.account_type === 'demo');
          
          const { data: withdrawals } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', profile.id)
            .eq('type', 'withdrawal')
            .eq('status', 'completed')
            .eq('is_demo', profile.account_type === 'demo');
          
          const { data: purchases } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', profile.id)
            .eq('type', 'purchase')
            .eq('status', 'completed')
            .eq('is_demo', profile.account_type === 'demo');
            
          const { data: winnings } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', profile.id)
            .eq('type', 'winnings')
            .eq('status', 'completed')
            .eq('is_demo', profile.account_type === 'demo');
            
          const totalDeposits = (deposits || []).reduce((sum, item) => sum + item.amount, 0);
          const totalWithdrawals = (withdrawals || []).reduce((sum, item) => sum + item.amount, 0);
          const totalPurchases = (purchases || []).reduce((sum, item) => sum + item.amount, 0);
          const totalWinnings = (winnings || []).reduce((sum, item) => sum + item.amount, 0);
          
          const balance = totalDeposits + totalWinnings - totalPurchases - totalWithdrawals;
          
          // Check if user is currently in a game (this is mock for now, would be replaced by actual game tracking)
          // In a real app, you would have a user_sessions or active_games table to track this
          const currentGame = null; // For now we don't track active games
          
          return {
            ...profile,
            balance,
            current_game: currentGame
          };
        })
      );
      
      setAccounts(accountsWithBalances);
    } catch (error: any) {
      console.error("Error loading user accounts:", error.message);
      toast({
        title: "Error loading accounts",
        description: error.message || "Failed to load account data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [profilesData]);

  return {
    accounts,
    isLoading,
    refreshAccounts: loadAccounts
  };
}
