
// import { useState } from 'react';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, FileCode, Briefcase, GraduationCap, Award, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Função auxiliar para carregar dados do localStorage
const loadData = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error(`Erro ao analisar ${key} do localStorage:`, err);
    }
  }
  return defaultValue;
};

// Dados padrão (serão substituídos pelos dados do localStorage se existirem)
const defaultAboutData = {
  name: "Claudio Henrique Marques de Oliveira",
  title: "Militar - Marinha do Brasil | Especialista em Defesa Cibernética | Mestrando em Computação Aplicada (UnB)",
  bio: "Profissional com 19 anos de experiência em Segurança da Informação e Defesa Cibernética, atuando em projetos estratégicos para as Forças Armadas. Mestrando em Computação Aplicada pela UnB com pesquisa em Detecção de Tráfego Malicioso utilizando Vetorização e Aprendizagem de Máquina. Combino expertise em segurança cibernética ofensiva e defensiva com técnicas avançadas de Ciência de Dados e Inteligência Artificial, desenvolvendo soluções inovadoras para proteção de infraestruturas críticas.",
  email: "unixsolution@gmail.com",
  location: "Brasília, DF, Brasil",
  lattes: "https://lattes.cnpq.br/2915812289846388",
  profileImage: "https://avatars.githubusercontent.com/u/13219600?s=400&u=f39c54243239a31d120222c40a3939649e3ccbfd&v=4",
  researchFocus: [
    "Defesa Cibernética",
    "Guerra Cibernética",
    "Segurança da Informação",
    "Ciência de Dados",
    "Inteligência Artificial",
    "Machine Learning"
  ],
  languages: [
    { language: "Português", level: "Nativo", proficiency: "Leitura, Fala, Escrita, Compreensão" },
    { language: "Inglês", level: "Intermediário", proficiency: "Leitura (Razoável), Escrita (Razoável), Compreensão (Razoável), Fala (Pouco)" }
  ]
};

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
  ]
};

const defaultSkillsData = {
  coreSkills: [
    { name: "Defesa Cibernética", level: 95 },
    { name: "Segurança da Informação", level: 92 },
    { name: "Linux / Unix", level: 90 },
    { name: "Redes de Computadores & Protocolos", level: 88 },
    { name: "Resposta a Incidentes & Forense Digital", level: 88 },
    { name: "Engenharia Reversa & Análise de Binários", level: 85 }
  ],
  advancedSkills: [
    { name: "Inteligência Artificial & Machine Learning", level: 82 },
    { name: "Arquitetura de LLMs & RAG", level: 85 },
    { name: "Ciência de Dados & Telemetria de Redes", level: 80 },
    { name: "OSINT & Testes de Intrusão (Pentest)", level: 82 },
    { name: "Docker & Orquestração de Microsserviços", level: 78 },
    { name: "Criptografia Aplicada & Protocolos Seguros", level: 85 }
  ],
  technologies: [
    "Python", "C/C++", "Rust", "Linux (Kernel & Sysadmin)",
    "Docker & Containers", "Windows Server & AD",
    "Machine Learning & Deep Learning", "LLMs & RAG (vLLM, Ollama, LangChain)",
    "Redes & Firewalls (IPTables, pfSense)", "Suricata & Snort (NIDS)",
    "Wireshark & Telemetria Zeek/Bro", "Criptografia & PKI",
    "Análise de Dados & Pandas/NumPy", "R & Estatística",
    "OSINT & Threat Intelligence", "Ghidra & IDA Pro (Engenharia Reversa)"
  ],
  awards: [
    "SANS FOR500 Windows Forensics Analysis — 2025",
    "Guardião Cibernético 7.0 — Exército Brasileiro — 2025",
    "CyberShield — Exercício Ibero-Americano de Defesa Cibernética — 2025",
    "Core NetWars Tournament 7 — SANS — 2022",
    "OSCE (Offensive Security Certified Expert) — 2020",
    "Curso de Guerra Cibernética (800h) — CComGEx/Exército — 2019",
    "CEH v7 Certified — EC-Council — 2013",
    "Prêmio de Melhor Trabalho de Mestrado — UnB"
  ]
};

