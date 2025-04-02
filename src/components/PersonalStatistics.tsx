
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

// Common colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0'];

interface NumberFrequency {
  number: number;
  frequency: number;
}

interface WinTrend {
  month: string;
  wins: number;
  tickets: number;
}

interface MostPlayed {
  number: number;
  count: number;
}

interface StatData {
  ticketsPlayed: number;
  winningTickets: number;
  mostPlayedNumbers: MostPlayed[];
  numberFrequency: NumberFrequency[];
  winTrend: WinTrend[];
  winRate: number;
}

const initialData: StatData = {
  ticketsPlayed: 0,
  winningTickets: 0,
  mostPlayedNumbers: [],
  numberFrequency: [],
  winTrend: [],
  winRate: 0
};

const PersonalStatistics = () => {
  const [stats, setStats] = useState<StatData>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }
      
      try {
        // Get all user tickets
        const { data: tickets, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (error) throw error;
        
        if (!tickets || tickets.length === 0) {
          setLoading(false);
          return;
        }
        
        // Calculate basic stats
        const winningTickets = tickets.filter(t => t.status === 'won');
        const winRate = tickets.length ? (winningTickets.length / tickets.length) * 100 : 0;
        
        // Calculate most played numbers
        const numberFrequency: Record<number, number> = {};
        tickets.forEach(ticket => {
          ticket.numbers.forEach(num => {
            numberFrequency[num] = (numberFrequency[num] || 0) + 1;
          });
        });
        
        const sortedNumbers = Object.entries(numberFrequency)
          .map(([num, count]) => ({ number: parseInt(num), count }))
          .sort((a, b) => b.count - a.count);
        
        const mostPlayedNumbers = sortedNumbers.slice(0, 5);
        
        // Format number frequency for chart
        const formattedFrequency = sortedNumbers
          .slice(0, 10)
          .map(({ number, count }) => ({ number, frequency: count }));
        
        // Calculate win trend by month
        const ticketsByMonth: Record<string, { wins: number, tickets: number }> = {};
        tickets.forEach(ticket => {
          const date = new Date(ticket.created_at);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          
          if (!ticketsByMonth[monthYear]) {
            ticketsByMonth[monthYear] = { wins: 0, tickets: 0 };
          }
          
          ticketsByMonth[monthYear].tickets += 1;
          
          if (ticket.status === 'won') {
            ticketsByMonth[monthYear].wins += 1;
          }
        });
        
        const winTrend = Object.entries(ticketsByMonth)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => {
            const [aMonth, aYear] = a.month.split('/').map(Number);
            const [bMonth, bYear] = b.month.split('/').map(Number);
            return (aYear * 12 + aMonth) - (bYear * 12 + bMonth);
          });
        
        setStats({
          ticketsPlayed: tickets.length,
          winningTickets: winningTickets.length,
          mostPlayedNumbers,
          numberFrequency: formattedFrequency,
          winTrend,
          winRate
        });
      } catch (error) {
        console.error('Error fetching player statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerStats();
  }, []);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-purple-50 rounded-lg mr-3">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold text-lottery-dark">Your Statistics</h2>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  const noDataMessage = (
    <div className="text-center py-12 text-lottery-gray">
      <Star className="w-12 h-12 mx-auto mb-3 text-lottery-gray/30" />
      <p className="text-lg">Play some lottery games to see your statistics</p>
      <p className="text-sm mt-2 max-w-md mx-auto">
        Your personal play patterns, win rates, and most frequently played numbers will appear here.
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-purple-50 rounded-lg mr-3">
          <TrendingUp className="w-5 h-5 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold text-lottery-dark">Your Statistics</h2>
      </div>

      {stats.ticketsPlayed === 0 ? (
        noDataMessage
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tickets Played</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.ticketsPlayed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Winning Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.winningTickets}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="wintrend">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="wintrend" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">Win Trends</span>
              </TabsTrigger>
              <TabsTrigger value="numbers" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Number Frequency</span>
              </TabsTrigger>
              <TabsTrigger value="mostplayed" className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                <span className="hidden md:inline">Most Played</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wintrend">
              <Card>
                <CardHeader>
                  <CardTitle>Win Trends Over Time</CardTitle>
                  <CardDescription>Your winning pattern over the months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.winTrend}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="tickets" stroke="#8884d8" name="Tickets Played" />
                        <Line type="monotone" dataKey="wins" stroke="#82ca9d" name="Wins" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="numbers">
              <Card>
                <CardHeader>
                  <CardTitle>Number Frequency</CardTitle>
                  <CardDescription>How often you play each number</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.numberFrequency}>
                        <XAxis dataKey="number" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="frequency" fill="#8884d8" name="Times Played" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mostplayed">
              <Card>
                <CardHeader>
                  <CardTitle>Most Played Numbers</CardTitle>
                  <CardDescription>Your favorite lottery numbers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.mostPlayedNumbers}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="number"
                        >
                          {stats.mostPlayedNumbers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
};

export default PersonalStatistics;
