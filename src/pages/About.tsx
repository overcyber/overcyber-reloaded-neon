
// import { useState } from 'react';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, FileCode, Briefcase, GraduationCap, Award, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';


const About = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const skills = [
    { name: "Python", level: 92 },
    { name: "Machine Learning", level: 85 },
    { name: "Cybersecurity", level: 90 },
    { name: "Data Science", level: 88 },
    { name: "Network Security", level: 86 },
    { name: "Web Development", level: 78 },
    { name: "Blockchain", level: 75 },
    { name: "Cloud Computing", level: 80 }
  ];

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
                      Pesquisador e especialista em cibersegurança com foco em técnicas avançadas de proteção de dados e desenvolvimento de soluções de segurança para redes e sistemas. Experiência em algoritmos de machine learning aplicados à detecção de intrusão e análise de vulnerabilidades.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl text-white font-mono mb-2">CONTACT // <span className="text-cyber-neon">SECURE CHANNELS</span></h3>
                    <ul className="space-y-2 text-cyber-blue/80">
                      <li className="flex items-center">
                        <span className="w-24 font-mono">EMAIL:</span>
                        <span className="text-cyber-neon">secure@cyberdomain.net</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-24 font-mono">LOCATION:</span>
                        <span>São Paulo, Brasil</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-24 font-mono">LATTES:</span>
                        <a 
                          href="https://lattes.cnpq.br/2915812289846388"
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
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl text-white font-mono">Doutorado em Ciência da Computação</h3>
                    <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">2018-2022</Badge>
                  </div>
                  <p className="text-cyber-blue mt-1">Universidade de São Paulo (USP)</p>
                  <p className="mt-3 text-cyber-blue/80">
                    Tese: "Algoritmos de Aprendizado Profundo para Detecção Avançada de Intrusões em Redes de Alta Velocidade"
                  </p>
                </div>
                
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl text-white font-mono">Mestrado em Segurança Computacional</h3>
                    <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">2016-2018</Badge>
                  </div>
                  <p className="text-cyber-blue mt-1">Universidade Estadual de Campinas (UNICAMP)</p>
                  <p className="mt-3 text-cyber-blue/80">
                    Dissertação: "Métodos Avançados de Criptografia Aplicados à Proteção de Dados em Sistemas Distribuídos"
                  </p>
                </div>
                
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl text-white font-mono">Graduação em Ciência da Computação</h3>
                    <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">2012-2016</Badge>
                  </div>
                  <p className="text-cyber-blue mt-1">Instituto Tecnológico de Aeronáutica (ITA)</p>
                  <p className="mt-3 text-cyber-blue/80">
                    Trabalho de Conclusão de Curso: "Desenvolvimento de Sistema de Análise de Vulnerabilidades em Redes Corporativas"
                  </p>
                </div>
                
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl text-white font-mono">Certificações Profissionais</h3>
                    <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">DIVERSAS</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-cyber-blue/80">
                      <span className="text-cyber-neon">•</span> Certified Information Systems Security Professional (CISSP)
                    </p>
                    <p className="text-cyber-blue/80">
                      <span className="text-cyber-neon">•</span> Offensive Security Certified Professional (OSCP)
                    </p>
                    <p className="text-cyber-blue/80">
                      <span className="text-cyber-neon">•</span> Certified Ethical Hacker (CEH)
                    </p>
                    <p className="text-cyber-blue/80">
                      <span className="text-cyber-neon">•</span> GIAC Security Essentials (GSEC)
                    </p>
                  </div>
                </div>
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
              <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl text-white font-mono">Pesquisador Sênior em Cibersegurança</h3>
                  <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">2022-PRESENTE</Badge>
                </div>
                <p className="text-cyber-blue mt-1">Instituto de Pesquisas Avançadas em Tecnologia (IPAT)</p>
                <div className="mt-3 space-y-2">
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Liderança em projetos de pesquisa em segurança de redes e sistemas
                  </p>
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Desenvolvimento de novos algoritmos para detecção de ataques avançados
                  </p>
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Coordenação de equipe multidisciplinar com foco em segurança de dados
                  </p>
                </div>
              </div>
              
              <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl text-white font-mono">Consultor de Segurança da Informação</h3>
                  <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">2019-2022</Badge>
                </div>
                <p className="text-cyber-blue mt-1">CyberShield Technologies</p>
                <div className="mt-3 space-y-2">
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Realização de testes de penetração em sistemas críticos
                  </p>
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Análise e mitigação de vulnerabilidades em aplicações corporativas
                  </p>
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Implementação de soluções de proteção para infraestruturas complexas
                  </p>
                </div>
              </div>
              
              <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl text-white font-mono">Pesquisador Associado</h3>
                  <Badge className="bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/50">2016-2019</Badge>
                </div>
                <p className="text-cyber-blue mt-1">Laboratório de Segurança em Computação (LabSEC)</p>
                <div className="mt-3 space-y-2">
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Pesquisa em técnicas de machine learning para análise de malware
                  </p>
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Desenvolvimento de ferramentas para análise automática de ameaças
                  </p>
                  <p className="text-cyber-blue/80">
                    <span className="text-cyber-neon">•</span> Publicação de artigos científicos em periódicos de alto impacto
                  </p>
                </div>
              </div>
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
                    <li className="border-l-2 border-cyber-blue pl-4 py-1">
                      <p className="text-cyber-blue font-mono">2023</p>
                      <p className="text-white">Deep Learning-Based Anomaly Detection for Zero-Day Attack Identification in High-Speed Networks</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">Journal of Cybersecurity Research, Vol. 15, Issue 4</p>
                    </li>
                    <li className="border-l-2 border-cyber-blue pl-4 py-1">
                      <p className="text-cyber-blue font-mono">2022</p>
                      <p className="text-white">A Novel Approach for Malware Classification Using Convolutional Neural Networks and Binary Visualization</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">IEEE Transactions on Information Security, Vol. 44, Issue 2</p>
                    </li>
                    <li className="border-l-2 border-cyber-blue pl-4 py-1">
                      <p className="text-cyber-blue font-mono">2021</p>
                      <p className="text-white">Quantum-Resistant Cryptographic Protocols for Secure IoT Communications</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">International Journal of Network Security, Vol. 32, Issue 8</p>
                    </li>
                    <li className="border-l-2 border-cyber-blue pl-4 py-1">
                      <p className="text-cyber-blue font-mono">2020</p>
                      <p className="text-white">Advanced Persistent Threats Detection Using Machine Learning Techniques</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">Computers & Security Journal, Vol. 89</p>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <h3 className="text-xl text-white font-mono mb-2">Conferências Internacionais</h3>
                  <ul className="space-y-4">
                    <li className="border-l-2 border-cyber-orange pl-4 py-1">
                      <p className="text-cyber-orange font-mono">2023</p>
                      <p className="text-white">Adversarial Machine Learning for Robust Intrusion Detection Systems</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">International Conference on Network and Systems Security (NSS)</p>
                    </li>
                    <li className="border-l-2 border-cyber-orange pl-4 py-1">
                      <p className="text-cyber-orange font-mono">2022</p>
                      <p className="text-white">Real-time Network Traffic Analysis Using Graph Neural Networks</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">IEEE Symposium on Security and Privacy (S&P)</p>
                    </li>
                    <li className="border-l-2 border-cyber-orange pl-4 py-1">
                      <p className="text-cyber-orange font-mono">2021</p>
                      <p className="text-white">Blockchain-based Framework for Secure Firmware Updates in IoT Devices</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">ACM Conference on Computer and Communications Security (CCS)</p>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-cyber-black/40 border border-cyber-neon/30 p-4 rounded-md">
                  <h3 className="text-xl text-white font-mono mb-2">Patentes e Propriedade Intelectual</h3>
                  <ul className="space-y-4">
                    <li className="border-l-2 border-cyber-neon pl-4 py-1">
                      <p className="text-cyber-neon font-mono">2022</p>
                      <p className="text-white">Sistema de Detecção de Intrusão Baseado em Análise Comportamental e Aprendizado Profundo</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">Patente Nº BR10202200XXXX</p>
                    </li>
                    <li className="border-l-2 border-cyber-neon pl-4 py-1">
                      <p className="text-cyber-neon font-mono">2021</p>
                      <p className="text-white">Método para Identificação Automática de Vulnerabilidades em Aplicações Web</p>
                      <p className="text-cyber-blue/80 text-sm mt-1">Patente Nº BR10202100XXXX</p>
                    </li>
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
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">AWS</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">Linux</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">Blockchain</Badge>
                  <Badge className="bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/50 p-2">Network Analysis</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl text-white font-mono mb-4">Certifications & Awards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-cyber-black/40 border border-cyber-neon/30 p-3 rounded-md flex items-center">
                    <Award size={24} className="text-cyber-orange mr-3" />
                    <span className="text-cyber-blue">Best Paper Award - Cybersecurity Conference 2022</span>
                  </div>
                  <div className="bg-cyber-black/40 border border-cyber-neon/30 p-3 rounded-md flex items-center">
                    <Award size={24} className="text-cyber-orange mr-3" />
                    <span className="text-cyber-blue">Young Researcher Award - INFOCOM 2021</span>
                  </div>
                  <div className="bg-cyber-black/40 border border-cyber-neon/30 p-3 rounded-md flex items-center">
                    <Award size={24} className="text-cyber-orange mr-3" />
                    <span className="text-cyber-blue">Top Security Researcher - CyberShield 2020</span>
                  </div>
                  <div className="bg-cyber-black/40 border border-cyber-neon/30 p-3 rounded-md flex items-center">
                    <Award size={24} className="text-cyber-orange mr-3" />
                    <span className="text-cyber-blue">Innovation Prize - Brazilian Computing Society</span>
                  </div>
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
