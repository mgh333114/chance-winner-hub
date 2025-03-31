
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';

type Reward = {
  id: string;
  user_id: string;
  reward_type: string;
  amount: number;
  is_claimed: boolean;
  is_expired: boolean;
  created_at: string;
  expires_at: string | null;
  description: string | null;
  details: any | null;
}

const BonusesAndRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { refreshBalance, formatCurrency } = usePayment();

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          setLoading(false);
          return;
        }
        
        // Fetch user's rewards
        const { data, error } = await supabase
          .from('rewards')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .eq('is_claimed', false)
          .eq('is_expired', false)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setRewards(data || []);
      } catch (error: any) {
        console.error('Error fetching rewards:', error);
        toast({
          title: 'Error loading rewards',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRewards();
    
    // Set up subscription to refresh rewards list when new ones are added
    const channel = supabase
      .channel('rewards-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public',
          table: 'rewards'
        }, 
        () => {
          fetchRewards();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const claimReward = async (reward: Reward) => {
    try {
      // Update reward to claimed
      const { error: updateError } = await supabase
        .from('rewards')
        .update({ is_claimed: true })
        .eq('id', reward.id);
        
      if (updateError) throw updateError;
      
      // If it's a deposit bonus, add to user balance
      if (reward.reward_type === 'deposit_bonus' || reward.reward_type === 'signup_bonus' || reward.reward_type === 'referral_bonus') {
        // For demo accounts, use the special RPC function
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          // Add the bonus amount as a transaction
          const { error: transactionError } = await supabase.rpc('add_demo_transaction', {
            user_id_input: sessionData.session.user.id,
            amount_input: reward.amount,
            type_input: 'deposit',
            details_input: { note: `Claimed ${reward.description || reward.reward_type}` }
          });
          
          if (transactionError) throw transactionError;
          
          // Refresh the user's balance
          await refreshBalance();
        }
      }
      
      // Update local rewards list
      setRewards(prevRewards => prevRewards.filter(r => r.id !== reward.id));
      
      toast({
        title: 'Reward claimed!',
        description: `You have claimed ${formatCurrency(reward.amount)}`,
      });
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Error claiming reward',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    }
  };
  
  // Function to get icon based on reward type
  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'signup_bonus':
        return <Zap className="w-5 h-5 text-purple-500" />;
      case 'deposit_bonus':
        return <Gift className="w-5 h-5 text-green-500" />;
      case 'referral_bonus':
        return <Users className="w-5 h-5 text-blue-500" />;
      default:
        return <Gift className="w-5 h-5 text-lottery-blue" />;
    }
  };
  
  // Function to get friendly name for reward type
  const getRewardTypeName = (type: string) => {
    switch (type) {
      case 'signup_bonus': return 'Sign-up Bonus';
      case 'deposit_bonus': return 'Deposit Match';
      case 'referral_bonus': return 'Referral Bonus';
      case 'free_spins': return 'Free Spins';
      case 'cashback': return 'Cashback';
      default: return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  // Placeholder for when there are no active rewards
  if (!loading && rewards.length === 0) {
    return (
      <Card className="bg-white border border-gray-100 shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Available Bonuses</CardTitle>
          <CardDescription>No active bonuses available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">Make a deposit to receive bonuses and rewards!</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/profile'}
              className="border-lottery-blue text-lottery-blue hover:bg-lottery-blue/5"
            >
              Go to Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-100 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Available Bonuses</CardTitle>
        <CardDescription>Claim your rewards and bonuses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100 relative overflow-hidden"
              >
                <div className="flex justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      {getRewardIcon(reward.reward_type)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {reward.description || getRewardTypeName(reward.reward_type)}
                      </h4>
                      <p className="text-green-600 font-semibold">{formatCurrency(reward.amount)}</p>
                      {reward.expires_at && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires: {new Date(reward.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-0">
                    {getRewardTypeName(reward.reward_type)}
                  </Badge>
                </div>
                <Button
                  className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600"
                  onClick={() => claimReward(reward)}
                >
                  Claim Bonus
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default BonusesAndRewards;
