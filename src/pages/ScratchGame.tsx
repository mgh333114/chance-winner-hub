
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { usePayment } from '@/context/PaymentContext';
import { CreditCard, Gift, DollarSign, ShoppingBag, Gem, Star, Trophy, TicketCheck, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type ScratchSymbol = {
  icon: JSX.Element;
  value: number;
  color: string;
  name: string;
};

const ScratchGame = () => {
  const { addFunds, processWithdrawal, userBalance, formatCurrency, refreshBalance } = usePayment();
  const { toast } = useToast();
  
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [cardGrid, setCardGrid] = useState<ScratchSymbol[][]>([]);
  const [isWinner, setIsWinner] = useState(false);
  const cardPrice = 5;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const symbols: ScratchSymbol[] = [
    { icon: <Star className="h-8 w-8" />, value: 0, color: "text-yellow-500", name: "Star" },
    { icon: <DollarSign className="h-8 w-8" />, value: 5, color: "text-green-600", name: "Dollar" },
    { icon: <Gift className="h-8 w-8" />, value: 10, color: "text-red-500", name: "Gift" },
    { icon: <Gem className="h-8 w-8" />, value: 20, color: "text-blue-500", name: "Gem" },
    { icon: <Trophy className="h-8 w-8" />, value: 50, color: "text-amber-500", name: "Trophy" },
    { icon: <ShoppingBag className="h-8 w-8" />, value: 0, color: "text-purple-500", name: "Bag" },
  ];

  const generateCardGrid = () => {
    // Create a 3x3 grid with random symbols
    const grid: ScratchSymbol[][] = [];
    for (let i = 0; i < 3; i++) {
      const row: ScratchSymbol[] = [];
      for (let j = 0; j < 3; j++) {
        // Random symbol from the symbols array
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        row.push(randomSymbol);
      }
      grid.push(row);
    }
    
    // We need to force at least one winning combination (3 of a kind)
    // 20% chance of winning
    if (Math.random() < 0.2) {
      const winningSymbol = symbols.filter(s => s.value > 0)[Math.floor(Math.random() * (symbols.length - 2)) + 1];
      
      // Place winning symbols in random positions
      // For simplicity, let's put them in the first row
      grid[0][0] = winningSymbol;
      grid[0][1] = winningSymbol;
      grid[0][2] = winningSymbol;
    }
    
    return grid;
  };

  const checkForWin = (grid: ScratchSymbol[][]) => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (
        grid[i][0].name === grid[i][1].name && 
        grid[i][1].name === grid[i][2].name &&
        grid[i][0].value > 0
      ) {
        return { isWinner: true, amount: grid[i][0].value * 3 };
      }
    }
    
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (
        grid[0][j].name === grid[1][j].name && 
        grid[1][j].name === grid[2][j].name &&
        grid[0][j].value > 0
      ) {
        return { isWinner: true, amount: grid[0][j].value * 3 };
      }
    }
    
    // Check diagonals
    if (
      grid[0][0].name === grid[1][1].name && 
      grid[1][1].name === grid[2][2].name &&
      grid[0][0].value > 0
    ) {
      return { isWinner: true, amount: grid[0][0].value * 3 };
    }
    
    if (
      grid[0][2].name === grid[1][1].name && 
      grid[1][1].name === grid[2][0].name &&
      grid[0][2].value > 0
    ) {
      return { isWinner: true, amount: grid[0][2].value * 3 };
    }
    
    return { isWinner: false, amount: 0 };
  };

  const purchaseCard = () => {
    if (userBalance < cardPrice) {
      toast({
        title: "Insufficient Funds",
        description: "Your balance is too low to purchase a scratch card",
        variant: "destructive",
      });
      return;
    }
    
    processWithdrawal(cardPrice, 'game', 'scratch-card-purchase')
      .then(() => {
        // Generate new card grid
        const newGrid = generateCardGrid();
        setCardGrid(newGrid);
        
        // Check if it's a winning card
        const { isWinner, amount } = checkForWin(newGrid);
        setIsWinner(isWinner);
        setWinAmount(amount);
        
        // Reset canvas
        setIsRevealed(false);
        initCanvas();
      })
      .catch(error => {
        toast({
          title: "Error Purchasing Card",
          description: error.message || "There was an error purchasing your scratch card",
          variant: "destructive",
        });
      });
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    contextRef.current = context;
    
    // Fill with gray scratch surface
    context.fillStyle = '#CBD5E1'; // Tailwind slate-300
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some texture to make it look like a scratch card
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      context.fillRect(x, y, 1, 1);
    }
    
    // Add "Scratch Here!" text
    context.fillStyle = '#1E293B'; // Tailwind slate-800
    context.font = '20px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Scratch Here!', canvas.width / 2, canvas.height / 2);
  };

  const handleMouseDown = () => {
    setIsScratching(true);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
    
    // Check if the card is mostly scratched
    if (canvasRef.current && contextRef.current) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixelData = imageData.data;
      
      // Count transparent pixels
      let transparentPixels = 0;
      for (let i = 3; i < pixelData.length; i += 4) {
        if (pixelData[i] < 50) { // If alpha channel is low (transparent)
          transparentPixels++;
        }
      }
      
      const totalPixels = canvas.width * canvas.height;
      const percentScratched = (transparentPixels / totalPixels) * 100;
      
      // If more than 50% scratched, fully reveal
      if (percentScratched > 50) {
        revealCard();
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching || !canvasRef.current || !contextRef.current) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scratch effect - clear a circle
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(x, y, 15, 0, Math.PI * 2);
    context.fill();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsScratching(true);
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
    
    // Check if the card is mostly scratched
    if (canvasRef.current && contextRef.current) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixelData = imageData.data;
      
      // Count transparent pixels
      let transparentPixels = 0;
      for (let i = 3; i < pixelData.length; i += 4) {
        if (pixelData[i] < 50) { // If alpha channel is low (transparent)
          transparentPixels++;
        }
      }
      
      const totalPixels = canvas.width * canvas.height;
      const percentScratched = (transparentPixels / totalPixels) * 100;
      
      // If more than 50% scratched, fully reveal
      if (percentScratched > 50) {
        revealCard();
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching || !canvasRef.current || !contextRef.current) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Scratch effect - clear a circle
    context.globalCompositeOperation = 'destination-out';
    context.beginPath();
    context.arc(x, y, 20, 0, Math.PI * 2);
    context.fill();
  };

  const revealCard = () => {
    if (isRevealed) return;
    
    if (canvasRef.current && contextRef.current) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      
      // Clear the entire canvas
      context.globalCompositeOperation = 'destination-out';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      setIsRevealed(true);
      
      // Play sound if it's a winner
      if (isWinner && audioRef.current) {
        audioRef.current.play();
      }
      
      // Award winnings if they won
      if (isWinner) {
        addFunds(winAmount)
          .then(() => {
            refreshBalance();
            toast({
              title: "Congratulations!",
              description: `You won ${formatCurrency(winAmount)}!`,
            });
          });
      } else {
        toast({
          title: "Better luck next time!",
          description: "Try again with a new card.",
        });
      }
    }
  };

  useEffect(() => {
    // Initialize canvas when component mounts
    initCanvas();
    
    // Load audio
    audioRef.current = new Audio('/success.mp3');
    
    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        initCanvas();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Generate initial card
    if (cardGrid.length === 0) {
      const initialGrid = generateCardGrid();
      setCardGrid(initialGrid);
      
      // Check if it's a winning card
      const { isWinner, amount } = checkForWin(initialGrid);
      setIsWinner(isWinner);
      setWinAmount(amount);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
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
              <CreditCard className="mr-2 h-8 w-8 text-yellow-500" />
              Lucky Scratch
            </h1>
            <p className="text-lottery-gray max-w-2xl mx-auto">
              Scratch and reveal to win instant prizes! Match three symbols to win big!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="h-full overflow-hidden relative">
                <CardContent className="p-0">
                  <div className="p-6 bg-gradient-to-br from-slate-100 to-white">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {cardGrid.length > 0 && cardGrid.map((row, rowIndex) => (
                        row.map((symbol, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg p-4 ${symbol.color}`}
                          >
                            {symbol.icon}
                          </div>
                        ))
                      ))}
                    </div>
                    
                    <div className="relative h-40 md:h-48 bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full cursor-pointer"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchMove}
                      />
                      
                      {isRevealed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isWinner ? (
                            <div className="text-center">
                              <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-green-600">
                                You Won!
                              </div>
                              <div className="text-3xl font-bold mt-1">
                                {formatCurrency(winAmount)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-700">
                                Better luck next time!
                              </div>
                              <Button 
                                className="mt-4" 
                                onClick={purchaseCard}
                              >
                                <Undo className="mr-2 h-4 w-4" />
                                Try Again
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Buy a Scratch Card</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Each card costs {formatCurrency(cardPrice)}. Match 3 of the same symbols to win!
                    </p>
                    
                    <Button
                      className="w-full mb-4"
                      onClick={purchaseCard}
                      disabled={userBalance < cardPrice}
                    >
                      <TicketCheck className="mr-2 h-4 w-4" />
                      Buy Card ({formatCurrency(cardPrice)})
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      Your Balance: <span className="font-semibold">{formatCurrency(userBalance)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Winning Symbols</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {symbols.filter(s => s.value > 0).map((symbol, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                          <div className={`mr-2 ${symbol.color}`}>
                            {symbol.icon}
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">{symbol.name}</div>
                            <div className="font-semibold">{formatCurrency(symbol.value)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">How To Play</h4>
                    <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                      <li>Buy a scratch card</li>
                      <li>Scratch the gray area by clicking or dragging</li>
                      <li>Match 3 identical symbols in a row, column, or diagonal to win</li>
                      <li>Winnings are automatically added to your balance</li>
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

export default ScratchGame;
