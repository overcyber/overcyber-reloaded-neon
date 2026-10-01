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
import { Lock, Save, Edit, Plus, Image, FileText, Trash2, AlertTriangle, Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminBackendPanel from "@/components/AdminBackendPanel";
import { api, ApiError } from "@/lib/api";

// Admin authentication schema
const authSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// About page schema
const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").or(z.literal('')).optional(),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres").or(z.literal('')).optional(),
  bio: z.string().or(z.literal('')).optional(),
  email: z.string().email("Email inválido").or(z.literal('')).optional(),
  location: z.string().or(z.literal('')).optional(),
  lattes: z.string().url("URL do Lattes inválida").or(z.literal('')).optional(),
  profileImage: z.string().url("URL da imagem de perfil inválida").or(z.literal('')).optional(),
  researchFocus: z.string().or(z.literal('')).optional()
});

// Project schema - campos flexíveis para permitir salvar alterações parciais
const projectSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().or(z.literal('')).optional(),
  tags: z.string().or(z.literal('')).optional(),
  image: z.string().or(z.literal('')).optional(),
  github: z.string().or(z.literal('')).optional(),
  live: z.string().optional().nullable(),
  readme: z.string().or(z.literal('')).optional(),
});

// Education, Experience, Publications, and Skills schemas
const educationSchema = z.object({
  items: z.string().or(z.literal('')).optional(),
});

const experienceSchema = z.object({
  items: z.string().or(z.literal('')).optional(),
});

// FIX: campos opcionais — permite atualizar apenas uma sub-seção
// (ex.: preencher só "Artigos" deixando Conferências/Patentes vazios sem erro).
const publicationsSchema = z.object({
  articles: z.string().or(z.literal('')).optional(),
  conferences: z.string().or(z.literal('')).optional(),
  patents: z.string().or(z.literal('')).optional()
});

const skillsSchema = z.object({
  coreSkills: z.string().or(z.literal('')).optional(),
  advancedSkills: z.string().or(z.literal('')).optional(),
  technologies: z.string().or(z.literal('')).optional(),
  awards: z.string().or(z.literal('')).optional()
});

// Blog post schema
const blogPostSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  excerpt: z.string().or(z.literal('')).optional(),
  content: z.string().or(z.literal('')).optional(),
  image: z.string().or(z.literal('')).optional(),
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
  name: "Claudio Henrique Marques de Oliveira",
  title: "Militar - Marinha do Brasil | Especialista em Defesa Cibernética | Mestrando em Computação Aplicada (UnB)",
  bio: "Profissional com sólida experiência na área de Defesa, com ênfase em Defesa Cibernética, atuando na área de segurança da informação há 19 anos, desenvolvendo projetos para as Forças Armadas e projetos pessoais. Nos últimos anos, tenho direcionado minha expertise para a área de Ciência de Dados e Inteligência Artificial aplicada à Defesa, combinando conhecimentos tradicionais de segurança cibernética com técnicas avançadas de análise de dados e machine learning.",
  email: "unixsolution@gmail.com",
  location: "Brasília, DF, Brasil",
  lattes: "https://lattes.cnpq.br/2915812289846388",
  profileImage: "https://avatars.githubusercontent.com/u/583231",
  researchFocus: [
    "Defesa Cibernética",
    "Guerra Cibernética",
    "Segurança da Informação",
    "Ciência de Dados",
    "Inteligência Artificial",
    "Machine Learning"
  ]
};

// Dados padrão para educação
const defaultEducationData = [
  {
    title: "Mestrado Profissional em Computação Aplicada",
    period: "2023-PRESENTE",
    institution: "Universidade de Brasília (UnB)",
    description: "PPCA — Programa de Pós-Graduação em Computação Aplicada. Orientador: João José Costa Gondim. Pesquisa em Detecção de Tráfego Malicioso utilizando Vetorização e Aprendizagem de Máquina."
  },
  {
    title: "Bacharelado em Sistemas de Informação",
    period: "2015-2018",
    institution: "Estácio Ribeirão Preto",
    description: "TCC: \"SISFISH\" — Sistema de Informação para Piscicultura"
  },
  {
    title: "Curso de Guerra Cibernética",
    period: "2019",
    institution: "Centro de Comunicações e Guerra Eletrônica do Exército (CComGEx)",
    description: "Pós-técnica em Guerra Cibernética — 800h. Abrangendo táticas ofensivas e defensivas no espectro cibernético.",
    certifications: ["Guerra Cibernética — CComGEx/Exército — 2019 (800h)"]
  },
  {
    title: "Engenharia Reversa de Código",
    period: "2020",
    institution: "Offensive Security",
    description: "Curso avançado de engenharia reversa de aplicações, análise de binários e exploração de vulnerabilidades em nível de sistema.",
    certifications: ["Offensive Security Certified Expert (OSCE) — 2020"]
  }
];

