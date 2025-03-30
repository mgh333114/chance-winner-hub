
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface BetHistoryItem {
  id: string;
  multiplier: number;
  timestamp: Date;
}

interface AviatorHistoryProps {
  history: BetHistoryItem[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

const AviatorHistory = ({ 
  history, 
  currentPage, 
  onPageChange, 
  itemsPerPage = 5 
}: AviatorHistoryProps) => {
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);
  
  // Calculate if there's a trend (up, down, or neutral)
  const calculateTrend = () => {
    if (history.length < 2) return "neutral";
    
    const lastFiveMultipliers = history.slice(0, 5).map(item => item.multiplier);
    const average = lastFiveMultipliers.reduce((a, b) => a + b, 0) / lastFiveMultipliers.length;
    const previousFiveMultipliers = history.slice(5, 10).map(item => item.multiplier);
    
    if (previousFiveMultipliers.length === 0) return "neutral";
    
    const previousAverage = previousFiveMultipliers.reduce((a, b) => a + b, 0) / previousFiveMultipliers.length;
    
    if (average > previousAverage) return "up";
    if (average < previousAverage) return "down";
    return "neutral";
  };
  
  const trend = calculateTrend();
  
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Crashes</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trend:</span>
          {trend === "up" && <ChevronUp className="text-green-500" />}
          {trend === "down" && <ChevronDown className="text-red-500" />}
          {trend === "neutral" && <span className="text-gray-400">―</span>}
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Time</TableHead>
            <TableHead className="text-right">Multiplier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedHistory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center text-gray-500">
                No history available yet
              </TableCell>
            </TableRow>
          ) : (
            paginatedHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.timestamp.toLocaleTimeString()}
                </TableCell>
                <TableCell className={`text-right font-semibold ${
                  item.multiplier < 1.5 ? 'text-red-500' : 
                  item.multiplier < 3 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {item.multiplier.toFixed(2)}x
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="py-2 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink 
                    onClick={() => onPageChange(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AviatorHistory;
