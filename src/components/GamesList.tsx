
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Dice5, Scan, CircleDot } from 'lucide-react';

const GamesList = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'aviator',
      title: 'Aviator',
      description: 'Catch the plane before it flies away! The longer you wait, the higher your winnings, but don\'t wait too long!',
      icon: <Plane className="w-10 h-10 text-blue-500" />,
      color: 'from-blue-500 to-purple-500',
      path: '/games/aviator',
    },
    {
      id: 'wheel',
      title: 'Number Wheel',
      description: 'Spin the wheel and land on lucky numbers with exciting multipliers! Test your luck today.',
      icon: <CircleDot className="w-10 h-10 text-purple-500" />,
      color: 'from-purple-500 to-pink-500',
      path: '/games/wheel',
    },
    {
      id: 'scratch',
      title: 'Scratch Cards',
      description: 'Reveal symbols and win instantly! Match the lucky patterns to win exciting prizes.',
      icon: <Scan className="w-10 h-10 text-green-500" />,
      color: 'from-green-500 to-emerald-500',
      path: '/games/scratch',
    },
    {
      id: 'dice',
      title: 'Dice Predictor',
      description: 'Predict the outcome of the dice roll and win big! Higher risk means higher rewards.',
      icon: <Dice5 className="w-10 h-10 text-red-500" />,
      color: 'from-red-500 to-orange-500',
      path: '/games/dice',
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-gradient-purple">Our Exciting Games</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className={`gradient-card overflow-hidden border-0 shadow-lg h-full`}>
              <div className={`absolute inset-0 opacity-80 bg-gradient-to-br ${game.color} -z-10`} />
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    {game.icon}
                  </div>
                </div>
                <CardTitle className="text-white text-center">{game.title}</CardTitle>
                <CardDescription className="text-white/90 text-center">
                  {game.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center text-white">
                  Try your luck now!
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  onClick={() => navigate(game.path)} 
                  className="bg-white text-black hover:bg-white/90"
                >
                  Play {game.title}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GamesList;
