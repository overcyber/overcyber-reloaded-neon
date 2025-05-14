
/**
 * Hook to access content managed through the admin panel
 * This reads from localStorage if available, otherwise returns default values
 */

// Generic function to load data from localStorage
export const loadStoredContent = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error(`Error parsing ${key} from localStorage:`, err);
    }
  }
  return defaultValue;
};

// Function to get the about page content
export const getAboutContent = () => {
  const defaultAboutData = {
    name: "Dr. Melquizedequi Cabral dos Santos",
    title: "Professor Associado - Universidade Federal do Piauí",
    bio: "Pesquisador e professor com foco em Ciência da Computação, Inteligência Artificial e Processamento de Linguagem Natural.",
    education: "Doutor em Ciência da Computação pela Universidade Federal de Pernambuco (2011)\nMestre em Ciência da Computação pela Universidade Federal de Pernambuco (2007)\nGraduado em Ciência da Computação pela Universidade Federal do Piauí (2005)",
    experience: "Professor Associado na Universidade Federal do Piauí desde 2011\nLíder do grupo de pesquisa em Processamento de Linguagem Natural\nMembro do comitê científico de diversas conferências nacionais e internacionais",
    publications: "Mais de 50 artigos publicados em periódicos e conferências internacionais\nAutor de 3 capítulos de livros na área de Inteligência Artificial\nEditor convidado para edições especiais em revistas científicas",
  };
  
  return loadStoredContent('admin-about-data', defaultAboutData);
};

// Function to get the projects content
export const getProjectsContent = () => {
  const defaultProjects = [
    {
      id: 1,
      title: "NeuraScan",
      description: "Advanced neural network-based vulnerability scanner with deep learning capabilities to identify zero-day exploits in web applications.",
      tags: ["Python", "Machine Learning", "Security"],
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      github: "https://github.com/overcyber/neurascan",
      live: "https://neurascan.io",
      stars: 342,
      forks: 87,
      readme: "# NeuraScan: Next-Gen Vulnerability Scanner\n\n## Introduction\nNeuraScan is a revolutionary neural network-based vulnerability scanner that uses deep learning to identify potential zero-day exploits in web applications. By analyzing patterns in code and behavior, NeuraScan can predict vulnerabilities before they're officially discovered.",
    },
    {
      id: 2,
      title: "CyberShield",
      description: "Enterprise-grade intrusion prevention system with real-time threat intelligence and automated response capabilities.",
      tags: ["Rust", "Networking", "Firewall"],
      image: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      github: "https://github.com/overcyber/cybershield",
      live: "https://cybershield.dev",
      stars: 765,
      forks: 134,
      readme: "# CyberShield\n\nCyberShield is a next-generation intrusion prevention system built for high-performance environments where security cannot be compromised.",
    },
    {
      id: 3,
      title: "QuantumCrypt",
      description: "Post-quantum cryptographic library implementing advanced algorithms resistant to quantum computing attacks.",
      tags: ["C++", "Cryptography", "Quantum"],
      image: "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      github: "https://github.com/overcyber/quantumcrypt",
      live: null,
      stars: 531,
      forks: 97,
      readme: "# QuantumCrypt\n\n## Quantum-Resistant Cryptographic Library\n\nQuantumCrypt is a C++ library implementing advanced cryptographic algorithms designed to resist attacks from both classical and quantum computers.",
    },
  ];
  
  // Convert admin data format to the format expected by the Projects page
  const storedProjects = loadStoredContent('admin-projects-data', []);
  
  if (!storedProjects.length) {
    return defaultProjects;
  }
  
  return storedProjects.map((project: any) => ({
    ...project,
    // Convert comma-separated tags string to array if needed
    tags: typeof project.tags === 'string' 
      ? project.tags.split(',').map((tag: string) => tag.trim())
      : project.tags,
  }));
};
