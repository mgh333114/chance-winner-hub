
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  sender: 'user' | 'support';
  created_at: string;
  read: boolean;
};

export const useChat = (userId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    fetchMessages();
  }, [userId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, this would fetch actual messages from a database
      // For now, we'll just simulate a welcome message
      const welcomeMessage = {
        id: '1',
        user_id: userId || '',
        content: 'Welcome to our support chat! How can we help you today?',
        sender: 'support' as const,
        created_at: new Date().toISOString(),
        read: true
      };
      
      setMessages([welcomeMessage]);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!userId || !content.trim()) return null;
    
    try {
      const newMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
        user_id: userId,
        content,
        sender: 'user',
        read: false
      };
      
      // In a real app, you would save this to the database
      // const { data, error } = await supabase
      //   .from('chat_messages')
      //   .insert(newMessage)
      //   .select()
      //   .single();
      
      // if (error) throw error;
      
      // Simulate successful creation
      const simulatedResponse = {
        ...newMessage,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, simulatedResponse]);
      return simulatedResponse;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return null;
    }
  };

  // Simulate receiving a message from support
  const simulateSupportResponse = async (userMessage: string) => {
    try {
      // Wait a bit to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let responseContent = "Thanks for your message! Our team will get back to you shortly.";
      
      // Simple AI-like responses based on keywords
      if (userMessage.toLowerCase().includes('help')) {
        responseContent = "I'd be happy to help! What do you need assistance with?";
      } else if (userMessage.toLowerCase().includes('ticket') || userMessage.toLowerCase().includes('lottery')) {
        responseContent = "For lottery ticket questions, you can check your tickets in the Profile section or contact our support team.";
      } else if (userMessage.toLowerCase().includes('bonus') || userMessage.toLowerCase().includes('reward')) {
        responseContent = "We offer various bonuses including welcome bonuses and referral rewards. Check the Bonuses section for more information!";
      }
      
      const supportMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: userId || '',
        content: responseContent,
        sender: 'support',
        created_at: new Date().toISOString(),
        read: true
      };
      
      setMessages(prev => [...prev, supportMessage]);
      return supportMessage;
    } catch (err: any) {
      console.error("Error simulating support response:", err);
      return null;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    simulateSupportResponse
  };
};
