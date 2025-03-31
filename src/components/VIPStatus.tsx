import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Award, Star, Sparkles, Diamond } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VIPTier, UserVIPStatus } from '@/types/rewards';

const VIPStatus = () => {
  const [vipTiers, setVipTiers] = useState<VIPTier[]>([]);
  const [userStatus, setUserStatus] = useState<UserVIPStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVIPData = async () => {
      try {
        setLoading(true);
        
        // Fetch VIP tiers
        const { data: tiersData, error: tiersError } = await supabase
          .from('vip_tiers')
          .select('*')
          .order('required_points', { ascending: true });
        
        if (tiersError) throw tiersError;
        
        setVipTiers(tiersData as VIPTier[] || []);
        
        // Fetch user's VIP status if logged in
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          const { data: statusData, error: statusError } = await supabase
            .from('user_vip_status')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .single();
          
          if (statusError && statusError.code !== 'PGRST116') {
            // PGRST116 means no rows returned, which is fine for new users
            throw statusError;
          }
          
          if (statusData) {
            setUserStatus(statusData as UserVIPStatus);
          } else if (tiersData && tiersData.length > 0) {
            // If user has no VIP status yet but is logged in, create one
            const { data: newStatus, error: insertError } = await supabase
              .from('user_vip_status')
              .insert({
                user_id: sessionData.session.user.id,
                tier_id: (tiersData as VIPTier[])[0].id, // Bronze tier
                points: 0
              } as Partial<UserVIPStatus>)
              .select()
              .single();
            
            if (insertError) throw insertError;
            setUserStatus(newStatus as UserVIPStatus || null);
          }
        }
      } catch (error: any) {
        console.error('Error fetching VIP data:', error);
        toast({
          title: 'Error loading VIP status',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVIPData();
  }, [toast]);

  if (loading || vipTiers.length === 0) {
    return (
      <Card className="bg-white border border-gray-100 shadow-sm relative">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">VIP Status</CardTitle>
          <CardDescription>Loading your loyalty benefits...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTier = userStatus 
    ? vipTiers.find(tier => tier.id === userStatus.tier_id) || vipTiers[0]
    : vipTiers[0];
    
  const nextTier = vipTiers.find(tier => tier.id === (currentTier.id + 1));
  
  let progressPercentage = 0;
  let pointsToNextTier = 0;
  
  if (userStatus && nextTier) {
    pointsToNextTier = nextTier.required_points - userStatus.points;
    const pointsRange = nextTier.required_points - currentTier.required_points;
    const userProgress = userStatus.points - currentTier.required_points;
    progressPercentage = Math.min(100, Math.max(0, (userProgress / pointsRange) * 100));
  }
  
  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return <Award className="w-5 h-5 text-amber-600" />;
      case 'silver': return <Star className="w-5 h-5 text-gray-400" />;
      case 'gold': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'platinum': return <Sparkles className="w-5 h-5 text-blue-400" />;
      case 'diamond': return <Diamond className="w-5 h-5 text-purple-500" />;
      default: return <Award className="w-5 h-5 text-amber-600" />;
    }
  };

  const getTierBgColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return 'from-amber-100 to-amber-50';
      case 'silver': return 'from-gray-200 to-gray-100';
      case 'gold': return 'from-yellow-100 to-amber-50';
      case 'platinum': return 'from-blue-100 to-blue-50';
      case 'diamond': return 'from-purple-100 to-pink-50';
      default: return 'from-amber-100 to-amber-50';
    }
  };

  return (
    <Card className="bg-white border border-gray-100 shadow-sm relative overflow-hidden">
      <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${getTierBgColor(currentTier.name)} -z-10`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">VIP Status</CardTitle>
          {getTierIcon(currentTier.name)}
        </div>
        <CardDescription>Your loyalty benefits</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{currentTier.name}</span>
              {currentTier.name !== 'Bronze' && (
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                  {currentTier.cashback_percentage}% Cashback
                </span>
              )}
            </div>
            {userStatus && (
              <span className="text-sm font-medium">{userStatus.points} Points</span>
            )}
          </div>
          
          {nextTier && (
            <div className="mt-4 mb-1">
              <div className="flex justify-between text-xs mb-1">
                <span>{currentTier.name}</span>
                <span>{nextTier.name}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="mt-2 text-xs text-gray-500">
                {pointsToNextTier} points needed for {nextTier.name}
              </div>
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            <div className="text-sm flex justify-between">
              <span>Weekly Bonus</span>
              <span className="font-medium">{currentTier.weekly_bonus} credits</span>
            </div>
            <div className="text-sm flex justify-between">
              <span>Exclusive Promotions</span>
              <span className="font-medium">{currentTier.id >= 3 ? 'Yes' : 'No'}</span>
            </div>
            <div className="text-sm flex justify-between">
              <span>Priority Support</span>
              <span className="font-medium">{currentTier.id >= 2 ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default VIPStatus;
