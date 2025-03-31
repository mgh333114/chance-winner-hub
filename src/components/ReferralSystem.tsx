
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';

type Referral = {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  status: string;
  reward_claimed: boolean;
  created_at: string;
  completed_at: string | null;
};

const ReferralSystem = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
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
        
        // Fetch user's referrals
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', sessionData.session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setReferrals(data || []);
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
  
  const getTotalEarned = () => {
    // Assuming $10 per successful referral
    return getCompletedReferrals() * 10;
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
              Share your unique link and earn {formatCurrency(10)} for each friend who signs up and makes a deposit!
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
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-lottery-gray">Total Earned</span>
              <span className="text-lg font-semibold text-purple-600">{formatCurrency(getTotalEarned())}</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full text-lottery-blue border-lottery-blue hover:bg-lottery-blue/5 mt-2"
              onClick={() => {
                window.location.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Join me on LottoWin and get a welcome bonus! Use my referral link: " + referralLink);
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
