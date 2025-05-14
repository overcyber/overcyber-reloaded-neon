
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCode, Github, ExternalLink, Star, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectsContent } from '@/hooks/use-managed-content';

const Projects = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  
  // Get projects from the content management system
  const projects = getProjectsContent();
  
  const filteredProjects = activeTab === "all" 
    ? projects 
    : projects.filter(project => project.tags.some((tag: string) => 
        tag.toLowerCase() === activeTab.toLowerCase()));

  // Get unique tags for building tab filters
  const uniqueTags = Array.from(
    new Set(
      projects.flatMap(project => project.tags)
        .map((tag: string) => typeof tag === 'string' ? tag.toLowerCase() : tag)
    )
  ).slice(0, 3); // Limit to first 3 tags to avoid too many tabs
  
  return (
    <Layout title="PROJECTS DATABASE">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-cyber-black border border-cyber-neon/30 p-1">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none"
          >
            ALL
          </TabsTrigger>
          {uniqueTags.map(tag => (
            <TabsTrigger 
              key={tag}
              value={tag}
              className="data-[state=active]:bg-cyber-neon/20 data-[state=active]:text-cyber-neon data-[state=active]:shadow-none uppercase"
            >
              {tag}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id} 
            className="neo-blur border border-cyber-neon/30 overflow-hidden transition-all duration-300 hover:border-cyber-neon/70"
          >
            <AspectRatio ratio={16/9}>
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-cyber-black/70 to-transparent"></div>
            </AspectRatio>
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-white font-mono tracking-tight flex items-center">
                  <FileCode size={18} className="text-cyber-neon mr-2" />
                  {project.title}
                </CardTitle>
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className="flex items-center text-cyber-orange">
                    <Star size={14} className="mr-1" />
                    {project.stars}
                  </span>
                  <span className="flex items-center text-cyber-blue">
                    <GitFork size={14} className="mr-1" />
                    {project.forks}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-cyber-blue/80 mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.isArray(project.tags) ? project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-cyber-neon/50 text-cyber-neon">
                    {tag}
                  </Badge>
                )) : (
                  project.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-cyber-neon/50 text-cyber-neon">
                      {tag.trim()}
                    </Badge>
                  ))
                )}
              </div>
              
              {expandedProject === project.id && (
                <div className="mt-4 border border-cyber-neon/30 rounded-md p-4 bg-cyber-black/60">
                  <h3 className="text-cyber-neon font-mono mb-2 text-lg">README.md</h3>
                  <div className="prose prose-invert max-w-none prose-headings:text-cyber-blue prose-headings:font-mono prose-a:text-cyber-neon">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-cyber-blue/80 overflow-auto max-h-96 scrollbar-none">{project.readme}</pre>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex gap-2 pt-2 border-t border-cyber-neon/20">
              <Button 
                variant="outline" 
                size="sm"
                className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              >
                {expandedProject === project.id ? "Hide README" : "Show README"}
              </Button>
              <a 
                href={project.github} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-cyber-neon/50 text-cyber-neon hover:bg-cyber-neon/20"
                >
                  <Github size={16} className="mr-2" />
                  GitHub
                </Button>
              </a>
              {project.live && (
                <a 
                  href={project.live} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-cyber-orange/50 text-cyber-orange hover:bg-cyber-orange/20"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Live Demo
                  </Button>
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Projects;
