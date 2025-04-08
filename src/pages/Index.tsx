
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import WinnerDisplay from '@/components/WinnerDisplay';
import LotteryNews from '@/components/LotteryNews';
import WelcomeBonus from '@/components/WelcomeBonus';
import Navbar from '@/components/Navbar';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-lottery-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <Hero />
        
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-8">Recent Winners</h2>
          <WinnerDisplay />
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
