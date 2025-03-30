import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { usePayment } from '@/context/PaymentContext';
import { Plane, TrendingUp, X, Undo, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AviatorHistory, { BetHistoryItem } from '@/components/AviatorHistory';
import { v4 as uuidv4 } from 'uuid';

const AviatorGame = () => {
  const { addFunds, processWithdrawal, userBalance, formatCurrency, refreshBalance } = usePayment();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(5);
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [hashedOut, setHashedOut] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [winnings, setWinnings] = useState<number>(0);
  const [gameHistory, setGameHistory] = useState<BetHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  const planeControls = useAnimation();
  const intervalRef = useRef<number | null>(null);
  const crashPointRef = useRef<number>(generateCrashPoint());
  
  // Audio references
  const takeoffSoundRef = useRef<HTMLAudioElement | null>(null);
  const cashoutSoundRef = useRef<HTMLAudioElement | null>(null);
  const crashSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Trail animation
  const [trailPositions, setTrailPositions] = useState<{x: number, y: number}[]>([]);
  const trailRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Generate random crash point that can be as low as 1.01
  function generateCrashPoint() {
    // Distribution favoring lower numbers but with occasional high multipliers
    // 10% chance of crashing between 1.01 and 1.2
    // 40% chance of crashing between 1.2 and 2.0
    // 30% chance of crashing between 2.0 and 5.0
    // 20% chance of crashing between 5.0 and 15.0
    
    const rand = Math.random();
    
    if (rand < 0.10) {
      // Very early crash (1.01 to 1.2)
      return 1.01 + (Math.random() * 0.19);
    } else if (rand < 0.50) {
      // Early crash (1.2 to 2.0)
      return 1.2 + (Math.random() * 0.8);
    } else if (rand < 0.80) {
      // Medium crash (2.0 to 5.0)
      return 2.0 + (Math.random() * 3.0);
    } else {
      // Late crash (5.0 to 15.0)
      return 5.0 + (Math.random() * 10.0);
    }
  }

  useEffect(() => {
    // Initialize audio elements
    takeoffSoundRef.current = new Audio('/takeoff.mp3');
    cashoutSoundRef.current = new Audio('/success.mp3');
    crashSoundRef.current = new Audio('/crash.mp3');
    
    // Load from localStorage
    const savedHistory = localStorage.getItem('aviator_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setGameHistory(parsedHistory);
      } catch (e) {
        console.error('Failed to parse history from localStorage', e);
      }
    }
    
    return () => {
      // Clean up on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Save history to localStorage when it changes
  useEffect(() => {
    if (gameHistory.length) {
      localStorage.setItem('aviator_history', JSON.stringify(gameHistory));
    }
  }, [gameHistory]);

  const updateTrailPosition = (planeElement: HTMLDivElement | null) => {
    if (!planeElement || !gameAreaRef.current) return;
    
    const rect = planeElement.getBoundingClientRect();
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    
    const position = {
      x: rect.left + rect.width / 2 - gameAreaRect.left,
      y: rect.top + rect.height / 2 - gameAreaRect.top
    };
    
    setTrailPositions(prev => {
      const newTrail = [...prev, position];
      if (newTrail.length > 20) {
        return newTrail.slice(newTrail.length - 20);
      }
      return newTrail;
    });
  };

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
        setTrailPositions([]);
        crashPointRef.current = generateCrashPoint();
        
        console.log(`Game started with crash point: ${crashPointRef.current.toFixed(2)}`);
        
        // Play takeoff sound
        if (soundEnabled && takeoffSoundRef.current) {
          takeoffSoundRef.current.currentTime = 0;
          takeoffSoundRef.current.play();
        }
        
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
        if (soundEnabled && cashoutSoundRef.current) {
          cashoutSoundRef.current.currentTime = 0;
          cashoutSoundRef.current.play();
        }
      });
  };

  const crashPlane = () => {
    planeControls.start({
      rotate: 90,
      transition: { duration: 0.5 }
    });
    
    setIsFlying(false);
    
    // Play crash sound
    if (soundEnabled && crashSoundRef.current) {
      crashSoundRef.current.currentTime = 0;
      crashSoundRef.current.play();
    }
    
    // Add to history
    const historyItem: BetHistoryItem = {
      id: uuidv4(),
      multiplier: crashPointRef.current,
      timestamp: new Date()
    };
    
    setGameHistory(prev => [historyItem, ...prev]);
    
    if (!hashedOut) {
      setGameResult('lose');
      toast({
        title: "Plane Crashed!",
        description: `Crashed at ${crashPointRef.current.toFixed(2)}x`,
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
    setTrailPositions([]);
    
    planeControls.start({
      y: 0,
      rotate: 0,
      transition: { duration: 0.5 }
    });
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
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
              <Card className="h-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px] relative" ref={gameAreaRef}>
                  {/* Sound toggle button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 z-30"
                    onClick={toggleSound}
                  >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </Button>
                  
                  {/* Sky background with clouds and stars */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-300 to-transparent"></div>
                    <div className="stars">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={`star-${i}`}
                          className="absolute bg-white rounded-full opacity-60"
                          style={{
                            width: Math.random() * 3 + 1 + 'px',
                            height: Math.random() * 3 + 1 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animation: `twinkle ${Math.random() * 5 + 3}s infinite`
                          }}
                        ></div>
                      ))}
                    </div>
                    
                    {/* Clouds */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={`cloud-${i}`}
                        className="absolute bg-white rounded-full opacity-70"
                        style={{
                          width: Math.random() * 100 + 50 + 'px',
                          height: Math.random() * 40 + 30 + 'px',
                          top: Math.random() * 60 + '%',
                          left: Math.random() * 80 + 10 + '%',
                          borderRadius: '50%'
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Trail effect */}
                  <div className="relative z-10" ref={trailRef}>
                    {trailPositions.map((pos, index) => (
                      <div
                        key={`trail-${index}`}
                        className="absolute rounded-full"
                        style={{
                          left: pos.x,
                          top: pos.y,
                          width: 6 - index * 0.2,
                          height: 6 - index * 0.2,
                          opacity: 1 - index * 0.04,
                          backgroundColor: index % 2 === 0 ? '#FF6B6B' : '#FFC107',
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Plane */}
                  <motion.div
                    className="relative z-20"
                    animate={planeControls}
                    initial={{ y: 0, rotate: 0 }}
                    onUpdate={(latest) => {
                      // Update trail position with plane position
                      if (trailRef.current && gameAreaRef.current && isFlying) {
                        updateTrailPosition(trailRef.current);
                      }
                    }}
                  >
                    <Plane 
                      className={`h-16 w-16 ${
                        gameResult === 'lose' 
                          ? 'text-red-500' 
                          : gameResult === 'win' 
                            ? 'text-green-500' 
                            : 'text-blue-600'
                      }`}
                    />
                  </motion.div>
                  
                  {/* Multiplier */}
                  <div className="absolute top-4 left-0 right-0 flex justify-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-600 mb-1 text-center">Multiplier</div>
                      <div className={`text-3xl font-bold flex items-center ${
                        multiplier < 1.5 ? 'text-red-500' :
                        multiplier < 3 ? 'text-yellow-600' :
                        multiplier < 5 ? 'text-green-600' : 'text-purple-600'
                      }`}>
                        <TrendingUp className="mr-1 h-5 w-5" />
                        {multiplier.toFixed(2)}x
                      </div>
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
            
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-blue-200">
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
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={startGame}
                        disabled={isFlying || betAmount <= 0 || betAmount > userBalance}
                      >
                        {isFlying ? 'In Flight' : 'Start Game'}
                      </Button>
                      
                      <Button
                        className={`flex-1 ${hashedOut ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
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
                </CardContent>
              </Card>
              
              {/* History component */}
              <AviatorHistory 
                history={gameHistory} 
                currentPage={historyPage}
                onPageChange={setHistoryPage}
              />
            </div>
          </div>
        </div>
      </main>
      
      <style>
        {`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}
      </style>
    </div>
  );
};

export default AviatorGame;
