
import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Banknote, CreditCard, ArrowRight } from 'lucide-react';
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

const formSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  method: z.enum(["bank", "paypal", "card"], {
    required_error: "Please select a withdrawal method",
  }),
  details: z.string().min(1, "Please provide necessary details for the withdrawal"),
});

const WithdrawalForm = () => {
  const { toast } = useToast();
  const { userBalance, processWithdrawal } = usePayment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        description: `Your balance ($${userBalance.toFixed(2)}) is less than the requested amount`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await processWithdrawal(amount, values.method, values.details);
      
      form.reset();
      
      toast({
        title: "Withdrawal requested",
        description: `Your withdrawal request for $${amount.toFixed(2)} has been submitted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Withdrawal failed",
        description: error.message || "An error occurred while processing your withdrawal request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const methodIcons = {
    bank: <Banknote className="w-4 h-4" />,
    paypal: <CreditCard className="w-4 h-4" />,
    card: <CreditCard className="w-4 h-4" />,
  };
  
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-lg text-lottery-dark mb-4">Withdraw Funds</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (USD)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input {...field} placeholder="0.00" className="pl-8" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Withdrawal Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bank">
                      <div className="flex items-center">
                        <Banknote className="w-4 h-4 mr-2" />
                        <span>Bank Transfer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>PayPal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Credit/Debit Card</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Details</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={
                      form.watch("method") === "bank"
                        ? "Account number, routing number, etc."
                        : form.watch("method") === "paypal"
                        ? "PayPal email address"
                        : form.watch("method") === "card"
                        ? "Last 4 digits of your card"
                        : "Provide necessary details for the withdrawal"
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-lottery-blue hover:bg-lottery-blue/90"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <div className="flex items-center">
                  Withdraw Funds
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WithdrawalForm;
