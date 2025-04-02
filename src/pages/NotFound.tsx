
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lottery-black">
      <div className="text-center p-8 bg-lottery-black/60 rounded-2xl border border-lottery-green/30 shadow-lg max-w-md">
        <h1 className="text-6xl font-bold text-lottery-gold mb-4">404</h1>
        <p className="text-xl text-lottery-white mb-8">Oops! Page not found</p>
        <p className="text-lottery-white/70 mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button 
          className="bg-lottery-green hover:bg-lottery-green/90 text-lottery-black"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
