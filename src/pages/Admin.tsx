
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Plus, X, Check, RefreshCw, RotateCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [jackpotAmount, setJackpotAmount] = useState(1000000);
  const [drawDate, setDrawDate] = useState('');
  const [newDrawLoading, setNewDrawLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Admin check: For now, we'll hardcode admin users by email
  // In a real app, you'd use a proper role system
  const ADMIN_EMAILS = ['admin@lottowin.com'];

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        const userEmail = session.session.user.email;
        // Check if user is admin
        if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
          setIsAdmin(true);
          // Load admin data
          loadAdminData();
        } else {
          setIsAdmin(false);
          navigate('/'); // Redirect non-admins
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin area",
            variant: "destructive"
          });
        }
      } else {
        navigate('/auth'); // Redirect to login
        toast({
          title: "Authentication Required",
          description: "Please log in to continue",
        });
      }
      
      setIsLoading(false);
    };
    
    checkAdmin();
  }, [navigate, toast]);

  const loadAdminData = async () => {
    try {
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
      
      // Load accounts (profiles)
      const { data: accountsData, error: accountsError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (accountsError) throw accountsError;
      setAccounts(accountsData || []);
      
      // Load draws
      const { data: drawsData, error: drawsError } = await supabase
        .from('draws')
        .select('*')
        .order('draw_date', { ascending: false })
        .limit(10);
      
      if (drawsError) throw drawsError;
      setDraws(drawsData || []);
      
    } catch (error: any) {
      console.error('Error loading admin data:', error.message);
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    const newValue = parseInt(value);
    if (isNaN(newValue) || newValue < 1 || newValue > 49) return;
    
    const newNumbers = [...winningNumbers];
    newNumbers[index] = newValue;
    setWinningNumbers(newNumbers);
  };

  const addNewNumber = () => {
    if (winningNumbers.length >= 6) return;
    setWinningNumbers([...winningNumbers, 1]);
  };

  const removeNumber = (index: number) => {
    const newNumbers = [...winningNumbers];
    newNumbers.splice(index, 1);
    setWinningNumbers(newNumbers);
  };

  const createNewDraw = async () => {
    if (winningNumbers.length !== 6) {
      toast({
        title: "Validation Error",
        description: "You must select exactly 6 winning numbers",
        variant: "destructive"
      });
      return;
    }
    
    if (!drawDate) {
      toast({
        title: "Validation Error",
        description: "Please select a draw date",
        variant: "destructive"
      });
      return;
    }
    
    setNewDrawLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('draws')
        .insert({
          winning_numbers: winningNumbers,
          draw_date: new Date(drawDate).toISOString(),
          jackpot: jackpotAmount,
          status: 'scheduled'
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Draw Created",
        description: "New lottery draw has been scheduled",
      });
      
      // Reset form and reload data
      setWinningNumbers([]);
      setDrawDate('');
      loadAdminData();
      
    } catch (error: any) {
      console.error('Error creating draw:', error.message);
      toast({
        title: "Error Creating Draw",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setNewDrawLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleRefresh = () => {
    loadAdminData();
    toast({
      title: "Data Refreshed",
      description: "Admin data has been updated",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lottery-blue" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-lottery-dark">Admin Dashboard</h1>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
            </Button>
          </div>
          
          <Tabs defaultValue="draws">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="draws">Lottery Draws</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="accounts">User Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="draws" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Draw</CardTitle>
                  <CardDescription>
                    Set up the next lottery draw with winning numbers and jackpot amount
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Winning Numbers</label>
                      <div className="flex flex-wrap items-center gap-2">
                        {winningNumbers.map((number, index) => (
                          <div key={index} className="flex items-center">
                            <Input
                              type="number"
                              min={1}
                              max={49}
                              value={number}
                              onChange={(e) => handleNumberChange(index, e.target.value)}
                              className="w-16 mr-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeNumber(index)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {winningNumbers.length < 6 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addNewNumber}
                            className="h-9"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Number
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Select 6 numbers from 1-49 for the winning combination
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Jackpot Amount</label>
                        <Input
                          type="number"
                          min={10000}
                          step={10000}
                          value={jackpotAmount}
                          onChange={(e) => setJackpotAmount(Number(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Draw Date</label>
                        <Input
                          type="datetime-local"
                          value={drawDate}
                          onChange={(e) => setDrawDate(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      className="w-full"
                      onClick={createNewDraw}
                      disabled={newDrawLoading}
                    >
                      {newDrawLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" /> Create Draw
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Draws</CardTitle>
                  <CardDescription>
                    View and manage lottery draw history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Date</TableHead>
                          <TableHead>Winning Numbers</TableHead>
                          <TableHead>Jackpot</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draws.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              No draws found
                            </TableCell>
                          </TableRow>
                        ) : (
                          draws.map((draw) => (
                            <TableRow key={draw.id}>
                              <TableCell>{formatDate(draw.draw_date)}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {draw.winning_numbers.map((num: number, i: number) => (
                                    <span 
                                      key={i} 
                                      className="inline-flex items-center justify-center w-8 h-8 bg-lottery-blue text-white text-sm font-medium rounded-full"
                                    >
                                      {num}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>{formatCurrency(draw.jackpot)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  draw.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    View and manage payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Date</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Demo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">
                              No transactions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{formatDate(transaction.created_at)}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {transaction.user_id.substring(0, 8)}...
                              </TableCell>
                              <TableCell className="capitalize">{transaction.type}</TableCell>
                              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  transaction.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : transaction.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {transaction.is_demo ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : (
                                  <X className="h-5 w-5 text-red-500" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="accounts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Accounts</CardTitle>
                  <CardDescription>
                    View and manage user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Account Type</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              No accounts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          accounts.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-mono text-xs">
                                {account.id.substring(0, 8)}...
                              </TableCell>
                              <TableCell>{account.email}</TableCell>
                              <TableCell>{account.username || 'N/A'}</TableCell>
                              <TableCell className="capitalize">{account.account_type}</TableCell>
                              <TableCell>{formatDate(account.created_at)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
