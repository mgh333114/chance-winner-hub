
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useLottery } from '@/context/LotteryContext';
import { usePayment } from '@/context/PaymentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, HelpCircle, CreditCard, Ticket, User } from 'lucide-react';
import ProfileStats from '@/components/ProfileStats';
import CustomerSupport from '@/components/CustomerSupport';
import NotificationPreferences from '@/components/NotificationPreferences';
import PersonalStatistics from '@/components/PersonalStatistics';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, isLoading, signOut } = useUser();
  const { tickets } = useLottery();
  const { formatCurrency } = usePayment();
  const [activeTab, setActiveTab] = useState<'stats' | 'settings' | 'support' | 'notifications' | 'personal'>('stats');
  const navigate = useNavigate();

  const activeTickets = tickets.filter(t => t.status === 'active').length;
  const wonTickets = tickets.filter(t => t.status === 'won').length;
  const totalWinnings = tickets
    .filter(t => t.status === 'won' && t.prize)
    .reduce((total, ticket) => total + (ticket.prize || 0), 0);
  
  // Redirect to auth page if user is not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          Loading profile...
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
          <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-gray-100">
            <CardHeader>
              <CardTitle className="text-amber-500">Authentication Required</CardTitle>
              <CardDescription className="text-gray-400">Please sign in to view your profile</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Button onClick={() => navigate('/auth')} className="bg-amber-500 hover:bg-amber-600 text-black">
                Sign In / Sign Up
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto mt-20 p-6 bg-black text-white min-h-screen"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="md:col-span-1">
            <Card className="bg-gray-900 border border-gray-800 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b border-gray-800">
                <CardTitle className="text-base font-semibold text-amber-500">
                  Account Overview
                </CardTitle>
                <User className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-16 w-16 bg-gray-800 border border-amber-500/50">
                    <AvatarFallback className="bg-gray-800 text-amber-500">{user.email?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-100">{user.email}</div>
                    <div className="text-xs text-gray-400">
                      Account ID: {user.id.substring(0, 8)}...
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut} className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
                    Sign Out
                  </Button>
                </div>
                <div className="grid gap-2 mt-6">
                  <Button
                    variant={activeTab === 'stats' ? 'default' : 'ghost'}
                    className={`justify-start ${activeTab === 'stats' ? 'bg-amber-500 text-black hover:bg-amber-600' : 'text-gray-300 hover:text-amber-500 hover:bg-transparent'}`}
                    onClick={() => setActiveTab('stats')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Account Stats
                  </Button>
                  <Button
                    variant={activeTab === 'personal' ? 'default' : 'ghost'}
                    className={`justify-start ${activeTab === 'personal' ? 'bg-amber-500 text-black hover:bg-amber-600' : 'text-gray-300 hover:text-amber-500 hover:bg-transparent'}`}
                    onClick={() => setActiveTab('personal')}
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    Personal Statistics
                  </Button>
                  <Button
                    variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                    className={`justify-start ${activeTab === 'notifications' ? 'bg-amber-500 text-black hover:bg-amber-600' : 'text-gray-300 hover:text-amber-500 hover:bg-transparent'}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Notifications
                  </Button>
                  <Button
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
                    className={`justify-start ${activeTab === 'settings' ? 'bg-amber-500 text-black hover:bg-amber-600' : 'text-gray-300 hover:text-amber-500 hover:bg-transparent'}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant={activeTab === 'support' ? 'default' : 'ghost'}
                    className={`justify-start ${activeTab === 'support' ? 'bg-amber-500 text-black hover:bg-amber-600' : 'text-gray-300 hover:text-amber-500 hover:bg-transparent'}`}
                    onClick={() => setActiveTab('support')}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Customer Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'stats' && <ProfileStats />}
            {activeTab === 'personal' && <PersonalStatistics />}
            {activeTab === 'settings' && (
              <Card className="bg-gray-900 border border-gray-800 shadow-md text-gray-100">
                <CardHeader>
                  <CardTitle className="text-amber-500">Account Settings</CardTitle>
                  <CardDescription className="text-gray-400">Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>More settings coming soon!</p>
                </CardContent>
              </Card>
            )}
            {activeTab === 'notifications' && <NotificationPreferences />}
            {activeTab === 'support' && <CustomerSupport />}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Profile;
