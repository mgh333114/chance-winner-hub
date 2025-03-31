
import { motion } from 'framer-motion';
import { Ticket, Trophy, Coins, CreditCard, RefreshCw } from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { usePayment } from '../context/PaymentContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import AccountTypeToggle from './AccountTypeToggle';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const ProfileStats = () => {
  const { tickets } = useLottery();
  const { 
    addFunds, 
    processingPayment, 
    userBalance, 
    loadingBalance, 
    refreshBalance, 
    isDemoAccount,
    formatCurrency,
    currencyInfo
  } = usePayment();
  const { toast } = useToast();
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(0);
  
  const activeTickets = tickets.filter(t => t.status === 'active').length;
  const wonTickets = tickets.filter(t => t.status === 'won').length;
  const totalWinnings = tickets
    .filter(t => t.status === 'won' && t.prize)
    .reduce((total, ticket) => total + (ticket.prize || 0), 0);
  
  const handleAddFunds = async (amount: number) => {
    // Check if user is authenticated
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add funds",
        variant: "destructive",
      });
      return;
    }
    
    addFunds(amount);
  };
  
  const handleRefreshBalance = async () => {
    setRefreshingBalance(true);
    await refreshBalance();
    setRefreshingBalance(false);
    
    toast({
      title: "Balance updated",
      description: "Your balance has been refreshed"
    });
  };
  
  const handleCustomFunds = () => {
    if (customAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a positive amount",
        variant: "destructive",
      });
      return;
    }
    
    if (isDemoAccount && customAmount > 50000) {
      toast({
        title: "Amount too high",
        description: "Demo account maximum is $50,000",
        variant: "destructive",
      });
      return;
    }
    
    handleAddFunds(customAmount);
    setCustomAmount(0);
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
      value: formatCurrency(totalWinnings),
      icon: <Coins className="w-5 h-5 text-green-500" />,
      color: 'bg-green-50'
    },
    {
      title: 'Current Balance',
      value: loadingBalance ? 'Loading...' : formatCurrency(userBalance),
      icon: <CreditCard className="w-5 h-5 text-purple-500" />,
      color: 'bg-purple-50',
      action: (
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2 p-1 h-6" 
          onClick={handleRefreshBalance}
          disabled={refreshingBalance}
        >
          <RefreshCw className={`w-3 h-3 ${refreshingBalance ? 'animate-spin' : ''}`} />
        </Button>
      )
    }
  ];
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-lottery-dark">Your Account</h2>
          {isDemoAccount ? (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Demo Mode</Badge>
          ) : (
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Real Money</Badge>
          )}
        </div>
        <AccountTypeToggle />
      </div>
      
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
              {item.action}
            </div>
            <div className="font-bold text-2xl text-lottery-dark">{item.value}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-lottery-dark">Add Funds</h3>
          {isDemoAccount && (
            <div className="text-sm italic text-amber-600">Demo funds are for practice only (Max: $50,000)</div>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[10, 100, 1000, 10000].map((amount, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Button 
                variant="outline"
                className={`w-full py-6 border-lottery-blue text-lottery-blue hover:bg-lottery-blue/5 font-medium ${
                  isDemoAccount ? 'border-amber-500 text-amber-500 hover:bg-amber-500/5' : ''
                }`}
                onClick={() => handleAddFunds(amount)}
                disabled={processingPayment}
              >
                {currencyInfo.symbol}{amount.toLocaleString()}
              </Button>
            </motion.div>
          ))}
        </div>
        
        <div className="flex gap-3 mt-4 items-center">
          <Input
            type="number"
            min="1"
            max={isDemoAccount ? 50000 : undefined}
            value={customAmount || ''}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
            placeholder="Enter custom amount"
            className="flex-1"
          />
          <Button
            onClick={handleCustomFunds}
            disabled={processingPayment || customAmount <= 0}
            className={`${isDemoAccount ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          >
            Add Custom Amount
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
