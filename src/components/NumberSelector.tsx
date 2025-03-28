import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLottery } from '../context/LotteryContext';
import { usePayment } from '../context/PaymentContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';

const NumberSelector = () => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { purchaseTicket } = useLottery();
  const { userBalance, formatCurrency } = usePayment();
  const { toast } = useToast();
  const maxSelections = 6;
  const ticketPrice = 5;
  
  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else if (selectedNumbers.length < maxSelections) {
      setSelectedNumbers(prev => [...prev, number]);
    } else {
      toast({
        title: "Maximum selections reached",
        description: `You can only select ${maxSelections} numbers`,
        variant: "destructive"
      });
    }
  };
  
  const generateRandomNumbers = () => {
    setIsGenerating(true);
    setSelectedNumbers([]);
    
    const generateWithDelay = (remainingCount: number, current: number[] = []) => {
      if (remainingCount === 0) {
        setIsGenerating(false);
        return;
      }
      
      setTimeout(() => {
        let newNum;
        do {
          newNum = Math.floor(Math.random() * 49) + 1;
        } while (current.includes(newNum));
        
        const updated = [...current, newNum];
        setSelectedNumbers(updated);
        generateWithDelay(remainingCount - 1, updated);
      }, 300);
    };
    
    generateWithDelay(maxSelections);
  };
  
  const clearSelection = () => {
    setSelectedNumbers([]);
  };
  
  const handlePurchase = () => {
    if (selectedNumbers.length !== maxSelections) {
      toast({
        title: "Incomplete selection",
        description: `Please select ${maxSelections} numbers to purchase a ticket`,
        variant: "destructive"
      });
      return;
    }
    
    if (userBalance < ticketPrice) {
      toast({
        title: "Insufficient balance",
        description: `You need at least ${formatCurrency(ticketPrice)} to purchase a ticket`,
        variant: "destructive"
      });
      return;
    }
    
    purchaseTicket(selectedNumbers);
    toast({
      title: "Ticket purchased!",
      description: "Good luck in the upcoming draw"
    });
    setSelectedNumbers([]);
  };
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-lottery-dark mb-2">Select Your Numbers</h2>
        <p className="text-lottery-gray text-sm mb-6">
          Choose {maxSelections} numbers between 1 and 49
        </p>
        
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center bg-lottery-light text-lottery-blue rounded-lg p-1.5 font-medium text-sm">
            <span className="mr-2">Selected:</span>
            {Array.from({ length: maxSelections }).map((_, i) => (
              <div 
                key={i} 
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-1
                  ${selectedNumbers[i] ? 'bg-lottery-blue text-white' : 'bg-white text-lottery-gray border border-gray-200'}`}
              >
                {selectedNumbers[i] || '-'}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: 49 }, (_, i) => i + 1).map(number => (
            <motion.button
              key={number}
              whileTap={{ scale: 0.95 }}
              disabled={isGenerating}
              className={`lottery-number border ${
                selectedNumbers.includes(number)
                  ? 'lottery-number-selected'
                  : 'bg-white text-lottery-dark border-gray-200 hover:border-lottery-blue/50'
              }`}
              onClick={() => handleNumberClick(number)}
            >
              {number}
            </motion.button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-lottery-blue text-lottery-blue hover:bg-lottery-blue/5"
            onClick={clearSelection}
            disabled={selectedNumbers.length === 0 || isGenerating}
          >
            Clear Selection
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 border-lottery-blue text-lottery-blue hover:bg-lottery-blue/5"
            onClick={generateRandomNumbers}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Quick Pick
          </Button>
        </div>
        
        <Button
          className="w-full py-6 bg-lottery-blue hover:bg-lottery-blue/90 text-white font-semibold rounded-xl text-lg transition-all transform hover:scale-[1.01]"
          onClick={handlePurchase}
          disabled={selectedNumbers.length !== maxSelections || isGenerating}
        >
          Purchase Ticket - {formatCurrency(ticketPrice)}
        </Button>
      </div>
    </div>
  );
};

export default NumberSelector;
