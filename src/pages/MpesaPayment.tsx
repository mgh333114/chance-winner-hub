
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PaymentProvider } from '@/context/PaymentContext';
import { supabase } from '@/integrations/supabase/client';

// Create a wrapped component that uses the PaymentProvider
const MpesaPaymentContent = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { state } = useLocation();
  const [amount, setAmount] = useState<number>(state?.amount || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { addFunds, processingPayment, refreshBalance } = usePayment();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      toast({
        title: "Invalid phone number",
        description: "Please enter your M-Pesa registered phone number",
        variant: "destructive",
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
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
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: session.data.session.user.id,
          amount: amount,
          type: 'deposit',
          status: 'pending',
          is_demo: false,
          details: { 
            method: 'mpesa',
            phone_number: phoneNumber,
            requested_at: new Date().toISOString()
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating transaction:", error);
        throw new Error(error.message);
      }
      
      setTransactionId(data.id);
      
      // In a real implementation, this would call the actual M-Pesa API
      // For demo purposes, we'll simulate a successful payment after a delay
      setTimeout(async () => {
        // Update the transaction to completed
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('id', data.id);
          
        if (updateError) {
          console.error("Error updating transaction:", updateError);
          return;
        }
        
        // Refresh balance to show the new transaction
        await refreshBalance();
        
        toast({
          title: "Payment completed",
          description: `Your M-Pesa payment of KSh ${amount} has been processed successfully.`,
        });
        
        // Redirect to profile after successful payment
        navigate('/profile');
      }, 5000); // Simulate 5 second processing time
      
      toast({
        title: "M-Pesa payment initiated",
        description: `A payment request has been sent to ${phoneNumber}. Please check your phone to complete the payment.`,
      });
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
              <div className="bg-green-600 p-4 rounded-full">
                <Phone className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-lottery-gold text-center mb-6">
              M-Pesa Payment
            </h1>
            
            {transactionId ? (
              <div className="space-y-6">
                <div className="bg-green-900/30 p-6 rounded-lg border border-green-500">
                  <h3 className="text-xl font-bold text-green-400 text-center mb-2">
                    Processing Payment
                  </h3>
                  <div className="flex justify-center my-4">
                    <RefreshCw className="w-8 h-8 animate-spin text-green-400" />
                  </div>
                  <p className="text-green-300 text-center">
                    We've sent a payment request to your phone ({phoneNumber}). 
                    Please check your M-Pesa messages and complete the transaction.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-lottery-white/80 text-center mb-8">
                  Enter your M-Pesa registered phone number and the amount you wish to deposit.
                  You will receive a prompt on your phone to complete the transaction.
                </p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-lottery-white">Phone Number</Label>
                    <Input 
                      id="phone" 
                      placeholder="+254 7XX XXX XXX" 
                      className="bg-lottery-black border-lottery-green/50 text-lottery-white"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-xs text-lottery-white/60">
                      Enter your M-Pesa registered phone number with country code
                    </p>
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
                    onClick={handleMpesaPayment}
                    disabled={isProcessing || processingPayment}
                    className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    {isProcessing ? (
                      <><RefreshCw className="ml-2 h-5 w-5 animate-spin" /> Processing...</>
                    ) : (
                      <span className="flex items-center justify-center">
                        Request M-Pesa Payment
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </span>
                    )}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Main component that wraps the content with PaymentProvider
const MpesaPayment = () => {
  return (
    <PaymentProvider>
      <MpesaPaymentContent />
    </PaymentProvider>
  );
};

export default MpesaPayment;