// Dados padrão para experiência
const defaultExperienceData = [
  {
    title: "Militar de Carreira — Defesa Cibernética",
    period: "2012-PRESENTE",
    company: "Marinha do Brasil",
    duties: [
      "Atuação na área de Defesa Cibernética com dedicação exclusiva",
      "Desenvolvimento de projetos estratégicos para as Forças Armadas",
      "Participação em exercícios nacionais e internacionais de Defesa Cibernética (Guardião Cibernético 7.0, CyberShield 2025, Exercício Ibero-Americano)",
      "Professor monitor na disciplina de Mineração de Dados Massivo no PPCA/UnB (2024)"
    ]
  },
  {
    title: "Arquiteto de Soluções LLM e IA",
    period: "2023-2024",
    company: "VIAAPIA Informática",
    duties: [
      "Desenvolvimento de arquitetura e solução de Chat com Processamento de Linguagem Natural (LLM)",
      "Criação de plataforma de comunicação integrando módulos de NLP, TTS/STT e armazenamento",
      "Arquitetura de microsserviços em contêineres Docker para escalabilidade"
    ]
  }
];

// Dados padrão para publicações
const defaultPublicationsData = {
  articles: [
    {
      year: "2025",
      title: "Metodologia para Detecção de Tráfego de Rede Malicioso Utilizando Vetorização e Aprendizagem de Máquina",
      journal: "Lecture Notes in Networks and Systems (ISSN: 2367-3389)"
    },
    {
      year: "2025",
      title: "Proactive Management of Offensive Profiles: Detecting Trends in Cyberattacks on Institutions in Brazil Through the Analysis of Hacker Communities Using Complex Networks and Machine Learning Algorithms",
      journal: "REVISTA ENIAC PESQUISA (ISSN: 2316-2341)"
    }
  ],
  conferences: [
    {
      year: "2024",
      title: "Proactive Management of Offensive Profiles: Detecting Trends in Cyberattacks on Institutions in Brazil...",
      conference: "XXI Encontro Nacional de Inteligência Artificial e Computacional (ENIAC 2024) — Belém/PA"
    }
  ],
  patents: []
};

// Dados padrão para habilidades
const defaultSkillsData = {
  coreSkills: [
    { name: "Defesa Cibernética", level: 92 },
    { name: "Segurança da Informação", level: 90 },
    { name: "Linux/Unix", level: 88 },
    { name: "Redes de Computadores", level: 85 }
  ],
  advancedSkills: [
    { name: "Inteligência Artificial / ML", level: 78 },
    { name: "Ciência de Dados", level: 75 },
    { name: "Docker / Microsserviços", level: 72 },
    { name: "OSINT / Pentest", level: 80 }
  ],
  technologies: [
    "Python", "Linux", "Docker", "Windows Server", 
    "Machine Learning", "LLM", "Redes", "Firewall",
    "Criptografia", "Análise de Dados", "R", "OSINT"
  ],
  awards: [
    "SANS FOR500 Windows Forensics Analysis — 2025",
    "Core NetWars Tournament 7 — SANS — 2022",
    "Guardião Cibernético 7.0 — Exército Brasileiro — 2025",
    "CEH v7 Certified — EC-Council — 2013"
  ]
};

