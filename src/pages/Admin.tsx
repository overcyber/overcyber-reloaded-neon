
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
type ProjectFormValues = z.infer<typeof projectSchema>;

// Sample About data (replace with localStorage or other storage)
const defaultAboutData = {
  name: "Dr. Melquizedequi Cabral dos Santos",
  title: "Professor Associado - Universidade Federal do Piauí",
  bio: "Pesquisador e professor com foco em Ciência da Computação, Inteligência Artificial e Processamento de Linguagem Natural.",
  education: "Doutor em Ciência da Computação pela Universidade Federal de Pernambuco (2011)\nMestre em Ciência da Computação pela Universidade Federal de Pernambuco (2007)\nGraduado em Ciência da Computação pela Universidade Federal do Piauí (2005)",
  experience: "Professor Associado na Universidade Federal do Piauí desde 2011\nLíder do grupo de pesquisa em Processamento de Linguagem Natural\nMembro do comitê científico de diversas conferências nacionais e internacionais",
  publications: "Mais de 50 artigos publicados em periódicos e conferências internacionais\nAutor de 3 capítulos de livros na área de Inteligência Artificial\nEditor convidado para edições especiais em revistas científicas",
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
useEffect(() => {
  const getLocalIpAddress = () => {
    return new Promise((resolve, reject) => {
      // Usando WebRTC para tentar obter o IP local
      const RTCPeerConnection = window.RTCPeerConnection || 
                              window.webkitRTCPeerConnection || 
                              window.mozRTCPeerConnection;
      
      if (!RTCPeerConnection) {
        reject(new Error('WebRTC não é suportado neste navegador'));
        return;
      }
      
      const pc = new RTCPeerConnection({
        iceServers: []
      });
      
      pc.createDataChannel('');
      
      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          pc.close();
          reject(new Error('Nenhum candidato ICE encontrado'));
          return;
        }
        
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
        const ipMatch = ipRegex.exec(event.candidate.candidate);
        
        if (ipMatch && ipMatch[1]) {
          const ip = ipMatch[1];
          pc.close();
          // Filtrar apenas IPs locais (endereços privados)
          if (
            ip.startsWith('10.') || 
            ip.startsWith('192.168.') || 
            ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
          ) {
            resolve(ip);
          } else {
            reject(new Error('IP não é local'));
          }
        } else {
          pc.close();
          reject(new Error('IP não encontrado no candidato ICE'));
        }
      };
      
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(err => {
          pc.close();
          reject(err);
        });
        
      // Timeout para garantir que não bloqueie indefinidamente
      setTimeout(() => {
        pc.close();
        reject(new Error('Timeout ao tentar obter IP local'));
      }, 5000);
    });
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
    try {
      // Primeiro tenta obter o IP local
      const localIp = await getLocalIpAddress();
      console.log('IP local encontrado:', localIp);
      setIpAddress(localIp);
    } catch (localError) {
      console.error('Erro ao obter IP local, tentando IP online:', localError);
      
      // Se falhar, tenta obter o IP online
      try {
        const onlineIp = await getOnlineIpAddress();
        console.log('IP online encontrado:', onlineIp);
        setIpAddress(onlineIp);
      } catch (onlineError) {
        console.error('Erro ao obter IP online:', onlineError);
        setIpAddress('unknown');
      }
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
          </TabsList>
          
          <TabsContent value="about">
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
