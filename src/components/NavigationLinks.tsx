
import { useState } from 'react';
import { FileCode, User, Archive, FileText, AtSign } from 'lucide-react';

const NavigationLinks = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const links = [
    { name: "BLOG", url: "/archive/", icon: <Archive size={16} /> },
    { name: "ABOUT", url: "/about/", icon: <User size={16} /> },
    { name: "PROJECTS", url: "/projects/", icon: <FileCode size={16} /> },
    { name: "RESUME", url: "/resume.pdf", icon: <FileText size={16} /> },
    { name: "CONTACT", url: "/contact/", icon: <AtSign size={16} /> }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full max-w-xl mb-8">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          className="cyber-button group flex items-center justify-center gap-2 rounded"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <span className={`transition-all duration-300 ${hoveredIndex === index ? 'text-white' : 'text-cyber-neon'}`}>
            {link.icon}
          </span>
          <span className="font-mono tracking-wider">{link.name}</span>
        </a>
      ))}
    </div>
  );
};

export default NavigationLinks;
