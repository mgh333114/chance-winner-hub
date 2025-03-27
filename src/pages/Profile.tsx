
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProfileStats from '@/components/ProfileStats';
import TicketCard from '@/components/TicketCard';
import { useLottery } from '@/context/LotteryContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const Profile = () => {
  const { tickets, checkResults } = useLottery();
  const [activeTab, setActiveTab] = useState("active");
  
  const activeTickets = tickets.filter(t => t.status === 'active');
  const completedTickets = tickets.filter(t => t.status !== 'active');
  
  const handleCheckResults = () => {
    checkResults();
    setActiveTab("completed");
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-lottery-dark mb-4">
              My Profile
            </h1>
            <p className="text-lottery-gray">
              Manage your account, view your tickets, and check your winnings.
            </p>
          </motion.div>
          
          <ProfileStats />
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-lottery-dark">My Tickets</h2>
              
              {activeTickets.length > 0 && (
                <Button 
                  variant="outline" 
                  className="border-lottery-blue text-lottery-blue hover:bg-lottery-blue/5"
                  onClick={handleCheckResults}
                >
                  Check Results
                </Button>
              )}
            </div>
            
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-lottery-light mb-6">
                <TabsTrigger 
                  value="active"
                  className="data-[state=active]:bg-white data-[state=active]:text-lottery-blue"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Active Tickets
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  className="data-[state=active]:bg-white data-[state=active]:text-lottery-blue"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed Tickets
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="focus-visible:outline-none focus-visible:ring-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <div className="col-span-full text-center py-8 text-lottery-gray">
                      <XCircle className="w-10 h-10 mx-auto mb-3 text-lottery-gray/50" />
                      <p>You don't have any active tickets.</p>
                      <Button 
                        className="mt-4 bg-lottery-blue hover:bg-lottery-blue/90"
                        onClick={() => window.location.href = '/purchase'}
                      >
                        Purchase Tickets
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="completed" className="focus-visible:outline-none focus-visible:ring-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTickets.length > 0 ? (
                    completedTickets.map((ticket, index) => (
                      <TicketCard 
                        key={ticket.id} 
                        numbers={ticket.numbers} 
                        index={index}
                        drawDate={ticket.drawDate}
                        status={ticket.status}
                        prize={ticket.prize}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-lottery-gray">
                      <XCircle className="w-10 h-10 mx-auto mb-3 text-lottery-gray/50" />
                      <p>You don't have any completed tickets yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
