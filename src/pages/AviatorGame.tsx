
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { usePayment } from '@/context/PaymentContext';
import { Plane, TrendingUp, X, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const AviatorGame = () => {
  const { addFunds, processWithdrawal, userBalance, formatCurrency, refreshBalance } = usePayment();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(5);
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [hashedOut, setHashedOut] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [winnings, setWinnings] = useState<number>(0);
  const planeControls = useAnimation();
  const intervalRef = useRef<number | null>(null);
  const crashPointRef = useRef<number>(generateCrashPoint());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate random crash point between 1.00 and 10.00
  function generateCrashPoint() {
    // This is a simplified version. In production, you would want to use 
    // a provably fair algorithm that can't be manipulated
    return 1.00 + Math.random() * 9.00;
  }

  const startGame = () => {
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

    // Process the bet amount as a withdrawal from user balance
    processWithdrawal(betAmount, 'game', 'aviator-game-bet')
      .then(() => {
        // Reset game state
        setIsFlying(true);
        setMultiplier(1.00);
        setHashedOut(false);
        setGameResult(null);
        crashPointRef.current = generateCrashPoint();
        
        // Start plane animation
        planeControls.start({
          y: -200,
          transition: { duration: 10, ease: "linear" }
        });
        
        // Start multiplier incrementing
        intervalRef.current = window.setInterval(() => {
          setMultiplier(prev => {
            const newMultiplier = parseFloat((prev + 0.01).toFixed(2));
            
            // Check if plane should crash
            if (newMultiplier >= crashPointRef.current) {
              clearInterval(intervalRef.current!);
              crashPlane();
            }
            return newMultiplier;
          });
        }, 100);
      })
      .catch(error => {
        toast({
          title: "Error Processing Bet",
          description: error.message || "There was an error processing your bet",
          variant: "destructive",
        });
      });
  };

  const cashOut = () => {
    if (!isFlying || hashedOut) return;
    
    clearInterval(intervalRef.current!);
    setHashedOut(true);
    
    // Calculate winnings
    const amount = parseFloat((betAmount * multiplier).toFixed(2));
    setWinnings(amount);
    setGameResult('win');
    
    // Add winnings to user balance
    addFunds(amount)
      .then(() => {
        refreshBalance();
        toast({
          title: "Cash Out Successful!",
          description: `You won ${formatCurrency(amount)}!`,
        });
        
        // Play winning sound
        if (audioRef.current) {
          audioRef.current.play();
        }
      });
  };

  const crashPlane = () => {
    planeControls.start({
      rotate: 90,
      transition: { duration: 0.5 }
    });
    
    setIsFlying(false);
    
    if (!hashedOut) {
      setGameResult('lose');
      toast({
        title: "Plane Crashed!",
        description: "Better luck next time!",
        variant: "destructive",
      });
    }
  };

  const resetGame = () => {
    setIsFlying(false);
    setMultiplier(1.00);
    setHashedOut(false);
    setGameResult(null);
    setWinnings(0);
    
    planeControls.start({
      y: 0,
      rotate: 0,
      transition: { duration: 0.5 }
    });
  };

  useEffect(() => {
    // Load audio
    audioRef.current = new Audio('/success.mp3');
    
    return () => {
      // Clean up on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
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
              <Plane className="mr-2 h-8 w-8 text-red-500" />
              Aviator Game
            </h1>
            <p className="text-lottery-gray max-w-2xl mx-auto">
              Watch the plane fly and cash out before it crashes! The longer you wait, the higher your potential winnings.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="h-full overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px] relative">
                  {/* Sky background */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-300 to-transparent"></div>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-white rounded-full opacity-60"
                        style={{
                          width: Math.random() * 10 + 5 + 'px',
                          height: Math.random() * 10 + 5 + 'px',
                          top: Math.random() * 100 + '%',
                          left: Math.random() * 100 + '%',
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Plane */}
                  <motion.div
                    className="relative z-10"
                    animate={planeControls}
                    initial={{ y: 0, rotate: 0 }}
                  >
                    <Plane className={`h-16 w-16 ${gameResult === 'lose' ? 'text-red-500' : 'text-blue-600'}`} />
                  </motion.div>
                  
                  {/* Multiplier */}
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Multiplier</div>
                    <div className="text-2xl font-bold flex items-center">
                      <TrendingUp className="mr-1 h-5 w-5 text-green-500" />
                      {multiplier.toFixed(2)}x
                    </div>
                  </div>
                  
                  {/* Game result overlay */}
                  {gameResult && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                      <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                        {gameResult === 'win' ? (
                          <>
                            <div className="text-green-500 text-4xl font-bold mb-2">WIN!</div>
                            <p className="text-xl">You cashed out at {multiplier.toFixed(2)}x</p>
                            <p className="text-2xl font-semibold my-3">{formatCurrency(winnings)}</p>
                          </>
                        ) : (
                          <>
                            <div className="text-red-500 text-4xl font-bold mb-2">CRASH!</div>
                            <p className="text-xl">Plane crashed at {crashPointRef.current.toFixed(2)}x</p>
                            <p className="text-gray-600 my-3">You lost {formatCurrency(betAmount)}</p>
                          </>
                        )}
                        <Button 
                          className="mt-2" 
                          onClick={resetGame}
                        >
                          <Undo className="mr-2 h-4 w-4" />
                          Play Again
                        </Button>
                      </div>
                    </div>
                  )}
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
                        disabled={isFlying}
                        className="flex-1"
                      />
                    </div>
                    
                    <div className="flex space-x-2 mb-6">
                      {[5, 10, 25, 50].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(amount)}
                          disabled={isFlying || amount > userBalance}
                          className="flex-1"
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={startGame}
                        disabled={isFlying || betAmount <= 0 || betAmount > userBalance}
                      >
                        {isFlying ? 'In Flight' : 'Start Game'}
                      </Button>
                      
                      <Button
                        className="flex-1"
                        variant={hashedOut ? "outline" : "default"}
                        onClick={cashOut}
                        disabled={!isFlying || hashedOut}
                      >
                        Cash Out
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Game Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Your Balance:</div>
                      <div className="text-right font-medium">{formatCurrency(userBalance)}</div>
                      
                      <div className="text-gray-600">Potential Win:</div>
                      <div className="text-right font-medium">
                        {isFlying
                          ? formatCurrency(betAmount * multiplier)
                          : formatCurrency(0)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">How To Play</h4>
                    <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                      <li>Set your bet amount</li>
                      <li>Click Start Game to see the plane take off</li>
                      <li>The multiplier increases as the plane flies higher</li>
                      <li>Cash out before the plane crashes to win!</li>
                      <li>If the plane crashes before you cash out, you lose your bet</li>
                    </ol>
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

export default AviatorGame;
