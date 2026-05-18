import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import Layout from '@/components/Layout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Lock, Save, Edit, Plus, Image, FileText, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import AdminBackendPanel from "@/components/AdminBackendPanel";

// Admin authentication schema
const authSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// About page schema
const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  bio: z.string().min(10, "Bio deve ter pelo menos 10 caracteres"),
  email: z.string().email("Email inválido"),
  location: z.string().min(2, "Localização deve ter pelo menos 2 caracteres"),
  lattes: z.string().url("URL do Lattes inválida"),
  profileImage: z.string().url("URL da imagem de perfil inválida"),
  researchFocus: z.string().min(5, "Áreas de pesquisa são obrigatórias")
});

// Project schema
const projectSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tags: z.string().min(3, "Add at least one tag"),
  image: z.string().url("Must be a valid URL"),
  github: z.string().url("Must be a valid URL"),
  live: z.string().url("Must be a valid URL").optional().nullable(),
  readme: z.string().min(10, "Readme must be at least 10 characters"),
});

// Education, Experience, Publications, and Skills schemas
const educationSchema = z.object({
  items: z.string().min(10, "Educação deve ter pelo menos 10 caracteres"),
});

const experienceSchema = z.object({
  items: z.string().min(10, "Experiência deve ter pelo menos 10 caracteres"),
});

const publicationsSchema = z.object({
  articles: z.string().min(5, "Artigos em periódicos são obrigatórios"),
  conferences: z.string().min(5, "Conferências são obrigatórias"),
  patents: z.string().min(5, "Patentes são obrigatórias")
});

const skillsSchema = z.object({
  coreSkills: z.string().min(5, "Habilidades principais são obrigatórias"),
  advancedSkills: z.string().min(5, "Habilidades avançadas são obrigatórias"),
  technologies: z.string().min(5, "Tecnologias são obrigatórias"),
  awards: z.string().min(5, "Prêmios e certificações são obrigatórios")
});

// Blog post schema
const blogPostSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  slug: z.string().min(5, "Slug deve ter pelo menos 5 caracteres"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  image: z.string().url("URL da imagem inválida").optional().or(z.literal('')),
});

type AuthFormValues = z.infer<typeof authSchema>;
type ProfileFormValues = z.infer<typeof profileSchema>;
type ProjectFormValues = z.infer<typeof projectSchema>;
type EducationFormValues = z.infer<typeof educationSchema>;
type ExperienceFormValues = z.infer<typeof experienceSchema>;
type PublicationsFormValues = z.infer<typeof publicationsSchema>;
type SkillsFormValues = z.infer<typeof skillsSchema>;
type BlogPostFormValues = z.infer<typeof blogPostSchema>;

// Sample About data (replace with localStorage or other storage)
const defaultAboutData = {
  name: "Dr. Melquizedequi Cabral dos Santos",
  title: "Professor Associado - Universidade Federal do Piauí",
  bio: "Pesquisador e especialista em cibersegurança com foco em técnicas avançadas de proteção de dados e desenvolvimento de soluções de segurança para redes e sistemas. Experiência em algoritmos de machine learning aplicados à detecção de intrusão e análise de vulnerabilidades.",
  email: "secure@cyberdomain.net",
  location: "São Paulo, Brasil",
  lattes: "https://lattes.cnpq.br/2915812289846388",
  profileImage: "https://avatars.githubusercontent.com/u/583231",
  researchFocus: [
    "Cibersegurança", 
    "Machine Learning", 
    "Análise de Vulnerabilidades", 
    "Redes Neurais", 
    "Detecção de Intrusão", 
    "Segurança de Dados"
  ]
};

// Dados padrão para educação
const defaultEducationData = [
  {
    title: "Doutorado em Ciência da Computação",
    period: "2018-2022",
    institution: "Universidade de São Paulo (USP)",
    description: "Tese: \"Algoritmos de Aprendizado Profundo para Detecção Avançada de Intrusões em Redes de Alta Velocidade\""
  },
  {
    title: "Mestrado em Segurança Computacional",
    period: "2016-2018",
    institution: "Universidade Estadual de Campinas (UNICAMP)",
    description: "Dissertação: \"Métodos Avançados de Criptografia Aplicados à Proteção de Dados em Sistemas Distribuídos\""
  },
  {
    title: "Graduação em Ciência da Computação",
    period: "2012-2016",
    institution: "Instituto Tecnológico de Aeronáutica (ITA)",
    description: "Trabalho de Conclusão de Curso: \"Desenvolvimento de Sistema de Análise de Vulnerabilidades em Redes Corporativas\""
  },
  {
    title: "Certificações Profissionais",
    period: "DIVERSAS",
    institution: "",
    certifications: [
      "Certified Information Systems Security Professional (CISSP)",
      "Offensive Security Certified Professional (OSCP)",
      "Certified Ethical Hacker (CEH)",
      "GIAC Security Essentials (GSEC)"
    ]
  }
];

