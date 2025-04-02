import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plane, Dices, CreditCard, Infinity } from 'lucide-react';

const Games = () => {
  const navigate = useNavigate();
  
  const games = [
    {
      id: 'aviator',
      title: 'Aviator',
      description: 'Watch the multiplier rise and cash out before the plane flies away!',
      icon: <Plane className="w-12 h-12 text-lottery-neonGreen" />,
      color: 'from-green-900/20 to-green-950/40',
      path: '/games/aviator'
    },
    {
      id: 'dice',
      title: 'Dice Roll',
      description: 'Test your luck with a roll of the dice. Choose your bet and multiplier.',
      icon: <Dices className="w-12 h-12 text-lottery-red" />,
      color: 'from-red-900/20 to-red-950/40',
      path: '/games/dice'
    },
    {
      id: 'scratch',
      title: 'Scratch Cards',
      description: 'Scratch and reveal instant prizes. Match symbols to win big!',
      icon: <CreditCard className="w-12 h-12 text-lottery-gold" />,
      color: 'from-yellow-900/20 to-yellow-950/40',
      path: '/games/scratch'
    },
    {
      id: 'wheel',
      title: 'Number Wheel',
      description: 'Spin the wheel and land on your lucky number to win multipliers.',
      icon: <Infinity className="w-12 h-12 text-lottery-blue" />,
      color: 'from-blue-900/20 to-blue-950/40',
      path: '/games/wheel'
    }
  ];
  
  return (
    <div className="min-h-screen bg-lottery-black">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-lottery-gold mb-4">
              Instant Win Games
            </h1>
            <p className="text-lottery-white/80 max-w-2xl mx-auto">
              Try your luck with our selection of exciting games. Win instant prizes with every play!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden bg-lottery-black backdrop-blur-sm border border-lottery-green/30 hover:border-lottery-green transition-colors h-full`}>
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${game.color} p-8 h-full flex flex-col`}>
                      <div className="mb-4">{game.icon}</div>
                      <h2 className="text-2xl font-bold text-lottery-white mb-2">{game.title}</h2>
                      <p className="text-lottery-white/70 mb-6 flex-grow">{game.description}</p>
                      <Button 
                        className="bg-lottery-black/60 hover:bg-lottery-black text-lottery-white border border-lottery-green/30 w-full sm:w-auto justify-between group"
                        onClick={() => navigate(game.path)}
                      >
                        <span>Play Now</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-lottery-black/60 rounded-2xl p-8 border border-lottery-gold/30 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-lottery-gold mb-4 text-center">
                How To Play
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-lottery-black/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-lottery-green/30">
                    <span className="text-lottery-neonGreen font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-bold text-lottery-white mb-2">Choose a Game</h3>
                  <p className="text-lottery-white/70">Select from our variety of exciting instant games.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-lottery-black/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-lottery-green/30">
                    <span className="text-lottery-neonGreen font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-bold text-lottery-white mb-2">Place Your Bet</h3>
                  <p className="text-lottery-white/70">Decide how much you want to wager on the game.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-lottery-black/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-lottery-green/30">
                    <span className="text-lottery-neonGreen font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-bold text-lottery-white mb-2">Win Instantly</h3>
                  <p className="text-lottery-white/70">Get your results right away and collect your winnings!</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Games;
