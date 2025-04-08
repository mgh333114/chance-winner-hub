
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, ArrowLeft, Copy, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CryptoPayment = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [amount, setAmount] = useState<number>(0);
  const [hasCopied, setHasCopied] = useState(false);
  const { processingPayment, refreshBalance } = usePayment();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get amount from location state if available
    if (location.state?.amount) {
      setAmount(location.state.amount);
    }
  }, [location]);

  const cryptoAddresses = {
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    usdt: 'TKVxYEtQUB3XLiHpKqZzbCEY1QTQQBmApi',
    usdc: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]);
    setHasCopied(true);
    
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
    
    // Reset copy state after 3 seconds
    setTimeout(() => setHasCopied(false), 3000);
  };

  const handleConfirmPayment = async () => {
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Create a pending transaction in the database
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: session.data.session.user.id,
          amount: amount,
          type: 'deposit',
          status: 'pending',
          is_demo: false,
          details: { 
            method: 'crypto',
            crypto_type: selectedCrypto,
            address: cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses],
            requested_at: new Date().toISOString()
          }
        });
      
      if (error) {
        console.error("Error creating transaction:", error);
        throw new Error(error.message);
      }
      
      // Refresh balance to show pending transactions
      await refreshBalance();
      
      toast({
        title: "Payment registered",
        description: `Your crypto payment of KSh ${amount} has been registered. Funds will be credited after confirmation.`,
      });
      
      // Redirect to profile after successful registration
      navigate('/profile');
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      toast({
        title: "Error registering payment",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-lottery-black">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <Link to="/profile" className="text-lottery-white flex items-center mb-6 hover:text-lottery-gold transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-lottery-dark/50 rounded-2xl p-8 border border-lottery-green/30"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="bg-purple-600 p-4 rounded-full">
                <Bitcoin className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-lottery-gold text-center mb-6">
              Cryptocurrency Payment
            </h1>
            
            <p className="text-lottery-white/80 text-center mb-8">
              Send cryptocurrency to the address below. Funds will be credited to your account after network confirmation.
            </p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="crypto-type" className="text-lottery-white">Select Cryptocurrency</Label>
                <Select
                  value={selectedCrypto}
                  onValueChange={setSelectedCrypto}
                >
                  <SelectTrigger className="bg-lottery-black border-lottery-green/50 text-lottery-white">
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent className="bg-lottery-dark text-lottery-white border-lottery-green/50">
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT)</SelectItem>
                    <SelectItem value="usdc">USD Coin (USDC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-lottery-white">Amount (KSh)</Label>
                <Input 
                  id="amount" 
                  type="number"
                  placeholder="Enter amount" 
                  className="bg-lottery-black border-lottery-green/50 text-lottery-white"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              
              <div className="bg-lottery-black/50 p-4 rounded-lg border border-lottery-green/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-lottery-white/80">Wallet Address:</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs text-lottery-gold hover:text-lottery-gold/80"
                    onClick={handleCopyAddress}
                  >
                    {hasCopied ? (
                      <><Check className="w-3 h-3 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>
                <div className="bg-lottery-dark p-2 rounded border border-lottery-green/30 text-xs font-mono break-all text-lottery-white/90">
                  {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
                </div>
                
                <div className="mt-4 flex justify-center bg-white p-4 rounded">
                  <QRCode 
                    value={cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    level={"L"}
                  />
                </div>
                
                <p className="text-xs text-lottery-white/60 mt-4 text-center">
                  Send the exact amount to this address. Funds will be credited after network confirmations.
                </p>
              </div>
              
              <Button 
                onClick={handleConfirmPayment}
                disabled={processingPayment || amount <= 0}
                className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                I've Sent the Payment
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CryptoPayment;