// Dados padrão para experiência
const defaultExperienceData = [
  {
    title: "Pesquisador Sênior em Cibersegurança",
    period: "2022-PRESENTE",
    company: "Instituto de Pesquisas Avançadas em Tecnologia (IPAT)",
    duties: [
      "Liderança em projetos de pesquisa em segurança de redes e sistemas",
      "Desenvolvimento de novos algoritmos para detecção de ataques avançados",
      "Coordenação de equipe multidisciplinar com foco em segurança de dados"
    ]
  },
  {
    title: "Consultor de Segurança da Informação",
    period: "2019-2022",
    company: "CyberShield Technologies",
    duties: [
      "Realização de testes de penetração em sistemas críticos",
      "Análise e mitigação de vulnerabilidades em aplicações corporativas",
      "Implementação de soluções de proteção para infraestruturas complexas"
    ]
  },
  {
    title: "Pesquisador Associado",
    period: "2016-2019",
    company: "Laboratório de Segurança em Computação (LabSEC)",
    duties: [
      "Pesquisa em técnicas de machine learning para análise de malware",
      "Desenvolvimento de ferramentas para análise automática de ameaças",
      "Publicação de artigos científicos em periódicos de alto impacto"
    ]
  }
];

// Dados padrão para publicações
const defaultPublicationsData = {
  articles: [
    {
      year: "2023",
      title: "Deep Learning-Based Anomaly Detection for Zero-Day Attack Identification in High-Speed Networks",
      journal: "Journal of Cybersecurity Research, Vol. 15, Issue 4"
    },
    {
      year: "2022",
      title: "A Novel Approach for Malware Classification Using Convolutional Neural Networks and Binary Visualization",
      journal: "IEEE Transactions on Information Security, Vol. 44, Issue 2"
    },
    {
      year: "2021",
      title: "Quantum-Resistant Cryptographic Protocols for Secure IoT Communications",
      journal: "International Journal of Network Security, Vol. 32, Issue 8"
    },
    {
      year: "2020",
      title: "Advanced Persistent Threats Detection Using Machine Learning Techniques",
      journal: "Computers & Security Journal, Vol. 89"
    }
  ],
  conferences: [
    {
      year: "2023",
      title: "Adversarial Machine Learning for Robust Intrusion Detection Systems",
      conference: "International Conference on Network and Systems Security (NSS)"
    },
    {
      year: "2022",
      title: "Real-time Network Traffic Analysis Using Graph Neural Networks",
      conference: "IEEE Symposium on Security and Privacy (S&P)"
    },
    {
      year: "2021",
      title: "Blockchain-based Framework for Secure Firmware Updates in IoT Devices",
      conference: "ACM Conference on Computer and Communications Security (CCS)"
    }
  ],
  patents: [
    {
      year: "2022",
      title: "Sistema de Detecção de Intrusão Baseado em Análise Comportamental e Aprendizado Profundo",
      number: "Patente Nº BR10202200XXXX"
    },
    {
      year: "2021",
      title: "Método para Identificação Automática de Vulnerabilidades em Aplicações Web",
      number: "Patente Nº BR10202100XXXX"
    }
  ]
};

// Dados padrão para habilidades
const defaultSkillsData = {
  coreSkills: [
    { name: "Python", level: 92 },
    { name: "Machine Learning", level: 85 },
    { name: "Cybersecurity", level: 90 },
    { name: "Data Science", level: 88 }
  ],
  advancedSkills: [
    { name: "Network Security", level: 86 },
    { name: "Web Development", level: 78 },
    { name: "Blockchain", level: 75 },
    { name: "Cloud Computing", level: 80 }
  ],
  technologies: [
    "Python", "C/C++", "JavaScript", "Rust", "TensorFlow", 
    "PyTorch", "Docker", "Kubernetes", "AWS", "Linux", 
    "Blockchain", "Network Analysis"
  ],
  awards: [
    "Best Paper Award - Cybersecurity Conference 2022",
    "Young Researcher Award - INFOCOM 2021",
    "Top Security Researcher - CyberShield 2020",
    "Innovation Prize - Brazilian Computing Society"
  ]
};

// Sample Projects data from the existing page
const defaultProjects = [
  {
    id: 1,
    title: "NeuraScan",
    description: "Advanced neural network-based vulnerability scanner with deep learning capabilities to identify zero-day exploits in web applications.",
    tags: "Python, Machine Learning, Security",
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
    tags: "Rust, Networking, Firewall",
    image: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    github: "https://github.com/overcyber/cybershield",
    live: "https://cybershield.dev",
    stars: 765,
    forks: 134,
    readme: "# CyberShield\n\nCyberShield is a next-generation intrusion prevention system built for high-performance environments where security cannot be compromised.",
  }
];

