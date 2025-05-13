
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import NavigationLinks from './NavigationLinks';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  title?: string;
}

const Layout = ({ children, showBackButton = true, title }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-cyber-black py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {showBackButton && (
          <Link 
            to="/" 
            className="cyber-button mb-6 inline-flex items-center gap-2 text-cyber-neon"
          >
            <ArrowLeft size={16} />
            <span className="font-mono">BACK TO MAINFRAME</span>
          </Link>
        )}
        
        {title && (
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white cyber-glow tracking-wide font-mono">
              {title}
            </h1>
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-neon to-transparent my-4 relative overflow-hidden">
              <div className="absolute h-full w-20 bg-white/30 animate-[shimmer_2s_infinite]" 
                  style={{animation: 'shimmer 2s infinite', animationTimingFunction: 'linear'}}></div>
            </div>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default Layout;
