
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

type WinnerDisplayProps = {
  id: string;
  name: string;
  prize: number;
  date: Date;
  numbers: number[];
  index?: number;
};

const WinnerDisplay = ({ 
  id, 
  name, 
  prize, 
  date, 
  numbers,
  index = 0
}: WinnerDisplayProps) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="winner-glow relative rounded-2xl"
    >
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center mb-2">
              <Trophy className="w-5 h-5 text-lottery-gold mr-2" />
              <h3 className="font-bold text-lg text-lottery-dark">{name}</h3>
            </div>
            <p className="text-lottery-gray text-sm">{formatDate(date)}</p>
          </div>
          
          <div className="text-right">
            <span className="text-xs font-medium text-lottery-gray block mb-1">Prize</span>
            <span className="text-lottery-blue font-bold text-xl">{formatCurrency(prize)}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-xs text-lottery-gray mb-2">Winning Numbers</div>
          <div className="flex flex-wrap justify-start gap-2">
            {numbers.map((num, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-full bg-lottery-light border border-lottery-gold/30 flex items-center justify-center font-medium text-lottery-dark text-sm"
              >
                {num}
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-100 text-xs text-lottery-gray">
          Ticket ID: #{id}
        </div>
      </div>
    </motion.div>
  );
};

export default WinnerDisplay;
