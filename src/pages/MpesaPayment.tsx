
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PaymentProvider } from '@/context/PaymentContext';

// Create a wrapped component that uses the PaymentProvider
const MpesaPaymentContent = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { state } = useLocation();
  const [amount, setAmount] = useState<number>(state?.amount || 0);
  const { addFunds, processingPayment } = usePayment();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMpesaPayment = () => {
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

    addFunds(amount, 'mpesa');
    
    toast({
      title: "M-Pesa payment initiated",
      description: `A payment request has been sent to ${phoneNumber}. Please check your phone to complete the payment.`,
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
              <div className="bg-green-600 p-4 rounded-full">
                <Phone className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-lottery-gold text-center mb-6">
              M-Pesa Payment
            </h1>
            
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
                disabled={processingPayment}
                className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {processingPayment ? (
                  "Processing..."
                ) : (
                  <span className="flex items-center justify-center">
                    Request M-Pesa Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </div>
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
