
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

// Dados padrão para skills (caso não existam no localStorage)
const defaultSkills = [
  { name: "Python", level: 92 },
  { name: "Machine Learning", level: 85 },
  { name: "Cybersecurity", level: 90 },
  { name: "Data Science", level: 88 },
  { name: "Network Security", level: 86 },
  { name: "Web Development", level: 78 },
  { name: "Blockchain", level: 75 },
  { name: "Cloud Computing", level: 80 }
];

// Dados padrão para o about (usado apenas como fallback)
const defaultAboutData = {
  name: "Dr. Melquizedequi Cabral dos Santos",
  title: "Professor Associado - Universidade Federal do Piauí",
  bio: "Pesquisador e professor com foco em Ciência da Computação, Inteligência Artificial e Processamento de Linguagem Natural.",
  education: "Doutor em Ciência da Computação pela Universidade Federal de Pernambuco (2011)\nMestre em Ciência da Computação pela Universidade Federal de Pernambuco (2007)\nGraduado em Ciência da Computação pela Universidade Federal do Piauí (2005)",
  experience: "Professor Associado na Universidade Federal do Piauí desde 2011\nLíder do grupo de pesquisa em Processamento de Linguagem Natural\nMembro do comitê científico de diversas conferências nacionais e internacionais",
  publications: "Mais de 50 artigos publicados em periódicos e conferências internacionais\nAutor de 3 capítulos de livros na área de Inteligência Artificial\nEditor convidado para edições especiais em revistas científicas",
};

const About = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [aboutData, setAboutData] = useState(defaultAboutData);
  const [skills, setSkills] = useState(defaultSkills);
  
  // Carregar dados do localStorage quando o componente montar
  useEffect(() => {
    const savedAboutData = loadData('admin-about-data', defaultAboutData);
    setAboutData(savedAboutData);
    
    // Se você decidir adicionar skills ao admin posteriormente
    const savedSkills = loadData('admin-skills-data', defaultSkills);
    setSkills(savedSkills);
  }, []);

  // Função para formatar texto com quebras de linha
  const formatText = (text) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim() !== '');
  };

  // Formatar dados para as diferentes seções
  const educationItems = formatText(aboutData.education);
  const experienceItems = formatText(aboutData.experience);
  const publicationItems = formatText(aboutData.publications);

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
                      src="https://avatars.githubusercontent.com/u/583231" 
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
                        <span className="w-24 font-mono">NAME:</span>
                        <span className="text-cyber-neon">{aboutData.name}</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-24 font-mono">TITLE:</span>
                        <span>{aboutData.title}</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-24 font-mono">EMAIL:</span>
                        <span className="text-cyber-neon">secure@cyberdomain.net</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-24 font-mono">LOCATION:</span>
                        <span>São Paulo, Brasil</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl text-white font-mono mb-2">RESEARCH FOCUS // <span className="text-cyber-neon">ACTIVE DOMAINS</span></h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">Cibersegurança</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">Machine Learning</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">Análise de Vulnerabilidades</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">Redes Neurais</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">Detecção de Intrusão</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50">Segurança de Dados</Badge>
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
                {educationItems.map((item, index) => (
                  <div key={index} className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl text-white font-mono">{item.split(' - ')[0] || item}</h3>
                      {item.split(' - ')[1] && (
                        <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">
                          {item.split(' - ')[1]}
                        </Badge>
                      )}
                    </div>
                    {item.split(' - ')[2] && (
                      <p className="text-cyber-blue mt-1">{item.split(' - ')[2]}</p>
                    )}
                    {item.split(' - ')[3] && (
                      <p className="mt-3 text-cyber-blue/80">{item.split(' - ')[3]}</p>
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
              {experienceItems.map((item, index) => (
                <div key={index} className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl text-white font-mono">{item.split(' - ')[0] || item}</h3>
                    {item.split(' - ')[1] && (
                      <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">
                        {item.split(' - ')[1]}
                      </Badge>
                    )}
                  </div>
                  {item.split(' - ')[2] && (
                    <p className="text-cyber-blue mt-1">{item.split(' - ')[2]}</p>
                  )}
                  <div className="mt-3 space-y-2">
                    {item.split(' - ')[3] && item.split(' - ')[3].split(';').map((duty, idx) => (
                      <p key={idx} className="text-cyber-blue/80">
                        <span className="text-cyber-neon">•</span> {duty.trim()}
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
                  <h3 className="text-xl text-white font-mono mb-2">Publicações e Artigos</h3>
                  <ul className="space-y-4">
                    {publicationItems.map((item, index) => (
                      <li key={index} className="border-l-2 border-cyber-blue pl-4 py-1">
                        <p className="text-cyber-blue font-mono">{item.split(' - ')[0] || '2023'}</p>
                        <p className="text-white">{item.split(' - ')[1] || item}</p>
                        {item.split(' - ')[2] && (
                          <p className="text-cyber-blue/80 text-sm mt-1">{item.split(' - ')[2]}</p>
                        )}
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
                  {skills.slice(0, 4).map((skill) => (
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
                  {skills.slice(4, 8).map((skill) => (
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
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">Python</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">C/C++</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">JavaScript</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">Rust</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">TensorFlow</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">PyTorch</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">Docker</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">Kubernetes</Badge>
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