// Default blog posts
const defaultBlogPosts = [
  {
    id: "1",
    title: "Introdução à Segurança Cibernética",
    slug: "introducao-a-seguranca-cibernetica",
    excerpt: "Uma visão geral sobre os princípios fundamentais da segurança cibernética para iniciantes.",
    content: "# Introdução à Segurança Cibernética\n\nA segurança cibernética é um campo em constante evolução que se concentra na proteção de sistemas computacionais, redes e dados contra ataques digitais. Este artigo apresenta os conceitos básicos que todos os profissionais de tecnologia deveriam conhecer.\n\n## Princípios Fundamentais\n\n1. **Confidencialidade**: Garantir que as informações sensíveis só possam ser acessadas por pessoas autorizadas.\n2. **Integridade**: Assegurar que os dados não sejam alterados de forma não autorizada.\n3. **Disponibilidade**: Garantir que sistemas e dados estejam acessíveis quando necessários.\n\n## Ameaças Comuns\n\n- Malware: vírus, worms, ransomware\n- Phishing e engenharia social\n- Ataques de força bruta\n- Injeção de SQL\n- Cross-Site Scripting (XSS)\n\n## Boas Práticas\n\n- Manter sistemas atualizados\n- Usar senhas fortes e gerenciadores de senhas\n- Implementar autenticação de dois fatores\n- Realizar backups regulares\n- Treinar usuários para reconhecer ameaças\n\nA segurança cibernética não é apenas uma questão técnica, mas também cultural. Organizações eficientes criam uma cultura de segurança onde todos os membros entendem seu papel na proteção dos recursos digitais.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    createdAt: "2023-01-15T10:30:00Z"
  },
  {
    id: "2",
    title: "Machine Learning Aplicado à Segurança de Redes",
    slug: "machine-learning-aplicado-a-seguranca-de-redes",
    excerpt: "Como algoritmos de aprendizado de máquina estão revolucionando a detecção de intrusões em redes.",
    content: "# Machine Learning Aplicado à Segurança de Redes\n\nA aplicação de técnicas de machine learning na segurança de redes tem se mostrado uma abordagem poderosa para identificar e mitigar ameaças cibernéticas cada vez mais sofisticadas.\n\n## Por que Machine Learning?\n\nOs métodos tradicionais de segurança baseados em regras e assinaturas têm limitações significativas:\n\n- Não detectam ameaças desconhecidas (zero-day)\n- Requerem atualizações constantes\n- Geram muitos falsos positivos\n\nO machine learning pode superar essas limitações, identificando padrões anômalos e adaptando-se a novas ameaças.\n\n## Técnicas Mais Utilizadas\n\n### Supervisionadas\n- Random Forests para classificação de tráfego malicioso\n- Redes Neurais para análise de comportamentos suspeitos\n- SVM (Support Vector Machines) para detecção de anomalias\n\n### Não-supervisionadas\n- Clustering para agrupar comportamentos similares\n- Detecção de anomalias para identificar desvios de padrões normais\n- Autoencoders para redução dimensional e detecção de outliers\n\n## Desafios\n\n- Necessidade de grandes conjuntos de dados para treinamento\n- Balanceamento entre falsos positivos e falsos negativos\n- Adaptação a ambientes de rede em constante mudança\n- Interpretabilidade dos modelos para análise forense\n\n## Implementações Práticas\n\nSistemas modernos de detecção de intrusão (IDS) e sistemas de prevenção de intrusão (IPS) já incorporam algoritmos de ML para melhorar sua eficácia. Ferramentas como Darktrace, Vectra AI e Cisco Stealthwatch utilizam essas técnicas para proporcionar proteção em tempo real contra ameaças avançadas.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    createdAt: "2023-02-22T14:45:00Z"
  }
];

