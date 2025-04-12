import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Save, Plus, X, Check, RefreshCw, RotateCw, AlertCircle, 
  DollarSign, Users, BarChart3, Wallet, CreditCard, Bitcoin, AlertTriangle 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUserAccounts } from '@/hooks/useUserAccounts';
import { useCryptoPayments } from '@/hooks/useCryptoPayments';

interface WithdrawalDetails {
  rejection_reason?: string;
  method?: string;
  account_number?: string;
  wallet_address?: string;
  phone_number?: string;
  [key: string]: any;
}

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [jackpotAmount, setJackpotAmount] = useState(1000000);
  const [drawDate, setDrawDate] = useState('');
  const [newDrawLoading, setNewDrawLoading] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [totalStaked, setTotalStaked] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { accounts, isLoading: accountsLoading, refreshAccounts } = useUserAccounts();
  const { 
    payments: cryptoPayments, 
    isLoading: cryptoPaymentsLoading, 
    approvePayment,
    rejectPayment,
    refreshPayments 
  } = useCryptoPayments();

  const ADMIN_EMAIL = "admin001@gmail.com";
  const ADMIN_PASSWORD = "3123jeff";

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        handleAdminCheck(session.session.user.email);
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);

    try {
      if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
        setIsAdmin(true);
        setIsAuthenticated(true);
        loadAdminData();
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the admin dashboard",
        });
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      
      if (error) throw error;
      
      handleAdminCheck(adminEmail);
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Authentication Failed",
        description: "Invalid admin credentials",
        variant: "destructive"
      });
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminCheck = (email: string | null) => {
    if (email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setIsAuthenticated(true);
      loadAdminData();
    } else {
      setIsAdmin(false);
      setIsAuthenticated(false);
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const loadAdminData = async () => {
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
      
      const { data: drawsData, error: drawsError } = await supabase
        .from('draws')
        .select('*')
        .order('draw_date', { ascending: false })
        .limit(10);
      
      if (drawsError) throw drawsError;
      setDraws(drawsData || []);

      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('transactions')
        .select('*, profiles:user_id(email, username)')
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (withdrawalsError) throw withdrawalsError;
      
      const mappedWithdrawals = (withdrawalsData || []).map(item => {
        const profileData = item.profiles as { email?: string, username?: string } | null;
        
        return {
          ...item,
          email: profileData?.email || 'Unknown',
          username: profileData?.username || 'Unknown User'
        };
      });
      
      setPendingWithdrawals(mappedWithdrawals);

      setTotalStaked(Math.floor(Math.random() * 100000) + 50000);
      
      setGames([
        { id: 1, name: 'Aviator', active_players: 24, total_staked: 12500, status: 'active' },
        { id: 2, name: 'Wheel of Fortune', active_players: 17, total_staked: 8750, status: 'active' },
        { id: 3, name: 'Scratch Cards', active_players: 33, total_staked: 16500, status: 'active' },
        { id: 4, name: 'Dice Game', active_players: 12, total_staked: 6000, status: 'active' },
      ]);
      
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
    setDrawError(null);
    
    if (winningNumbers.length !== 6) {
      setDrawError("You must select exactly 6 winning numbers");
      toast({
        title: "Validation Error",
        description: "You must select exactly 6 winning numbers",
        variant: "destructive"
      });
      return;
    }
    
    if (!drawDate) {
      setDrawError("Please select a draw date");
      toast({
        title: "Validation Error",
        description: "Please select a draw date",
        variant: "destructive"
      });
      return;
    }
    
    const uniqueNumbers = new Set(winningNumbers);
    if (uniqueNumbers.size !== winningNumbers.length) {
      setDrawError("Winning numbers must be unique");
      toast({
        title: "Validation Error",
        description: "Winning numbers must be unique",
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
      
      setWinningNumbers([]);
      setDrawDate('');
      loadAdminData();
      
    } catch (error: any) {
      console.error('Error creating draw:', error.message);
      setDrawError(error.message);
      toast({
        title: "Error Creating Draw",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setNewDrawLoading(false);
    }
  };

  const handleWithdrawalAction = async (id: string, approve: boolean) => {
    try {
      const updateData: { 
        status: string; 
        details?: WithdrawalDetails;
      } = approve 
        ? { status: 'completed' } 
        : { 
            status: 'rejected',
            details: { rejection_reason: 'Rejected by admin' }
          };
      
      if (!approve) {
        const { data: transactionData } = await supabase
          .from('transactions')
          .select('details')
          .eq('id', id)
          .single();
          
        if (transactionData) {
          const existingDetails = typeof transactionData.details === 'object' && transactionData.details !== null 
            ? transactionData.details as WithdrawalDetails
            : {};
            
          updateData.details = {
            ...existingDetails,
            rejection_reason: 'Rejected by admin'
          };
        }
      }
      
      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: approve ? "Withdrawal Approved" : "Withdrawal Rejected",
        description: approve ? 
          "The withdrawal request has been approved and will be processed" : 
          "The withdrawal request has been rejected",
      });
      
      loadAdminData();
    } catch (error: any) {
      console.error('Error updating withdrawal:', error.message);
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
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
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRefresh = () => {
    loadAdminData();
    refreshAccounts();
    refreshPayments();
    
    toast({
      title: "Data Refreshed",
      description: "Admin data has been updated",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin dashboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lottery-black">
        <Loader2 className="w-8 h-8 animate-spin text-lottery-gold" />
      </div>
    );
  }

  if (!isAdmin || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-lottery-black">
        <Navbar />
        
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-md">
            <Card className="border border-lottery-green/30 bg-lottery-black/70 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-2xl text-lottery-gold">Admin Login</CardTitle>
                <CardDescription className="text-lottery-white/70">
                  Enter your credentials to access the admin dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-lottery-white">
                      Email
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="bg-lottery-black/50 border-lottery-green/30 text-lottery-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-lottery-white">
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="bg-lottery-black/50 border-lottery-green/30 text-lottery-white"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={adminLoginLoading}
                    className="w-full bg-lottery-green hover:bg-lottery-green/80 text-lottery-black font-medium"
                  >
                    {adminLoginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Access Admin Dashboard
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lottery-black">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-lottery-gold">Admin Dashboard</h1>
            <div className="flex space-x-3">
              <Button onClick={handleRefresh} variant="outline" size="sm" className="border-lottery-green/30 text-lottery-white hover:bg-lottery-green/10">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="border-lottery-red/30 text-lottery-white hover:bg-lottery-red/10">
                Log Out
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="accounts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 mb-8 bg-lottery-black border border-lottery-green/30">
              <TabsTrigger value="accounts" className="text-lottery-white data-[state=active]:bg-lottery-green data-[state=active]:text-lottery-black">
                Live Accounts
              </TabsTrigger>
              <TabsTrigger value="crypto" className="text-lottery-white data-[state=active]:bg-lottery-green data-[state=active]:text-lottery-black">
                Crypto Payments
              </TabsTrigger>
              <TabsTrigger value="draws" className="text-lottery-white data-[state=active]:bg-lottery-green data-[state=active]:text-lottery-black">
                Lottery Draws
              </TabsTrigger>
              <TabsTrigger value="games" className="text-lottery-white data-[state=active]:bg-lottery-green data-[state=active]:text-lottery-black">
                Active Games
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="text-lottery-white data-[state=active]:bg-lottery-green data-[state=active]:text-lottery-black">
                Pending Withdrawals
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-lottery-white data-[state=active]:bg-lottery-green data-[state=active]:text-lottery-black">
                All Transactions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts" className="space-y-6">
              <Card className="border border-lottery-green/30 bg-lottery-black/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lottery-gold">Live User Accounts</CardTitle>
                  <CardDescription className="text-lottery-white/70">
                    View real-time user accounts with current balances and activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-lottery-green/30">
                          <TableHead className="text-lottery-white">User ID</TableHead>
                          <TableHead className="text-lottery-white">Email</TableHead>
                          <TableHead className="text-lottery-white">Username</TableHead>
                          <TableHead className="text-lottery-white">Account Type</TableHead>
                          <TableHead className="text-lottery-white">Balance</TableHead>
                          <TableHead className="text-lottery-white">Current Game</TableHead>
                          <TableHead className="text-lottery-white">Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountsLoading ? (
                          <TableRow className="border-lottery-green/20">
                            <TableCell colSpan={7} className="text-center text-lottery-white/50">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : accounts.length === 0 ? (
                          <TableRow className="border-lottery-green/20">
                            <TableCell colSpan={7} className="text-center text-lottery-white/50">
                              No accounts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          accounts.map((account) => (
                            <TableRow key={account.id} className="border-lottery-green/20">
                              <TableCell className="font-mono text-xs text-lottery-white">
                                {account.id.substring(0, 8)}...
                              </TableCell>
                              <TableCell className="text-lottery-white">{account.email || 'N/A'}</TableCell>
                              <TableCell className="text-lottery-white">{account.username || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge className={`${
                                  account.account_type === 'real' 
                                    ? 'bg-lottery-green hover:bg-lottery-green/90 text-lottery-black' 
                                    : 'bg-lottery-blue hover:bg-lottery-blue/90 text-white'
                                }`}>
                                  {account.account_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-lottery-white font-medium">
                                {formatCurrency(account.balance)}
                              </TableCell>
                              <TableCell className="text-lottery-white">
                                {account.current_game ? (
                                  <Badge variant="outline" className="border-lottery-gold text-lottery-gold">
                                    {account.current_game}
                                  </Badge>
                                ) : (
                                  <span className="text-lottery-white/50">Not playing</span>
                                )}
                              </TableCell>
                              <TableCell className="text-lottery-white">{formatDate(account.created_at)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-6">
              <Card className="border border-lottery-green/30 bg-lottery-black/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lottery-gold">Pending Crypto Payments</CardTitle>
                  <CardDescription className="text-lottery-white/70">
                    Review and approve crypto payments awaiting confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-lottery-green/30">
                          <TableHead className="w-[180px] text-lottery-white">Date</TableHead>
                          <TableHead className="text-lottery-white">User</TableHead>
                          <TableHead className="text-lottery-white">Amount</TableHead>
                          <TableHead className="text-lottery-white">Currency</TableHead>
                          <TableHead className="text-lottery-white">Transaction Hash</TableHead>
                          <TableHead className="text-lottery-white">Status</TableHead>
                          <TableHead className="text-lottery-white text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cryptoPaymentsLoading ? (
                          <TableRow className="border-lottery-green/20">
                            <TableCell colSpan={7} className="text-center text-lottery-white/50">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </TableCell>
                          </TableRow>
                        ) : cryptoPayments.length === 0 ? (
                          <TableRow className="border-lottery-green/20">
                            <TableCell colSpan={7} className="text-center text-lottery-white/50">
                              No pending crypto payments
                            </TableCell>
                          </TableRow>
                        ) : (
                          cryptoPayments.map((payment) => (
                            <TableRow key={payment.id} className="border-lottery-green/20">
                              <TableCell className="text-lottery-white">{formatDate(payment.created_at)}</TableCell>
                              <TableCell className="text-lottery-white">
                                {payment.username || payment.email || payment.user_id.substring(0, 8) + '...'}
                              </TableCell>
                              <TableCell className="font-medium text-lottery-white">{formatCurrency(payment.amount)}</TableCell>
                              <TableCell className="text-lottery-white">
                                {payment?.details?.currency || 'BTC'}
                                <Bitcoin className="h-4 w-4 inline-block ml-1 text-yellow-500" />
                              </TableCell>
                              <TableCell className="font-mono text-xs text-lottery-white/70">
                                {payment?.details?.transaction_hash ? 
                                  payment.details.transaction_hash.substring(0, 12) + '...' : 
                                  'Not provided'}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                  Pending Approval
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => approvePayment(payment.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => rejectPayment(payment.id)}
                                    className="border-lottery-red text-lottery-red hover:bg-lottery-red/10"
                                  >
                                    <X className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                </div>
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
            
            <TabsContent value="draws" className="space-y-6">
              <Card className="border border-lottery-green/30 bg-lottery-black/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lottery-gold">Create New Draw</CardTitle>
                  <CardDescription className="text-lottery-white/70">
                    Set up the next lottery draw with winning numbers and jackpot amount
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-lottery-white">
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
                              className="w-16 mr-1 bg-lottery-black/50 border-lottery-green/40 text-lottery-white"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeNumber(index)}
                              className="h-8 w-8 text-lottery-red hover:text-lottery-red/80 hover:bg-lottery-red/10"
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
                            className="h-9 border-lottery-green/40 text-lottery-neonGreen hover:bg-lottery-green/10"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Number
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-lottery-white/50 mt-1">
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
                          className="bg-lottery-black/50 border-lottery-green/40 text-lottery-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Draw Date</label>
                        <Input
                          type="datetime-local"
                          value={drawDate}
                          onChange={(e) => setDrawDate(e.target.value)}
                          className="bg-lottery-black/50 border-lottery-green/40 text-lottery-white"
                        />
                      </div>
                    </div>
                    
                    {drawError && (
                      <div className="bg-red-950/30 border border-red-500/50 p-3 rounded-md flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-200">{drawError}</p>
                      </div>
                    )}
                    
                    <Button 
                      type="button" 
                      className="w-full bg-lottery-green hover:bg-lottery-green/80 text-lottery-black font-medium"
                      onClick={createNewDraw}
                      disabled={newDrawLoading}
                    >
                      {newDrawLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" /> Create Draw
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-lottery-green/30 bg-lottery-black/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lottery-gold">Recent Draws</CardTitle>
                  <CardDescription className="text-lottery-white/70">
                    View and manage lottery draw history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-lottery-green/30">
                          <TableHead className="w-[180px] text-lottery-white">Date</TableHead>
                          <TableHead className="text-lottery-white">Winning Numbers</TableHead>
                          <TableHead className="text-lottery-white">Jackpot</TableHead>
                          <TableHead className="text-lottery-white">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draws.length === 0 ? (
                          <TableRow className="border-lottery-green/20">
                            <TableCell colSpan={4} className="text-center text-lottery-white/50">
                              No draws found
                            </TableCell>
                          </TableRow>
                        ) : (
                          draws.map((draw) => (
                            <TableRow key={draw.id} className="border-lottery-green/20">
                              <TableCell className="text-lottery-white">{formatDate(draw.draw_date)}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {draw.winning_numbers.map((num: number, i: number) => (
                                    <span 
                                      key={i} 
                                      className="inline-flex items-center justify-center w-8 h-8 bg-lottery-green text-lottery-black text-sm font-medium rounded-full"
                                    >
                                      {num}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-lottery-white">{formatCurrency(draw.jackpot)}</TableCell>
                              <TableCell>
                                <Badge className={`${
                                  draw.status === 'completed' 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-lottery-blue hover:bg-lottery-blue/90'
                                } text-white`}>
                                  {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                                </Badge>
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

            <TabsContent value="games" className="space-y-6">
              <Card className="border border-lottery-green/30 bg-lottery-black/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lottery-gold">Active Games</CardTitle>
                  <CardDescription className="text-lottery-white/70">
                    Monitor currently active games and stakes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-lottery-green/30">
                          <TableHead className="text-lottery-white">Game</TableHead>
                          <TableHead className="text-lottery-white">Active Players</TableHead>
                          <TableHead className="text-lottery-white">Total Staked</TableHead>
                          <TableHead className="text-lottery-white">Status</TableHead>
                          <TableHead className="text-lottery-white text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {games.length === 0 ? (
                          <TableRow className="border-lottery-green/20">
                            <TableCell colSpan={5} className="text-center text-lottery-white/50">
                              No active games found
                            </TableCell>
                          </TableRow>
                        ) : (
                          games.map((game) => (
                            <TableRow key={game.id} className="border-lottery-green/20">
                              <TableCell className="font-medium text-lottery-white">
                                {game.name}
                              </TableCell>
                              <TableCell className="text-lottery-white">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-lottery-neonGreen" />
                                  {game.active_players}
                                </div>
                              </TableCell>
                              <TableCell className="text-lottery-white">{formatCurrency(game.total_staked)}</TableCell>
                              <TableCell>
                                <Badge className="bg-green-600 hover:bg-green-700 text-white">
                                  {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-lottery-green/30 text-lottery-white hover:bg-lottery-green/10"
                                >
                                  <BarChart3 className="h-4 w-4 mr-1" /> View Stats
                                </Button>
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

            <TabsContent value="withdrawals" className="space-y-6">
              <Card className="border border-lottery-green/30 bg-lottery-black/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lottery-gold">Pending Withdrawals</CardTitle>
                  <CardDescription className="text-lottery-white/70">
                    Review and approve user withdrawal requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-lottery-green/30">
                          <TableHead className="w-[180px] text-lottery-white">Date</TableHead>
                          <TableHead className="text-lottery-white">User</TableHead>
                          <TableHead className="text-lottery-white">Amount</TableHead>
                          <TableHead className="text-lottery-white">Method</TableHead>
                          <TableHead className="text-lottery-white">Details</TableHead>
                          <TableHead className="text-lottery-white text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingWithdrawals.length === 0 ? (
                          <TableRow className="border-lottery-green/20">
                            <TableCell colSpan={6} className="text-center text-lottery-white/50">
                              No pending withdrawal requests
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingWithdrawals.map((withdrawal) => (
                            <TableRow key={withdrawal.id} className="border-lottery-green/20">
                              <TableCell className="text-lottery-white">
                                {formatDate(withdrawal.created_at)}
                              </TableCell>
                              <TableCell className="text-lottery-white">
                                {withdrawal.username} 
                                <span className="block text-xs text-lottery-white/50">{withdrawal.email}</span>
                              </TableCell>
                              <TableCell className="font-medium text-lottery-white">
                                {formatCurrency(withdrawal.amount)}
                              </TableCell>
                              <TableCell className="text-lottery-white">
                                {withdrawal?.details?.method === 'crypto' ? (
                                  <div className="flex items-center space-x-1">
                                    <Bitcoin className="h-4 w-4 text-yellow-500" />
                                    <span>Crypto</span>
                                  </div>
                                ) : withdrawal?.details?.method === 'bank' ? (
                                  <div className="flex items-center space-x-1">
                                    <CreditCard className="h-4 w-4 text-blue-500" />
                                    <span>Bank Transfer</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1">
                                    <Wallet className="h-4 w-4 text-green-500" />
                                    <span>M-Pesa</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-lottery-white">
                                {withdrawal?.details?.account_number || withdrawal?.details?.wallet_address || withdrawal?.details?.phone_number ? (
                                  withdrawal?.details?.account_number ? 
                                    `Acct: ${withdrawal.details.account_number.substring(0, 4)}...` :
                                    withdrawal?.details?.wallet_address ?
                                      `Wallet: ${withdrawal.details.wallet_address.substring(0, 6)}...` :
                                      `Phone: ${withdrawal.details.phone_number}`
                                ) : (
                                  'No details provided'
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleWithdrawalAction(withdrawal.id, true)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleWithdrawalAction(withdrawal.id, false)}
                                    className="border-lottery-red text-lottery-red hover:bg-lottery-red/10"
                                  >
                                    <X className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                </div>
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
              <Card className="border border-lottery-green/30 bg-lottery-black/70 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lottery-gold">All Transactions</CardTitle>
                  <CardDescription className="text-lottery-white/70">
                    View history of all platform transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-lottery-green/30">
                          <TableHead className="w-[180px] text-lottery-white">Date</TableHead>
                          <TableHead className="text-lottery-white">Type</TableHead>
                          <TableHead className="text-lottery-white">User ID</TableHead>
                          <TableHead className="text-lottery-white">Amount</TableHead>
                          <TableHead className="text-lottery-white">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.length === 0 ? (
                          <TableRow className="border-lottery-green/20">
                            <TableCell colSpan={5} className="text-center text-lottery-white/50">
                              No transactions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          transactions.map((transaction) => (
                            <TableRow key={transaction.id} className="border-lottery-green/20">
                              <TableCell className="text-lottery-white">
                                {formatDate(transaction.created_at)}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${
                                  transaction.type === 'deposit' 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : transaction.type === 'withdrawal'
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : transaction.type === 'purchase'
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                } text-white`}>
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-lottery-white">
                                {transaction.user_id?.substring(0, 8)}...
                              </TableCell>
                              <TableCell className="text-lottery-white font-medium">
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  transaction.status === 'completed' 
                                    ? 'default' 
                                    : transaction.status === 'pending'
                                    ? 'outline'
                                    : 'destructive'
                                } className={`${
                                  transaction.status === 'completed' 
                                    ? 'bg-lottery-green hover:bg-lottery-green/90 text-lottery-black' 
                                    : transaction.status === 'pending'
                                    ? 'border-lottery-gold text-lottery-gold'
                                    : ''
                                }`}>
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </Badge>
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
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
