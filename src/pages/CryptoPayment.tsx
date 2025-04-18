import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, ArrowLeft, Copy, Check, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PaymentProvider } from '@/context/PaymentContext';
import QRCode from 'react-qr-code';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create a wrapped component that uses the PaymentProvider
const CryptoPaymentContent = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [amount, setAmount] = useState<number>(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [startChecking, setStartChecking] = useState(false);
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

  // Auto-check payment status every 15 seconds once startChecking is true
  useEffect(() => {
    let checkInterval: number | null = null;
    
    if (startChecking && transactionId) {
      // Fix: Cast the return value of setInterval to number
      checkInterval = window.setInterval(() => {
        checkPaymentStatus(transactionId);
      }, 15000) as unknown as number; // Check every 15 seconds
    }
    
    return () => {
      if (checkInterval) window.clearInterval(checkInterval);
    };
  }, [startChecking, transactionId]);

  const generatePaymentAddress = async () => {
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      
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

      // Call our Edge Function to generate a payment address using Binance API
      const { data, error } = await supabase.functions.invoke('crypto-payment', {
        body: { 
          action: 'generate_address', 
          crypto_type: selectedCrypto,
          amount: amount,
          user_id: session.data.session.user.id
        }
      });
      
      if (error) {
        console.error("Error generating payment address:", error);
        throw new Error(error.message || 'Failed to generate payment address');
      }
      
      // Update state with the new payment details
      setAddress(data.address);
      setPaymentId(data.payment_id);
      setTransactionId(data.transaction_id);
      setPaymentStatus('pending');
      
      toast({
        title: "Payment address generated",
        description: `Send ${selectedCrypto.toUpperCase()} to the address below`,
      });
      
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error generating payment address",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const checkPaymentStatus = async (txId: string) => {
    try {
      setIsChecking(true);
      
      // Call our Edge Function to check payment status
      const { data, error } = await supabase.functions.invoke('crypto-payment', {
        body: { 
          action: 'check_payment', 
          transaction_id: txId 
        }
      });
      
      if (error) {
        console.error("Error checking payment:", error);
        throw new Error(error.message || 'Failed to check payment status');
      }
      
      setPaymentStatus(data.status);
      
      // If payment is completed, show success message and redirect
      if (data.status === 'completed') {
        await refreshBalance();
        
        toast({
          title: "Payment confirmed",
          description: `Your payment of KSh ${amount} has been received and credited to your account.`,
        });
        
        // Redirect to profile after successful payment
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      }
      
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error checking payment",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setHasCopied(true);
    
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
    
    // Reset copy state after 3 seconds
    setTimeout(() => setHasCopied(false), 3000);
  };

  const handleConfirmPayment = () => {
    if (!transactionId) {
      toast({
        title: "No active payment",
        description: "Please generate a payment address first",
        variant: "destructive",
      });
      return;
    }
    
    // Start checking for payment confirmation
    setStartChecking(true);
    checkPaymentStatus(transactionId);
    
    toast({
      title: "Checking for payment",
      description: "We'll automatically check for your payment every 15 seconds",
    });
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
              Send cryptocurrency to the generated address. Funds will be credited to your account after network confirmation.
            </p>
            
            <div className="space-y-6">
              {!transactionId ? (
                <>
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
                  
                  <Button 
                    onClick={generatePaymentAddress}
                    disabled={isGenerating || amount <= 0}
                    className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  >
                    {isGenerating ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating Address...</>
                    ) : (
                      <>Generate Payment Address</>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-6">
                  {paymentStatus === 'completed' ? (
                    <div className="bg-green-900/30 p-6 rounded-lg border border-green-500">
                      <h3 className="text-xl font-bold text-green-400 text-center mb-2">
                        Payment Confirmed!
                      </h3>
                      <p className="text-green-300 text-center">
                        Your payment of KSh {amount} has been received and credited to your account. Redirecting...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500/50 mb-4">
                        <p className="text-yellow-300 text-sm font-medium text-center">
                          Payment Status: <span className="font-bold">Pending</span>
                        </p>
                        <p className="text-yellow-300/80 text-xs text-center mt-1">
                          Send exactly KSh {amount} worth of {selectedCrypto.toUpperCase()} to the address below
                        </p>
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
                          {address}
                        </div>
                        
                        <div className="mt-4 flex justify-center bg-white p-4 rounded">
                          <QRCode 
                            value={address}
                            size={200}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            level={"L"}
                          />
                        </div>
                        
                        {paymentId && (
                          <div className="mt-4">
                            <span className="text-sm font-medium text-lottery-white/80">Payment ID:</span>
                            <div className="bg-lottery-dark p-2 rounded border border-lottery-green/30 text-xs font-mono break-all mt-1 text-lottery-white/90">
                              {paymentId}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-xs text-lottery-white/60 mt-4 text-center">
                          Send the exact amount to this address. Funds will be credited after network confirmations.
                        </p>
                      </div>
                    
                      <Button 
                        onClick={handleConfirmPayment}
                        disabled={isChecking || processingPayment}
                        className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                      >
                        {isChecking ? (
                          <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Checking Payment Status...</>
                        ) : (
                          <>I've Sent the Payment</>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Main component that wraps the content with PaymentProvider
const CryptoPayment = () => {
  return (
    <PaymentProvider>
      <CryptoPaymentContent />
    </PaymentProvider>
  );
};

export default CryptoPayment;
