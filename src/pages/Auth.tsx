
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingUsers) {
        toast({
          title: "Account already exists",
          description: "Please log in instead or use a different email",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // If no existing user, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Disable email confirmation requirement
          emailRedirectTo: window.location.origin,
          data: {
            email: email.toLowerCase(), // Store email in metadata for easy access
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "You can now log in with your credentials",
      });
      
      if (data.user) {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back",
        description: "You have been successfully logged in",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add colorful background
  const bgStyle = {
    backgroundImage: 'url("https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=2000&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen bg-black relative" style={bgStyle}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <Navbar />
      
      <main className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="container mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Join LottoWin</h1>
              <p className="text-white/80">Create an account or sign in to purchase tickets and win big prizes!</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-white/20">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-signin" className="text-white">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="email-signin"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password-signin" className="text-white">Password</Label>
                        <a href="#" className="text-xs text-blue-300 hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="password-signin"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-signup" className="text-white">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="email-signup"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password-signup" className="text-white">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="password-signup"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-white/70">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full bg-purple-500 hover:bg-purple-600"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                    
                    <p className="text-xs text-center text-white/70">
                      By creating an account, you agree to our{' '}
                      <a href="#" className="text-blue-300 hover:underline">Terms of Service</a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-300 hover:underline">Privacy Policy</a>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
