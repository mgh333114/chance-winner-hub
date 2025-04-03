
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import NumberSelector from '@/components/NumberSelector';
import TicketCard from '@/components/TicketCard';
import { useLottery } from '@/context/LotteryContext';
import { Calendar, DollarSign, Ticket } from 'lucide-react';
import { usePayment } from '@/context/PaymentContext';

const Purchase = () => {
  const { tickets, nextDrawDate, jackpot } = useLottery();
  const { formatCurrency } = usePayment();
  
  const activeTickets = tickets.filter(t => t.status === 'active');
  
  const formatDrawDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="min-h-screen bg-lottery-black">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-lottery-gold mb-4">
              Purchase Your WinHub Tickets
            </h1>
            <p className="text-lottery-white/80 max-w-2xl mx-auto">
              Select your lucky numbers and purchase tickets for the upcoming draw. The more tickets you buy, the higher your chances of winning!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-lottery-black/50 rounded-2xl p-4 border border-lottery-green/30 flex items-center"
            >
              <Calendar className="w-10 h-10 text-lottery-neonGreen mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-sm text-lottery-gray mb-1">Next Draw</h3>
                <p className="font-medium text-lottery-white">{formatDrawDate(nextDrawDate)}</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-lottery-black/50 rounded-2xl p-4 border border-lottery-gold/30 flex items-center"
            >
              <DollarSign className="w-10 h-10 text-lottery-gold mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-sm text-lottery-gray mb-1">Current Jackpot</h3>
                <p className="font-medium text-lottery-white">{formatCurrency(jackpot)}</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-lottery-black/50 rounded-2xl p-4 border border-lottery-green/30 flex items-center"
            >
              <Ticket className="w-10 h-10 text-lottery-neonGreen mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-sm text-lottery-gray mb-1">Your Active Tickets</h3>
                <p className="font-medium text-lottery-white">{activeTickets.length} tickets</p>
              </div>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-7"
            >
              <NumberSelector />
            </motion.div>
            
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-lottery-black/60 rounded-2xl p-6 shadow-lg border border-lottery-green/30 mb-6"
                >
                  <h2 className="text-xl font-bold text-lottery-white mb-4 flex items-center">
                    <Ticket className="w-5 h-5 mr-2 text-lottery-neonGreen" />
                    Your Active Tickets
                  </h2>
                  
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {activeTickets.length > 0 ? (
                      activeTickets.map((ticket, index) => (
                        <TicketCard 
                          key={ticket.id} 
                          numbers={ticket.numbers} 
                          index={index}
                          drawDate={ticket.drawDate}
                          status={ticket.status}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-lottery-gray">
                        <p>You don't have any active tickets.</p>
                        <p className="mt-2 text-sm">Purchase a ticket to see it here!</p>
                      </div>
                    )}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-lottery-black/60 rounded-2xl p-6 border border-lottery-green/30"
                >
                  <h3 className="font-medium text-lottery-white mb-4">Important Information</h3>
                  <ul className="space-y-2 text-sm text-lottery-white/70">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-lottery-neonGreen mt-1.5 mr-2 flex-shrink-0"></span>
                      Each ticket costs KSh 500 and includes 6 numbers.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-lottery-neonGreen mt-1.5 mr-2 flex-shrink-0"></span>
                      You can purchase multiple tickets to increase your chances.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-lottery-neonGreen mt-1.5 mr-2 flex-shrink-0"></span>
                      Tickets for the upcoming draw can be purchased until 1 hour before the draw time.
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-lottery-neonGreen mt-1.5 mr-2 flex-shrink-0"></span>
                      Results will be available immediately after the draw.
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Purchase;
