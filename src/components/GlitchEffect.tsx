
import { useState, useEffect, ReactNode } from 'react';

interface GlitchEffectProps {
  children: ReactNode;
}

const GlitchEffect = ({ children }: GlitchEffectProps) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Randomly trigger glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200 + Math.random() * 400);
      }
    }, 2000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="relative">
      {/* Original content */}
      <div className={isGlitching ? "opacity-90" : "opacity-100"}>
        {children}
      </div>
      
      {/* Glitch layers */}
      {isGlitching && (
        <>
          <div className="absolute inset-0 text-cyber-blue opacity-70 translate-x-[1px] translate-y-[-1px]">
            {children}
          </div>
          <div className="absolute inset-0 text-cyber-orange opacity-70 translate-x-[-1px] translate-y-[1px]">
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default GlitchEffect;
