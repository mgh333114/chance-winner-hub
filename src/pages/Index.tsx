
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gift, Award, ShieldCheck, Ticket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import GamesList from '@/components/GamesList';
import WelcomeBonus from '@/components/WelcomeBonus';
import CustomerSupport from '@/components/CustomerSupport';
import { supabase } from '@/integrations/supabase/client';

const features = [
  {
    icon: <Gift className="w-8 h-8 text-lottery-gold" />,
    title: 'Exciting Prizes',
    description: 'Win big with our generous prize pools and special jackpots.',
  },
  {
    icon: <Award className="w-8 h-8 text-lottery-neonGreen" />,
    title: 'Multiple Games',
    description: 'Try your luck with various games from lotteries to instant wins.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-lottery-green" />,
    title: 'Secure Platform',
    description: 'Your data and transactions are always protected with us.',
  },
  {
    icon: <Ticket className="w-8 h-8 text-lottery-red" />,
    title: 'Easy Participation',
    description: 'Simple and straightforward process to buy tickets and play games.',
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-lottery-black text-lottery-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <Hero />
        
        {!isLoggedIn && (
          <div className="mt-6">
            <WelcomeBonus />
          </div>
        )}
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 mb-16"
        >
          <div className="text-center mb-10">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold mb-4 text-lottery-gold"
            >
              Why Choose Our Platform?
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-lottery-white max-w-2xl mx-auto"
            >
              We offer an exciting gaming experience with multiple ways to win big prizes.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-lottery-black backdrop-blur-sm p-6 rounded-xl border border-lottery-green hover:border-lottery-gold transition-all shadow-lg"
              >
                <div className="bg-lottery-black/50 p-3 rounded-full w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-lottery-neonGreen">{feature.title}</h3>
                <p className="text-lottery-white/90">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <GamesList />
        
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center lg:text-left"
          >
            <div className="bg-lottery-black backdrop-blur-sm border border-lottery-green rounded-xl p-8 shadow-lg h-full">
              <h2 className="text-2xl font-bold mb-4 text-lottery-gold">
                Ready to Try Your Luck?
              </h2>
              <p className="text-lottery-white mb-6">
                {isLoggedIn 
                  ? "You're logged in! Start playing any of our exciting games or buy lottery tickets now."
                  : "Sign up now to receive a welcome bonus and start your winning journey with us!"}
              </p>
              
              {!isLoggedIn && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    onClick={() => navigate('/auth')} 
                    className="bg-lottery-green hover:bg-lottery-green/90 text-lottery-black border-0"
                    size="lg"
                  >
                    Sign Up Now
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')} 
                    variant="outline"
                    className="border-lottery-gold text-lottery-gold hover:bg-lottery-black/50"
                    size="lg"
                  >
                    Already Have an Account?
                  </Button>
                </div>
              )}
              
              {isLoggedIn && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    onClick={() => navigate('/purchase')} 
                    className="bg-lottery-green hover:bg-lottery-green/90 text-lottery-black border-0"
                    size="lg"
                  >
                    Buy Lottery Tickets
                  </Button>
                  <Button 
                    onClick={() => navigate('/games')} 
                    variant="outline"
                    className="border-lottery-gold text-lottery-gold hover:bg-lottery-black/50"
                    size="lg"
                  >
                    Play Games
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CustomerSupport />
          </motion.div>
        </div>
      </div>
      
      <footer className="mt-16 bg-lottery-black/80 backdrop-blur-md border-t border-lottery-green/30 py-6">
        <div className="container mx-auto px-4 text-center text-lottery-white/60 text-sm">
          <p>© 2023 LottoWin. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-lottery-neonGreen mx-2">Terms</a>
            <a href="#" className="hover:text-lottery-neonGreen mx-2">Privacy</a>
            <a href="#" className="hover:text-lottery-neonGreen mx-2">Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
