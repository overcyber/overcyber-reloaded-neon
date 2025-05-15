
import { useState, useEffect } from 'react';

const ProfileHeader = () => {
  const [scanline, setScanline] = useState(0);
  const [glitching, setGlitching] = useState(false);
  
  useEffect(() => {
    // Create scanline effect
    const scanlineInterval = setInterval(() => {
      setScanline(prev => (prev + 1) % 100);
    }, 50);
    
    // Occasionally trigger glitch effect
    const glitchInterval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }, 3000);
    
    return () => {
      clearInterval(scanlineInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div className="w-32 h-32 md:w-40 md:h-40 relative mb-6 rounded-full overflow-hidden border-4 border-cyber-neon glow">
      {/* Profile image with cyber effects */}
      <div className={`absolute inset-0 ${glitching ? 'animate-glitch' : ''}`}
        style={{
          backgroundImage: "url('https://pbs.twimg.com/profile_images/1366369596777897990/lrgv5812_400x400.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: glitching ? 'hue-rotate(90deg)' : 'none',
        }}>
      </div>
      
      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          // background: `linear-gradient(transparent ${scanline}%, rgba(155, 135, 245, 0.2) ${scanline}%, rgba(155, 135, 245, 0.2) ${scanline + 1}%, transparent ${scanline + 1}%)`,
          background: `linear-gradient(transparent ${scanline}%, rgba(0, 255, 128, 0.2) ${scanline}%, rgba(0, 255, 128, 0.2) ${scanline + 1}%, transparent ${scanline + 1}%)`,

        }}
      ></div>
      
      {/* Color overlay */}
{/*       <div className="absolute inset-0 bg-cyber-purple/10 mix-blend-overlay"></div> */}
        <div className="absolute inset-0 bg-cyber-neon/10 mix-blend-overlay"></div>

      
      {/* Border glow effect */}
      // <div className="absolute -inset-1 bg-gradient-to-r from-cyber-neon via-cyber-blue to-cyber-purple rounded-full blur opacity-30"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-neon via-cyber-neon to-cyber-blue rounded-full blur opacity-30"></div>

    </div>
  );
};

export default ProfileHeader;
