import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useLottery } from '@/context/LotteryContext';
import { usePayment } from '@/context/PaymentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, HelpCircle, CreditCard, Ticket } from 'lucide-react';
import ProfileStats from '@/components/ProfileStats';
import CustomerSupport from '@/components/CustomerSupport';
import NotificationPreferences from '@/components/NotificationPreferences';
import PersonalStatistics from '@/components/PersonalStatistics';

const Profile: React.FC = () => {
  const { user, isLoading, signOut } = useUser();
  const { tickets } = useLottery();
  const { formatCurrency } = usePayment();
  const [activeTab, setActiveTab] = useState<'stats' | 'settings' | 'support' | 'notifications' | 'personal'>('stats');

  const activeTickets = tickets.filter(t => t.status === 'active').length;
  const wonTickets = tickets.filter(t => t.status === 'won').length;
  const totalWinnings = tickets
    .filter(t => t.status === 'won' && t.prize)
    .reduce((total, ticket) => total + (ticket.prize || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto mt-10 p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="md:col-span-1">
          <Card className="bg-white border border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-base font-semibold">
                Account Overview
              </CardTitle>
              <Settings className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{user.email?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="text-sm font-medium">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    Account ID: {user.id.substring(0, 8)}...
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
              <div className="grid gap-2 mt-4">
                <Button
                  variant={activeTab === 'stats' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => setActiveTab('stats')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Account Stats
                </Button>
                <Button
                  variant={activeTab === 'personal' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => setActiveTab('personal')}
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  Personal Statistics
                </Button>
                <Button
                  variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => setActiveTab('notifications')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant={activeTab === 'support' ? 'default' : 'ghost'}
                  className="justify-start"
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
            <Card className="bg-white border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
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
  );
};

export default Profile;
