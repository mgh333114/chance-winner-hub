
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import TicketCard from '@/components/TicketCard';
import WinnerDisplay from '@/components/WinnerDisplay';
import { useLottery } from '@/context/LotteryContext';
import { Trophy, Users, Zap, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { winners } = useLottery();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };
    
    getSession();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      
      <main className="pt-16">
        <Hero />
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse h-8 w-8 rounded-full bg-lottery-blue"></div>
          </div>
        ) : user ? (
          // Content for authenticated users
          <>
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-lottery-light/50">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold text-lottery-dark mb-4"
                  >
                    How It Works
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lottery-gray max-w-2xl mx-auto"
                  >
                    Getting started with LottoWin is simple. Follow these easy steps and you could be our next big winner!
                  </motion.p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <Zap className="w-8 h-8 text-lottery-blue" />,
                      title: "Select Your Numbers",
                      description: "Choose 6 numbers from 1-49 or use our Quick Pick for random selection.",
                      delay: 0
                    },
                    {
                      icon: <Users className="w-8 h-8 text-lottery-blue" />,
                      title: "Purchase Your Ticket",
                      description: "Each ticket costs $5. Buy as many as you want to increase your chances.",
                      delay: 0.2
                    },
                    {
                      icon: <Trophy className="w-8 h-8 text-lottery-blue" />,
                      title: "Check Your Results",
                      description: "Draws happen every Friday at 8 PM. Match all numbers to win the jackpot!",
                      delay: 0.4
                    }
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: step.delay }}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lottery-blue/10 mb-4">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-bold text-lottery-dark mb-2">{step.title}</h3>
                      <p className="text-lottery-gray">{step.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
            
            <section className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold text-lottery-dark mb-4"
                  >
                    Recent Winners
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lottery-gray max-w-2xl mx-auto"
                  >
                    Meet the lucky players who recently hit it big with LottoWin. You could be next!
                  </motion.p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {winners.slice(0, 3).map((winner, index) => (
                    <WinnerDisplay key={winner.id} {...winner} index={index} />
                  ))}
                </div>
              </div>
            </section>
            
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-lottery-blue/5 to-lottery-light">
              <div className="container mx-auto max-w-6xl text-center">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-lottery-dark mb-4"
                >
                  Ready to Change Your Life?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lottery-gray max-w-2xl mx-auto mb-8"
                >
                  Don't miss your chance to win big. Get your tickets now for the next draw!
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Link 
                    to="/purchase" 
                    className="inline-block bg-lottery-blue text-white font-semibold px-8 py-4 rounded-xl hover:bg-lottery-blue/90 transition-colors"
                  >
                    Play Now
                  </Link>
                </motion.div>
              </div>
            </section>
          </>
        ) : (
          // Content for non-authenticated users
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-lottery-blue/5 to-lottery-light">
            <div className="container mx-auto max-w-6xl text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-lottery-dark mb-4"
              >
                Join LottoWin Today
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lottery-gray max-w-2xl mx-auto mb-8"
              >
                Sign up or log in to start your journey to winning big with LottoWin!
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to="/auth?tab=signin">
                  <Button size="lg" className="bg-lottery-blue hover:bg-lottery-blue/90">
                    <LogIn className="mr-2 h-5 w-5" />
                    Log In
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="lg" variant="outline" className="border-lottery-blue text-lottery-blue hover:bg-lottery-blue/10">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      
      <footer className="bg-lottery-dark text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <span className="text-white">Lotto</span>
                <span className="bg-white text-lottery-blue px-2 rounded-md ml-1">Win</span>
              </h3>
              <p className="text-gray-400 text-sm">
                The most trusted lottery platform for your chance to win big.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-3">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                {user ? (
                  <>
                    <li><Link to="/purchase" className="hover:text-white transition-colors">Buy Tickets</Link></li>
                    <li><Link to="/results" className="hover:text-white transition-colors">Results</Link></li>
                    <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/auth?tab=signin" className="hover:text-white transition-colors">Log In</Link></li>
                    <li><Link to="/auth?tab=signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-3">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How to Play</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-3">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@lottowin.example</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Lottery Lane, Lucky City</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LottoWin. All rights reserved. This is a demonstration site and not a real lottery.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
