
import { motion } from 'framer-motion';
import { Ticket, Trophy, Coins, CreditCard } from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ProfileStats = () => {
  const { tickets, userBalance, addFunds } = useLottery();
  const { toast } = useToast();
  
  const activeTickets = tickets.filter(t => t.status === 'active').length;
  const wonTickets = tickets.filter(t => t.status === 'won').length;
  const totalWinnings = tickets
    .filter(t => t.status === 'won' && t.prize)
    .reduce((total, ticket) => total + (ticket.prize || 0), 0);
  
  const handleAddFunds = (amount: number) => {
    addFunds(amount);
    toast({
      title: "Funds Added",
      description: `$${amount.toFixed(2)} has been added to your balance`,
    });
  };
  
  const statItems = [
    {
      title: 'Active Tickets',
      value: activeTickets,
      icon: <Ticket className="w-5 h-5 text-lottery-blue" />,
      color: 'bg-blue-50'
    },
    {
      title: 'Winning Tickets',
      value: wonTickets,
      icon: <Trophy className="w-5 h-5 text-lottery-gold" />,
      color: 'bg-yellow-50'
    },
    {
      title: 'Total Winnings',
      value: `$${totalWinnings.toFixed(2)}`,
      icon: <Coins className="w-5 h-5 text-green-500" />,
      color: 'bg-green-50'
    },
    {
      title: 'Current Balance',
      value: `$${userBalance.toFixed(2)}`,
      icon: <CreditCard className="w-5 h-5 text-purple-500" />,
      color: 'bg-purple-50'
    }
  ];
  
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`${item.color} rounded-xl p-4 border border-gray-100`}
          >
            <div className="flex items-center mb-2">
              <div className="mr-3 p-2 bg-white rounded-lg shadow-sm">
                {item.icon}
              </div>
              <span className="text-lottery-gray text-sm">{item.title}</span>
            </div>
            <div className="font-bold text-2xl text-lottery-dark">{item.value}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-lg text-lottery-dark mb-4">Add Funds</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[10, 25, 50, 100].map((amount, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Button 
                variant="outline"
                className="w-full py-6 border-lottery-blue text-lottery-blue hover:bg-lottery-blue/5 font-medium"
                onClick={() => handleAddFunds(amount)}
              >
                ${amount}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
