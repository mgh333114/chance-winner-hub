
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Mail, HelpCircle, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const supportCategories = [
  { value: 'account', label: 'Account Issues' },
  { value: 'payment', label: 'Payment Issues' },
  { value: 'bonus', label: 'Bonus & Promotion' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'other', label: 'Other' },
];

const faqs = [
  {
    question: 'How do I make a deposit?',
    answer: 'You can make a deposit by visiting your profile page and clicking on "Add Funds". We accept various payment methods including credit cards and digital wallets.'
  },
  {
    question: 'How long does it take to process withdrawals?',
    answer: 'Withdrawals are typically processed within 1-3 business days, depending on your payment method. Bank transfers may take 2-5 business days to reflect in your account.'
  },
  {
    question: 'How do I claim my welcome bonus?',
    answer: 'Your welcome bonus is automatically added to your account after you complete the registration process and make your first deposit. You can view and claim it from the "Bonuses" section on your profile.'
  },
  {
    question: 'What are VIP tiers and how do I level up?',
    answer: 'Our VIP program consists of different tiers from Bronze to Diamond. You level up by earning loyalty points when you play games and purchase tickets. Higher tiers offer better benefits such as increased cashback rates and exclusive bonuses.'
  },
  {
    question: 'How does the referral program work?',
    answer: 'You can earn rewards by inviting friends to join our platform. Share your unique referral link, and when your friends sign up and make their first deposit, both you and your friend will receive a bonus.'
  },
];

const CustomerSupport = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message || !category) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to submit a support ticket',
          variant: 'destructive',
        });
        return;
      }
      
      // Submit support ticket
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: sessionData.session.user.id,
          subject,
          description: message,
          category
        });
      
      if (error) throw error;
      
      // Reset form
      setSubject('');
      setMessage('');
      setCategory('');
      
      toast({
        title: 'Ticket submitted',
        description: 'We\'ll get back to you as soon as possible',
      });
    } catch (error: any) {
      console.error('Error submitting ticket:', error);
      toast({
        title: 'Error submitting ticket',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const filteredFAQs = searchTerm 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  return (
    <Card className="bg-white border border-gray-100 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Customer Support</CardTitle>
          <MessageSquare className="w-5 h-5 text-lottery-blue" />
        </div>
        <CardDescription>
          Get help with any questions or issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="info">Support Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contact" className="space-y-4">
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmitTicket}
              className="space-y-4"
            >
              <div>
                <label htmlFor="category" className="block text-sm mb-1">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm mb-1">Subject</label>
                <Input 
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm mb-1">Message</label>
                <Textarea 
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your issue in detail"
                  rows={4}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
                {!submitting && <Send className="w-4 h-4 ml-2" />}
              </Button>
            </motion.form>
          </TabsContent>
          
          <TabsContent value="faq">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <Input 
                  placeholder="Search FAQ..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-3">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-5 h-5 text-lottery-blue mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium text-lottery-dark mb-1">{faq.question}</h4>
                          <p className="text-sm text-lottery-gray">{faq.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-lottery-gray">No matching FAQ found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="info">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-lottery-dark">Phone Support</h4>
                    <p className="text-sm text-lottery-gray mb-1">Available 24/7 for premium members</p>
                    <p className="text-lottery-blue font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-lottery-dark">Email Support</h4>
                    <p className="text-sm text-lottery-gray mb-1">Typical response time: 24 hours</p>
                    <p className="text-purple-600 font-medium">support@lottowin.com</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-lottery-dark">Live Chat</h4>
                    <p className="text-sm text-lottery-gray mb-1">Available 9 AM - 6 PM, Monday to Friday</p>
                    <Button 
                      variant="outline"
                      className="mt-2 border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        toast({
                          title: "Live Chat",
                          description: "Chat feature is coming soon!",
                        });
                      }}
                    >
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CustomerSupport;
