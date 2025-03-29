
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { usePayment } from '@/context/PaymentContext';
import { 
  Dices, 
  Ticket, 
  Plane, 
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Games = () => {
  const navigate = useNavigate();
  const { formatCurrency } = usePayment();
  
  const games = [
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
    },
    {
      id: 'lottery',
      name: 'Lottery Tickets',
      description: 'Our classic lottery game. Pick your numbers and win big!',
      icon: <Ticket className="h-10 w-10 text-green-500" />,
      minBet: 5,
      maxWin: 1000000,
      path: '/purchase'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-lottery-dark mb-4">
              Games &amp; Entertainment
            </h1>
            <p className="text-lottery-gray max-w-2xl mx-auto">
              Try your luck with our variety of exciting games! From classic lottery to instant games, 
              we have something for everyone.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(game.path)}
                    >
                      Play Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Games;
