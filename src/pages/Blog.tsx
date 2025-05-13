
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Sample blog data
const blogPosts = [
  {
    id: 1,
    title: "Exploiting Zero-Day Vulnerabilities in IoT Devices",
    slug: "exploiting-zero-day-vulnerabilities",
    excerpt: "An in-depth analysis of recently discovered vulnerabilities in consumer IoT devices and how to protect against them.",
    date: "2025-04-15",
    readTime: "8 min read",
    tags: ["Security", "IoT", "Exploit"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "The Future of Quantum Encryption",
    slug: "future-quantum-encryption",
    excerpt: "Exploring how quantum computing will transform the landscape of cryptography and data security.",
    date: "2025-03-22",
    readTime: "12 min read",
    tags: ["Quantum", "Encryption", "Cybersecurity"],
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Building Secure APIs for the Modern Web",
    slug: "building-secure-apis",
    excerpt: "Best practices for designing and implementing secure APIs that can withstand today's sophisticated attacks.",
    date: "2025-02-18",
    readTime: "10 min read",
    tags: ["API", "Web Security", "Development"],
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Dark Web Monitoring: Protecting Your Digital Identity",
    slug: "dark-web-monitoring",
    excerpt: "How to monitor the dark web to protect yourself from identity theft and credential leaks.",
    date: "2025-01-05",
    readTime: "7 min read",
    tags: ["Dark Web", "Identity", "Protection"],
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout title="NEURAL ARCHIVE">
      <div className="mb-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="SEARCH ARCHIVES..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-cyber-black/60 border-cyber-neon/50 font-mono text-cyber-blue focus:border-cyber-orange placeholder:text-cyber-neon/50"
          />
          <div className="absolute inset-0 border border-cyber-neon/30 rounded-md pointer-events-none"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.id} className="group">
            <Card className="neo-blur border border-cyber-neon/30 overflow-hidden transition-all duration-300 group-hover:border-cyber-neon/70 h-full flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-black to-transparent"></div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white font-mono tracking-tight line-clamp-2 group-hover:text-cyber-neon transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow">
                <p className="text-cyber-blue/80 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-cyber-neon/50 text-cyber-neon text-xs">
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="text-xs text-cyber-blue/70 font-mono pt-2 border-t border-cyber-neon/20">
                <div className="flex justify-between w-full">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" className="bg-transparent border border-cyber-neon/50 text-cyber-neon" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive className="bg-cyber-neon/20 border border-cyber-neon text-cyber-neon">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="bg-transparent border border-cyber-neon/50 text-cyber-neon">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" className="bg-transparent border border-cyber-neon/50 text-cyber-neon" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Layout>
  );
};

export default Blog;
