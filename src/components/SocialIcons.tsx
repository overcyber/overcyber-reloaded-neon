
import { Github, Twitter, Mail, Database, Rss } from 'lucide-react';

const SocialIcons = () => {
  const socialLinks = [
    { 
      icon: <Github className="w-6 h-6" />, 
      url: "https://github.com/overcyber", 
      label: "Github",
      color: "hover:text-white" 
    },
    { 
      icon: <Twitter className="w-6 h-6" />, 
      url: "https://twitter.com/overcyber", 
      label: "Twitter",
      color: "hover:text-cyber-blue" 
    },
    { 
      icon: <Mail className="w-6 h-6" />, 
      url: "mailto:email@example.com", 
      label: "Email",
      color: "hover:text-cyber-orange" 
    },
    { 
      icon: <Database className="w-6 h-6" />, 
      url: "https://keybase.io/overcyber", 
      label: "Keybase",
      color: "hover:text-cyber-purple" 
    },
    { 
      icon: <Rss className="w-6 h-6" />, 
      url: "/atom.xml", 
      label: "RSS",
      color: "hover:text-cyber-neon" 
    }
  ];

  return (
    <div className="flex justify-center space-x-6 mt-4">
      {socialLinks.map((link, index) => (
        <a 
          key={index}
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`text-gray-400 transition-all duration-300 transform hover:scale-110 ${link.color}`}
          aria-label={link.label}
        >
          <div className="relative group">
            {link.icon}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-mono text-cyber-neon">
              {link.label}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default SocialIcons;
