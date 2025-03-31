
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Mail, Phone, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket } from '@/types/rewards';

const CustomerSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'contact' | 'faq'>('chat');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const faqItems = [
    {
      question: 'How do I buy lottery tickets?',
      answer: 'You can purchase tickets through our "Buy Tickets" page after logging into your account. Select your numbers and complete the checkout process.'
    },
    {
      question: 'When are lottery draws held?',
      answer: 'Our main lottery draws are held every Wednesday and Saturday at 8:00 PM. Results are posted shortly after on our "Results" page.'
    },
    {
      question: 'How do I claim my winnings?',
      answer: 'Small prizes are automatically credited to your account. For larger prizes, you\'ll need to contact our support team to arrange payment.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, bank transfers, and select e-wallets like PayPal and Skrill.'
    }
  ];
  
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message || !category) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get user ID from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to submit a support ticket",
          variant: "destructive",
        });
        return;
      }
      
      // Create required properties for the ticket
      const ticketData: Partial<SupportTicket> & { 
        user_id: string; 
        subject: string; 
        description: string; 
        category: string;
      } = {
        user_id: session.user.id,
        subject: subject,
        description: message,
        category: category
      };
      
      const { error } = await supabase
        .from('support_tickets')
        .insert(ticketData);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your support ticket has been submitted",
      });
      
      // Reset form
      setSubject('');
      setMessage('');
      setCategory('general');
      
    } catch (error: any) {
      console.error("Error submitting support ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit support ticket",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl overflow-hidden shadow-lg text-white">
      <div className="relative p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Customer Support</h2>
          <p className="opacity-90">We're here to help you 24/7</p>
        </div>
        
        <div className="flex mb-6 bg-white/10 rounded-lg p-1">
          <Button
            variant="ghost"
            className={`flex-1 ${activeTab === 'chat' ? 'bg-white/20' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 ${activeTab === 'contact' ? 'bg-white/20' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 ${activeTab === 'faq' ? 'bg-white/20' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQ
          </Button>
        </div>
        
        {activeTab === 'chat' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <p className="text-center">
                Click the chat button in the bottom right corner to start a conversation with our support team.
              </p>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                <Mail className="h-8 w-8 mr-3 text-lottery-gold" />
                <div>
                  <p className="font-medium">Email Us</p>
                  <p className="opacity-90">support@lottowin.com</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                <Phone className="h-8 w-8 mr-3 text-lottery-gold" />
                <div>
                  <p className="font-medium">Call Us</p>
                  <p className="opacity-90">+1 (800) 555-LOTTO</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmitTicket} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="font-semibold mb-4">Submit a Support Ticket</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="payment">Payment Problems</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block mb-1">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Brief description of your issue"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Message</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-white/10 border-white/20 text-white min-h-[100px]"
                    placeholder="Describe your issue in detail"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-lottery-gold hover:bg-yellow-500 text-black"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
        
        {activeTab === 'faq' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold text-lottery-gold mb-2">{item.question}</h4>
                <p className="text-white/90">{item.answer}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CustomerSupport;
