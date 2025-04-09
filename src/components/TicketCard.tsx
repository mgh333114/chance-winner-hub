
import { motion } from 'framer-motion';

type TicketCardProps = {
  numbers: number[];
  index?: number;
  drawDate?: Date;
  status?: 'active' | 'checked' | 'won' | 'lost';
  prize?: number;
};

const TicketCard = ({ 
  numbers, 
  index = 0, 
  drawDate, 
  status = 'active',
  prize 
}: TicketCardProps) => {
  
  const formatDate = (date?: Date) => {
    if (!date) return 'Upcoming Draw';
    
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  const getStatusColor = () => {
    switch(status) {
      case 'won': return 'bg-green-50 border-green-200';
      case 'lost': return 'bg-red-50 border-red-200';
      case 'checked': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-lottery-light border-lottery-blue/20';
    }
  };
  
  const getStatusText = () => {
    switch(status) {
      case 'won': return 'Winner';
      case 'lost': return 'No Match';
      case 'checked': return 'Checked';
      default: return 'Active';
    }
  };
  
  const getStatusBadgeColor = () => {
    switch(status) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'checked': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`lottery-ticket ${getStatusColor()} border p-4 rounded-xl relative overflow-hidden`}
    >
      <div className="ticket-pattern" />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs text-lottery-gray">Ticket</span>
          <h3 className="font-bold text-lottery-dark">#{(index + 1).toString().padStart(3, '0')}</h3>
        </div>
        
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor()} font-medium`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="flex justify-center gap-2 my-4">
        {numbers.map((num, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + idx * 0.05, duration: 0.3 }}
            className="w-8 h-8 text-sm rounded-full bg-white shadow-sm border border-lottery-blue/20 flex items-center justify-center font-medium text-lottery-dark"
          >
            {num}
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-between items-end">
        <div className="text-sm text-lottery-gray">
          <span>{formatDate(drawDate)}</span>
        </div>
        
        {status === 'won' && prize && (
          <div className="text-green-600 font-bold">
            +KSh{prize.toFixed(2)}
          </div>
        )}
      </div>
      
      {status === 'won' && (
        <div className="absolute -inset-1 bg-green-400/20 blur-md rounded-xl -z-10" />
      )}
    </motion.div>
  );
};

export default TicketCard;
