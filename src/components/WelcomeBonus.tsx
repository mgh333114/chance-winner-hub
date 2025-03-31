
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Reward } from '@/types/rewards';

const WelcomeBonus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSignupBonus, setHasSignupBonus] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        // Check if user is logged in
        const { data: sessionData } = await supabase.auth.getSession();
        setIsLoggedIn(!!sessionData?.session?.user);
        
        // If logged in, check if they already have a welcome bonus
        if (sessionData?.session?.user) {
          const { data, error } = await supabase
            .from('rewards')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .eq('reward_type', 'signup_bonus')
            .single();
            
          if (error && error.code !== 'PGRST116') {
            // PGRST116 means no rows returned - which is expected if they don't have a bonus
            throw error;
          }
          
          setHasSignupBonus(!!data);
          
          // If they don't have a welcome bonus yet, create one!
          if (!data && sessionData?.session?.user) {
            const { error: insertError } = await supabase
              .from('rewards')
              .insert({
                user_id: sessionData.session.user.id,
                reward_type: 'signup_bonus',
                amount: 100,
                description: 'Welcome Bonus - New User',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
              } as Partial<Reward>);
              
            if (insertError) throw insertError;
          }
        }
      } catch (error: any) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // If user has already claimed the bonus or is loading, don't show this component
  if ((isLoggedIn && hasSignupBonus) || loading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl overflow-hidden shadow-lg text-white relative"
    >
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_40%)]"></div>
      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 md:mr-6">
            <div className="flex items-center">
              <Gift className="w-8 h-8 text-yellow-300 mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold">Welcome Bonus</h2>
            </div>
            <p className="mt-4 text-lg opacity-90">
              Sign up today and get <span className="font-bold">$100 FREE</span> bonus credits!
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-300 mr-2" />
                <p>No deposit required</p>
              </div>
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-300 mr-2" />
                <p>Try all our games without risk</p>
              </div>
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-300 mr-2" />
                <p>Win real prizes with your bonus</p>
              </div>
            </div>
            <Button 
              className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black"
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Claim Your Bonus <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="hidden md:block relative">
            <div className="relative w-44 h-44 bg-white rounded-full flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-30"
                style={{
                  background: "conic-gradient(from 0deg, purple, blue, purple)",
                  borderRadius: "50%"
                }}
              />
              <div className="z-10 text-center px-4">
                <div className="text-6xl font-bold text-purple-600">$100</div>
                <div className="text-purple-600 font-semibold">FREE BONUS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeBonus;
