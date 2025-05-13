
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Shield, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black bg-cyber-grid">
      <div className="neo-blur rounded-lg p-8 max-w-lg w-full border border-cyber-neon/30 text-center">
        <div className="relative mb-6">
          <AlertTriangle className="w-16 h-16 mx-auto text-cyber-orange animate-pulse" />
          <div className="absolute inset-0 bg-cyber-orange blur-lg opacity-20 rounded-full"></div>
        </div>
        
        <h1 className="text-6xl font-bold mb-2 font-mono cyber-glow text-white">404</h1>
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-neon to-transparent my-6"></div>
        
        <p className="text-xl text-cyber-blue mb-6 font-mono">SYSTEM ERROR: PAGE NOT FOUND</p>
        
        <a 
          href="/" 
          className="cyber-button inline-block rounded"
        >
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            RETURN TO MAINFRAME
          </span>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
