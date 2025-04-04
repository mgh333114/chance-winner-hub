
import React from 'react'; // Important: Add explicit React import
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LotteryProvider } from "./context/LotteryContext";
import { PaymentProvider } from "./context/PaymentContext";
import { UserProvider } from "./context/UserContext";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import SplashLoader from "./components/SplashLoader";
import Index from "./pages/Index";
import Purchase from "./pages/Purchase";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Games from "./pages/Games";
import AviatorGame from "./pages/AviatorGame";
import ScratchGame from "./pages/ScratchGame";
import DiceGame from "./pages/DiceGame";
import WheelGame from "./pages/WheelGame";
import MpesaPayment from "./pages/MpesaPayment"; // Add new page
import CryptoPayment from "./pages/CryptoPayment"; // Add new page
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Chat from "./components/Chat";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkIfAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // In a real app, you'd check against a list of admin users or an admin role
        // This is a simple example just checking a specific email
        if (session.user.email === 'admin@example.com') {
          setIsAdmin(true);
        }
      }
    };
    
    checkIfAdmin();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <UserProvider>
              <PaymentProvider>
                <LotteryProvider>
                  {loading && <SplashLoader onComplete={() => setLoading(false)} />}
                  <Toaster />
                  <Sonner />
                  <div className="flex flex-col min-h-screen">
                    <div className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/purchase" element={<Purchase />} />
                        <Route path="/results" element={<Results />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/games/aviator" element={<AviatorGame />} />
                        <Route path="/games/wheel" element={<WheelGame />} />
                        <Route path="/games/scratch" element={<ScratchGame />} />
                        <Route path="/games/dice" element={<DiceGame />} />
                        <Route path="/payment/mpesa" element={<MpesaPayment />} />
                        <Route path="/payment/crypto" element={<CryptoPayment />} />
                        {isAdmin && <Route path="/admin" element={<Admin />} />}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <Footer />
                  </div>
                  <Chat />
                </LotteryProvider>
              </PaymentProvider>
            </UserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
