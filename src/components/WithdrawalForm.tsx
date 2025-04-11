
import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Banknote, CreditCard, ArrowRight, Phone, Bitcoin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/context/PaymentContext';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const formSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  method: z.enum(["bank", "mpesa", "card", "crypto"], {
    required_error: "Please select a withdrawal method",
  }),
  details: z.string().min(1, "Please provide necessary details for the withdrawal"),
});

const WithdrawalForm = () => {
  const { toast } = useToast();
  const { userBalance, processWithdrawal } = usePayment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      method: undefined,
      details: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const amount = parseFloat(values.amount);
    
    // Check if the withdrawal amount is within the user's balance
    if (amount > userBalance) {
      toast({
        title: "Insufficient balance",
        description: `Your balance (KSh ${userBalance.toFixed(2)}) is less than the requested amount`,
        variant: "destructive",
      });
      return;
    }
    
    // Store the pending withdrawal data
    setPendingWithdrawal({
      amount,
      method: values.method,
      details: values.details
    });
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };
  
  const confirmWithdrawal = async () => {
    if (!pendingWithdrawal) return;
    
    setIsSubmitting(true);
    setShowConfirmation(false);
    
    try {
      await processWithdrawal(
        pendingWithdrawal.amount, 
        pendingWithdrawal.method, 
        pendingWithdrawal.details
      );
      
      form.reset();
      
      toast({
        title: "Withdrawal requested",
        description: `Your withdrawal request for KSh ${pendingWithdrawal.amount.toFixed(2)} has been submitted and is pending admin approval.`,
      });
    } catch (error: any) {
      toast({
        title: "Withdrawal failed",
        description: error.message || "An error occurred while processing your withdrawal request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setPendingWithdrawal(null);
    }
  };

  const getMethodDetails = (method: string) => {
    switch (method) {
      case 'bank':
        return {
          icon: <Banknote className="w-5 h-5 text-amber-500" />,
          label: 'Bank Transfer',
          placeholder: 'Account number, bank name, routing number, etc.',
          description: 'Funds will be transferred to your bank account'
        };
      case 'mpesa':
        return {
          icon: <Phone className="w-5 h-5 text-green-500" />,
          label: 'M-Pesa',
          placeholder: 'M-Pesa phone number (e.g. 254XXXXXXXXX)',
          description: 'Funds will be sent to your M-Pesa account'
        };
      case 'card':
        return {
          icon: <CreditCard className="w-5 h-5 text-blue-500" />,
          label: 'Card',
          placeholder: 'Last 4 digits of your card, cardholder name',
          description: 'Funds will be credited to your debit/credit card'
        };
      case 'crypto':
        return {
          icon: <Bitcoin className="w-5 h-5 text-purple-500" />,
          label: 'Cryptocurrency',
          placeholder: 'Crypto wallet address, currency (BTC/ETH/etc.)',
          description: 'Funds will be converted to cryptocurrency and sent to your wallet'
        };
      default:
        return {
          icon: <Banknote className="w-5 h-5 text-amber-500" />,
          label: 'Select method',
          placeholder: 'Provide withdrawal details',
          description: ''
        };
    }
  };
  
  const method = form.watch("method");
  const methodInfo = method ? getMethodDetails(method) : getMethodDetails("");
  
  return (
    <div className="bg-black rounded-xl p-6 border border-gray-800 shadow-lg text-gray-100">
      <h3 className="font-bold text-xl text-amber-500 mb-6">Withdraw Funds</h3>
      
      <Alert className="mb-6 bg-gray-900 border-amber-500/50 text-gray-300">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-500">Important</AlertTitle>
        <AlertDescription>
          All withdrawals are subject to review and approval by our admin team. Processing may take 1-3 business days.
        </AlertDescription>
      </Alert>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Amount (KSh)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">KSh</span>
                    <Input 
                      {...field} 
                      placeholder="0.00" 
                      className="pl-12 bg-gray-900 border-gray-700 text-gray-100 focus-visible:ring-amber-500" 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Withdrawal Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-100 focus:ring-amber-500">
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-900 border-gray-700 text-gray-100">
                    <SelectItem value="bank" className="focus:bg-gray-800 focus:text-amber-500">
                      <div className="flex items-center">
                        <Banknote className="w-4 h-4 mr-2 text-amber-500" />
                        <span>Bank Transfer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mpesa" className="focus:bg-gray-800 focus:text-green-500">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-green-500" />
                        <span>M-Pesa</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="card" className="focus:bg-gray-800 focus:text-blue-500">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Card Refund</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="crypto" className="focus:bg-gray-800 focus:text-purple-500">
                      <div className="flex items-center">
                        <Bitcoin className="w-4 h-4 mr-2 text-purple-500" />
                        <span>Cryptocurrency</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {method && (
                  <FormDescription className="text-gray-400">
                    {methodInfo.description}
                  </FormDescription>
                )}
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">
                  <div className="flex items-center gap-2">
                    {methodInfo.icon}
                    <span>Account Details</span>
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={methodInfo.placeholder}
                    className="bg-gray-900 border-gray-700 text-gray-100 focus-visible:ring-amber-500"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <div className="flex items-center">
                  Request Withdrawal
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-gray-900 text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-amber-500">Confirm Withdrawal</DialogTitle>
            <DialogDescription className="text-gray-400">
              Please review your withdrawal request before submitting
            </DialogDescription>
          </DialogHeader>
          
          {pendingWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 border-b border-gray-800 pb-2">
                <div className="text-gray-400">Amount:</div>
                <div className="text-right font-semibold text-white">KSh {pendingWithdrawal.amount.toFixed(2)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 border-b border-gray-800 pb-2">
                <div className="text-gray-400">Method:</div>
                <div className="text-right font-semibold text-white capitalize">{pendingWithdrawal.method}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 border-b border-gray-800 pb-2">
                <div className="text-gray-400">Details:</div>
                <div className="text-right font-semibold text-white">{pendingWithdrawal.details}</div>
              </div>
              
              <div className="text-gray-400 text-sm">
                <AlertCircle className="inline-block w-4 h-4 mr-1 text-amber-500" />
                This withdrawal will be pending until approved by our admin team
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmWithdrawal}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalForm;
