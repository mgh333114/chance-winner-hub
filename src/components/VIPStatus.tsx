
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Trophy, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VIPTier, UserVIPStatus } from '@/types/rewards';

const VIPStatus: React.FC = () => {
  const [tiers, setTiers] = useState<VIPTier[]>([]);
  const [userStatus, setUserStatus] = useState<UserVIPStatus | null>(null);
  const [currentTier, setCurrentTier] = useState<VIPTier | null>(null);
  const [nextTier, setNextTier] = useState<VIPTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchVIPData = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) {
          return;
        }
        
        setUserId(sessionData.session.user.id);
        
        // Fetch VIP tiers
        const { data: tierData, error: tierError } = await supabase
          .from('vip_tiers')
          .select('*')
          .order('required_points', { ascending: true });
          
        if (tierError) throw tierError;
        setTiers(tierData as VIPTier[]);
        
        // Fetch user's VIP status
        const { data: statusData, error: statusError } = await supabase
          .from('user_vip_status')
          .select('*')
          .eq('user_id', sessionData.session.user.id)
          .single();
          
        if (statusError && statusError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw statusError;
        }
        
        // If no VIP status found, create a default one
        if (!statusData && tierData && tierData.length > 0) {
          const defaultStatus: Omit<UserVIPStatus, 'last_calculated_at'> & {
            user_id: string;
            tier_id: number;
            points: number;
          } = {
            user_id: sessionData.session.user.id,
            tier_id: tierData[0].id,
            points: 0
          };
          
          const { data: newStatus, error: createError } = await supabase
            .from('user_vip_status')
            .insert(defaultStatus)
            .select()
            .single();
            
          if (createError) throw createError;
          setUserStatus(newStatus as UserVIPStatus);
        } else {
          setUserStatus(statusData as UserVIPStatus);
        }
        
      } catch (error: any) {
        console.error("Error fetching VIP data:", error);
        toast({
          title: "Error loading VIP status",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVIPData();
  }, [toast]);
  
  useEffect(() => {
    // Set current and next tier based on user status and tiers
    if (userStatus && tiers.length > 0) {
      const current = tiers.find(tier => tier.id === userStatus.tier_id);
      setCurrentTier(current || null);
      
      const currentIndex = tiers.findIndex(tier => tier.id === userStatus.tier_id);
      setNextTier(currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null);
    }
  }, [userStatus, tiers]);
  
  // Calculate progress to next tier
  const calculateProgress = () => {
    if (!userStatus || !currentTier || !nextTier) return 0;
    
    const currentPoints = userStatus.points;
    const currentTierPoints = currentTier.required_points;
    const nextTierPoints = nextTier.required_points;
    
    const requiredPoints = nextTierPoints - currentTierPoints;
    const achievedPoints = currentPoints - currentTierPoints;
    
    return Math.min(Math.round((achievedPoints / requiredPoints) * 100), 100);
  };
  
  // If not logged in or still loading, show placeholder
  if (!userId || loading) {
    return (
      <div className="border border-lottery-gray/20 rounded-2xl bg-white/5 backdrop-blur-sm p-6 animate-pulse">
        <div className="h-8 w-1/3 bg-lottery-gray/20 rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-lottery-gray/20 rounded mb-6"></div>
        <div className="h-16 w-full bg-lottery-gray/20 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-lottery-gray/20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="border border-lottery-gold/30 rounded-2xl bg-gradient-to-br from-lottery-black to-lottery-dark shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-lottery-gold" />
            VIP Status
          </h2>
          
          {currentTier && (
            <div className="flex items-center">
              <motion.span 
                className="bg-lottery-gold px-3 py-1 rounded-full text-lottery-black font-bold text-sm"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {currentTier.name} TIER
              </motion.span>
            </div>
          )}
        </div>
        
        {currentTier && (
          <div className="bg-white/5 rounded-xl p-4 mb-5">
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-lottery-gold mr-1" />
                <span className="text-white/90 text-sm">Current Benefits:</span>
              </div>
              <span className="text-lottery-gold text-sm font-medium">{currentTier.name}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/70">Cashback</div>
                <div className="text-xl font-bold text-lottery-gold">{currentTier.cashback_percentage}%</div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/70">Weekly Bonus</div>
                <div className="text-xl font-bold text-lottery-gold">${currentTier.weekly_bonus}</div>
              </div>
            </div>
            
            <div className="text-xs text-white/60">{currentTier.description}</div>
          </div>
        )}
        
        {nextTier && (
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span className="text-white/90 text-sm">Progress to {nextTier.name}</span>
              <span className="text-white/90 text-sm">
                {userStatus ? userStatus.points : 0} / {nextTier.required_points} points
              </span>
            </div>
            
            <Progress value={calculateProgress()} className="h-2 mb-2" />
            
            <div className="text-xs text-white/60">
              {userStatus && nextTier && (
                <>Need {nextTier.required_points - userStatus.points} more points to reach {nextTier.name}</>
              )}
            </div>
          </div>
        )}
        
        <Button className="w-full group bg-lottery-gold hover:bg-lottery-gold/90 text-lottery-black" onClick={() => {}}>
          <span>View VIP Benefits</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      
      {tiers.length > 0 && (
        <div className="bg-white/5 border-t border-lottery-gold/20 px-4 py-3 flex overflow-x-auto space-x-2 no-scrollbar">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                currentTier && tier.id === currentTier.id
                  ? 'bg-lottery-gold text-lottery-black'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {tier.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VIPStatus;
