
import { useState, useEffect } from 'react';
import { Cpu, Shield, FileCode, ExternalLink, AtSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ProfileHeader from '@/components/ProfileHeader';
import NavigationLinks from '@/components/NavigationLinks';
import SocialIcons from '@/components/SocialIcons';
import GlitchEffect from '@/components/GlitchEffect';
import { ThemeToggle } from './ThemeToggle';
const Index = () => {
  const [loaded, setLoaded] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [bootText, setBootText] = useState<string[]>([]);

  useEffect(() => {
    if (bootSequence) {
      const bootMessages = [
        "Initializing cyberpunk terminal...",
        "Loading mainframe components...",
        "Establishing secure connection...",
        "Decrypting user profile...",
        "Compiling identity data...",
        "Connection established."
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < bootMessages.length) {
          setBootText(prev => [...prev, bootMessages[index]]);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setBootSequence(false);
            setLoaded(true);
          }, 800);
        }
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [bootSequence]);

  if (bootSequence) {
    return (
      // <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="min-h-screen flex flex-col items-center justify-center bg-cyber-black bg-cyber-grid p-8">


        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>
        <div className="scanline"></div>
        
        <div className="cyber-terminal w-full max-w-3xl h-[60vh] overflow-hidden">
          <div className="terminal-header">
            <span className="text-primary font-mono text-sm">BOOT SEQUENCE</span>
            <div className="ml-auto flex gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <div className="w-3 h-3 rounded-full bg-primary"></div>
            </div>
          </div>
          <div className="font-mono text-sm space-y-2 h-full overflow-y-auto scrollbar-none">
            {bootText.map((text, index) => (
              <div key={index} className="terminal-line py-1">{text}</div>
            ))}
            {bootText.length < 6 && (
              <div className="terminal-line py-1 loading-dots">Loading</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="corner-tr"></div>
      <div className="corner-bl"></div>
      <div className="corner-br"></div>
      <div className="scanline"></div>
      
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="cyber-terminal w-full max-w-4xl mx-auto relative">
          <div className="terminal-header">
            <span className="text-primary font-mono text-sm">MAIN TERMINAL</span>
            <div className="ml-auto flex gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <div className="w-3 h-3 rounded-full bg-primary"></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center py-8 px-4">
            <ProfileHeader />
            
            <div className="w-full my-6">
              <GlitchEffect>
                <h1 className="text-4xl md:text-5xl font-bold text-center cyber-glow font-mono uppercase tracking-wide">
                  HENRIQUE <span className="text-accent">//</span> OVERCYBER
                </h1>
              </GlitchEffect>
            </div>
            
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent my-6 relative overflow-hidden">
              <div className="absolute h-full w-20 bg-primary/50 animate-[shimmer_2s_infinite] flicker bg-cyber-grid"></div>
            </div>
            
            <div className="flex items-center gap-2 mb-8">
              <Shield className="text-accent h-5 w-5" />
              <h3 className="text-xl font-mono uppercase tracking-widest text-primary flicker">
                CYBER SECURITY ANALYST
              </h3>
              <Shield className="text-accent h-5 w-5" />
            </div>
               <div className="flex justify-center mt-3">
                <ThemeToggle />
              </div>

            <SocialIcons />
          </div>
        </div>
        
        <div className="cyber-terminal w-full max-w-4xl mx-auto mt-6">
          <NavigationLinks />
        </div>
        
        <div className="mt-8 text-xs font-mono text-primary/50 flex items-center gap-1">
          <span className="w-2 h-2 bg-primary/50 rounded-full animate-pulse"></span>
          TERMINAL ACTIVE
        </div>
      </div>
    </div>
  );
};

export default Index;
