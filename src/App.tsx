
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

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);

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
                    <Route path="/payment/mpesa" element={<MpesaPayment />} /> {/* New route */}
                    <Route path="/payment/crypto" element={<CryptoPayment />} /> {/* New route */}
                    <Route path="/admin" element={<Admin />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
