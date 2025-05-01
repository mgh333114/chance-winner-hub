
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '@/components/Hero';
import WinnerDisplay from '@/components/WinnerDisplay';
import LotteryNews from '@/components/LotteryNews';
import WelcomeBonus from '@/components/WelcomeBonus';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { useDeposit } from '@/hooks/useDeposit';
import { usePayment } from '@/context/PaymentContext';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userBalance, refreshBalance } = usePayment();
  const { addFunds } = useDeposit(false, refreshBalance);
  
  // Create some mock data for the WinnerDisplay component
  const recentWinner = {
    id: "WIN123456",
    name: "John Doe",
    prize: 150000,
    date: new Date('2023-05-15'),
    numbers: [7, 14, 23, 36, 42, 49]
  };

  const handleQuickDeposit = () => {
    addFunds(500, 'crypto');
    toast({
      title: "Crypto deposit initiated",
      description: "You'll be redirected to complete the crypto payment"
    });
  };

  return (
    <div className="min-h-screen bg-lottery-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <Hero />
        
        <div className="mt-12 flex justify-center">
          <Button 
            onClick={handleQuickDeposit}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            Quick Crypto Deposit (500 KES)
          </Button>
        </div>
        
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-8">Recent Winners</h2>
          <WinnerDisplay {...recentWinner} />
        </div>
        
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-8">Latest Lottery News</h2>
          <LotteryNews />
        </div>
        
        <div className="mt-20 mb-20">
          <WelcomeBonus />
        </div>
      </div>
    </div>
  );
};

export default Index;