// Sample Projects data — must match the 3 projects in use-managed-content.ts
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
  },
  {
    id: 3,
    title: "QuantumCrypt",
    description: "Post-quantum cryptographic library implementing advanced algorithms resistant to quantum computing attacks.",
    tags: "C++, Cryptography, Quantum",
    image: "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    github: "https://github.com/overcyber/quantumcrypt",
    live: "",
    stars: 531,
    forks: 97,
    readme: "# QuantumCrypt\n\n## Quantum-Resistant Cryptographic Library\n\nQuantumCrypt is a C++ library implementing advanced cryptographic algorithms designed to resist attacks from both classical and quantum computers.",
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

// Save to backend with fallback to localStorage
async function saveToBackend(path: string, data: any): Promise<boolean> {
  try {
    await api(path, { method: 'PUT', json: data });
    return true;
  } catch (err) {
    console.warn(`Backend offline for ${path}, saved to localStorage only:`, err);
    return false;
  }
}

// Load from backend
async function loadFromBackend<T>(path: string): Promise<T | null> {
  try {
    return await api<T>(path);
  } catch {
    return null;
  }
}

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
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginLockedUntil, setLoginLockedUntil] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_SECONDS = 30;
  
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
  const [sections, setSections] = useState<Record<string, boolean>>({
    profile: true, education: true, experience: true, publications: true,
    skills: true, projects: true, blog: true, contact: true,
  });
  
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
      name: aboutData?.name || "",
      title: aboutData?.title || "",
      bio: aboutData?.bio || "",
      email: aboutData?.email || "",
      location: aboutData?.location || "",
      lattes: aboutData?.lattes || "",
      profileImage: aboutData?.profileImage || "",
      researchFocus: Array.isArray(aboutData?.researchFocus)
        ? aboutData.researchFocus.join(', ')
        : (aboutData?.researchFocus || "")
    }
  });
  
  const educationForm = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      items: formatEducationData(Array.isArray(educationData) ? educationData : [])
    }
  });
  
  const experienceForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      items: formatExperienceData(Array.isArray(experienceData) ? experienceData : [])
    }
  });
  
  const publicationsForm = useForm<PublicationsFormValues>({
    resolver: zodResolver(publicationsSchema),
    defaultValues: {
      articles: formatArticlesData(publicationsData?.articles || []),
      conferences: formatConferencesData(publicationsData?.conferences || []),
      patents: formatPatentsData(publicationsData?.patents || [])
    }
  });
  
  const skillsForm = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      coreSkills: formatSkillsData(skillsData?.coreSkills || []),
      advancedSkills: formatSkillsData(skillsData?.advancedSkills || []),
      technologies: Array.isArray(skillsData?.technologies)
        ? skillsData.technologies.join(', ')
        : (skillsData?.technologies || ""),
      awards: Array.isArray(skillsData?.awards)
        ? skillsData.awards.join('\n')
        : (skillsData?.awards || "")
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
  
  // Carregar dados do backend + localStorage
  const loadAll = async () => {
    // 1. Load from localStorage first (instant)
    const loadedAboutData = loadData('admin-about-data', defaultAboutData);
    setAboutData(loadedAboutData);
    const loadedEducationData = loadData('admin-education-data', defaultEducationData);
    setEducationData(loadedEducationData);
    const loadedExperienceData = loadData('admin-experience-data', defaultExperienceData);
    setExperienceData(loadedExperienceData);
    const loadedPublicationsData = loadData('admin-publications-data', defaultPublicationsData);
    setPublicationsData(loadedPublicationsData);
    const loadedSkillsData = loadData('admin-skills-data', defaultSkillsData);
    setSkillsData(loadedSkillsData);
    const loadedProjects = loadData('admin-projects-data', defaultProjects);
    setProjects(loadedProjects);
    const loadedBlogPosts = loadData('blog-posts', defaultBlogPosts);
    setBlogPosts(loadedBlogPosts);

    // 2. Try to load from backend (overrides localStorage if available)
    // IMPORTANTE: só sobrescreve se o backend retornar dados NÃO-VAZIOS
    // (arrays/objetos vazios são truthy em JS — precisamos checar conteúdo)
    try {
      // Profile
      const backendAbout = await loadFromBackend<any>('/about');
      if (backendAbout && backendAbout.name) {
        setAboutData(backendAbout);
        saveData('admin-about-data', backendAbout);
      }

      // Resume sections (single call returns all)
      const backendResume = await loadFromBackend<any>('/resume');
      if (backendResume) {
        if (Array.isArray(backendResume.education) && backendResume.education.length > 0) {
          setEducationData(backendResume.education);
          saveData('admin-education-data', backendResume.education);
        }

        // Experiência: merge para preservar preenchimento
        const curExp = loadData('admin-experience-data', defaultExperienceData);
        if (Array.isArray(backendResume.experience) && backendResume.experience.length > 0) {
          setExperienceData(backendResume.experience);
          saveData('admin-experience-data', backendResume.experience);
        } else {
          setExperienceData(curExp);
        }

        // Publicações (04 // KNOWLEDGE DATABASE): merge preservando artigos e conferências
        if (backendResume.publications && typeof backendResume.publications === 'object') {
          const curPubs = loadData('admin-publications-data', defaultPublicationsData);
          const mergedArticles = (Array.isArray(backendResume.publications.articles) && backendResume.publications.articles.length > 0)
            ? backendResume.publications.articles
            : curPubs.articles;
          const mergedConferences = (Array.isArray(backendResume.publications.conferences) && backendResume.publications.conferences.length > 0)
            ? backendResume.publications.conferences
            : curPubs.conferences;
          const mergedPatents = (Array.isArray(backendResume.publications.patents) && backendResume.publications.patents.length > 0)
            ? backendResume.publications.patents
            : (curPubs.patents || []);

          const mergedPubs = {
            articles: mergedArticles,
            conferences: mergedConferences,
            patents: mergedPatents
          };
          setPublicationsData(mergedPubs);
          saveData('admin-publications-data', mergedPubs);
        }

        // Habilidades: merge preservando competências e tecnologias
        if (backendResume.skills && typeof backendResume.skills === 'object') {
          const curSkills = loadData('admin-skills-data', defaultSkillsData);
          const mergedSkills = {
            coreSkills: (Array.isArray(backendResume.skills.coreSkills) && backendResume.skills.coreSkills.length > 0)
              ? backendResume.skills.coreSkills
              : curSkills.coreSkills,
            advancedSkills: (Array.isArray(backendResume.skills.advancedSkills) && backendResume.skills.advancedSkills.length > 0)
              ? backendResume.skills.advancedSkills
              : curSkills.advancedSkills,
            technologies: (Array.isArray(backendResume.skills.technologies) && backendResume.skills.technologies.length > 0)
              ? backendResume.skills.technologies
              : curSkills.technologies,
            awards: (Array.isArray(backendResume.skills.awards) && backendResume.skills.awards.length > 0)
              ? backendResume.skills.awards
              : curSkills.awards
          };
          setSkillsData(mergedSkills);
          saveData('admin-skills-data', mergedSkills);
        }
      }

      // Projects
      const backendProjects = await loadFromBackend<any[]>('/projects');
      if (backendProjects && backendProjects.length > 0) {
        setProjects(backendProjects);
        saveData('admin-projects-data', backendProjects);
      }

      // Blog posts
      const backendPosts = await loadFromBackend<any[]>('/posts');
      if (backendPosts && backendPosts.length > 0) {
        setBlogPosts(backendPosts);
        saveData('blog-posts', backendPosts);
      }

      // Sections visibility
      const backendSections = await loadFromBackend<Record<string, boolean>>('/sections');
      if (backendSections && typeof backendSections === 'object') {
        setSections(backendSections);
      }
    } catch {
      // Backend offline — using localStorage data is fine
    }

    // 3. Reset all forms with final data
    const finalAbout = loadData('admin-about-data', defaultAboutData);
    setAboutData(finalAbout);
    profileForm.reset({
      name: finalAbout.name,
      title: finalAbout.title,
      bio: finalAbout.bio,
      email: finalAbout.email,
      location: finalAbout.location,
      lattes: finalAbout.lattes,
      profileImage: finalAbout.profileImage,
      researchFocus: (finalAbout.researchFocus || []).join(', ')
    });

    const finalEducation = loadData('admin-education-data', defaultEducationData);
    setEducationData(finalEducation);
    educationForm.reset({ items: formatEducationData(finalEducation) });

    const finalExperience = loadData('admin-experience-data', defaultExperienceData);
    setExperienceData(finalExperience);
    experienceForm.reset({ items: formatExperienceData(finalExperience) });

    const finalPublications = loadData('admin-publications-data', defaultPublicationsData);
    setPublicationsData(finalPublications);
    publicationsForm.reset({
      articles: formatArticlesData(finalPublications.articles),
      conferences: formatConferencesData(finalPublications.conferences),
      patents: formatPatentsData(finalPublications.patents)
    });

    const finalSkills = loadData('admin-skills-data', defaultSkillsData);
    setSkillsData(finalSkills);
    skillsForm.reset({
      coreSkills: formatSkillsData(finalSkills.coreSkills),
      advancedSkills: formatSkillsData(finalSkills.advancedSkills),
      technologies: finalSkills.technologies.join(', '),
      awards: finalSkills.awards.join('\n')
    });

    const finalProjects = loadData('admin-projects-data', defaultProjects);
    setProjects(finalProjects);

    const finalPosts = loadData('blog-posts', defaultBlogPosts);
    setBlogPosts(finalPosts);
  };

  useEffect(() => {
    loadAll();
  }, [isAuthenticated]);

  // Verificar sessão existente no backend
  useEffect(() => {
    const checkSession = async () => {
      try {
        await api("/auth/me");
        setIsAuthenticated(true);
      } catch {
        // Sem sessão ativa
      } finally {
        setAuthChecking(false);
      }
    };
    checkSession();
  }, []);

  // Authentication via backend API
  const onAuthSubmit = async (data: AuthFormValues) => {
    // Check rate limiting
    const now = Date.now();
    if (loginLockedUntil && now < loginLockedUntil) {
      const remaining = Math.ceil((loginLockedUntil - now) / 1000);
      setAuthError(`Too many attempts. Wait ${remaining}s.`);
      return;
    }

    if (submitting) return;
    setSubmitting(true);
    setAuthError(null);
    try {
      await api("/auth/login", {
        method: "POST",
        json: { username: "admin", password: data.password },
      });
      setLoginAttempts(0);
      setSubmitting(false);
      setIsAuthenticated(true);
      await loadAll();
      toast({
        title: "Authenticated",
        description: "Welcome to the admin panel.",
      });
    } catch (e) {
      setSubmitting(false);
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      const msg = e instanceof ApiError
        ? (typeof e.body === "object" && e.body?.error ? e.body.error : e.message)
        : "Authentication failed";

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_SECONDS * 1000;
        setLoginLockedUntil(lockUntil);
        setLoginAttempts(0);
        setAuthError(`Locked out for ${LOCKOUT_SECONDS}s due to too many failed attempts.`);
        setTimeout(() => setLoginLockedUntil(null), LOCKOUT_SECONDS * 1000);
      } else {
        setAuthError(`${msg} (${newAttempts}/${MAX_ATTEMPTS} attempts)`);
      }

      toast({
        title: "Authentication failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  // Form submission handlers
  const onProfileSubmit = async (data: ProfileFormValues) => {
    // Mescla com dados existentes — só sobrescreve campos preenchidos
    const updatedProfile = { ...aboutData };
    if (data.name) updatedProfile.name = data.name;
    if (data.title) updatedProfile.title = data.title;
    if (data.bio) updatedProfile.bio = data.bio;
    if (data.email) updatedProfile.email = data.email;
    if (data.location) updatedProfile.location = data.location;
    if (data.lattes) updatedProfile.lattes = data.lattes;
    if (data.profileImage) updatedProfile.profileImage = data.profileImage;
    if (data.researchFocus) {
      updatedProfile.researchFocus = data.researchFocus.split(',').map(item => item.trim());
    }
    
    setAboutData(updatedProfile);
    saveData('admin-about-data', updatedProfile);
    const ok = await saveToBackend('/about', updatedProfile);
    
    toast({
      title: "Perfil atualizado",
      description: ok ? "Salvo no backend + cache local." : "Salvo apenas no cache local (backend offline).",
    });
  };

  const onEducationSubmit = async (data: EducationFormValues) => {
    const updatedEducation = parseEducationData(data.items);
    setEducationData(updatedEducation);
    saveData('admin-education-data', updatedEducation);
    const ok = await saveToBackend('/resume/education', updatedEducation);
    
    toast({
      title: "Educação atualizada",
      description: ok ? "Salvo no backend + cache local." : "Salvo apenas no cache local (backend offline).",
    });
  };

  const onExperienceSubmit = async (data: ExperienceFormValues) => {
    const updatedExperience = parseExperienceData(data.items);
    setExperienceData(updatedExperience);
    saveData('admin-experience-data', updatedExperience);
    const ok = await saveToBackend('/resume/experience', updatedExperience);
    
    toast({
      title: "Experiência atualizada",
      description: ok ? "Salvo no backend + cache local." : "Salvo apenas no cache local (backend offline).",
    });
  };

  const onPublicationsSubmit = async (data: PublicationsFormValues) => {
    const updatedPublications = parsePublicationsData(data.articles, data.conferences, data.patents);
    setPublicationsData(updatedPublications);
    saveData('admin-publications-data', updatedPublications);
    const ok = await saveToBackend('/resume/publications', updatedPublications);
    
    toast({
      title: "Publicações atualizadas",
      description: ok ? "Salvo no backend + cache local." : "Salvo apenas no cache local (backend offline).",
    });
  };

  const onSkillsSubmit = async (data: SkillsFormValues) => {
    const updatedSkills = parseSkillsData(data.coreSkills, data.advancedSkills, data.technologies, data.awards);
    setSkillsData(updatedSkills);
    saveData('admin-skills-data', updatedSkills);
    const ok = await saveToBackend('/resume/skills', updatedSkills);
    
    toast({
      title: "Habilidades atualizadas",
      description: ok ? "Salvo no backend + cache local." : "Salvo apenas no cache local (backend offline).",
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

  const onProjectSubmit = async (data: ProjectFormValues) => {
    setSubmitting(true);
    try {
      if (currentProject && currentProject.id) {
        // Edit existing project
        const payload = {
          title: data.title,
          description: data.description,
          tags: data.tags,
          image: data.image,
          github: data.github,
          live: data.live || null,
          readme: data.readme,
          stars: (currentProject as any).stars || 0,
          forks: (currentProject as any).forks || 0,
          ord: 0,
        };
        await api(`/projects/${currentProject.id}`, { method: 'PUT', json: payload });
        toast({
          title: "Projeto atualizado",
          description: `"${data.title}" foi atualizado no backend.`,
        });
      } else {
        // Add new project
        const payload = {
          title: data.title,
          description: data.description,
          tags: data.tags,
          image: data.image,
          github: data.github,
          live: data.live || null,
          readme: data.readme,
          stars: 0,
          forks: 0,
          ord: 0,
        };
        await api('/projects', { method: 'POST', json: payload });
        toast({
          title: "Projeto adicionado",
          description: `"${data.title}" foi criado no backend.`,
        });
      }
      // Reload projects from backend
      const updated = await loadFromBackend<any[]>('/projects');
      if (updated) {
        setProjects(updated);
        saveData('admin-projects-data', updated);
      }
    } catch (err) {
      // Fallback: save to localStorage only
      let updatedProjects;
      if (currentProject && currentProject.id) {
        updatedProjects = projects.map(p => 
          p.id === currentProject.id ? { ...data, id: currentProject.id, stars: (p as any).stars || 0, forks: (p as any).forks || 0 } : p
        );
      } else {
        const newProject = {
          ...data,
          id: Math.max(0, ...projects.map(p => p.id || 0)) + 1,
          stars: 0,
          forks: 0,
        };
        updatedProjects = [...projects, newProject];
      }
      setProjects(updatedProjects);
      saveData('admin-projects-data', updatedProjects);
      toast({
        title: "Projeto salvo (offline)",
        description: `"${data.title}" salvo apenas no cache local (backend offline).`,
      });
    } finally {
      setSubmitting(false);
      setIsProjectDialogOpen(false);
    }
  };

  const deleteProject = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await api(`/projects/${id}`, { method: 'DELETE', json: {} });
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        saveData('admin-projects-data', updated);
        toast({
          title: "Projeto excluído",
          description: "Removido do backend + cache local.",
        });
      } catch {
        // Fallback: remove from localStorage only
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        saveData('admin-projects-data', updated);
        toast({
          title: "Projeto excluído (offline)",
          description: "Removido apenas do cache local (backend offline).",
        });
      }
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

  const onBlogPostSubmit = async (data: BlogPostFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content,
        image: data.image || null,
        status: "published" as const,
      };
      
      if (currentBlogPost) {
        // Edit existing post
        await api(`/posts/by-id/${currentBlogPost.id}`, { method: 'PUT', json: payload });
        toast({
          title: "Post atualizado",
          description: `"${data.title}" foi atualizado no backend.`,
        });
      } else {
        // Add new post
        await api('/posts', { method: 'POST', json: payload });
        toast({
          title: "Post criado",
          description: `"${data.title}" foi criado no backend.`,
        });
      }
      // Reload posts from backend
      const updated = await loadFromBackend<any[]>('/posts');
      if (updated) {
        setBlogPosts(updated);
        saveData('blog-posts', updated);
      }
    } catch (err) {
      // Fallback: save to localStorage only
      if (currentBlogPost) {
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
      } else {
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
      }
      toast({
        title: currentBlogPost ? "Post atualizado (offline)" : "Post criado (offline)",
        description: `"${data.title}" salvo apenas no cache local (backend offline).`,
      });
    } finally {
      setSubmitting(false);
      setIsBlogPostDialogOpen(false);
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este post?")) {
      try {
        await api(`/posts/by-id/${id}`, { method: 'DELETE', json: {} });
        const updatedPosts = blogPosts.filter(post => post.id !== id);
        setBlogPosts(updatedPosts);
        saveData('blog-posts', updatedPosts);
        toast({
          title: "Post excluído",
          description: "Removido do backend + cache local.",
        });
      } catch {
        const updatedPosts = blogPosts.filter(post => post.id !== id);
        setBlogPosts(updatedPosts);
        saveData('blog-posts', updatedPosts);
        toast({
          title: "Post excluído (offline)",
          description: "Removido apenas do cache local (backend offline).",
        });
      }
    }
  };

  // If checking auth, show loading
  if (authChecking) {
    return (
      <Layout title="ADMIN AUTHENTICATION">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Card className="w-full max-w-md neo-blur border border-cyber-neon/30">
            <CardContent className="p-6 font-mono text-cyber-blue text-center">
              Verificando sessão...
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    const now = Date.now();
    const isLocked = loginLockedUntil && now < loginLockedUntil;
    const lockRemaining = isLocked ? Math.ceil((loginLockedUntil! - now) / 1000) : 0;

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
                Enter your admin password to access the control panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authError && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <Form {...authForm}>
                <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-4">
                  <FormField
                    control={authForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter admin password"
                            disabled={isLocked}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLocked || submitting}>
                    {submitting ? "Authenticating..." : isLocked ? `Locked (${lockRemaining}s)` : "Authenticate"}
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
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-400 border-red-400/30 hover:bg-red-900/20"
            onClick={async () => {
              try {
                await api("/auth/logout", { method: "POST", json: {} });
              } catch {}
              setIsAuthenticated(false);
              toast({ title: "Logged out" });
            }}
          >
            SAIR
          </Button>
        </div>
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
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
            >
              <Settings size={14} className="mr-1" />
              CONFIGURAÇÕES
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

          <TabsContent value="settings">
            <Card className="neo-blur border border-cyber-neon/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  Visibilidade de Seções
                </CardTitle>
                <CardDescription>
                  Controle quais seções são visíveis na página pública do site.
                  As alterações são aplicadas imediatamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "profile", label: "PERFIL", desc: "Informações pessoais e profissionais" },
                  { key: "education", label: "EDUCAÇÃO", desc: "Formação acadêmica e cursos" },
                  { key: "experience", label: "EXPERIÊNCIA", desc: "Experiência profissional" },
                  { key: "publications", label: "PUBLICAÇÕES", desc: "Artigos, conferências e patentes" },
                  { key: "skills", label: "HABILIDADES", desc: "Competências técnicas e prêmios" },
                  { key: "projects", label: "PROJETOS", desc: "Portfólio de projetos" },
                  { key: "blog", label: "BLOG", desc: "Posts do blog" },
                  { key: "contact", label: "CONTATO", desc: "Formulário de contato" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 border border-primary/20 rounded">
                    <div>
                      <Label className="font-mono text-sm text-primary">{label}</Label>
                      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                    </div>
                    <Switch
                      checked={sections[key] ?? true}
                      onCheckedChange={async (checked) => {
                        const updated = { ...sections, [key]: checked };
                        setSections(updated);
                        try {
                          await api('/sections', { method: 'PUT', json: { [key]: checked } });
                          toast({
                            title: `${label} ${checked ? 'visível' : 'oculta'}`,
                            description: `Seção ${label.toLowerCase()} foi ${checked ? 'ativada' : 'desativada'} no site.`,
                          });
                        } catch {
                          // Reverte em caso de erro
                          setSections(sections);
                          toast({
                            title: "Erro ao salvar",
                            description: "Não foi possível atualizar a visibilidade. Backend offline?",
                            variant: "destructive",
                          });
                        }
                      }}
                    />
                  </div>
                ))}
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
