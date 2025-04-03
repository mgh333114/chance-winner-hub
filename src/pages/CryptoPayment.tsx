
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, ArrowLeft, Copy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'react-qrcode-svg';
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
  const { addFunds, processingPayment } = usePayment();
  const { toast } = useToast();

  const cryptoAddresses = {
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    usdt: 'TKVxYEtQUB3XLiHpKqZzbCEY1QTQQBmApi',
    usdc: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleConfirmPayment = () => {
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    addFunds(amount, 'crypto');
    toast({
      title: "Payment registered",
      description: `Your crypto payment of KSh ${amount} has been registered. Funds will be credited after confirmation.`,
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
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <div className="bg-lottery-dark p-2 rounded border border-lottery-green/30 text-xs font-mono break-all text-lottery-white/90">
                  {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
                </div>
                
                <div className="mt-4 flex justify-center bg-white p-4 rounded">
                  <QRCodeSVG 
                    value={cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"L"}
                  />
                </div>
                
                <p className="text-xs text-lottery-white/60 mt-4 text-center">
                  Send the exact amount to this address. Funds will be credited after network confirmations.
                </p>
              </div>
              
              <Button 
                onClick={handleConfirmPayment}
                disabled={processingPayment}
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
