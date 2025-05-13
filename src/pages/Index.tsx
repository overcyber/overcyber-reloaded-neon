
import { useState, useEffect } from 'react';
import { Cpu, Shield, FileCode, ExternalLink, AtSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ProfileHeader from '@/components/ProfileHeader';
import NavigationLinks from '@/components/NavigationLinks';
import SocialIcons from '@/components/SocialIcons';
import GlitchEffect from '@/components/GlitchEffect';

const Index = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulating loading effect
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-cyber-black transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="neo-blur rounded-lg p-6 md:p-10 max-w-3xl w-full mx-4 border border-cyber-neon/30 relative overflow-hidden">
        {/* Background grid effect */}
        <div 
          className="absolute inset-0 bg-cyber-grid z-0 opacity-20" 
          style={{ backgroundSize: '20px 20px' }}
        />
        
        {/* Decoration elements */}
        <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-cyber-neon to-transparent"></div>
        <div className="absolute top-0 right-0 w-1 h-24 bg-gradient-to-b from-cyber-orange to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-24 h-1 bg-gradient-to-l from-cyber-neon to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1 h-24 bg-gradient-to-t from-cyber-blue to-transparent"></div>
        
        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center">
          <ProfileHeader />
          
          {/* Main title with glitch effect */}
          <GlitchEffect>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white cyber-glow tracking-wide">
              Henrique <span className="text-cyber-neon">aka</span> Overcyber
            </h1>
          </GlitchEffect>
          
          {/* Divider with animation */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-neon to-transparent my-6 relative overflow-hidden">
            <div className="absolute h-full w-20 bg-white/30 animate-[shimmer_2s_infinite]" 
                 style={{animation: 'shimmer 2s infinite', animationTimingFunction: 'linear'}}></div>
          </div>
          
          {/* Subtitle with icon */}
          <div className="flex items-center gap-2 mb-8">
            <Shield className="text-cyber-orange h-5 w-5" />
            <h3 className="text-xl font-mono uppercase tracking-widest text-cyber-blue animate-pulse">
              CYBER SECURITY ANALYST
            </h3>
            <Shield className="text-cyber-orange h-5 w-5" />
          </div>
          
          {/* Navigation Links */}
          <NavigationLinks />
          
          {/* Social Icons */}
          <SocialIcons />
        </div>
      </div>
    </div>
  );
};

export default Index;
