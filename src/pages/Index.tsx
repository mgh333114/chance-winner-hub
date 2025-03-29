
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import WinnerDisplay from '@/components/WinnerDisplay';
import { useLottery } from '@/context/LotteryContext';
import { Trophy, Users, Zap, LogIn, UserPlus, Ticket, Plane, CreditCard, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayment } from '@/context/PaymentContext';

const Index = () => {
  const { winners } = useLottery();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = usePayment();
  
  // Game information to showcase
  const games = [
    {
      id: 'lottery',
      name: 'Lottery Tickets',
      description: 'Our classic lottery game. Pick your numbers and win big!',
      icon: <Ticket className="h-10 w-10 text-green-500" />,
      minBet: 5,
      maxWin: 1000000,
      path: '/purchase'
    },
    {
      id: 'aviator',
      name: 'Aviator',
      description: 'Watch the plane fly and cash out before it crashes! Higher risk, higher rewards.',
      icon: <Plane className="h-10 w-10 text-red-500" />,
      minBet: 1,
      maxWin: 100,
      path: '/games/aviator'
    },
    {
      id: 'scratch',
      name: 'Lucky Scratch',
      description: 'Scratch and reveal instant prizes! Find matching symbols to win.',
      icon: <CreditCard className="h-10 w-10 text-yellow-500" />,
      minBet: 2,
      maxWin: 50,
      path: '/games/scratch'
    },
    {
      id: 'dice',
      name: 'Dice Predictor',
      description: 'Predict the dice roll outcome. Choose high or low for different odds.',
      icon: <Dices className="h-10 w-10 text-blue-500" />,
      minBet: 1, 
      maxWin: 20,
      path: '/games/dice'
    }
  ];
  
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 overflow-x-hidden">
      <div className="sparkles-container">
        <div className="sparkles sparkles-1"></div>
        <div className="sparkles sparkles-2"></div>
        <div className="sparkles sparkles-3"></div>
      </div>
      
      <Navbar />
      
      <main className="pt-16 relative z-10">
        <Hero />
        
        {/* Games Showcase Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-100/70 via-purple-100/60 to-blue-100/70 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gradient-rainbow mb-4"
              >
                Our Games
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lottery-gray max-w-2xl mx-auto"
              >
                Explore our variety of exciting games and try your luck today!
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow duration-300 flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="bg-gray-100 p-3 rounded-full">{game.icon}</div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-500">Min bet</p>
                          <p className="font-semibold">{formatCurrency(game.minBet)}</p>
                        </div>
                      </div>
                      <CardTitle className="mt-4">{game.name}</CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-500">Max potential win:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(game.maxWin)}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {user ? (
                        <Button 
                          className="w-full" 
                          asChild
                        >
                          <Link to={game.path}>Play Now</Link>
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          asChild
                        >
                          <Link to="/auth">Login to Play</Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse h-8 w-8 rounded-full bg-gradient-to-r from-lottery-blue to-purple-500"></div>
          </div>
        ) : user ? (
          // Content for authenticated users
          <>
            <section className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold text-gradient-rainbow mb-4"
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
                      icon: <Zap className="w-8 h-8 text-gradient-blue" />,
                      title: "Select Your Numbers",
                      description: "Choose 6 numbers from 1-49 or use our Quick Pick for random selection.",
                      delay: 0,
                      gradient: "from-blue-400 to-purple-500"
                    },
                    {
                      icon: <Users className="w-8 h-8 text-gradient-purple" />,
                      title: "Purchase Your Ticket",
                      description: "Each ticket costs $5. Buy as many as you want to increase your chances.",
                      delay: 0.2,
                      gradient: "from-purple-400 to-pink-500"
                    },
                    {
                      icon: <Trophy className="w-8 h-8 text-gradient-gold" />,
                      title: "Check Your Results",
                      description: "Draws happen every Friday at 8 PM. Match all numbers to win the jackpot!",
                      delay: 0.4,
                      gradient: "from-amber-400 to-orange-500"
                    }
                  ].map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: step.delay }}
                      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 gradient-card bg-gradient-to-br ${step.gradient}`}
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm mb-4 shadow-inner">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-white/90">{step.description}</p>
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
                    className="text-3xl font-bold text-gradient-rainbow mb-4"
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
            
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-200/70 via-pink-200/70 to-blue-200/70 backdrop-blur-sm">
              <div className="container mx-auto max-w-6xl text-center">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-gradient-rainbow mb-4"
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
                    className="inline-block bg-gradient-to-r from-lottery-blue via-purple-500 to-pink-500 text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Play Now
                  </Link>
                </motion.div>
              </div>
            </section>
          </>
        ) : (
          // Content for non-authenticated users
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-200/70 via-pink-200/70 to-blue-200/70 backdrop-blur-sm">
            <div className="container mx-auto max-w-6xl text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-gradient-rainbow mb-4"
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
                  <Button size="lg" className="bg-gradient-to-r from-lottery-blue to-purple-600 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <LogIn className="mr-2 h-5 w-5" />
                    Log In
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="lg" variant="outline" className="border-lottery-blue text-lottery-blue hover:bg-lottery-blue/10 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      
      <footer className="bg-gradient-to-br from-lottery-dark to-purple-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <span className="text-gradient-rainbow">Lotto</span>
                <span className="bg-white text-lottery-blue px-2 rounded-md ml-1">Win</span>
              </h3>
              <p className="text-gray-300 text-sm">
                The most trusted lottery platform for your chance to win big.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-3 text-gradient-blue">Links</h4>
              <ul className="space-y-2 text-gray-300">
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
              <h4 className="font-medium text-lg mb-3 text-gradient-purple">Resources</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">How to Play</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg mb-3 text-gradient-gold">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                <li>info@lottowin.example</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Lottery Lane, Lucky City</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} LottoWin. All rights reserved. This is a demonstration site and not a real lottery.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
