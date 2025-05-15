
import { useState } from 'react';
import { FileCode, User, Archive, FileText, AtSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const NavigationLinks = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const links = [
    { name: "BLOG", url: "/blog", icon: <Archive size={16} /> },
    { name: "ABOUT", url: "/about/", icon: <User size={16} /> },
    { name: "PROJECTS", url: "/projects", icon: <FileCode size={16} /> },
    { name: "RESUME", url: "/resume.pdf", icon: <FileText size={16} /> },
    { name: "CONTACT", url: "/contact", icon: <AtSign size={16} /> }
  ];
  
  return (
    <div className="w-full">
      <div className="terminal-header">
        <span className="text-primary font-mono text-sm">NAVIGATION</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full">
        {links.map((link, index) => (
          link.url.endsWith('.pdf') ? (
            <a
              key={index}
              href={link.url}
              className="cyber-button flex items-center justify-center gap-2 p-3"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className={`transition-all duration-300 ${hoveredIndex === index ? 'text-accent' : 'text-primary'}`}>
                {link.icon}
              </span>
              <span className="font-mono tracking-wider text-xs">{link.name}</span>
            </a>
          ) : (
            <Link
              key={index}
              to={link.url}
              className="cyber-button flex items-center justify-center gap-2 p-3"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className={`transition-all duration-300 ${hoveredIndex === index ? 'text-accent' : 'text-primary'}`}>
                {link.icon}
              </span>
              <span className="font-mono tracking-wider text-xs">{link.name}</span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

export default NavigationLinks;