// Helper function to load and save data from local storage
const loadData = (key: string, defaultValue: any) => {
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

const saveData = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper functions for data formatting
function formatEducationData(data: any) {
  return data.map((item: any) => {
    let text = `${item.title} | ${item.period} | ${item.institution || ''} | ${item.description || ''}`;
    if (item.certifications) {
      text += ` | ${item.certifications.join('; ')}`;
    }
    return text;
  }).join('\n');
}

function parseEducationData(text: string) {
  return text.split('\n').filter(line => line.trim()).map(line => {
    const parts = line.split('|').map(part => part.trim());
    const result: any = {
      title: parts[0] || '',
      period: parts[1] || '',
      institution: parts[2] || '',
      description: parts[3] || ''
    };
    
    if (parts[4]) {
      result.certifications = parts[4].split(';').map(cert => cert.trim());
    }
    
    return result;
  });
}

function formatExperienceData(data: any) {
  return data.map((item: any) => {
    return `${item.title} | ${item.period} | ${item.company} | ${item.duties.join('; ')}`;
  }).join('\n');
}

function parseExperienceData(text: string) {
  return text.split('\n').filter(line => line.trim()).map(line => {
    const parts = line.split('|').map(part => part.trim());
    return {
      title: parts[0] || '',
      period: parts[1] || '',
      company: parts[2] || '',
      duties: (parts[3] || '').split(';').map(duty => duty.trim())
    };
  });
}

function formatArticlesData(data: any) {
  return data.map((item: any) => {
    return `${item.year} | ${item.title} | ${item.journal}`;
  }).join('\n');
}

function formatConferencesData(data: any) {
  return data.map((item: any) => {
    return `${item.year} | ${item.title} | ${item.conference}`;
  }).join('\n');
}

function formatPatentsData(data: any) {
  return data.map((item: any) => {
    return `${item.year} | ${item.title} | ${item.number}`;
  }).join('\n');
}

function parsePublicationsData(articles: string, conferences: string, patents: string) {
  return {
    articles: articles.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('|').map(part => part.trim());
      return {
        year: parts[0] || '',
        title: parts[1] || '',
        journal: parts[2] || ''
      };
    }),
    conferences: conferences.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('|').map(part => part.trim());
      return {
        year: parts[0] || '',
        title: parts[1] || '',
        conference: parts[2] || ''
      };
    }),
    patents: patents.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('|').map(part => part.trim());
      return {
        year: parts[0] || '',
        title: parts[1] || '',
        number: parts[2] || ''
      };
    })
  };
}

function formatSkillsData(data: any) {
  return data.map((item: any) => {
    return `${item.name} | ${item.level}`;
  }).join('\n');
}

function parseSkillsData(coreText: string, advancedText: string, technologiesText: string, awardsText: string) {
  return {
    coreSkills: coreText.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('|').map(part => part.trim());
      return {
        name: parts[0] || '',
        level: parseInt(parts[1] || '0')
      };
    }),
    advancedSkills: advancedText.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('|').map(part => part.trim());
      return {
        name: parts[0] || '',
        level: parseInt(parts[1] || '0')
      };
    }),
    technologies: technologiesText.split(',').map(tech => tech.trim()),
    awards: awardsText.split('\n').filter(line => line.trim())
  };
}

// Helper function to convert title to slug
const generateSlugFromTitle = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, "")
    .replace(/[áàâã]/g, "a")
    .replace(/[éèê]/g, "e")
    .replace(/[íï]/g, "i")
    .replace(/[óôõö]/g, "o")
    .replace(/[úü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/ñ/g, "n")
    .replace(/\s+/g, "-");
};

