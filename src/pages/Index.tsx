
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
    <div className={`min-h-screen flex items-center justify-center transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="neo-blur rounded-lg p-6 md:p-10 max-w-3xl w-full mx-4 border border-primary/30 relative overflow-hidden">
        {/* Background grid effect */}
        <div 
          className="absolute inset-0 bg-cyber-grid dark:bg-cyber-grid light:bg-cyber-light-grid z-0 opacity-20" 
          style={{ backgroundSize: '20px 20px' }}
        />
        
        {/* Decoration elements */}
        <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-primary to-transparent"></div>
        <div className="absolute top-0 right-0 w-1 h-24 bg-gradient-to-b from-accent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-24 h-1 bg-gradient-to-l from-primary to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1 h-24 bg-gradient-to-t from-cyber-blue dark:from-cyber-blue light:from-cyber-lightblue to-transparent"></div>
        
        {/* Content container */}
        <div className="relative z-10 flex flex-col items-center">
          <ProfileHeader />
          
          {/* Main title with glitch effect */}
          <GlitchEffect>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-foreground cyber-glow tracking-wide">
              Henrique <span className="text-primary dark:text-cyber-neon light:text-cyber-teal">aka</span> Overcyber
            </h1>
          </GlitchEffect>
          
          {/* Divider with animation */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent my-6 relative overflow-hidden">
            <div className="absolute h-full w-20 bg-foreground/30 animate-[shimmer_2s_infinite]" 
                 style={{animation: 'shimmer 2s infinite', animationTimingFunction: 'linear'}}></div>
          </div>
          
          {/* Subtitle with icon */}
          <div className="flex items-center gap-2 mb-8">
            <Shield className="text-accent h-5 w-5" />
            <h3 className="text-xl font-mono uppercase tracking-widest text-primary dark:text-cyber-blue light:text-cyber-teal animate-pulse">
              CYBER SECURITY ANALYST
            </h3>
            <Shield className="text-accent h-5 w-5" />
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
