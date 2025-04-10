
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { usePayment } from '@/context/PaymentContext';
import { Plane, TrendingUp, X, Undo, Volume2, VolumeX, Clock, Users, BarChart4, Repeat, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AviatorHistory, { BetHistoryItem } from '@/components/AviatorHistory';
import { Switch } from "@/components/ui/switch";
import { v4 as uuidv4 } from 'uuid';
import { Progress } from "@/components/ui/progress";

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
  const [isWaitingForNextRound, setIsWaitingForNextRound] = useState<boolean>(false);
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null);
  const [currentUsers, setCurrentUsers] = useState<number>(
    Math.floor(Math.random() * 15) + 5 // Random number between 5 and 20
  );
  const [totalBetAmount, setTotalBetAmount] = useState<number>(
    Math.floor(Math.random() * 500) + 100 // Random between 100 and 600
  );
  const [autoBet, setAutoBet] = useState<boolean>(false);
  const [autoCollectAt, setAutoCollectAt] = useState<number>(2.0);
  const [showExplainer, setShowExplainer] = useState<boolean>(true);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [activePlayers, setActivePlayers] = useState<{id: string, username: string, multiplier: number | null}[]>([]);
  
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
    
    // Start with a next round countdown
    startNextRoundCountdown();
    
    // Initialize simulated active players
    generateActivePlayers();

    // Close explainer after 10 seconds
    const explainerTimer = setTimeout(() => {
      setShowExplainer(false);
    }, 10000);
    
    return () => {
      // Clean up on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(explainerTimer);
    };
  }, []);
  
  // Save history to localStorage when it changes
  useEffect(() => {
    if (gameHistory.length) {
      localStorage.setItem('aviator_history', JSON.stringify(gameHistory));
    }
  }, [gameHistory]);

  // Generate simulated active players
  const generateActivePlayers = () => {
    const playerCount = Math.floor(Math.random() * 8) + 3; // 3-10 players
    const names = ['Alex', 'Jamie', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn'];
    
    const players = Array.from({ length: playerCount }, (_, i) => ({
      id: uuidv4(),
      username: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000),
      multiplier: null
    }));
    
    setActivePlayers(players);
  };

  // Simulate players cashing out at different multipliers
  useEffect(() => {
    if (isFlying && multiplier > 1.1) {
      const notCashedOutPlayers = activePlayers.filter(p => p.multiplier === null);
      
      // For each player who hasn't cashed out yet, there's a small chance they cash out at the current multiplier
      notCashedOutPlayers.forEach(player => {
        // The higher the multiplier, the more likely players will cash out
        const cashoutChance = 0.03 + (multiplier - 1) * 0.02;
        
        if (Math.random() < cashoutChance) {
          setActivePlayers(prev => 
            prev.map(p => 
              p.id === player.id ? { ...p, multiplier } : p
            )
          );
        }
      });
    }
  }, [multiplier, isFlying, activePlayers]);

  // Update progress bar based on multiplier
  useEffect(() => {
    if (isFlying) {
      // Map multiplier to a percentage (1.0-10.0 -> 0-100%)
      const maxMultiplierForFull = 10.0;
      const percentage = Math.min(((multiplier - 1.0) / (maxMultiplierForFull - 1.0)) * 100, 100);
      setProgressValue(percentage);
    } else {
      setProgressValue(0);
    }
  }, [multiplier, isFlying]);

  // Start countdown for next round
  const startNextRoundCountdown = () => {
    setIsWaitingForNextRound(true);
    setNextRoundCountdown(7);
    
    const countdownInterval = setInterval(() => {
      setNextRoundCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setIsWaitingForNextRound(false);
          
          // If auto-bet is enabled, start the game automatically
          if (autoBet) {
            setTimeout(() => startGame(), 500);
          }
          
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Update user count and total bet for the round
  const updateRoundStats = () => {
    // Simulate random user count between 5 and 25
    const newUserCount = Math.floor(Math.random() * 20) + 5;
    setCurrentUsers(newUserCount);
    
    // Simulate total bet amount based on user count
    const newTotalBet = newUserCount * (Math.floor(Math.random() * 50) + 10);
    setTotalBetAmount(newTotalBet);
    
    // Reset active players for next round
    generateActivePlayers();
  };

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
          y: -300,
          transition: { duration: 12, ease: "easeOut" }
        });
        
        // Start multiplier incrementing
        intervalRef.current = window.setInterval(() => {
          setMultiplier(prev => {
            const newMultiplier = parseFloat((prev + 0.01).toFixed(2));
            
            // Auto-collect if enabled and reached target
            if (autoBet && newMultiplier >= autoCollectAt && !hashedOut) {
              cashOut();
            }
            
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
          variant: "success",
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
      transition: { duration: 0.5, ease: "easeIn" }
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
    
    // Update stats for next round
    updateRoundStats();
    
    // Start countdown for next round
    startNextRoundCountdown();
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-purple-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center">
              <Plane className="mr-2 h-8 w-8 text-red-500" />
              Aviator Game
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Watch the plane fly and cash out before it crashes! The longer you wait, the higher your potential winnings.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="h-full overflow-hidden bg-gradient-to-b from-blue-950 to-indigo-950 border-blue-500/30 relative shadow-xl">
                {/* Explainer overlay for new users */}
                <AnimatePresence>
                  {showExplainer && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
                    >
                      <div className="bg-indigo-900/90 p-5 rounded-xl max-w-lg text-white border border-indigo-500/50 backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold flex items-center">
                            <Plane className="mr-2 h-5 w-5 text-red-400" />
                            How to Play Aviator
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setShowExplainer(false)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X size={18} />
                          </Button>
                        </div>
                        <ol className="list-decimal list-inside space-y-3 text-gray-200">
                          <li>Place your bet before the plane takes off</li>
                          <li>Watch as the multiplier increases while the plane flies</li>
                          <li>Cash out before the plane crashes to secure your winnings</li>
                          <li>If you wait too long and the plane crashes, you lose your bet</li>
                        </ol>
                        <div className="mt-5 flex justify-end">
                          <Button 
                            onClick={() => setShowExplainer(false)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Got it
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[500px] relative" ref={gameAreaRef}>
                  {/* Sound toggle button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 z-30 text-white/70 hover:text-white hover:bg-indigo-800/50"
                    onClick={toggleSound}
                  >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </Button>
                  
                  {/* Next round countdown */}
                  {isWaitingForNextRound && nextRoundCountdown !== null && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-2 left-2 bg-indigo-900/80 text-white px-3 py-1 rounded-full flex items-center z-20 border border-indigo-500/30"
                    >
                      <Clock className="mr-1 h-4 w-4 text-blue-300" />
                      <span>Next flight: <span className="font-bold text-blue-300">{nextRoundCountdown}s</span></span>
                    </motion.div>
                  )}
                  
                  {/* Current users and total bet */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-indigo-900/80 text-white px-3 py-1 rounded-full flex items-center space-x-3 z-20 border border-indigo-500/30">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4 text-blue-300" />
                      <span>{currentUsers}</span>
                    </div>
                    <div className="flex items-center">
                      <BarChart4 className="mr-1 h-4 w-4 text-blue-300" />
                      <span>{formatCurrency(totalBetAmount)}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar showing flight progress */}
                  <div className="absolute top-14 left-0 right-0 px-6 z-20">
                    <div className="bg-indigo-950/50 p-2 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
                      <div className="flex justify-between text-xs text-white/70 mb-1 px-1">
                        <span>1.00x</span>
                        <span>5.00x</span>
                        <span>10.00x</span>
                      </div>
                      <Progress 
                        value={progressValue} 
                        className="h-2 bg-indigo-900/50" 
                        indicatorClassName={`${
                          progressValue < 25 ? "bg-gradient-to-r from-red-500 to-yellow-500" :
                          progressValue < 50 ? "bg-gradient-to-r from-yellow-500 to-green-500" :
                          progressValue < 75 ? "bg-gradient-to-r from-green-500 to-blue-500" :
                          "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                      />
                    </div>
                  </div>
                  
                  {/* Sky background with clouds and stars */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-indigo-900/10 to-purple-950/20"></div>
                    
                    {/* Stars */}
                    <div className="stars">
                      {Array.from({ length: 80 }).map((_, i) => (
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
                      <motion.div
                        key={`cloud-${i}`}
                        className="absolute bg-white/20 rounded-full backdrop-blur-sm"
                        initial={{ x: -50 }}
                        animate={{ x: "calc(100vw + 100px)" }}
                        transition={{ 
                          duration: Math.random() * 120 + 80,
                          repeat: Infinity,
                          delay: Math.random() * 30
                        }}
                        style={{
                          width: Math.random() * 100 + 50 + 'px',
                          height: Math.random() * 40 + 30 + 'px',
                          top: Math.random() * 70 + '%',
                          left: -100,
                          borderRadius: '50%',
                          filter: 'blur(8px)'
                        }}
                      ></motion.div>
                    ))}
                  </div>
                  
                  {/* Active players' bets and cashouts */}
                  <div className="absolute left-4 top-24 bottom-4 w-56 flex flex-col max-h-[350px] overflow-y-auto z-20 custom-scrollbar bg-black/20 backdrop-blur-md border border-indigo-500/20 rounded-lg p-2">
                    <h4 className="text-white/80 text-xs uppercase mb-2 font-semibold px-2">Live Bets</h4>
                    {activePlayers.map(player => (
                      <div 
                        key={player.id} 
                        className={`mb-2 p-2 rounded ${
                          player.multiplier 
                            ? 'bg-green-900/30 border border-green-500/30' 
                            : 'bg-indigo-900/30 border border-indigo-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white text-sm font-medium truncate max-w-[120px]">
                            {player.username}
                          </span>
                          {player.multiplier ? (
                            <div className="flex items-center bg-green-800/70 text-white text-xs rounded px-1.5 py-0.5">
                              <span>x{player.multiplier.toFixed(2)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center bg-indigo-800/70 text-white text-xs rounded px-1.5 py-0.5">
                              <span>In flight</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Particle effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    {isFlying && (
                      <div className="particles">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <motion.div
                            key={`particle-${i}`}
                            className="absolute bg-white/50 rounded-full"
                            initial={{ 
                              x: "50%", 
                              y: "50%", 
                              opacity: 0.8,
                              scale: 0 
                            }}
                            animate={{ 
                              x: `${Math.random() * 100}%`, 
                              y: `${Math.random() * 100}%`,
                              opacity: 0,
                              scale: Math.random() * 3
                            }}
                            transition={{ 
                              duration: Math.random() * 3 + 1,
                              repeat: Infinity,
                              repeatType: "loop"
                            }}
                            style={{
                              width: Math.random() * 4 + 2 + 'px',
                              height: Math.random() * 4 + 2 + 'px',
                            }}
                          ></motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Trail effect */}
                  <div className="relative z-10" ref={trailRef}>
                    {trailPositions.map((pos, index) => (
                      <motion.div
                        key={`trail-${index}`}
                        className="absolute rounded-full"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 - index * 0.04 }}
                        style={{
                          left: pos.x,
                          top: pos.y,
                          width: 8 - index * 0.3,
                          height: 8 - index * 0.3,
                          backgroundColor: index % 2 === 0 ? '#FF6B6B' : '#FFC107',
                          boxShadow: index < 5 ? `0 0 ${8 - index}px ${index % 2 === 0 ? '#FF6B6B' : '#FFC107'}` : 'none'
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
                      className={`h-16 w-16 drop-shadow-glow ${
                        gameResult === 'lose' 
                          ? 'text-red-500' 
                          : gameResult === 'win' 
                            ? 'text-green-500' 
                            : 'text-red-400'
                      }`}
                    />
                  </motion.div>
                  
                  {/* Multiplier */}
                  <div className="absolute top-1/2 left-0 right-0 flex justify-center z-20 -translate-y-24">
                    <div className="bg-indigo-900/80 backdrop-blur-sm rounded-lg p-3 shadow-glow border border-indigo-500/50">
                      <div className="text-xs text-indigo-300 mb-1 text-center">Multiplier</div>
                      <motion.div 
                        className={`text-4xl md:text-5xl font-bold flex items-center justify-center ${
                          multiplier < 1.5 ? 'text-red-400' :
                          multiplier < 3 ? 'text-yellow-400' :
                          multiplier < 5 ? 'text-green-400' : 'text-purple-400'
                        }`}
                        animate={{ 
                          scale: isFlying ? [1, 1.05, 1] : 1,
                        }}
                        transition={{ 
                          repeat: isFlying ? Infinity : 0, 
                          duration: 0.5 
                        }}
                      >
                        <TrendingUp className="mr-2 h-6 w-6" />
                        {multiplier.toFixed(2)}x
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Game result overlay */}
                  {gameResult && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="bg-gradient-to-b from-indigo-900 to-indigo-950 rounded-xl p-8 shadow-glow border border-indigo-500/50 text-center max-w-md"
                      >
                        {gameResult === 'win' ? (
                          <>
                            <motion.div 
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1, rotate: [0, 5, 0, -5, 0] }}
                              transition={{ delay: 0.4, duration: 0.8 }}
                              className="flex justify-center mb-4"
                            >
                              <Award className="h-16 w-16 text-yellow-400" />
                            </motion.div>
                            <div className="text-green-400 text-4xl font-bold mb-2">WIN!</div>
                            <p className="text-white text-xl mb-2">You cashed out at {multiplier.toFixed(2)}x</p>
                            <motion.p 
                              className="text-3xl font-semibold my-4 text-yellow-400"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ delay: 0.5, duration: 0.5 }}
                            >
                              {formatCurrency(winnings)}
                            </motion.p>
                          </>
                        ) : (
                          <>
                            <motion.div 
                              initial={{ scale: 0.5, opacity: 0, rotate: 0 }}
                              animate={{ scale: 1, opacity: 1, rotate: 360 }}
                              transition={{ delay: 0.4, duration: 0.8 }}
                              className="flex justify-center mb-4"
                            >
                              <X className="h-16 w-16 text-red-500" />
                            </motion.div>
                            <div className="text-red-500 text-4xl font-bold mb-2">CRASH!</div>
                            <p className="text-white text-xl mb-2">Plane crashed at {crashPointRef.current.toFixed(2)}x</p>
                            <p className="text-gray-400 my-3">You lost {formatCurrency(betAmount)}</p>
                          </>
                        )}
                        <Button 
                          className="mt-4 bg-indigo-600 hover:bg-indigo-700" 
                          onClick={resetGame}
                        >
                          <Undo className="mr-2 h-4 w-4" />
                          Play Again
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-indigo-500/30 bg-gradient-to-b from-indigo-950 to-purple-950 shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 text-white">Place Your Bet</h3>
                    <div className="flex items-center mb-3">
                      <label className="block text-sm text-gray-300 mr-2">Bet Amount:</label>
                      <Input
                        type="number"
                        min="1"
                        max={userBalance}
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        disabled={isFlying || isWaitingForNextRound}
                        className="flex-1 bg-indigo-900/50 border-indigo-600/50 text-white"
                      />
                    </div>
                    
                    <div className="flex space-x-2 mb-6">
                      {[5, 10, 25, 50].map((amount) => (
                        <Button
                          key={amount}
                          variant={betAmount === amount ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBetAmount(amount)}
                          disabled={isFlying || isWaitingForNextRound || amount > userBalance}
                          className={`flex-1 ${
                            betAmount === amount 
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                              : "border-indigo-500/50 text-gray-300 hover:text-white hover:bg-indigo-800/50"
                          }`}
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Auto-bet settings */}
                    <div className="mb-4 p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Repeat className="h-4 w-4 mr-1 text-indigo-300" />
                          <span className="text-sm font-medium text-white">Auto-bet</span>
                        </div>
                        <Switch
                          checked={autoBet}
                          onCheckedChange={setAutoBet}
                          disabled={isFlying}
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </div>
                      
                      {autoBet && (
                        <div>
                          <div className="flex items-center mb-2">
                            <label className="text-xs text-gray-300 mr-2">Auto cash-out at:</label>
                            <Input
                              type="number"
                              min="1.1"
                              step="0.1"
                              value={autoCollectAt}
                              onChange={(e) => setAutoCollectAt(Number(e.target.value))}
                              disabled={isFlying}
                              className="flex-1 h-7 py-1 text-sm bg-indigo-900/50 border-indigo-600/50 text-white"
                            />
                            <span className="ml-1 text-xs text-white">x</span>
                          </div>
                          <p className="text-xs text-indigo-300">
                            Will automatically bet and cash out at {autoCollectAt.toFixed(1)}x multiplier
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        className={`flex-1 ${
                          isFlying || isWaitingForNextRound || betAmount <= 0 || betAmount > userBalance
                            ? "bg-indigo-800/50 text-indigo-300"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                        onClick={startGame}
                        disabled={isFlying || isWaitingForNextRound || betAmount <= 0 || betAmount > userBalance}
                      >
                        {isWaitingForNextRound 
                          ? `Wait ${nextRoundCountdown}s` 
                          : isFlying 
                            ? 'In Flight' 
                            : 'Start Game'}
                      </Button>
                      
                      <Button
                        className={`flex-1 ${
                          !isFlying || hashedOut
                            ? "bg-gray-700/50 text-gray-300"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                        variant={hashedOut ? "outline" : "default"}
                        onClick={cashOut}
                        disabled={!isFlying || hashedOut}
                      >
                        Cash Out
                      </Button>
                    </div>
                  </div>
                  
                  {/* Game stats with improved design */}
                  <div className="pt-4 border-t border-indigo-500/30">
                    <h4 className="text-sm font-medium text-indigo-300 mb-3 flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      Game Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-500/30">
                        <div className="text-xs text-indigo-300 mb-1">Balance</div>
                        <div className="text-lg font-medium text-white">{formatCurrency(userBalance)}</div>
                      </div>
                      
                      <div className="bg-indigo-900/30 p-3 rounded-lg border border-indigo-500/30">
                        <div className="text-xs text-indigo-300 mb-1">Potential Win</div>
                        <div className={`text-lg font-medium ${isFlying ? 'text-green-400' : 'text-white'}`}>
                          {isFlying
                            ? formatCurrency(betAmount * multiplier)
                            : formatCurrency(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* History component with redesigned styling */}
              <AviatorHistory 
                history={gameHistory} 
                currentPage={historyPage}
                onPageChange={setHistoryPage}
              />
            </div>
          </div>
        </div>
      </main>
      
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        .shadow-glow {
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(248, 113, 113, 0.6));
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(79, 70, 229, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.6);
        }
      `}</style>
    </div>
  );
};

export default AviatorGame;