// Main Admin component
const Admin: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [allowedIPs, setAllowedIPs] = useState(['127.0.0.1', 'localhost', '::1']);
  
  // Content state
  const [aboutData, setAboutData] = useState(() => loadData('admin-about-data', defaultAboutData));
  const [educationData, setEducationData] = useState(() => loadData('admin-education-data', defaultEducationData));
  const [experienceData, setExperienceData] = useState(() => loadData('admin-experience-data', defaultExperienceData));
  const [publicationsData, setPublicationsData] = useState(() => loadData('admin-publications-data', defaultPublicationsData));
  const [skillsData, setSkillsData] = useState(() => loadData('admin-skills-data', defaultSkillsData));
  const [projects, setProjects] = useState(() => loadData('admin-projects-data', defaultProjects));
  const [blogPosts, setBlogPosts] = useState(() => loadData('blog-posts', defaultBlogPosts));
  
  // UI state
  const [activeTab, setActiveTab] = useState("profile");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectFormValues | null>(null);
  const [isBlogPostDialogOpen, setIsBlogPostDialogOpen] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState<any>(null);
  
  // Forms
  const authForm = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      password: "",
    },
  });
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: aboutData.name,
      title: aboutData.title,
      bio: aboutData.bio,
      email: aboutData.email,
      location: aboutData.location,
      lattes: aboutData.lattes,
      profileImage: aboutData.profileImage,
      researchFocus: aboutData.researchFocus.join(', ')
    }
  });
  
  const educationForm = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      items: formatEducationData(educationData)
    }
  });
  
  const experienceForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      items: formatExperienceData(experienceData)
    }
  });
  
  const publicationsForm = useForm<PublicationsFormValues>({
    resolver: zodResolver(publicationsSchema),
    defaultValues: {
      articles: formatArticlesData(publicationsData.articles),
      conferences: formatConferencesData(publicationsData.conferences),
      patents: formatPatentsData(publicationsData.patents)
    }
  });
  
  const skillsForm = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      coreSkills: formatSkillsData(skillsData.coreSkills),
      advancedSkills: formatSkillsData(skillsData.advancedSkills),
      technologies: skillsData.technologies.join(', '),
      awards: skillsData.awards.join('\n')
    }
  });
  
  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      image: "",
      github: "",
      live: "",
      readme: "",
    },
  });
  
  const blogPostForm = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image: "",
    }
  });
  
  const navigate = useNavigate();
  
  // Get user's IP address
  useEffect(() => {
    const checkLocalhost = () => {
      // Verifica se está acessando via localhost ou 127.0.0.1
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      
      console.log('Hostname atual:', hostname);
      console.log('Porta atual:', port);
      
      // Se estiver acessando localmente, define o IP como localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('Acesso local detectado');
        setIpAddress(hostname);
        return true;
      }
      
      return false;
    };

    const getOnlineIpAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error('Erro ao obter IP online:', error);
        throw error;
      }
    };

    const getIpAddress = async () => {
      // Primeiro verifica se é localhost
      if (checkLocalhost()) {
        // Se for localhost, não precisa fazer mais nada
        return;
      }
      
      // Se não for localhost, tenta obter o IP online
      try {
        const onlineIp = await getOnlineIpAddress();
        console.log('IP online encontrado:', onlineIp);
        setIpAddress(onlineIp);
      } catch (onlineError) {
        console.error('Erro ao obter IP online:', onlineError);
        setIpAddress('unknown');
      }
    };
    
    getIpAddress();

    // Reset form values with data from localStorage
    const loadedAboutData = loadData('admin-about-data', defaultAboutData);
    setAboutData(loadedAboutData);
    profileForm.reset({
      name: loadedAboutData.name,
      title: loadedAboutData.title,
      bio: loadedAboutData.bio,
      email: loadedAboutData.email,
      location: loadedAboutData.location,
      lattes: loadedAboutData.lattes,
      profileImage: loadedAboutData.profileImage,
      researchFocus: loadedAboutData.researchFocus.join(', ')
    });

    const loadedEducationData = loadData('admin-education-data', defaultEducationData);
    setEducationData(loadedEducationData);
    educationForm.reset({
      items: formatEducationData(loadedEducationData)
    });

    const loadedExperienceData = loadData('admin-experience-data', defaultExperienceData);
    setExperienceData(loadedExperienceData);
    experienceForm.reset({
      items: formatExperienceData(loadedExperienceData)
    });

    const loadedPublicationsData = loadData('admin-publications-data', defaultPublicationsData);
    setPublicationsData(loadedPublicationsData);
    publicationsForm.reset({
      articles: formatArticlesData(loadedPublicationsData.articles),
      conferences: formatConferencesData(loadedPublicationsData.conferences),
      patents: formatPatentsData(loadedPublicationsData.patents)
    });

    const loadedSkillsData = loadData('admin-skills-data', defaultSkillsData);
    setSkillsData(loadedSkillsData);
    skillsForm.reset({
      coreSkills: formatSkillsData(loadedSkillsData.coreSkills),
      advancedSkills: formatSkillsData(loadedSkillsData.advancedSkills),
      technologies: loadedSkillsData.technologies.join(', '),
      awards: loadedSkillsData.awards.join('\n')
    });

    const loadedProjects = loadData('admin-projects-data', defaultProjects);
    setProjects(loadedProjects);
    
    const loadedBlogPosts = loadData('blog-posts', defaultBlogPosts);
    setBlogPosts(loadedBlogPosts);
  }, []);
  
  // Check if IP is allowed (localhost is always allowed for development)
  const isIPAllowed = () => {
    return allowedIPs.includes(ipAddress) ||
            ipAddress === '127.0.0.1' ||
            ipAddress === 'localhost' ||
            ipAddress === '192.168.10.21' ||
            ipAddress === '192.168.10.18' ||
            ipAddress === '::1';
  };

  // Authentication
  const onAuthSubmit = (data: AuthFormValues) => {
    // Simple password check (in a real app, use a more secure method)
    if (data.password === "admin123") {
      if (isIPAllowed()) {
        setIsAuthenticated(true);
        toast({
          title: "Authentication successful",
          description: "Welcome to the admin panel.",
        });
      } else {
        toast({
          title: "IP not allowed",
          description: `Your IP (${ipAddress}) is not in the allowed list.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Authentication failed",
        description: "Incorrect password.",
        variant: "destructive",
      });
    }
  };

  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    const updatedProfile = {
      ...aboutData,
      name: data.name,
      title: data.title,
      bio: data.bio,
      email: data.email,
      location: data.location,
      lattes: data.lattes,
      profileImage: data.profileImage,
      researchFocus: data.researchFocus.split(',').map(item => item.trim())
    };
    
    setAboutData(updatedProfile);
    saveData('admin-about-data', updatedProfile);
    
    toast({
      title: "Perfil atualizado",
      description: "As informações do perfil foram salvas com sucesso.",
    });
  };

  const onEducationSubmit = (data: EducationFormValues) => {
    const updatedEducation = parseEducationData(data.items);
    setEducationData(updatedEducation);
    saveData('admin-education-data', updatedEducation);
    
    toast({
      title: "Educação atualizada",
      description: "As informações sobre educação foram salvas com sucesso.",
    });
  };

  const onExperienceSubmit = (data: ExperienceFormValues) => {
    const updatedExperience = parseExperienceData(data.items);
    setExperienceData(updatedExperience);
    saveData('admin-experience-data', updatedExperience);
    
    toast({
      title: "Experiência atualizada",
      description: "As informações sobre experiência profissional foram salvas com sucesso.",
    });
  };

  const onPublicationsSubmit = (data: PublicationsFormValues) => {
    const updatedPublications = parsePublicationsData(data.articles, data.conferences, data.patents);
    setPublicationsData(updatedPublications);
    saveData('admin-publications-data', updatedPublications);
    
    toast({
      title: "Publicações atualizadas",
      description: "As informações sobre publicações foram salvas com sucesso.",
    });
  };

  const onSkillsSubmit = (data: SkillsFormValues) => {
    const updatedSkills = parseSkillsData(data.coreSkills, data.advancedSkills, data.technologies, data.awards);
    setSkillsData(updatedSkills);
    saveData('admin-skills-data', updatedSkills);
    
    toast({
      title: "Habilidades atualizadas",
      description: "As informações sobre habilidades foram salvas com sucesso.",
    });
  };

  // Project management
  const openProjectDialog = (project?: ProjectFormValues) => {
    if (project) {
      setCurrentProject(project);
      projectForm.reset(project);
    } else {
      setCurrentProject(null);
      projectForm.reset({
        title: "",
        description: "",
        tags: "",
        image: "",
        github: "",
        live: "",
        readme: "",
      });
    }
    setIsProjectDialogOpen(true);
  };

  const onProjectSubmit = (data: ProjectFormValues) => {
    let updatedProjects;
    
    if (currentProject && currentProject.id) {
      // Edit existing project
      updatedProjects = projects.map(p => 
        p.id === currentProject.id ? { ...data, id: currentProject.id, stars: p.stars, forks: p.forks } : p
      );
      toast({
        title: "Project updated",
        description: `"${data.title}" has been updated.`,
      });
    } else {
      // Add new project
      const newProject = {
        ...data,
        id: Math.max(0, ...projects.map(p => p.id || 0)) + 1,
        stars: 0,
        forks: 0,
      };
      updatedProjects = [...projects, newProject];
      toast({
        title: "Project added",
        description: `"${data.title}" has been added to your projects.`,
      });
    }
    
    setProjects(updatedProjects);
    saveData('admin-projects-data', updatedProjects);
    setIsProjectDialogOpen(false);
  };

  const deleteProject = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const updatedProjects = projects.filter(p => p.id !== id);
      setProjects(updatedProjects);
      saveData('admin-projects-data', updatedProjects);
      toast({
        title: "Project deleted",
        description: "The project has been removed from your portfolio.",
      });
    }
  };
  
  // Blog post management
  const openBlogPostDialog = (post?: any) => {
    if (post) {
      setCurrentBlogPost(post);
      blogPostForm.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
      });
    } else {
      setCurrentBlogPost(null);
      blogPostForm.reset({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image: "",
      });
    }
    setIsBlogPostDialogOpen(true);
  };

  const onBlogPostSubmit = (data: BlogPostFormValues) => {
    if (currentBlogPost) {
      // Edit existing post
      const updatedPosts = blogPosts.map(post => 
        post.id === currentBlogPost.id ? 
          { 
            ...post, 
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || "",
            content: data.content,
            image: data.image || "",
          } : post
      );
      
      setBlogPosts(updatedPosts);
      saveData('blog-posts', updatedPosts);
      
      toast({
        title: "Post atualizado",
        description: `"${data.title}" foi atualizado com sucesso.`,
      });
    } else {
      // Add new post
      const newPost = {
        id: Date.now().toString(),
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content,
        image: data.image || "",
        createdAt: new Date().toISOString(),
      };
      
      const updatedPosts = [...blogPosts, newPost];
      setBlogPosts(updatedPosts);
      saveData('blog-posts', updatedPosts);
      
      toast({
        title: "Post criado",
        description: `"${data.title}" foi criado com sucesso.`,
      });
    }
    
    setIsBlogPostDialogOpen(false);
  };

  const deleteBlogPost = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este post?")) {
      const updatedPosts = blogPosts.filter(post => post.id !== id);
      setBlogPosts(updatedPosts);
      saveData('blog-posts', updatedPosts);
      
      toast({
        title: "Post excluído",
        description: "O post foi removido do seu blog.",
      });
    }
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <Layout title="ADMIN AUTHENTICATION">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Card className="w-full max-w-md neo-blur border border-cyber-neon/30">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock size={20} className="mr-2 text-cyber-neon" />
                Admin Authentication
              </CardTitle>
              <CardDescription>
                Enter your password to access the admin area.
                {!isIPAllowed() && (
                  <div className="mt-2 text-destructive">
                    Warning: Your IP ({ipAddress}) is not in the allowed list.
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...authForm}>
                <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-4">
                  <FormField
                    control={authForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter admin password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Authenticate
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/')}>
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  // Admin interface after authentication
  return (
    <Layout title="ADMIN PANEL">
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-cyber-black border border-cyber-neon/30 p-1">
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              PERFIL
            </TabsTrigger>
            <TabsTrigger 
              value="education"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              EDUCAÇÃO
            </TabsTrigger>
            <TabsTrigger 
              value="experience"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              EXPERIÊNCIA
            </TabsTrigger>
            <TabsTrigger 
              value="publications"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              PUBLICAÇÕES
            </TabsTrigger>
            <TabsTrigger 
              value="skills"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              HABILIDADES
            </TabsTrigger>
            <TabsTrigger 
              value="projects"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              PROJETOS
            </TabsTrigger>
            <TabsTrigger 
              value="blog"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              BLOG
            </TabsTrigger>
            <TabsTrigger
              value="backend"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              BACKEND
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader>
                <CardTitle>Editar Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e profissionais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título Profissional</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu título profissional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografia</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Breve biografia sobre você"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="seu.email@dominio.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade, Estado, País" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="lattes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL do Lattes</FormLabel>
                            <FormControl>
                              <Input placeholder="https://lattes.cnpq.br/..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="profileImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL da Imagem de Perfil</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/imagem.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="researchFocus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Áreas de Pesquisa (separadas por vírgula)</FormLabel>
                          <FormControl>
                            <Input placeholder="Cibersegurança, Machine Learning, Análise de Dados" {...field} />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Digite as áreas de pesquisa separadas por vírgula.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="profile-form"
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Save size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader>
                <CardTitle>Editar Educação</CardTitle>
                <CardDescription>
                  Atualize suas informações educacionais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...educationForm}>
                  <form id="education-form" onSubmit={educationForm.handleSubmit(onEducationSubmit)} className="space-y-4">
                    <FormField
                      control={educationForm.control}
                      name="items"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Itens de Educação</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Formato: Título | Período | Instituição | Descrição | Certificações (separadas por ;)"
                              className="min-h-[300px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Cada linha representa um item educacional. Use o formato:<br />
                            <code>Título | Período | Instituição | Descrição | Certificações (separadas por ;)</code><br />
                            Exemplo: Doutorado em Ciência da Computação | 2018-2022 | USP | Tese: "Título da Tese"
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="education-form"
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Save size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="experience">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader>
                <CardTitle>Editar Experiência Profissional</CardTitle>
                <CardDescription>
                  Atualize suas informações de experiência profissional.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...experienceForm}>
                  <form id="experience-form" onSubmit={experienceForm.handleSubmit(onExperienceSubmit)} className="space-y-4">
                    <FormField
                      control={experienceForm.control}
                      name="items"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Itens de Experiência</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Formato: Cargo | Período | Empresa | Responsabilidades (separadas por ;)"
                              className="min-h-[300px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Cada linha representa uma experiência profissional. Use o formato:<br />
                            <code>Cargo | Período | Empresa | Responsabilidade 1; Responsabilidade 2; Responsabilidade 3</code><br />
                            Exemplo: Pesquisador Sênior | 2022-PRESENTE | Instituto XYZ | Liderança em projetos; Desenvolvimento de algoritmos
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="experience-form"
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Save size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="publications">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader>
                <CardTitle>Editar Publicações</CardTitle>
                <CardDescription>
                  Atualize suas publicações acadêmicas e patentes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...publicationsForm}>
                  <form id="publications-form" onSubmit={publicationsForm.handleSubmit(onPublicationsSubmit)} className="space-y-6">
                    <FormField
                      control={publicationsForm.control}
                      name="articles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artigos em Periódicos</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Formato: Ano | Título | Periódico"
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Cada linha representa um artigo. Use o formato: <code>Ano | Título | Periódico</code>
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={publicationsForm.control}
                      name="conferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conferências Internacionais</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Formato: Ano | Título | Conferência"
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Cada linha representa uma conferência. Use o formato: <code>Ano | Título | Conferência</code>
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={publicationsForm.control}
                      name="patents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patentes e Propriedade Intelectual</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Formato: Ano | Título | Número da Patente"
                              className="min-h-[150px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Cada linha representa uma patente. Use o formato: <code>Ano | Título | Número da Patente</code>
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="publications-form"
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Save size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader>
                <CardTitle>Editar Habilidades</CardTitle>
                <CardDescription>
                  Atualize suas habilidades técnicas e prêmios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...skillsForm}>
                  <form id="skills-form" onSubmit={skillsForm.handleSubmit(onSkillsSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={skillsForm.control}
                        name="coreSkills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Habilidades Principais</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Formato: Nome | Nível (0-100)"
                                className="min-h-[150px] font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            <FormDescription>
                              Cada linha representa uma habilidade. Use o formato: <code>Nome | Nível (0-100)</code><br />
                              Exemplo: Python | 92
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={skillsForm.control}
                        name="advancedSkills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Habilidades Avançadas</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Formato: Nome | Nível (0-100)"
                                className="min-h-[150px] font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            <FormDescription>
                              Cada linha representa uma habilidade. Use o formato: <code>Nome | Nível (0-100)</code><br />
                              Exemplo: Network Security | 86
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={skillsForm.control}
                      name="technologies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Linguagens e Tecnologias (separadas por vírgula)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Python, C/C++, JavaScript, Rust, TensorFlow, PyTorch, Docker, Kubernetes"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={skillsForm.control}
                      name="awards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificações e Prêmios</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Um prêmio ou certificação por linha"
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Cada linha representa um prêmio ou certificação.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="skills-form"
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Save size={16} className="mr-2" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Projetos</CardTitle>
                  <CardDescription>
                    Adicione, edite ou remova projetos do seu portfólio.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openProjectDialog()}
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  Adicionar Novo Projeto
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>{project.tags}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProjectDialog(project)}
                            className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                          >
                            <Edit size={14} className="mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProject(project.id || 0)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/20"
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="blog">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Blog</CardTitle>
                  <CardDescription>
                    Adicione, edite ou remova posts do seu blog.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openBlogPostDialog()}
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Plus size={16} className="mr-2" />
                  Novo Post
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell className="font-mono text-sm">{post.slug}</TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openBlogPostDialog(post)}
                            className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                          >
                            <Edit size={14} className="mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBlogPost(post.id)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/20"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend">
            <AdminBackendPanel />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Project Edit Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-3xl neo-blur border border-cyber-neon/30">
          <DialogHeader>
            <DialogTitle>
              {currentProject ? `Editar Projeto: ${currentProject.title}` : 'Adicionar Novo Projeto'}
            </DialogTitle>
            <DialogDescription>
              {currentProject
                ? 'Atualize os detalhes do seu projeto existente.'
                : 'Preencha os detalhes para adicionar um novo projeto ao seu portfólio.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...projectForm}>
            <form id="project-form" onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título do projeto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="Python, Machine Learning, Security" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={projectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Uma breve descrição do projeto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={projectForm.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do GitHub</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username/repo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={projectForm.control}
                name="live"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Demo (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={projectForm.control}
                name="readme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo do README (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="# Título do Projeto"
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProjectDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="project-form"
              className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
            >
              {currentProject ? 'Atualizar Projeto' : 'Adicionar Projeto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Blog Post Edit Dialog */}
      <Dialog open={isBlogPostDialogOpen} onOpenChange={setIsBlogPostDialogOpen}>
        <DialogContent className="max-w-4xl neo-blur border border-cyber-neon/30">
          <DialogHeader>
            <DialogTitle>
              {currentBlogPost ? `Editar Post: ${currentBlogPost.title}` : 'Criar Novo Post'}
            </DialogTitle>
            <DialogDescription>
              {currentBlogPost
                ? 'Atualize os detalhes do seu post existente.'
                : 'Preencha os detalhes para adicionar um novo post ao seu blog.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...blogPostForm}>
            <form id="blog-post-form" onSubmit={blogPostForm.handleSubmit(onBlogPostSubmit)} className="space-y-4">
              <FormField
                control={blogPostForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Título do post" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          if (!currentBlogPost && !blogPostForm.getValues().slug) {
                            blogPostForm.setValue('slug', generateSlugFromTitle(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={blogPostForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="titulo-do-post" className="font-mono text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Versão do título amigável para URL. Gerado automaticamente, mas pode ser editado.
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={blogPostForm.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Um breve resumo do seu post (aparece na listagem do blog)"
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={blogPostForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem de Destaque</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          className="font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <Button variant="outline" size="icon" type="button" disabled>
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Informe uma URL para a imagem de destaque do seu post.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={blogPostForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Escreva o conteúdo do seu post aqui..."
                        className="min-h-[300px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Suporta formatação em markdown.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!currentBlogPost) {
                  blogPostForm.reset({
                    title: "",
                    slug: "",
                    excerpt: "",
                    content: "",
                    image: "",
                  });
                }
                setIsBlogPostDialogOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="blog-post-form"
              className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
            >
              <Save size={16} className="mr-2" />
              {currentBlogPost ? 'Atualizar Post' : 'Criar Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
