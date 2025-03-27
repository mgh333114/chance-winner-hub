
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TicketType = {
  id: string;
  numbers: number[];
  drawDate: Date;
  status: 'active' | 'checked' | 'won' | 'lost';
  prize?: number;
};

type WinnerType = {
  id: string;
  name: string;
  prize: number;
  date: Date;
  numbers: number[];
};

type LotteryContextType = {
  tickets: TicketType[];
  winners: WinnerType[];
  purchaseTicket: (numbers: number[]) => void;
  checkResults: () => void;
  nextDrawDate: Date;
  jackpot: number;
  userBalance: number;
  addFunds: (amount: number) => void;
};

const LotteryContext = createContext<LotteryContextType | undefined>(undefined);

export const LotteryProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [winners, setWinners] = useState<WinnerType[]>([
    {
      id: '1',
      name: 'John D.',
      prize: 1500000,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      numbers: [7, 12, 23, 34, 42, 48]
    },
    {
      id: '2',
      name: 'Sarah M.',
      prize: 750000,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      numbers: [3, 11, 25, 33, 39, 45]
    },
    {
      id: '3',
      name: 'Robert K.',
      prize: 2750000,
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      numbers: [5, 18, 22, 31, 40, 47]
    }
  ]);
  const [userBalance, setUserBalance] = useState(100);
  const [jackpot, setJackpot] = useState(5000000);
  
  // Calculate next draw date (next Friday from current date)
  const getNextDrawDate = (): Date => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 5 is Friday
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(20, 0, 0, 0); // 8 PM
    return nextFriday;
  };
  
  const [nextDrawDate, setNextDrawDate] = useState(getNextDrawDate());
  
  // Update jackpot and next draw date periodically
  useEffect(() => {
    const timer = setInterval(() => {
      // Small random increase to jackpot
      setJackpot(prev => Math.floor(prev * 1.001));
      
      // Update next draw date if we've passed it
      const now = new Date();
      if (now > nextDrawDate) {
        setNextDrawDate(getNextDrawDate());
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(timer);
  }, [nextDrawDate]);
  
  const purchaseTicket = (numbers: number[]) => {
    if (userBalance < 5) return; // Ticket costs $5
    
    const newTicket: TicketType = {
      id: Date.now().toString(),
      numbers,
      drawDate: nextDrawDate,
      status: 'active'
    };
    
    setTickets(prev => [...prev, newTicket]);
    setUserBalance(prev => prev - 5);
  };
  
  const checkResults = () => {
    // Mock checking results - in a real app, this would check against actual lottery results
    setTickets(prev => 
      prev.map(ticket => {
        if (ticket.status === 'active' && ticket.drawDate < new Date()) {
          // Simulate random wins (about 1 in 10 tickets wins something)
          const won = Math.random() > 0.9;
          
          if (won) {
            // Random small prize
            const prize = Math.floor(Math.random() * 500) + 10;
            setUserBalance(prev => prev + prize);
            return { ...ticket, status: 'won', prize };
          } else {
            return { ...ticket, status: 'lost' };
          }
        }
        return ticket;
      })
    );
  };
  
  const addFunds = (amount: number) => {
    setUserBalance(prev => prev + amount);
  };
  
  return (
    <LotteryContext.Provider 
      value={{ 
        tickets, 
        winners, 
        purchaseTicket, 
        checkResults, 
        nextDrawDate, 
        jackpot,
        userBalance,
        addFunds
      }}
    >
      {children}
    </LotteryContext.Provider>
  );
};

export const useLottery = () => {
  const context = useContext(LotteryContext);
  if (context === undefined) {
    throw new Error('useLottery must be used within a LotteryProvider');
  }
  return context;
};
