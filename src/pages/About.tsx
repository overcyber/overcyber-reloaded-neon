
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

const About = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Estado para armazenar os dados
  const [aboutData, setAboutData] = useState(defaultAboutData);
  const [educationData, setEducationData] = useState(defaultEducationData);
  const [experienceData, setExperienceData] = useState(defaultExperienceData);
  const [publicationsData, setPublicationsData] = useState(defaultPublicationsData);
  const [skillsData, setSkillsData] = useState(defaultSkillsData);
  
  // Carrega os dados do localStorage quando o componente montar
  useEffect(() => {
    const savedAboutData = loadData('admin-about-data', defaultAboutData);
    setAboutData(savedAboutData);
    
    const savedEducationData = loadData('admin-education-data', defaultEducationData);
    setEducationData(savedEducationData);
    
    const savedExperienceData = loadData('admin-experience-data', defaultExperienceData);
    setExperienceData(savedExperienceData);
    
    const savedPublicationsData = loadData('admin-publications-data', defaultPublicationsData);
    setPublicationsData(savedPublicationsData);
    
    const savedSkillsData = loadData('admin-skills-data', defaultSkillsData);
    setSkillsData(savedSkillsData);
  }, []);

  return (
    <Layout title="IDENTITY PROFILE" showBackButton={true}>
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-cyber-black/80 border border-cyber-neon/30 mb-6">
          <TabsTrigger 
            value="profile"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
          >
            <User size={16} className="mr-2" /> PROFILE
          </TabsTrigger>
          <TabsTrigger 
            value="education"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
          >
            <GraduationCap size={16} className="mr-2" /> EDUCATION
          </TabsTrigger>
          <TabsTrigger 
            value="experience"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
          >
            <Briefcase size={16} className="mr-2" /> EXPERIENCE
          </TabsTrigger>
          <TabsTrigger 
            value="publications"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
          >
            <Book size={16} className="mr-2" /> PUBLICATIONS
          </TabsTrigger>
          <TabsTrigger 
            value="skills"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon"
          >
            <FileCode size={16} className="mr-2" /> SKILLS
          </TabsTrigger>
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
                  {aboutData.researchFocus.map((focus, index) => (
                    <Badge key={index} className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">{focus}</Badge>
                  ))}
                </div>
              </div>
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
                {educationData.map((edu, index) => (
                  <div key={index} className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl text-white font-mono">{edu.title}</h3>
                      <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">{exp.period}</Badge>

                    </div>
                    {edu.institution && <p className="text-cyber-blue mt-1">{edu.institution}</p>}
                    {edu.description && <p className="mt-3 text-cyber-blue/80">{edu.description}</p>}
                    
                    {edu.certifications && (
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
              {experienceData.map((exp, index) => (
                <div key={index} className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl text-white font-mono">{exp.title}</h3>
                    <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">{exp.period}</Badge>
                  </div>
                  <p className="text-cyber-blue mt-1">{exp.company}</p>
                  <div className="mt-3 space-y-2">
                    {exp.duties.map((duty, idx) => (
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
                    {publicationsData.articles.map((article, index) => (
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
                    {publicationsData.conferences.map((conf, index) => (
                      <li key={index} className="border-l-2 border-cyber-orange pl-4 py-1">
                        <p className="text-cyber-orange font-mono">{conf.year}</p>
                        <p className="text-white">{conf.title}</p>
                        <p className="text-cyber-blue/80 text-sm mt-1">{conf.conference}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <h3 className="text-xl text-white font-mono mb-2">Patentes e Propriedade Intelectual</h3>
                  <ul className="space-y-4">
                    {publicationsData.patents.map((patent, index) => (
                      <li key={index} className="border-l-2 border-cyber-neon pl-4 py-1">
                        <p className="text-cyber-neon font-mono">{patent.year}</p>
                        <p className="text-white">{patent.title}</p>
                        <p className="text-cyber-blue/80 text-sm mt-1">{patent.number}</p>
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
                  {skillsData.coreSkills.map((skill) => (
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
                  {skillsData.advancedSkills.map((skill) => (
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
                  {skillsData.technologies.map((tech, index) => (
                    <Badge key={index} className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">{tech}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl text-white font-mono mb-4">Certifications & Awards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillsData.awards.map((award, index) => (
                    <div key={index} className="bg-cyber-black/40 border border-cyber-neon/30 p-3 rounded-md flex items-center">
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
