
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gift, Award, ShieldCheck, Ticket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import GamesList from '@/components/GamesList';
import { supabase } from '@/integrations/supabase/client';

const features = [
  {
    icon: <Gift className="w-8 h-8 text-purple-400" />,
    title: 'Exciting Prizes',
    description: 'Win big with our generous prize pools and special jackpots.',
  },
  {
    icon: <Award className="w-8 h-8 text-blue-400" />,
    title: 'Multiple Games',
    description: 'Try your luck with various games from lotteries to instant wins.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
    title: 'Secure Platform',
    description: 'Your data and transactions are always protected with us.',
  },
  {
    icon: <Ticket className="w-8 h-8 text-red-400" />,
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

  // Background style with gradient and pattern
  const bgStyle = {
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E"), linear-gradient(135deg, #4527a0, #7b1fa2, #c2185b)',
    backgroundSize: '100px 100px, cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen bg-black text-white" style={bgStyle}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <Hero />
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 mb-16"
        >
          <div className="text-center mb-10">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
            >
              Why Choose Our Platform?
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-white/80 max-w-2xl mx-auto"
            >
              We offer an exciting gaming experience with multiple ways to win big prizes.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-purple-500/50 transition-all shadow-lg"
              >
                <div className="bg-black/20 p-3 rounded-full w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <GamesList />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-3xl mx-auto shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Ready to Try Your Luck?
            </h2>
            <p className="text-white/80 mb-6">
              {isLoggedIn 
                ? "You're logged in! Start playing any of our exciting games or buy lottery tickets now."
                : "Sign up now to receive a welcome bonus and start your winning journey with us!"}
            </p>
            
            {!isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  size="lg"
                >
                  Sign Up Now
                </Button>
                <Button 
                  onClick={() => navigate('/auth')} 
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  size="lg"
                >
                  Already Have an Account?
                </Button>
              </div>
            )}
            
            {isLoggedIn && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/purchase')} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  size="lg"
                >
                  Buy Lottery Tickets
                </Button>
                <Button 
                  onClick={() => navigate('/games')} 
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  size="lg"
                >
                  Play Games
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      <footer className="mt-16 bg-black/40 backdrop-blur-md border-t border-white/10 py-6">
        <div className="container mx-auto px-4 text-center text-white/60 text-sm">
          <p>© 2023 LottoWin. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-white mx-2">Terms</a>
            <a href="#" className="hover:text-white mx-2">Privacy</a>
            <a href="#" className="hover:text-white mx-2">Support</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
