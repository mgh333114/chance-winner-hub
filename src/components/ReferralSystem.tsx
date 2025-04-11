
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
    // KSh 10,000 per successful referral + deposit bonuses
    return getCompletedReferrals() * 10000 + depositBonusTotal;
  };

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Refer Your Friends</CardTitle>
          <Users className="w-5 h-5 text-lottery-blue" />
        </div>
        <CardDescription>
          Invite friends and earn bonuses for each referral
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-lottery-light p-4 rounded-lg mb-4">
            <p className="text-sm text-lottery-dark mb-3">
              Share your unique link and earn <span className="font-semibold">{formatCurrency(10000)}</span> for each friend who signs up!
              Plus <span className="font-semibold">5%</span> of their deposits.
            </p>
            <div className="flex">
              <Input 
                value={referralLink} 
                readOnly
                className="rounded-r-none border-r-0 bg-white"
              />
              <Button
                onClick={copyToClipboard}
                className="rounded-l-none bg-lottery-blue hover:bg-lottery-blue/90"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-xs text-lottery-gray mb-1">Total Referrals</p>
              <p className="text-lg font-semibold text-lottery-dark">{referrals.length}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xs text-lottery-gray mb-1">Completed</p>
              <p className="text-lg font-semibold text-green-600">{getCompletedReferrals()}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg text-center">
              <p className="text-xs text-lottery-gray mb-1">Pending</p>
              <p className="text-lg font-semibold text-amber-600">{getPendingReferrals()}</p>
            </div>
          </div>
          
          {isInfluencer ? (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-lg text-white mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">Influencer Status Achieved!</span>
              </div>
              <p className="text-sm opacity-90 mb-2">
                Congratulations on becoming a LottoWin Influencer with {getCompletedReferrals()} successful referrals!
              </p>
              <Badge className="bg-yellow-400 text-indigo-900 hover:bg-yellow-500 border-0">
                Influencer
              </Badge>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-purple-800">Influencer Program</span>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Refer 100 friends and become a LottoWin Influencer! Get a special badge and {formatCurrency(1000)} bonus.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-purple-600">
                  <span>{getCompletedReferrals()} Referrals</span>
                  <span>100 Needed</span>
                </div>
                <Progress value={getInfluencerProgress()} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-lottery-gray">Total Earned</span>
              <span className="text-lg font-semibold text-purple-600">{formatCurrency(getTotalEarned())}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Including referral bonuses and 5% of friends' deposits</p>
            <Button 
              variant="outline" 
              className="w-full text-lottery-blue border-lottery-blue hover:bg-lottery-blue/5 mt-2"
              onClick={() => {
                window.location.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Join me on LottoWin and get a KSh 10,000 welcome bonus! Use my referral link: " + referralLink);
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
