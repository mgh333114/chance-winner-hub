
import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useChat, ChatMessage } from '@/hooks/useChat';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, simulateSupportResponse } = useChat(userId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
      }
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !userId) return;
    
    const sentMessage = await sendMessage(message);
    setMessage('');
    
    if (sentMessage) {
      simulateSupportResponse(sentMessage.content);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-lottery-green text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-lottery-green/90 transition-all z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-lottery-gold z-50">
      {/* Chat Header */}
      <div className="bg-lottery-black text-white p-3 flex justify-between items-center">
        <div>
          <h3 className="font-bold">Customer Support</h3>
          <p className="text-xs opacity-80">We usually reply in a few minutes</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:bg-lottery-black/50"
          onClick={() => setIsOpen(false)}
        >
          <X size={18} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-lottery-light">
        {!isLoggedIn ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <p className="mb-2">Please log in to chat with support</p>
              <Button onClick={() => window.location.href = '/auth'}>
                Login / Register
              </Button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg: ChatMessage) => (
              <div 
                key={msg.id} 
                className={`mb-2 max-w-[80%] ${
                  msg.sender === 'user' 
                    ? 'ml-auto bg-lottery-green text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                    : 'mr-auto bg-white border border-lottery-gray/20 rounded-tl-lg rounded-tr-lg rounded-br-lg'
                } p-3 shadow-sm`}
              >
                <p>{msg.content}</p>
                <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/80' : 'text-lottery-gray'}`}>
                  {formatTime(msg.created_at)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      {isLoggedIn && (
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex">
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 focus-visible:ring-lottery-green"
            />
            <Button 
              onClick={handleSendMessage}
              className="ml-2 bg-lottery-green hover:bg-lottery-green/90 text-white"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
