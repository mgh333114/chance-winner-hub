
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useInfluencerStatus = () => {
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkInfluencerStatus = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        setLoading(false);
        return;
      }
      
      // Fetch user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', sessionData.session.user.id)
        .single();
        
      if (profileData) {
        setIsInfluencer(
          profileData.account_type === 'influencer' || 
          profileData.account_type === 'demo_influencer'
        );
      }
      
      // Fetch user's completed referrals
      const { data: referrals, error: referralError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', sessionData.session.user.id)
        .eq('status', 'completed');
      
      if (referralError) throw referralError;
      
      setReferralCount(referrals?.length || 0);
      
      // If we have enough referrals but not marked as influencer yet, call the edge function
      if (referrals && referrals.length >= 100 && !isInfluencer) {
        // Call the edge function to check and update influencer status
        const { error } = await supabase.functions.invoke('influencer-notification', {
          body: { userId: sessionData.session.user.id }
        });
        
        if (error) {
          console.error('Error checking influencer status:', error);
        } else {
          // Refresh the profile data to see if status changed
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (updatedProfile) {
            const newInfluencerStatus = 
              updatedProfile.account_type === 'influencer' || 
              updatedProfile.account_type === 'demo_influencer';
              
            if (newInfluencerStatus && !isInfluencer) {
              toast({
                title: 'Congratulations!',
                description: 'You are now a LottoWin Influencer! Check your email for details.',
              });
            }
            
            setIsInfluencer(newInfluencerStatus);
          }
        }
      }
    } catch (error: any) {
      console.error('Error checking influencer status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkInfluencerStatus();
  }, []);

  return {
    isInfluencer,
    referralCount,
    loading,
    refreshInfluencerStatus: checkInfluencerStatus
  };
};
