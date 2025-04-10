
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, Trophy, User, Menu, X, Dices, ShieldCheck } from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePayment } from '../context/PaymentContext';
import { useUser } from '@/context/UserContext';
import AuthButton from './AuthButton';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { formatCurrency, userBalance } = usePayment();
  const isMobile = useIsMobile();
  const { user } = useUser();
  
  // Check if the user is admin by checking their email
  const isAdmin = user?.email === "admin001@gmail.com";
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setMenuOpen(false);
  }, [location.pathname]);
  
  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };
  
  // Define navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Buy Tickets', path: '/purchase', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Games', path: '/games', icon: <Dices className="w-5 h-5" /> },
    { name: 'Results', path: '/results', icon: <Trophy className="w-5 h-5" /> },
    { name: 'My Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
    // Only show Admin link if the user is an admin
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: <ShieldCheck className="w-5 h-5" /> }] : []),
  ];
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-lottery-black/80 backdrop-blur-md border-b border-lottery-green/20' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-lottery-gold">Win</span>
              <span className="text-2xl font-bold bg-lottery-green text-lottery-black px-2 rounded-md">Hub</span>
            </Link>
          </div>
          
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.path)
                      ? 'bg-lottery-green text-lottery-black'
                      : 'text-lottery-white hover:bg-lottery-green/10'
                    }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </nav>
          )}
          
          <div className="flex items-center">
            <div className="mr-4 hidden md:flex items-center space-x-1 bg-lottery-black/70 px-3 py-1 rounded-full border border-lottery-green/30">
              <span className="text-lottery-neonGreen font-medium">Balance:</span>
              <span className="font-bold text-lottery-white">{formatCurrency(userBalance)}</span>
            </div>
            
            <AuthButton />
            
            {isMobile && (
              <button 
                className="inline-flex items-center justify-center p-2 rounded-md text-lottery-white"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div className="md:hidden bg-lottery-black/95 backdrop-blur-md shadow-md animate-slide-down border-t border-lottery-green/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-lottery-green text-lottery-black'
                    : 'text-lottery-white hover:bg-lottery-green/10'
                  }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
            <div className="flex items-center space-x-1 px-3 py-3">
              <span className="text-lottery-neonGreen font-medium">Balance:</span>
              <span className="font-bold text-lottery-white">{formatCurrency(userBalance)}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
