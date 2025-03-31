
import { useLottery } from '../context/LotteryContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const { jackpot, nextDrawDate } = useLottery();
  const navigate = useNavigate();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDrawDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-lottery-black" />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-lottery-green/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-lottery-gold/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-lottery-white mb-4 leading-tight">
                Dream Bigger with <span className="text-lottery-neonGreen">LottoWin</span>
              </h1>
              
              <p className="text-lg md:text-xl text-lottery-white mb-8 max-w-xl mx-auto lg:mx-0">
                Choose your numbers. Change your life. It only takes a moment to win a fortune.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="bg-lottery-black/50 border border-lottery-green p-4 rounded-xl inline-block">
                  <p className="text-sm text-lottery-white mb-1">Current Jackpot</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-lottery-gold">
                    {formatCurrency(jackpot)}
                  </h2>
                </div>
                
                <div className="bg-lottery-black/50 border border-lottery-green p-4 rounded-xl inline-block ml-4">
                  <p className="text-sm text-lottery-white mb-1">Next Draw</p>
                  <h2 className="text-lg md:text-xl font-medium text-lottery-white">
                    {formatDrawDate(nextDrawDate)}
                  </h2>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-lottery-green hover:bg-lottery-green/90 text-lottery-black font-semibold px-8 py-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate('/purchase')}
                >
                  Play Now
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-lottery-gold text-lottery-gold hover:bg-lottery-black font-medium px-8 py-6 rounded-xl"
                  onClick={() => navigate('/results')}
                >
                  View Results
                </Button>
              </div>
            </motion.div>
          </div>
          
          <div className="hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-lottery-black/50 border border-lottery-green rounded-2xl p-8 shadow-xl">
                <div className="absolute inset-0 bg-lottery-green/5 rounded-2xl transform rotate-3" />
                <div className="absolute inset-0 bg-lottery-gold/5 rounded-2xl transform -rotate-3" />
                
                <div className="relative bg-lottery-black rounded-xl p-6 shadow-sm border border-lottery-green/30">
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-bold text-lottery-white mb-1">Winning Numbers</h3>
                    <p className="text-lottery-white/70 text-sm">Last Draw</p>
                  </div>
                  
                  <div className="flex justify-center gap-3 mb-6">
                    {[7, 12, 23, 34, 42, 48].map((num, index) => (
                      <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                        className="w-12 h-12 rounded-full bg-lottery-green text-lottery-black flex items-center justify-center font-bold text-lg shadow-md"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-lottery-black rounded-lg p-3 border border-lottery-green/30">
                      <p className="text-lottery-white/70 text-xs mb-1">Winners</p>
                      <p className="font-bold text-lottery-neonGreen text-xl">3</p>
                    </div>
                    <div className="bg-lottery-black rounded-lg p-3 border border-lottery-green/30">
                      <p className="text-lottery-white/70 text-xs mb-1">Next Draw</p>
                      <p className="font-bold text-lottery-gold text-xl">3d 12h</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="absolute -bottom-10 -right-10 w-24 h-24 bg-lottery-gold rounded-full flex items-center justify-center text-lottery-black font-bold shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <div className="text-center">
                  <div className="text-xs">PLAY</div>
                  <div className="text-lg">NOW</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
