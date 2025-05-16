
import { ReactNode } from 'react';
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
