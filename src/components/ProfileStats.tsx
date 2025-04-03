
import { motion } from 'framer-motion';
import { Ticket, Trophy, Coins, CreditCard, RefreshCw, Bitcoin, Phone } from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { usePayment } from '../context/PaymentContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import AccountTypeToggle from './AccountTypeToggle';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import VIPStatus from './VIPStatus';
import BonusesAndRewards from './BonusesAndRewards';
import ReferralSystem from './ReferralSystem';
import { Link } from 'react-router-dom';

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
        description: "Demo account maximum is KSh 50,000",
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
    <div className="mb-8 space-y-6">
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VIPStatus />
        <BonusesAndRewards />
        <ReferralSystem />
      </div>
      
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-lottery-dark">Payment Options</h3>
          {isDemoAccount && (
            <div className="text-sm italic text-amber-600">Demo funds are for practice only (Max: KSh 50,000)</div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Card Payment */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col items-center justify-between h-full">
              <CreditCard className="h-12 w-12 text-blue-500 mb-3" />
              <h4 className="text-center font-medium mb-2">Card Payment</h4>
              <p className="text-sm text-gray-500 text-center mb-4">Securely deposit funds using your debit or credit card</p>
              
              <div className="grid grid-cols-2 gap-2 w-full mb-4">
                {[1000, 5000, 10000, 20000].map((amount) => (
                  <Button 
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddFunds(amount)}
                    className="w-full"
                  >
                    {currencyInfo.symbol}{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2 w-full">
                <Input
                  type="number"
                  min="100"
                  value={customAmount || ''}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  className="flex-1"
                />
                <Button onClick={handleCustomFunds}>
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          {/* M-Pesa Payment */}
          <Link to="/payment/mpesa" className="rounded-lg border border-gray-200 p-4 hover:border-green-500 transition-colors">
            <div className="flex flex-col items-center h-full">
              <Phone className="h-12 w-12 text-green-500 mb-3" />
              <h4 className="text-center font-medium mb-2">M-Pesa Payment</h4>
              <p className="text-sm text-gray-500 text-center mb-4">Quick and convenient mobile money payments via M-Pesa</p>
              
              <Button className="w-full bg-green-600 hover:bg-green-700 mt-auto">
                Deposit with M-Pesa
              </Button>
            </div>
          </Link>
          
          {/* Cryptocurrency Payment */}
          <Link to="/payment/crypto" className="rounded-lg border border-gray-200 p-4 hover:border-purple-500 transition-colors">
            <div className="flex flex-col items-center h-full">
              <Bitcoin className="h-12 w-12 text-purple-500 mb-3" />
              <h4 className="text-center font-medium mb-2">Crypto Payment</h4>
              <p className="text-sm text-gray-500 text-center mb-4">Deposit using Bitcoin, Ethereum, and other cryptocurrencies</p>
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-auto">
                Deposit with Crypto
              </Button>
            </div>
          </Link>
          
          {/* Withdrawal Block */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col items-center h-full">
              <Coins className="h-12 w-12 text-amber-500 mb-3" />
              <h4 className="text-center font-medium mb-2">Withdraw Funds</h4>
              <p className="text-sm text-gray-500 text-center mb-4">Withdraw your winnings to your preferred payment method</p>
              
              <Button variant="outline" className="w-full border-amber-500 text-amber-500 hover:bg-amber-50 mt-auto">
                Withdraw Funds
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