const About = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Estado para armazenar os dados
  const [aboutData, setAboutData] = useState(defaultAboutData);
  const [educationData, setEducationData] = useState(defaultEducationData);
  const [experienceData, setExperienceData] = useState(defaultExperienceData);
  const [publicationsData, setPublicationsData] = useState(defaultPublicationsData);
  const [skillsData, setSkillsData] = useState(defaultSkillsData);
  const [sections, setSections] = useState<Record<string, boolean>>({});
  
  // Carrega os dados do localStorage quando o componente montar
  useEffect(() => {
    const rawAbout = loadData('admin-about-data', defaultAboutData);
    setAboutData({
      ...defaultAboutData,
      ...(rawAbout || {}),
      profileImage: rawAbout?.profileImage || defaultAboutData.profileImage,
      researchFocus: Array.isArray(rawAbout?.researchFocus) && rawAbout.researchFocus.length > 0
        ? rawAbout.researchFocus
        : defaultAboutData.researchFocus,
      languages: Array.isArray(rawAbout?.languages) && rawAbout.languages.length > 0
        ? rawAbout.languages
        : defaultAboutData.languages,
    });
    
    const rawEdu = loadData('admin-education-data', defaultEducationData);
    setEducationData(Array.isArray(rawEdu) && rawEdu.length > 0 ? rawEdu : defaultEducationData);
    
    const rawExp = loadData('admin-experience-data', defaultExperienceData);
    setExperienceData(Array.isArray(rawExp) && rawExp.length > 0 ? rawExp : defaultExperienceData);
    
    const rawPubs = loadData('admin-publications-data', defaultPublicationsData);
    setPublicationsData({
      articles: Array.isArray(rawPubs?.articles) && rawPubs.articles.length > 0 ? rawPubs.articles : defaultPublicationsData.articles,
      conferences: Array.isArray(rawPubs?.conferences) && rawPubs.conferences.length > 0 ? rawPubs.conferences : defaultPublicationsData.conferences,
      patents: Array.isArray(rawPubs?.patents) ? rawPubs.patents : [],
    });
    
    const rawSkills = loadData('admin-skills-data', defaultSkillsData);
    setSkillsData({
      coreSkills: Array.isArray(rawSkills?.coreSkills) && rawSkills.coreSkills.length > 0 ? rawSkills.coreSkills : defaultSkillsData.coreSkills,
      advancedSkills: Array.isArray(rawSkills?.advancedSkills) && rawSkills.advancedSkills.length > 0 ? rawSkills.advancedSkills : defaultSkillsData.advancedSkills,
      technologies: Array.isArray(rawSkills?.technologies) && rawSkills.technologies.length > 0 ? rawSkills.technologies : defaultSkillsData.technologies,
      awards: Array.isArray(rawSkills?.awards) && rawSkills.awards.length > 0 ? rawSkills.awards : defaultSkillsData.awards,
    });

    // Carregar visibilidade de seções do backend
    fetch('/api/sections')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSections(data); })
      .catch(() => {});

    // Sincronizar dados do backend com merge seguro
    fetch('/api/about')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setAboutData(prev => ({
            ...defaultAboutData,
            ...prev,
            ...data,
            profileImage: data.profileImage || prev.profileImage || defaultAboutData.profileImage,
            researchFocus: (Array.isArray(data.researchFocus) && data.researchFocus.length > 0)
              ? data.researchFocus
              : (Array.isArray(prev.researchFocus) && prev.researchFocus.length > 0 ? prev.researchFocus : defaultAboutData.researchFocus),
            languages: (Array.isArray(data.languages) && data.languages.length > 0)
              ? data.languages
              : (Array.isArray(prev.languages) && prev.languages.length > 0 ? prev.languages : defaultAboutData.languages),
          }));
        }
      })
      .catch(() => {});

    fetch('/api/resume')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          if (Array.isArray(data.education) && data.education.length > 0) setEducationData(data.education);
          if (Array.isArray(data.experience) && data.experience.length > 0) setExperienceData(data.experience);
          if (data.publications && typeof data.publications === 'object') {
            setPublicationsData(prev => ({
              articles: (Array.isArray(data.publications.articles) && data.publications.articles.length > 0)
                ? data.publications.articles
                : (Array.isArray(prev.articles) && prev.articles.length > 0 ? prev.articles : defaultPublicationsData.articles),
              conferences: (Array.isArray(data.publications.conferences) && data.publications.conferences.length > 0)
                ? data.publications.conferences
                : (Array.isArray(prev.conferences) && prev.conferences.length > 0 ? prev.conferences : defaultPublicationsData.conferences),
              patents: Array.isArray(data.publications.patents)
                ? data.publications.patents
                : (prev.patents || []),
            }));
          }
          if (data.skills && typeof data.skills === 'object') {
            setSkillsData(prev => ({
              coreSkills: (Array.isArray(data.skills.coreSkills) && data.skills.coreSkills.length > 0)
                ? data.skills.coreSkills
                : (Array.isArray(prev.coreSkills) && prev.coreSkills.length > 0 ? prev.coreSkills : defaultSkillsData.coreSkills),
              advancedSkills: (Array.isArray(data.skills.advancedSkills) && data.skills.advancedSkills.length > 0)
                ? data.skills.advancedSkills
                : (Array.isArray(prev.advancedSkills) && prev.advancedSkills.length > 0 ? prev.advancedSkills : defaultSkillsData.advancedSkills),
              technologies: (Array.isArray(data.skills.technologies) && data.skills.technologies.length > 0)
                ? data.skills.technologies
                : (Array.isArray(prev.technologies) && prev.technologies.length > 0 ? prev.technologies : defaultSkillsData.technologies),
              awards: (Array.isArray(data.skills.awards) && data.skills.awards.length > 0)
                ? data.skills.awards
                : (Array.isArray(prev.awards) && prev.awards.length > 0 ? prev.awards : defaultSkillsData.awards),
            }));
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Layout title="IDENTITY PROFILE" showBackButton={true}>
      <Tabs defaultValue={sections.profile !== false ? "profile" : "education"} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-cyber-black/80 border border-cyber-neon/30 mb-6">
          {sections.profile !== false && (
            <TabsTrigger 
              value="profile"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
            >
              <User size={16} className="mr-2" /> PROFILE
            </TabsTrigger>
          )}
          {sections.education !== false && (
            <TabsTrigger 
              value="education"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
            >
              <GraduationCap size={16} className="mr-2" /> EDUCATION
            </TabsTrigger>
          )}
          {sections.experience !== false && (
            <TabsTrigger 
              value="experience"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
            >
              <Briefcase size={16} className="mr-2" /> EXPERIENCE
            </TabsTrigger>
          )}
          {sections.publications !== false && (
            <TabsTrigger 
              value="publications"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
            >
              <Book size={16} className="mr-2" /> PUBLICATIONS
            </TabsTrigger>
          )}
          {sections.skills !== false && (
            <TabsTrigger 
              value="skills"
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
            >
              <FileCode size={16} className="mr-2" /> SKILLS
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <Card className="neo-blur border border-cyber-neon/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-cyber-neon font-mono">01 // PERSONAL PROFILE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <div className="aspect-square relative overflow-hidden border-2 border-cyber-neon rounded-md">
                    <img 
                      src={aboutData.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent"></div>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xl text-white font-mono mb-2">BIO // <span className="text-cyber-neon">ACCESS GRANTED</span></h3>
                    <p className="text-cyber-blue/80">
                      {aboutData.bio}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl text-white font-mono mb-2">CONTACT // <span className="text-cyber-neon">SECURE CHANNELS</span></h3>
                    <ul className="space-y-2 text-cyber-blue/80">
                      <li className="flex items-center">
                        <span className="w-24 font-mono">EMAIL:</span>
                        <span className="text-cyber-neon">{aboutData.email}</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-24 font-mono">LOCATION:</span>
                        <span>{aboutData.location}</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-24 font-mono">LATTES:</span>
                        <a 
                          href={aboutData.lattes}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyber-neon hover:underline"
                        >
                          CV Lattes
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl text-white font-mono mb-2">RESEARCH FOCUS // <span className="text-cyber-neon">ACTIVE DOMAINS</span></h3>
                <div className="flex flex-wrap gap-2">
                  {(aboutData?.researchFocus || []).map((focus, index) => (
                    <Badge key={index} className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">{focus}</Badge>
                  ))}
                </div>
              </div>

              {aboutData?.languages && Array.isArray(aboutData.languages) && aboutData.languages.length > 0 && (
              <div>
                <h3 className="text-xl text-white font-mono mb-2">LANGUAGES // <span className="text-cyber-neon">PROFICIENCY</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {aboutData.languages.map((lang, index) => (
                    <div key={index} className="bg-cyber-black/40 border border-cyber-neon/20 p-3 rounded-md">
                      <p className="text-white font-mono">{lang.language} <span className="text-cyber-neon text-sm">({lang.level})</span></p>
                      <p className="text-cyber-blue/80 text-xs mt-1">{lang.proficiency}</p>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="mt-0">
          <Card className="neo-blur border border-cyber-neon/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-cyber-neon font-mono">02 // EDUCATIONAL RECORDS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {(educationData || []).map((edu, index) => (
                  <div key={index} className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl text-white font-mono">{edu.title}</h3>
                      <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">{edu.period}</Badge>
                    </div>
                    {edu.institution && <p className="text-cyber-blue mt-1">{edu.institution}</p>}
                    {edu.description && <p className="mt-3 text-cyber-blue/80">{edu.description}</p>}
                    
                    {Array.isArray(edu.certifications) && edu.certifications.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {edu.certifications.map((cert, idx) => (
                          <p key={idx} className="text-cyber-blue/80">
                            <span className="text-cyber-neon">•</span> {cert}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="experience" className="mt-0">
          <Card className="neo-blur border border-cyber-neon/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-cyber-neon font-mono">03 // PROFESSIONAL PROTOCOLS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(experienceData || []).map((exp, index) => (
                <div key={index} className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl text-white font-mono">{exp.title}</h3>
                    <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">{exp.period}</Badge>
                  </div>
                  <p className="text-cyber-blue mt-1">{exp.company}</p>
                  <div className="mt-3 space-y-2">
                    {(exp.duties || []).map((duty, idx) => (
                      <p key={idx} className="text-cyber-blue/80">
                        <span className="text-cyber-neon">•</span> {duty}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="publications" className="mt-0">
          <Card className="neo-blur border border-cyber-neon/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-cyber-neon font-mono">04 // KNOWLEDGE DATABASE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <h3 className="text-xl text-white font-mono mb-2">Artigos em Periódicos</h3>
                  <ul className="space-y-4">
                    {(publicationsData?.articles || []).map((article, index) => (
                      <li key={index} className="border-l-2 border-cyber-blue pl-4 py-1">
                        <p className="text-cyber-blue font-mono">{article.year}</p>
                        <p className="text-white">{article.title}</p>
                        <p className="text-cyber-blue/80 text-sm mt-1">{article.journal}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <h3 className="text-xl text-white font-mono mb-2">Conferências Internacionais</h3>
                  <ul className="space-y-4">
                    {(publicationsData?.conferences || []).map((conf, index) => (
                      <li key={index} className="border-l-2 border-cyber-orange pl-4 py-1">
                        <p className="text-cyber-orange font-mono">{conf.year}</p>
                        <p className="text-white">{conf.title}</p>
                        <p className="text-cyber-blue/80 text-sm mt-1">{conf.conference}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skills" className="mt-0">
          <Card className="neo-blur border border-cyber-neon/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-cyber-neon font-mono">05 // TECHNICAL CAPABILITIES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl text-white font-mono">Core Skills</h3>
                  {(skillsData?.coreSkills || []).map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-cyber-blue font-mono">{skill.name}</span>
                        <span className="text-cyber-neon">{skill.level}%</span>
                      </div>
                      <Progress 
                        value={skill.level} 
                        max={100} 
                        className="h-2 bg-cyber-black/60"
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-cyber-neon to-cyber-purple rounded-sm"
                          style={{ width: `${skill.level}%` }}
                        />
                      </Progress>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl text-white font-mono">Advanced Skills</h3>
                  {(skillsData?.advancedSkills || []).map((skill) => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-cyber-blue font-mono">{skill.name}</span>
                        <span className="text-cyber-neon">{skill.level}%</span>
                      </div>
                      <Progress 
                        value={skill.level} 
                        max={100} 
                        className="h-2 bg-cyber-black/60"
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-cyber-blue to-cyber-orange rounded-sm"
                          style={{ width: `${skill.level}%` }}
                        />
                      </Progress>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl text-white font-mono mb-4">Languages & Technologies</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(skillsData?.technologies || []).map((tech, index) => (
                    <Badge key={index} className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">{tech}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl text-white font-mono mb-4">Certifications & Awards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(skillsData?.awards || []).map((award, index) => (
                    <div key={index} className="bg-cyber-black/40 border border-cyber-neon/30 p-3 rounded-md flex bg-cyber-black bg-cyber-grid  items-center">
                      <Award size={24} className="text-cyber-orange mr-3" />
                      <span className="text-cyber-blue">{award}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default About;
