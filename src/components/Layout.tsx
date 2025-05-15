
import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavigationLinks from './NavigationLinks';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  title?: string;
}

const Layout = ({ children, showBackButton = true, title }: LayoutProps) => {
  const [bootSequence, setBootSequence] = useState(true);
  const [bootText, setBootText] = useState<string[]>([]);

  useEffect(() => {
    if (bootSequence) {
      const bootMessages = [
        "Initializing cyberpunk terminal...",
        "Loading system components...",
        "Establishing secure connection...",
        "Decrypting user data...",
        `Accessing ${title || "main"} module...`,
        "Connection established."
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < bootMessages.length) {
          setBootText(prev => [...prev, bootMessages[index]]);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => setBootSequence(false), 800);
        }
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [bootSequence, title]);

  if (bootSequence) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
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
    <>
      <div className="corner-tr"></div>
      <div className="corner-bl"></div>
      <div className="corner-br"></div>
      <div className="scanline"></div>
      
      <div className="min-h-screen flex flex-col p-8">
        <div className="w-full max-w-6xl mx-auto">
          <header className="cyber-terminal mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {showBackButton ? (
                  <Link 
                    to="/" 
                    className="cyber-button inline-flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    <span className="font-mono text-xs">MAIN</span>
                  </Link>
                ) : (
                  <div className="text-primary font-mono text-sm">SYSTEM READY</div>
                )}
                
                {title && (
                  <h1 className="text-2xl md:text-3xl font-bold cyber-glow font-mono uppercase tracking-wider">
                    {title}
                  </h1>
                )}
              </div>
              
              <ThemeToggle />
            </div>
          </header>
          
          <main className="cyber-panel p-6 mb-8">
            {children}
          </main>
          
          <footer className="cyber-terminal mt-auto">
            <NavigationLinks />
          </footer>
        </div>
      </div>
    </>
  );
};

export default Layout;
