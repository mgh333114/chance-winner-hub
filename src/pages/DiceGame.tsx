
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { usePayment } from '@/context/PaymentContext';
import { Dices, ArrowUp, ArrowDown, RotateCcw, TrendingUp, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

// Dice faces components
const DiceFace = ({ value }: { value: number }) => {
  const renderDots = () => {
    switch (value) {
      case 1:
        return (
          <div className="grid place-items-center h-full w-full">
            <div className="w-3 h-3 bg-black rounded-full"></div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 gap-1 h-full w-full p-2">
            <div className="w-3 h-3 bg-black rounded-full justify-self-start"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end self-end"></div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-3 gap-1 h-full w-full p-2">
            <div className="w-3 h-3 bg-black rounded-full justify-self-start"></div>
            <div className="w-3 h-3 bg-black rounded-full place-self-center"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end self-end"></div>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-1 h-full w-full p-2">
            <div className="w-3 h-3 bg-black rounded-full justify-self-start"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-start self-end"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end self-end"></div>
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-3 gap-1 h-full w-full p-2">
            <div className="w-3 h-3 bg-black rounded-full justify-self-start"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end"></div>
            <div className="w-3 h-3 bg-black rounded-full place-self-center"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-start self-end"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end self-end"></div>
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 gap-1 h-full w-full p-2">
            <div className="w-3 h-3 bg-black rounded-full justify-self-start"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-start self-center"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end self-center"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-start self-end"></div>
            <div className="w-3 h-3 bg-black rounded-full justify-self-end self-end"></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-16 h-16 bg-white rounded-xl border-2 border-gray-300 shadow-md">
      {renderDots()}
    </div>
  );
};

const DiceGame = () => {
  const { addFunds, processWithdrawal, userBalance, formatCurrency, refreshBalance } = usePayment();
  const { toast } = useToast();
  const diceControls = useAnimation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [betAmount, setBetAmount] = useState<number>(5);
  const [targetValue, setTargetValue] = useState<number>(4);
  const [prediction, setPrediction] = useState<'higher' | 'lower'>('higher');
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [winnings, setWinnings] = useState<number>(0);
  const [winRate, setWinRate] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(2);
  
  // Calculate win probability based on target and prediction
  useEffect(() => {
    let probability = 0;
    
    if (prediction === 'higher') {
      // Chance of rolling higher than target
      probability = (6 - targetValue) / 6;
    } else {
      // Chance of rolling lower than target
      probability = (targetValue - 1) / 6;
    }
    
    setWinRate(parseFloat((probability * 100).toFixed(1)));
    
    // Calculate fair multiplier (plus house edge)
    const fairMultiplier = 1 / probability;
    const houseEdge = 0.05; // 5% house edge
    const adjustedMultiplier = fairMultiplier * (1 - houseEdge);
    setMultiplier(parseFloat(adjustedMultiplier.toFixed(2)));
  }, [targetValue, prediction]);

  const handleTargetChange = (value: number[]) => {
    setTargetValue(value[0]);
  };

  const togglePrediction = () => {
    setPrediction(prev => prev === 'higher' ? 'lower' : 'higher');
  };

  const rollDice = async () => {
    if (isRolling) return;
    
    if (betAmount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a positive bet amount",
        variant: "destructive",
      });
      return;
    }

    if (betAmount > userBalance) {
      toast({
        title: "Insufficient Funds",
        description: "Your balance is too low for this bet",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Process the bet amount as a withdrawal from user balance
      await processWithdrawal(betAmount, 'game', 'dice-game-bet');
      
      setIsRolling(true);
      setGameResult(null);
      
      // Random dice roll animation
      const animationDuration = 1.5; // seconds
      const frames = 20;
      const frameDuration = animationDuration / frames;
      
      for (let i = 0; i < frames; i++) {
        await new Promise(resolve => setTimeout(resolve, frameDuration * 1000));
        setDiceValue(Math.floor(Math.random() * 6) + 1);
        
        // Shake animation
        diceControls.start({
          x: Math.random() * 10 - 5,
          y: Math.random() * 10 - 5,
          rotate: Math.random() * 20 - 10,
          transition: { duration: frameDuration / 2 }
        });
      }
      
      // Final dice value
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(finalValue);
      
      // Reset position
      diceControls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { duration: 0.3 }
      });
      
      // Check if won
      let isWin = false;
      if (prediction === 'higher' && finalValue > targetValue) {
        isWin = true;
      } else if (prediction === 'lower' && finalValue < targetValue) {
        isWin = true;
      }
      
      setGameResult(isWin ? 'win' : 'lose');
      
      // Calculate winnings
      const winAmount = parseFloat((betAmount * multiplier).toFixed(2));
      setWinnings(winAmount);
      
      // If win, add funds
      if (isWin) {
        await addFunds(winAmount);
        await refreshBalance();
        
        // Play winning sound
        if (audioRef.current) {
          audioRef.current.play();
        }
        
        toast({
          title: "Congratulations!",
          description: `You correctly predicted the dice roll and won ${formatCurrency(winAmount)}!`,
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: `The dice rolled ${finalValue}, which is ${prediction === 'higher' ? 'not higher' : 'not lower'} than ${targetValue}.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Processing Bet",
        description: error.message || "There was an error processing your bet",
        variant: "destructive",
      });
    } finally {
      setIsRolling(false);
    }
  };

  useEffect(() => {
    // Load audio
    audioRef.current = new Audio('/success.mp3');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-lottery-dark mb-4 flex items-center justify-center">
              <Dices className="mr-2 h-8 w-8 text-blue-500" />
              Dice Predictor
            </h1>
            <p className="text-lottery-gray max-w-2xl mx-auto">
              Predict whether the dice will roll higher or lower than your target number!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="h-full overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <div className="mb-10">
                      <p className="text-center mb-2 text-gray-600">Target Number</p>
                      <div className="flex items-center justify-center space-x-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-gray-300 flex items-center justify-center text-2xl font-bold">
                          {targetValue}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className={`flex items-center font-bold px-6 ${
                            prediction === 'higher' 
                              ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                          }`}
                          onClick={togglePrediction}
                        >
                          {prediction === 'higher' ? (
                            <>
                              <ArrowUp className="mr-2 h-5 w-5" />
                              Higher
                            </>
                          ) : (
                            <>
                              <ArrowDown className="mr-2 h-5 w-5" />
                              Lower
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="mt-8 max-w-lg mx-auto">
                        <Slider
                          defaultValue={[4]}
                          value={[targetValue]}
                          min={1}
                          max={6}
                          step={1}
                          onValueChange={handleTargetChange}
                        />
                        <div className="flex justify-between mt-2">
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <div 
                              key={num} 
                              className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full ${
                                num === targetValue ? 'bg-blue-500 text-white' : 'bg-gray-100'
                              }`}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={diceValue}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={diceControls}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="p-8"
                        >
                          <DiceFace value={diceValue} />
                          
                          {gameResult && (
                            <div className={`mt-4 text-center font-bold text-lg ${
                              gameResult === 'win' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {gameResult === 'win' ? 'You Win!' : 'You Lose!'}
                              {gameResult === 'win' && (
                                <div className="text-xl">{formatCurrency(winnings)}</div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                      
                      <Button 
                        className="mt-6 w-full"
                        onClick={rollDice}
                        disabled={isRolling || betAmount <= 0 || betAmount > userBalance}
                      >
                        {isRolling ? (
                          <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Dices className="mr-2 h-4 w-4" />
                        )}
                        {isRolling ? 'Rolling...' : 'Roll Dice'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Place Your Bet</h3>
                    <div className="flex items-center mb-3">
                      <label className="block text-sm text-gray-600 mr-2">Bet Amount:</label>
                      <Input
                        type="number"
                        min="1"
                        max={userBalance}
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        disabled={isRolling}
                        className="flex-1"
                      />
                    </div>
                    
                    <div className="flex space-x-2 mb-6">
                      {[5, 10, 20, 50].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(amount)}
                          disabled={isRolling || amount > userBalance}
                          className="flex-1"
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-6 bg-gray-50 p-3 rounded-lg">
                      <div className="text-gray-600">Win Chance:</div>
                      <div className="text-right font-medium">{winRate}%</div>
                      
                      <div className="text-gray-600">Multiplier:</div>
                      <div className="text-right font-medium flex items-center justify-end">
                        <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                        {multiplier}x
                      </div>
                      
                      <div className="text-gray-600">Potential Win:</div>
                      <div className="text-right font-medium text-green-600">
                        {formatCurrency(betAmount * multiplier)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-600">Your Balance:</h4>
                      <span className="font-semibold">{formatCurrency(userBalance)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">How To Play</h4>
                    <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                      <li>Select a target number (1-6)</li>
                      <li>Predict if the dice will roll higher or lower than your target</li>
                      <li>Enter your bet amount</li>
                      <li>Click "Roll Dice" to play</li>
                      <li>Win if your prediction is correct!</li>
                    </ol>
                    <div className="mt-4 text-xs text-gray-500">
                      <p><strong>Note:</strong> If the dice matches your target number exactly, it's a loss.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiceGame;
