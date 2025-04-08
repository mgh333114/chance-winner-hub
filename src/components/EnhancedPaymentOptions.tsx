
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Wallet, Bitcoin, DollarSign, Lock, Phone, Smartphone } from 'lucide-react';
import { usePayment } from '@/context/PaymentContext';
import QRCode from 'react-qr-code';

const EnhancedPaymentOptions = () => {
  const { addFunds, processingPayment, isDemoAccount } = usePayment();
  const { toast } = useToast();
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('btc');

  const handleAddFunds = async (amount: number, method: string) => {
    if (isDemoAccount) {
      toast({
        title: "Demo Account",
        description: `Added $${amount} with ${method} in demo mode`,
      });
    }
    
    // Process the payment with the selected method
    addFunds(amount, method);
  };

  const cryptoAddresses = {
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    usdt: 'TKVxYEtQUB3XLiHpKqZzbCEY1QTQQBmApi',
    usdc: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
  };

  const handleMpesaPayment = () => {
    if (!mobileNumber) {
      toast({
        title: "Invalid phone number",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (customAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "M-Pesa payment initiated",
      description: `A payment request has been sent to ${mobileNumber}. Please check your phone to complete the payment.`,
    });

    // In a real implementation, this would call the M-Pesa API
    if (isDemoAccount) {
      setTimeout(() => {
        toast({
          title: "Demo payment completed",
          description: `Added $${customAmount} with M-Pesa in demo mode`,
        });
        addFunds(customAmount, 'mpesa');
      }, 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <CardTitle>Payment Methods</CardTitle>
        </div>
        <CardDescription>Choose how you want to add funds</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="card" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Card</span>
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Bank</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Bitcoin className="w-4 h-4" />
              <span className="hidden sm:inline">Crypto</span>
            </TabsTrigger>
            <TabsTrigger value="mpesa" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">M-Pesa</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">E-Wallet</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className="py-6 border-lottery-blue text-lottery-blue hover:bg-lottery-blue/5 font-medium"
                    onClick={() => handleAddFunds(amount, 'Credit Card')}
                    disabled={processingPayment}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="card-name">Name on Card</Label>
                  <Input id="card-name" placeholder="John Smith" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="4111 1111 1111 1111" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="bank">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input id="account-name" placeholder="John Smith" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input id="account-number" placeholder="000123456789" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="routing">Routing Number</Label>
                  <Input id="routing" placeholder="11000000" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="bank-amount">Amount ($)</Label>
                  <Input
                    id="bank-amount"
                    type="number"
                    min="10"
                    placeholder="100"
                    value={customAmount || ''}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="crypto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[25, 50, 100, 200].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className="py-6 border-purple-500 text-purple-600 hover:bg-purple-50 font-medium"
                    onClick={() => handleAddFunds(amount, 'Cryptocurrency')}
                    disabled={processingPayment}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="crypto-type">Cryptocurrency</Label>
                  <select
                    id="crypto-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                  >
                    <option value="btc">Bitcoin (BTC)</option>
                    <option value="eth">Ethereum (ETH)</option>
                    <option value="usdt">Tether (USDT)</option>
                    <option value="usdc">USD Coin (USDC)</option>
                  </select>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Wallet Address:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]);
                        toast({
                          title: "Address copied",
                          description: "Wallet address copied to clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-300 text-xs font-mono break-all">
                    {cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
                  </div>
                  
                  {/* QR Code for the crypto address */}
                  <div className="mt-4 flex justify-center">
                    <div className="p-2 bg-white rounded border border-gray-200">
                      <QRCode 
                        value={cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
                        size={150}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        level={"L"}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Send the exact amount to this address. Funds will be credited after network confirmations.
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="mpesa">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">M-Pesa Payment</h3>
                </div>
                <p className="text-sm text-green-700">
                  Enter your M-Pesa registered phone number and the amount you wish to deposit.
                  You will receive a prompt on your phone to complete the transaction.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="mpesa-phone">Phone Number</Label>
                  <Input 
                    id="mpesa-phone" 
                    placeholder="+254 7XX XXX XXX" 
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Enter your M-Pesa registered phone number with country code</p>
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="mpesa-amount">Amount ($)</Label>
                  <Input
                    id="mpesa-amount"
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={customAmount || ''}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                  />
                </div>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleMpesaPayment}
                  disabled={processingPayment}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Request M-Pesa Payment
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="wallet">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Button
                  variant="outline"
                  className="py-6 border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleAddFunds(50, 'PayPal')}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold mb-2">PayPal</span>
                    <span>$50</span>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="py-6 border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => handleAddFunds(50, 'Cash App')}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold mb-2">Cash App</span>
                    <span>$50</span>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="py-6 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => handleAddFunds(50, 'Venmo')}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold mb-2">Venmo</span>
                    <span>$50</span>
                  </div>
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="wallet-email">E-Wallet Email</Label>
                  <Input id="wallet-email" type="email" placeholder="you@example.com" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="wallet-amount">Amount ($)</Label>
                  <Input
                    id="wallet-amount"
                    type="number"
                    min="10"
                    placeholder="100"
                    value={customAmount || ''}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => handleAddFunds(customAmount || 50, 'Selected Method')}>
          <Lock className="w-4 h-4 mr-2" />
          Securely Add Funds
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnhancedPaymentOptions;
