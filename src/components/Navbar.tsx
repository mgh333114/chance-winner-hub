import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, Trophy, User, Menu, X } from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePayment } from '../context/PaymentContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { formatCurrency, userBalance } = usePayment();
  const isMobile = useIsMobile();
  
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
    return location.pathname === path;
  };
  
  const navItems = [
    { name: 'Home', path: '/', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Buy Tickets', path: '/purchase', icon: <Ticket className="w-5 h-5" /> },
    { name: 'Results', path: '/results', icon: <Trophy className="w-5 h-5" /> },
    { name: 'My Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
  ];
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-lottery-blue">Lotto</span>
              <span className="text-2xl font-bold bg-lottery-blue text-white px-2 rounded-md">Win</span>
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
                      ? 'bg-lottery-blue text-white'
                      : 'text-lottery-dark hover:bg-lottery-blue/10'
                    }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </nav>
          )}
          
          <div className="flex items-center">
            <div className="mr-4 hidden md:flex items-center space-x-1 bg-lottery-light px-3 py-1 rounded-full">
              <span className="text-lottery-blue font-medium">Balance:</span>
              <span className="font-bold">{formatCurrency(userBalance)}</span>
            </div>
            
            {isMobile && (
              <button 
                className="inline-flex items-center justify-center p-2 rounded-md text-lottery-dark"
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
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-md animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-lottery-blue text-white'
                    : 'text-lottery-dark hover:bg-lottery-blue/10'
                  }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
            <div className="flex items-center space-x-1 px-3 py-3">
              <span className="text-lottery-blue font-medium">Balance:</span>
              <span className="font-bold">{formatCurrency(userBalance)}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
