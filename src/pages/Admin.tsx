
import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import Layout from '@/components/Layout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Lock, Save, Edit } from "lucide-react";

// Admin authentication schema
const authSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// About page schema
const aboutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  education: z.string().min(5, "Education must be at least 5 characters"),
  experience: z.string().min(5, "Experience must be at least 5 characters"),
  publications: z.string().min(5, "Publications must be at least 5 characters"),
});
// Esquema para a aba de perfil
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

// Esquema para educação (array)
const educationItemSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  period: z.string().min(2, "Período é obrigatório"),
  institution: z.string().optional(),
  description: z.string().optional(),
  certifications: z.string().optional()
});

// Esquema para experiência (array)
const experienceItemSchema = z.object({
  title: z.string().min(3, "Cargo deve ter pelo menos 3 caracteres"),
  period: z.string().min(2, "Período é obrigatório"),
  company: z.string().min(2, "Empresa/Instituição é obrigatória"),
  duties: z.string().min(5, "Responsabilidades são obrigatórias")
});

// Esquema para publicações
const publicationsSchema = z.object({
  articles: z.string().min(5, "Artigos em periódicos são obrigatórios"),
  conferences: z.string().min(5, "Conferências são obrigatórias"),
  patents: z.string().min(5, "Patentes são obrigatórias")
});

// Esquema para habilidades
const skillsSchema = z.object({
  coreSkills: z.string().min(5, "Habilidades principais são obrigatórias"),
  advancedSkills: z.string().min(5, "Habilidades avançadas são obrigatórias"),
  technologies: z.string().min(5, "Tecnologias são obrigatórias"),
  awards: z.string().min(5, "Prêmios e certificações são obrigatórios")
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

type AboutFormValues = z.infer<typeof aboutSchema>;
// Tipos inferidos dos esquemas
type ProfileFormValues = z.infer<typeof profileSchema>;
type EducationItemFormValues = z.infer<typeof educationItemSchema>;
type ExperienceItemFormValues = z.infer<typeof experienceItemSchema>;
type PublicationsFormValues = z.infer<typeof publicationsSchema>;
type SkillsFormValues = z.infer<typeof skillsSchema>;
type ProjectFormValues = z.infer<typeof projectSchema>;

// Sample About data (replace with localStorage or other storage)
// const defaultAboutData = {
//   name: "Dr. Melquizedequi Cabral dos Santos",
//   title: "Professor Associado - Universidade Federal do Piauí",
//   bio: "Pesquisador e professor com foco em Ciência da Computação, Inteligência Artificial e Processamento de Linguagem Natural.",
//   education: "Doutor em Ciência da Computação pela Universidade Federal de Pernambuco (2011)\nMestre em Ciência da Computação pela Universidade Federal de Pernambuco (2007)\nGraduado em Ciência da Computação pela Universidade Federal do Piauí (2005)",
//   experience: "Professor Associado na Universidade Federal do Piauí desde 2011\nLíder do grupo de pesquisa em Processamento de Linguagem Natural\nMembro do comitê científico de diversas conferências nacionais e internacionais",
//   publications: "Mais de 50 artigos publicados em periódicos e conferências internacionais\nAutor de 3 capítulos de livros na área de Inteligência Artificial\nEditor convidado para edições especiais em revistas científicas",
// };

// Dados padrão para o About
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

// const defaultAboutData = {
//   name: "Dr. Melquizedequi Cabral dos Santos",
//   title: "Professor Associado - Universidade Federal do Piauí",
//   bio: "Pesquisador e especialista em cibersegurança com foco em técnicas avançadas de proteção de dados e desenvolvimento de soluções de segurança para redes e sistemas. Experiência em algoritmos de machine learning aplicados à detecção de intrusão e análise de vulnerabilidades.",
//   education: "Doutorado em Ciência da Computação - 2018-2022 - Universidade de São Paulo (USP) - Tese: \"Algoritmos de Aprendizado Profundo para Detecção Avançada de Intrusões em Redes de Alta Velocidade\"\nMestrado em Segurança Computacional - 2016-2018 - Universidade Estadual de Campinas (UNICAMP) - Dissertação: \"Métodos Avançados de Criptografia Aplicados à Proteção de Dados em Sistemas Distribuídos\"\nGraduação em Ciência da Computação - 2012-2016 - Instituto Tecnológico de Aeronáutica (ITA) - Trabalho de Conclusão de Curso: \"Desenvolvimento de Sistema de Análise de Vulnerabilidades em Redes Corporativas\"\nCertificações Profissionais - DIVERSAS - - Certified Information Systems Security Professional (CISSP); Offensive Security Certified Professional (OSCP); Certified Ethical Hacker (CEH); GIAC Security Essentials (GSEC)",
//   experience: "Pesquisador Sênior em Cibersegurança - 2022-PRESENTE - Instituto de Pesquisas Avançadas em Tecnologia (IPAT) - Liderança em projetos de pesquisa em segurança de redes e sistemas; Desenvolvimento de novos algoritmos para detecção de ataques avançados; Coordenação de equipe multidisciplinar com foco em segurança de dados\nConsultor de Segurança da Informação - 2019-2022 - CyberShield Technologies - Realização de testes de penetração em sistemas críticos; Análise e mitigação de vulnerabilidades em aplicações corporativas; Implementação de soluções de proteção para infraestruturas complexas\nPesquisador Associado - 2016-2019 - Laboratório de Segurança em Computação (LabSEC) - Pesquisa em técnicas de machine learning para análise de malware; Desenvolvimento de ferramentas para análise automática de ameaças; Publicação de artigos científicos em periódicos de alto impacto",
//   publications: "2023 - Deep Learning-Based Anomaly Detection for Zero-Day Attack Identification in High-Speed Networks - Journal of Cybersecurity Research, Vol. 15, Issue 4\n2022 - A Novel Approach for Malware Classification Using Convolutional Neural Networks and Binary Visualization - IEEE Transactions on Information Security, Vol. 44, Issue 2\n2021 - Quantum-Resistant Cryptographic Protocols for Secure IoT Communications - International Journal of Network Security, Vol. 32, Issue 8\n2020 - Advanced Persistent Threats Detection Using Machine Learning Techniques - Computers & Security Journal, Vol. 89",
// };

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

// Main Admin component
const Admin: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [allowedIPs, setAllowedIPs] = useState(['127.0.0.1', 'localhost', '::1']);
  
  // Content state
  const [aboutData, setAboutData] = useState<AboutFormValues>(() => 
    loadData('admin-about-data', defaultAboutData)
  );
  const [projects, setProjects] = useState<ProjectFormValues[]>(() => 
    loadData('admin-projects-data', defaultProjects)
  );
  
  // UI state
  const [activeTab, setActiveTab] = useState("about");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectFormValues | null>(null);
  
  // Forms
  const authForm = useForm<{ password: string }>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      password: "",
    },
  });
  
  const aboutForm = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: aboutData,
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
// novas funcionalidades


