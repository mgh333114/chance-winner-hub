
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, LinkIcon, Award, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';
import { Referral } from '@/types/rewards';

const ReferralSystem = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [depositBonusTotal, setDepositBonusTotal] = useState(0);
  const { toast } = useToast();
  const { formatCurrency } = usePayment();

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          setLoading(false);
          return;
        }
        
        // Create referral link
        const baseUrl = window.location.origin;
        setReferralLink(`${baseUrl}/auth?ref=${sessionData.session.user.id}`);
        
        // Fetch user's profile to check influencer status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (profileData) {
          setIsInfluencer(profileData.account_type === 'influencer' || profileData.account_type === 'demo_influencer');
        }
        
        // Fetch user's referrals
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', sessionData.session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setReferrals(data as Referral[] || []);
        setReferralCount(data?.length || 0);
        
        // Fetch deposit bonuses
        const { data: depositBonuses, error: depositError } = await supabase
          .from('rewards')
          .select('amount')
          .eq('user_id', sessionData.session.user.id)
          .eq('reward_type', 'deposit_bonus');
          
        if (depositError) throw depositError;
        
        const total = depositBonuses?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
        setDepositBonusTotal(total);
      } catch (error: any) {
        console.error('Error fetching referrals:', error);
        toast({
          title: 'Error loading referrals',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferrals();
    
    // Set up subscription for referral updates
    const channel = supabase
      .channel('referrals-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: 'referrals'
        }, 
        () => {
          fetchReferrals();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getCompletedReferrals = () => {
    return referrals.filter(ref => ref.status === 'completed').length;
  };
  
  const getPendingReferrals = () => {
    return referrals.filter(ref => ref.status === 'pending').length;
  };
  
  const getInfluencerProgress = () => {
    const completed = getCompletedReferrals();
    return Math.min((completed / 100) * 100, 100);
  };
  
  const getTotalEarned = () => {
    // KSh 10 per successful referral + deposit bonuses
    return getCompletedReferrals() * 10 + depositBonusTotal;
  };

  return (
    <Card className="bg-black border border-gray-800 shadow-lg text-gray-100">
      <CardHeader className="pb-2 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-amber-500">Refer Your Friends</CardTitle>
          <Users className="w-5 h-5 text-amber-500" />
        </div>
        <CardDescription className="text-gray-400">
          Invite friends and earn bonuses for each referral
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-900 p-4 rounded-lg mb-4 border border-gray-800">
            <p className="text-sm text-gray-300 mb-3">
              Share your unique link and earn <span className="font-semibold text-amber-500">{formatCurrency(10)}</span> for each friend who signs up!
              Plus <span className="font-semibold text-amber-500">5%</span> of their deposits.
            </p>
            <div className="flex">
              <Input 
                value={referralLink} 
                readOnly
                className="rounded-r-none border-r-0 bg-gray-800 text-gray-300 border-gray-700 focus:ring-amber-500"
              />
              <Button
                onClick={copyToClipboard}
                className="rounded-l-none bg-amber-500 hover:bg-amber-600 text-black"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-900 p-3 rounded-lg text-center border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Total Referrals</p>
              <p className="text-lg font-semibold text-white">{referrals.length}</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg text-center border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Completed</p>
              <p className="text-lg font-semibold text-green-500">{getCompletedReferrals()}</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg text-center border border-gray-800">
              <p className="text-xs text-gray-400 mb-1">Pending</p>
              <p className="text-lg font-semibold text-amber-500">{getPendingReferrals()}</p>
            </div>
          </div>
          
          {isInfluencer ? (
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 rounded-lg text-white mb-4 border border-amber-500/50">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-bold">Influencer Status Achieved!</span>
              </div>
              <p className="text-sm opacity-90 mb-2">
                Congratulations on becoming a LottoWin Influencer with {getCompletedReferrals()} successful referrals!
              </p>
              <Badge className="bg-amber-500 text-black hover:bg-amber-600 border-0">
                Influencer
              </Badge>
            </div>
          ) : (
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-white">Influencer Program</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Refer 100 friends and become a LottoWin Influencer! Get a special badge and {formatCurrency(1000)} bonus.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{getCompletedReferrals()} Referrals</span>
                  <span>100 Needed</span>
                </div>
                <Progress value={getInfluencerProgress()} className="h-2 bg-gray-700" indicatorClassName="bg-amber-500" />
              </div>
            </div>
          )}
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Total Earned</span>
              <span className="text-lg font-semibold text-amber-500">{formatCurrency(getTotalEarned())}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Including referral bonuses and 5% of friends' deposits</p>
            <Button 
              variant="outline" 
              className="w-full text-amber-500 border-amber-500 hover:bg-amber-500/10 mt-2"
              onClick={() => {
                window.location.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Join me on LottoWin and get a KSh 10 welcome bonus! Use my referral link: " + referralLink);
              }}
            >
              <LinkIcon className="w-4 h-4 mr-2" /> Share on Twitter
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default ReferralSystem;
