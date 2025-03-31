
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { usePayment } from '@/context/PaymentContext';
import { 
  CircleDot, 
  RefreshCw, 
  Clock, 
  Users,
  Volume2,
  VolumeX,
  Trophy,
  BarChart4
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Define wheel segments with numbers and colors
const wheelSegments = [
  { color: '#e74c3c', number: 1, multiplier: 2 },
  { color: '#3498db', number: 2, multiplier: 1.5 },
  { color: '#2ecc71', number: 3, multiplier: 3 },
  { color: '#f39c12', number: 4, multiplier: 0.5 },
  { color: '#9b59b6', number: 5, multiplier: 5 },
  { color: '#e67e22', number: 6, multiplier: 0.2 },
  { color: '#1abc9c', number: 7, multiplier: 1 },
  { color: '#d35400', number: 8, multiplier: 10 },
];

// Type for storing previous spins
type SpinHistoryItem = {
  id: string;
  number: number;
  multiplier: number;
  timestamp: Date;
};

const WheelGame = () => {
  const { addFunds, processWithdrawal, userBalance, formatCurrency, refreshBalance } = usePayment();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(5);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [winnings, setWinnings] = useState<number>(0);
  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>([]);
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentUsers, setCurrentUsers] = useState<number>(
    Math.floor(Math.random() * 15) + 5 // Random number between 5 and 20
  );
  const [totalBetAmount, setTotalBetAmount] = useState<number>(
    Math.floor(Math.random() * 500) + 100 // Random between 100 and 600
  );
  const [isWaitingForNextRound, setIsWaitingForNextRound] = useState<boolean>(false);

  const wheelRef = useRef<HTMLDivElement>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize sounds
  useEffect(() => {
    spinSoundRef.current = new Audio('/wheel-spin.mp3');
    winSoundRef.current = new Audio('/success.mp3');

    // Load from localStorage
    const savedHistory = localStorage.getItem('wheel_history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSpinHistory(parsedHistory);
      } catch (e) {
        console.error('Failed to parse history from localStorage', e);
      }
    }

    // Start with a next round countdown
    startNextRoundCountdown();

    return () => {
      // Clean up
      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
      }
      if (winSoundRef.current) {
        winSoundRef.current.pause();
      }
    };
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (spinHistory.length) {
      localStorage.setItem('wheel_history', JSON.stringify(spinHistory));
    }
  }, [spinHistory]);

  // Start countdown for next round
  const startNextRoundCountdown = () => {
    setIsWaitingForNextRound(true);
    setNextRoundCountdown(7);
    
    const countdownInterval = setInterval(() => {
      setNextRoundCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setIsWaitingForNextRound(false);
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
  };

  const spinWheel = () => {
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

    // Process the bet amount
    processWithdrawal(betAmount, 'game', 'number-wheel-bet')
      .then(() => {
        // Reset state
        setIsSpinning(true);
        setSpinResult(null);
        setWinnings(0);
        
        // Play spin sound
        if (soundEnabled && spinSoundRef.current) {
          spinSoundRef.current.currentTime = 0;
          spinSoundRef.current.play();
        }
        
        // Determine winning segment (random)
        const randomSegmentIndex = Math.floor(Math.random() * wheelSegments.length);
        const winningSegment = wheelSegments[randomSegmentIndex];
        
        // Calculate rotation - add multiple full rotations plus the position to land on the chosen segment
        const segmentSize = 360 / wheelSegments.length;
        const destinationRotation = 360 * 5 + (360 - (randomSegmentIndex * segmentSize));
        
        // Animate wheel to spin and stop at the chosen segment
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.1, 0.25, 0.1, 1)';
          wheelRef.current.style.transform = `rotate(${destinationRotation}deg)`;
        }
        
        // Process result after spin animation
        setTimeout(() => {
          const winAmount = betAmount * winningSegment.multiplier;
          setSpinResult(winningSegment.number);
          setWinnings(winAmount);
          
          // Add to history
          const historyItem: SpinHistoryItem = {
            id: uuidv4(),
            number: winningSegment.number,
            multiplier: winningSegment.multiplier,
            timestamp: new Date()
          };
          setSpinHistory(prev => [historyItem, ...prev]);
          
          // Add winnings to balance
          if (winAmount > 0) {
            addFunds(winAmount);
            
            // Play win sound
            if (soundEnabled && winSoundRef.current) {
              winSoundRef.current.currentTime = 0;
              winSoundRef.current.play();
            }
            
            toast({
              title: "You Won!",
              description: `You won ${formatCurrency(winAmount)}!`,
            });
          } else {
            toast({
              title: "Better luck next time!",
              description: `You lost ${formatCurrency(betAmount)}`,
              variant: "destructive",
            });
          }
          
          // End spinning state
          setIsSpinning(false);
          
          // Update stats for next round
          updateRoundStats();
          
          // Start countdown for next round
          startNextRoundCountdown();

        }, 5000); // 5 seconds for wheel animation
      })
      .catch(error => {
        toast({
          title: "Error Processing Bet",
          description: error.message || "There was an error processing your bet",
          variant: "destructive",
        });
      });
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
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
              <CircleDot className="mr-2 h-8 w-8 text-purple-500" />
              Number Wheel
            </h1>
            <p className="text-lottery-gray max-w-2xl mx-auto">
              Spin the wheel and test your luck! Land on high numbers to win big rewards.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wheel and game area */}
            <div className="lg:col-span-2">
              <Card className="h-full overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[500px] relative">
                  {/* Sound toggle button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 z-30"
                    onClick={toggleSound}
                  >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </Button>
                  
                  {/* Next round countdown */}
                  {isWaitingForNextRound && nextRoundCountdown !== null && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full flex items-center z-20">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>Next round: {nextRoundCountdown}s</span>
                    </div>
                  )}
                  
                  {/* Current users and total bet */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full flex items-center space-x-3 z-20">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      <span>{currentUsers}</span>
                    </div>
                    <div className="flex items-center">
                      <BarChart4 className="mr-1 h-4 w-4" />
                      <span>{formatCurrency(totalBetAmount)}</span>
                    </div>
                  </div>
                  
                  {/* Wheel */}
                  <div className="relative w-64 h-64 md:w-80 md:h-80">
                    {/* Center point */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gray-800 rounded-full z-10"></div>
                    
                    {/* Wheel */}
                    <div 
                      ref={wheelRef} 
                      className="w-full h-full rounded-full border-8 border-gray-800 relative"
                    >
                      {wheelSegments.map((segment, index) => {
                        const segmentSize = 360 / wheelSegments.length;
                        const startAngle = index * segmentSize;
                        const endAngle = (index + 1) * segmentSize;
                        
                        return (
                          <div
                            key={index}
                            className="absolute inset-0"
                            style={{
                              background: `conic-gradient(from ${startAngle}deg to ${endAngle}deg, ${segment.color}, ${segment.color} 100%)`,
                              clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 - 50 * Math.sin(endAngle * Math.PI / 180)}%, 50% 50%)`
                            }}
                          >
                            {/* Segment number */}
                            <div 
                              className="absolute whitespace-nowrap text-white font-bold text-xl md:text-2xl"
                              style={{ 
                                transform: `rotate(${startAngle + segmentSize/2}deg) translateX(110px) rotate(${-(startAngle + segmentSize/2)}deg)`,
                                left: '50%',
                                top: '50%',
                              }}
                            >
                              {segment.number}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 clip-path-triangle bg-gray-800 z-10"></div>
                  </div>

                  {/* Game result */}
                  {spinResult !== null && (
                    <div className={`mt-8 p-4 rounded-lg ${winnings > betAmount ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'}`}>
                      <h3 className="text-xl font-semibold">
                        {winnings > betAmount ? 'You Won!' : 'Try Again!'}
                      </h3>
                      <p className="text-lg">
                        Landed on number: <span className="font-bold">{spinResult}</span>
                      </p>
                      <p className="text-lg">
                        Multiplier: <span className="font-bold">
                          {wheelSegments.find(s => s.number === spinResult)?.multiplier}x
                        </span>
                      </p>
                      <p className="text-lg">
                        {winnings > betAmount ? 'Winnings:' : 'Result:'} <span className="font-bold">{formatCurrency(winnings)}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Controls and history */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-purple-200">
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
                        disabled={isSpinning || isWaitingForNextRound}
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
                          disabled={isSpinning || isWaitingForNextRound || amount > userBalance}
                          className="flex-1"
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={spinWheel}
                      disabled={isSpinning || isWaitingForNextRound || betAmount <= 0 || betAmount > userBalance}
                    >
                      {isWaitingForNextRound 
                        ? `Wait ${nextRoundCountdown}s` 
                        : isSpinning 
                          ? <RefreshCw className="animate-spin" /> 
                          : 'Spin Wheel'}
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Game Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Your Balance:</div>
                      <div className="text-right font-medium">{formatCurrency(userBalance)}</div>
                      
                      <div className="text-gray-600">Potential Win:</div>
                      <div className="text-right font-medium">
                        {formatCurrency(betAmount * Math.max(...wheelSegments.map(s => s.multiplier)))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* History */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-purple-500" />
                    Recent Spins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {spinHistory.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {spinHistory.slice(0, 10).map((spin) => (
                        <div 
                          key={spin.id}
                          className="flex justify-between items-center border-b border-gray-100 pb-2"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-lg">{spin.number}</span>
                            <span className={`text-sm ${
                              spin.multiplier >= 2 ? 'text-green-600' : 
                              spin.multiplier >= 1 ? 'text-blue-600' : 'text-red-600'
                            }`}>
                              ({spin.multiplier}x)
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(spin.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No spins yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <style>
        {`
          .clip-path-triangle {
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default WheelGame;
