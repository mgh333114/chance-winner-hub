
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { safeCast } from '@/lib/supabaseUtils';

interface ResultData {
  id: string;
  draw_date: string;
  winning_numbers: number[];
  jackpot: number;
  status: string;
}

const ResultsArchive = () => {
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const pageSize = 5;
  
  const fetchResults = async (pageNumber: number = 0) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .eq('status', 'completed')
        .order('draw_date', { ascending: false })
        .range(pageNumber * pageSize, (pageNumber * pageSize) + pageSize - 1);
        
      if (error) throw error;
      
      if (data) {
        const typedData = safeCast<ResultData>(data);
        
        if (pageNumber === 0) {
          setResults(typedData);
        } else {
          setResults(prev => [...prev, ...typedData]);
        }
        
        // Check if we've reached the end of results
        setHasMoreResults(typedData.length === pageSize);
      }
    } catch (error: any) {
      console.error('Error fetching results:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchResults();
    
    // Subscribe to new draw results
    const channel = supabase
      .channel('public:draws')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'draws',
        filter: 'status=eq.completed' 
      }, (payload) => {
        // Add the new result to the top of the list
        setResults(prev => [payload.new as ResultData, ...prev]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(nextPage);
  };

  const formatJackpot = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-50 rounded-lg mr-3">
          <Calendar className="w-5 h-5 text-lottery-blue" />
        </div>
        <h2 className="text-xl font-bold text-lottery-dark">Results Archive</h2>
      </div>
      
      {loading && results.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lottery-blue"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-lottery-gray">
          No past results available.
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Table>
              <TableCaption>Historical lottery draw results</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Draw Date</TableHead>
                  <TableHead>Winning Numbers</TableHead>
                  <TableHead>Jackpot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      {formatDate(new Date(result.draw_date))}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {result.winning_numbers.map((num, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-lottery-gold/10 text-lottery-gold font-semibold text-sm"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 text-lottery-gold mr-1" />
                        {formatJackpot(result.jackpot)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
          
          {hasMoreResults && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                className="border-lottery-blue text-lottery-blue hover:bg-lottery-blue/5"
              >
                {loading ? "Loading..." : "Load More Results"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsArchive;