const [profileData, setProfileData] = useState(() => loadData('admin-about-data', defaultAboutData));
const [educationData, setEducationData] = useState(() => loadData('admin-education-data', defaultEducationData));
const [experienceData, setExperienceData] = useState(() => loadData('admin-experience-data', defaultExperienceData));
const [publicationsData, setPublicationsData] = useState(() => loadData('admin-publications-data', defaultPublicationsData));
const [skillsData, setSkillsData] = useState(() => loadData('admin-skills-data', defaultSkillsData));

// Forms adicionais
const profileForm = useForm<ProfileFormValues>({
  resolver: zodResolver(profileSchema),
  defaultValues: {
    name: profileData.name,
    title: profileData.title,
    bio: profileData.bio,
    email: profileData.email,
    location: profileData.location,
    lattes: profileData.lattes,
    profileImage: profileData.profileImage,
    researchFocus: profileData.researchFocus.join(', ')
  }
});

const educationForm = useForm<{ items: string }>({
  resolver: zodResolver(z.object({ items: z.string().min(10) })),
  defaultValues: {
    items: formatEducationData(educationData)
  }
});

const experienceForm = useForm<{ items: string }>({
  resolver: zodResolver(z.object({ items: z.string().min(10) })),
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

// Funções auxiliares para formatar os dados
function formatEducationData(data) {
  return data.map(item => {
    let text = `${item.title} | ${item.period} | ${item.institution || ''} | ${item.description || ''}`;
    if (item.certifications) {
      text += ` | ${item.certifications.join('; ')}`;
    }
    return text;
  }).join('\n');
}

function parseEducationData(text) {
  return text.split('\n').filter(line => line.trim()).map(line => {
    const parts = line.split('|').map(part => part.trim());
    const result = {
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

function formatExperienceData(data) {
  return data.map(item => {
    return `${item.title} | ${item.period} | ${item.company} | ${item.duties.join('; ')}`;
  }).join('\n');
}

function parseExperienceData(text) {
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

function formatArticlesData(data) {
  return data.map(item => {
    return `${item.year} | ${item.title} | ${item.journal}`;
  }).join('\n');
}

function formatConferencesData(data) {
  return data.map(item => {
    return `${item.year} | ${item.title} | ${item.conference}`;
  }).join('\n');
}

function formatPatentsData(data) {
  return data.map(item => {
    return `${item.year} | ${item.title} | ${item.number}`;
  }).join('\n');
}

function parsePublicationsData(articles, conferences, patents) {
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

function formatSkillsData(data) {
  return data.map(item => {
    return `${item.name} | ${item.level}`;
  }).join('\n');
}

function parseSkillsData(coreText, advancedText, technologiesText, awardsText) {
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

// Handlers para salvar os formulários
const onProfileSubmit = (data: ProfileFormValues) => {
  const updatedProfile = {
    ...profileData,
    name: data.name,
    title: data.title,
    bio: data.bio,
    email: data.email,
    location: data.location,
    lattes: data.lattes,
    profileImage: data.profileImage,
    researchFocus: data.researchFocus.split(',').map(item => item.trim())
  };
  
  setProfileData(updatedProfile);
  saveData('admin-about-data', updatedProfile);
  
  toast({
    title: "Perfil atualizado",
    description: "As informações do perfil foram salvas com sucesso.",
  });
};

const onEducationSubmit = (data: { items: string }) => {
  const updatedEducation = parseEducationData(data.items);
  setEducationData(updatedEducation);
  saveData('admin-education-data', updatedEducation);
  
  toast({
    title: "Educação atualizada",
    description: "As informações sobre educação foram salvas com sucesso.",
  });
};

const onExperienceSubmit = (data: { items: string }) => {
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
  const navigate = useNavigate();

  // Get user's IP address
  // useEffect(() => {
  //   const getIpAddress = async () => {
  //     try {
  //       const response = await fetch('https://api.ipify.org?format=json');
  //       const data = await response.json();
  //       setIpAddress(data.ip);
  //     } catch (error) {
  //       console.error('Error fetching IP:', error);
  //       setIpAddress('unknown');
  //     }
  //   };

  //   getIpAddress();
  // Get user's IP address
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
    
    // Load saved data
    const savedAboutData = loadData('admin-about-data', defaultAboutData);
    setAboutData(savedAboutData);
    aboutForm.reset(savedAboutData);
    
    const savedProjects = loadData('admin-projects-data', defaultProjects);
    setProjects(savedProjects);
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
  const onAuthSubmit = (data: { password: string }) => {
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

  // Save About data
  const onAboutSubmit = (data: AboutFormValues) => {
    setAboutData(data);
    saveData('admin-about-data', data);
    toast({
      title: "About page updated",
      description: "The changes have been saved successfully.",
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
        p.id === currentProject.id ? { ...data, id: currentProject.id, stars: 0, forks: 0 } : p
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
              value="about"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              ABOUT PAGE
            </TabsTrigger>
            <TabsTrigger 
              value="projects"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              PROJECTS
            </TabsTrigger>
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
          </TabsList>
          
{/*           <TabsContent value="about">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader>
                <CardTitle>Edit About Page</CardTitle>
                <CardDescription>
                  Update your personal information and professional background.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...aboutForm}>
                  <form id="about-form" onSubmit={aboutForm.handleSubmit(onAboutSubmit)} className="space-y-4">
                    <FormField
                      control={aboutForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    */}
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
                    
                    <FormField
                      control={aboutForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Your professional title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aboutForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biography</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief biography about yourself" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aboutForm.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your educational background" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aboutForm.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your professional experience" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={aboutForm.control}
                      name="publications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publications</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Notable publications" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  form="about-form"
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Save size={16} className="mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Manage Projects</CardTitle>
                  <CardDescription>
                    Add, edit, or remove projects from your portfolio.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openProjectDialog()}
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  Add New Project
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
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
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteProject(project.id || 0)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/20"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Project Edit Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-3xl neo-blur border border-cyber-neon/30">
          <DialogHeader>
            <DialogTitle>
              {currentProject ? `Edit Project: ${currentProject.title}` : 'Add New Project'}
            </DialogTitle>
            <DialogDescription>
              {currentProject 
                ? 'Update the details of your existing project.'
                : 'Fill in the details to add a new project to your portfolio.'}
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
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project title" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the project" {...field} />
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
                      <FormLabel>Image URL</FormLabel>
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
                      <FormLabel>GitHub URL</FormLabel>
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
                    <FormLabel>Live Demo URL (optional)</FormLabel>
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
                    <FormLabel>README Content (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="# Project Title" 
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
              Cancel
            </Button>
            <Button 
              type="submit"
              form="project-form"
              className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
            >
              {currentProject ? 'Update Project' : 'Add Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
