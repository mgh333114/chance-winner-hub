
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import WinnerDisplay from '@/components/WinnerDisplay';
import { useLottery } from '@/context/LotteryContext';
import { Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Results = () => {
  const { winners } = useLottery();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const winnersPerPage = 6;
  
  // Filter winners by search term
  const filteredWinners = winners.filter(winner => 
    winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.id.includes(searchTerm)
  );
  
  // Paginate winners
  const indexOfLastWinner = currentPage * winnersPerPage;
  const indexOfFirstWinner = indexOfLastWinner - winnersPerPage;
  const currentWinners = filteredWinners.slice(indexOfFirstWinner, indexOfLastWinner);
  const totalPages = Math.ceil(filteredWinners.length / winnersPerPage);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
            className="mb-12 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-lottery-dark mb-4">
              Lottery Results
            </h1>
            <p className="text-lottery-gray max-w-2xl mx-auto">
              Check out our recent winners and see who struck it lucky! View past draw results and winning numbers.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-lottery-light rounded-2xl p-6 border border-lottery-blue/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-lottery-blue mr-2" />
                  <h2 className="text-lg font-bold text-lottery-dark">Latest Draw Results</h2>
                </div>
                
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lottery-gray w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by name or ID"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 py-2 w-full border-lottery-blue/20 focus:ring-lottery-blue focus:border-lottery-blue"
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentWinners.length > 0 ? (
              currentWinners.map((winner, index) => (
                <WinnerDisplay key={winner.id} {...winner} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-lottery-gray">
                <p className="text-lg mb-2">No results found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
          
          {filteredWinners.length > winnersPerPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center space-x-4"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={currentPage === 1}
                className="border-lottery-blue/20 text-lottery-blue hover:bg-lottery-blue/5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-lottery-gray">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="border-lottery-blue/20 text-lottery-blue hover:bg-lottery-blue/5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-lottery-dark mb-6 text-center">Latest Winning Numbers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  date: "June 2, 2023",
                  numbers: [7, 12, 23, 34, 42, 48],
                  prize: "$5,000,000"
                },
                {
                  date: "May 26, 2023",
                  numbers: [3, 11, 25, 33, 39, 45],
                  prize: "$3,750,000"
                },
                {
                  date: "May 19, 2023",
                  numbers: [5, 18, 22, 31, 40, 47],
                  prize: "$2,500,000"
                }
              ].map((draw, index) => (
                <div 
                  key={index} 
                  className="bg-lottery-light rounded-xl p-5 border border-lottery-blue/10"
                >
                  <p className="text-sm text-lottery-gray mb-2">{draw.date}</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {draw.numbers.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-full bg-white border border-lottery-blue/20 flex items-center justify-center font-medium text-lottery-dark shadow-sm"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  <p className="text-center font-bold text-lottery-blue">{draw.prize}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Results;
