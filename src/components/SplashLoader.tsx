
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Show splash for 3 seconds then trigger onComplete callback
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 500); // Wait for exit animation to complete
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-lottery-black z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={!isVisible ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-80 h-80">
        {/* Animated color circles */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-purple-500 mix-blend-screen"
          animate={{ 
            x: [0, 50, -30, 0], 
            y: [0, -50, 30, 0],
            scale: [1, 1.5, 0.8, 1],
          }} 
          transition={{ repeat: Infinity, duration: 3 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-blue-500 mix-blend-screen"
          animate={{ 
            x: [0, -40, 20, 0], 
            y: [0, 30, -40, 0],
            scale: [1, 0.7, 1.3, 1], 
          }} 
          transition={{ repeat: Infinity, duration: 3.5, delay: 0.1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full bg-orange-500 mix-blend-screen"
          animate={{ 
            x: [0, 30, -40, 0], 
            y: [0, -30, -40, 0],
            scale: [1, 1.2, 0.9, 1], 
          }} 
          transition={{ repeat: Infinity, duration: 3.2, delay: 0.2 }}
        />
        
        {/* Lottery logo in center */}
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-lottery-gold">Lotto</span>
            <span className="text-4xl font-bold bg-lottery-green text-lottery-black px-2 rounded-md">Win</span>
          </div>
          <motion.div 
            className="mt-4 text-white text-sm"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Loading...
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashLoader;
